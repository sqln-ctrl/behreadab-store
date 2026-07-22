import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

const getSettings = async () => {
  const { data } = await supabase.from('store_settings').select('*').limit(1).single();
  return data || { delivery_charge: 500, free_delivery_threshold: 5000 };
};

// ── Place order (logged-in OR guest) ──────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'cod', notes = '', guestEmail = '' } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'No items in order' });

  const userId = req.user?.id || null;

  // For guest orders, require an email so we can contact them
  if (!userId && !guestEmail) return res.status(400).json({ message: 'Email required for guest checkout' });

  const settings = await getSettings();
  let itemsTotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const { data: product } = await supabase.from('products')
      .select('id, name, image, price, cost_price, inventory(stock_qty, reserved_qty)')
      .eq('id', item.product_id).eq('is_active', true).single();
    if (!product) return res.status(404).json({ message: `Product not found` });
    const available = (product.inventory?.stock_qty || 0) - (product.inventory?.reserved_qty || 0);
    if (available < item.qty) return res.status(400).json({ message: `${product.name} only has ${available} left` });
    verifiedItems.push({ product_id: product.id, name: product.name, image: product.image, price: product.price, cost_price: product.cost_price || 0, qty: item.qty });
    itemsTotal += product.price * item.qty;
  }

  const shippingCost = itemsTotal >= settings.free_delivery_threshold ? 0 : settings.delivery_charge;
  const totalAmount  = itemsTotal + shippingCost;

  const { data: order, error } = await supabase.from('orders').insert({
    user_id:          userId,
    guest_email:      !userId ? guestEmail : null,
    items_total:      itemsTotal,
    shipping_cost:    shippingCost,
    total_amount:     totalAmount,
    payment_method:   paymentMethod,
    shipping_address: shippingAddress,
    notes,
    is_deleted:       false,
  }).select().single();

  if (error) return res.status(400).json({ message: error.message });

  await supabase.from('order_items').insert(verifiedItems.map(i => ({ ...i, order_id: order.id })));

  for (const item of verifiedItems) {
    await supabase.from('inventory_transactions').insert({
      product_id: item.product_id, type: 'sale',
      qty_change: -item.qty, notes: `Order ${order.id.slice(-8).toUpperCase()}`,
    });
  }

  await supabase.from('payments').insert({
    order_id: order.id, provider: paymentMethod,
    amount: totalAmount, currency: 'PKR', status: 'pending',
  });

  res.status(201).json(order);
});

// ── My orders (logged in) ──────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('orders')
    .select('*, order_items(*)')
    .eq('user_id', req.user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('orders')
    .select('*, order_items(*), payments(*), users(name, email)').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ message: 'Order not found' });
  const isOwner = data.user_id === req.user?.id;
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });
  res.json(data);
});

export const markAsPaid = asyncHandler(async (req, res) => {
  const { data: order } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
  if (!order) return res.status(404).json({ message: 'Order not found' });
  await supabase.from('orders').update({ is_paid: true, paid_at: new Date().toISOString() }).eq('id', req.params.id);
  await supabase.from('payments').update({ status: 'completed', paid_at: new Date().toISOString() }).eq('order_id', req.params.id);
  res.json({ message: 'Marked as paid' });
});

// ── All orders (admin) ─────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 30 } = req.query;
  let query = supabase.from('orders')
    .select('*, users(name, email), order_items(*)', { count: 'exact' })
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const from = (Number(page) - 1) * Number(limit);
  query = query.range(from, from + Number(limit) - 1);
  const { data, error, count } = await query;
  if (error) return res.status(400).json({ message: error.message });
  res.json({ orders: data || [], total: count || 0, pages: Math.ceil((count||0) / Number(limit)) });
});

// ── Update order status with confirmation flow ─────────────────────
// Status flow: Pending → Processing → Shipped → Delivered → Confirm Delivered
//              Pending → Cancelled → Confirm Cancelled
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, tracking_number } = req.body;
  const { data: order, error: orderErr } = await supabase.from('orders')
    .select('*, order_items(*)').eq('id', req.params.id).single();
  if (orderErr || !order) return res.status(404).json({ message: 'Order not found' });

  const updates = { status };
  if (tracking_number) updates.tracking_number = tracking_number;

  // ── Confirm Delivered: finalise revenue ──────────────────────────
  if (status === 'Confirm Delivered') {
    updates.status        = 'Delivered';
    updates.delivered_at  = new Date().toISOString();
    updates.is_confirmed  = true;

    // Add to revenue now that delivery is confirmed
    await supabase.from('ledger_entries').insert([
      { order_id: order.id, type: 'sale', debit_account: 'accounts_receivable', credit_account: 'revenue', amount: order.items_total, currency: 'PKR', description: `Confirmed delivery — Order #${order.id.slice(-8).toUpperCase()}` },
      ...(order.shipping_cost > 0 ? [{ order_id: order.id, type: 'shipping', debit_account: 'accounts_receivable', credit_account: 'shipping_income', amount: order.shipping_cost, currency: 'PKR', description: `Shipping — Order #${order.id.slice(-8).toUpperCase()}` }] : []),
    ]);

    const totalCogs = (order.order_items || []).reduce((acc, i) => acc + (i.cost_price || 0) * i.qty, 0);
    if (totalCogs > 0) {
      await supabase.from('ledger_entries').insert({ order_id: order.id, type: 'cogs', debit_account: 'cogs', credit_account: 'inventory_asset', amount: totalCogs, currency: 'PKR', description: `COGS — Order #${order.id.slice(-8).toUpperCase()}` });
    }
  }

  // ── Confirm Cancelled: restore stock, no revenue impact ──────────
  if (status === 'Confirm Cancelled') {
    updates.status       = 'Cancelled';
    updates.is_confirmed = true;

    for (const item of (order.order_items || [])) {
      await supabase.from('inventory_transactions').insert({
        product_id: item.product_id, type: 'return',
        qty_change: item.qty, notes: `Cancelled — Order #${order.id.slice(-8).toUpperCase()}`,
      });
    }

    // If was previously confirmed delivered, deduct shipping (store paid for delivery)
    if (order.status === 'Delivered' && order.is_confirmed && order.shipping_cost > 0) {
      await supabase.from('ledger_entries').insert({
        order_id: order.id, type: 'expense',
        debit_account: 'delivery_loss', credit_account: 'cash',
        amount: order.shipping_cost, currency: 'PKR',
        description: `Delivery loss — cancelled after delivery #${order.id.slice(-8).toUpperCase()}`,
      });
    }
  }

  const { data, error } = await supabase.from('orders').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// ── Delete order (soft) ────────────────────────────────────────────
export const deleteOrder = asyncHandler(async (req, res) => {
  const { data: order } = await supabase.from('orders').select('status, is_confirmed').eq('id', req.params.id).single();
  if (!order) return res.status(404).json({ message: 'Order not found' });
  // Only allow delete if confirmed (cancelled or delivered)
  if (!order.is_confirmed && !['Cancelled','Delivered'].includes(order.status)) {
    return res.status(400).json({ message: 'Can only delete confirmed orders. Confirm cancellation or delivery first.' });
  }
  await supabase.from('orders').update({ is_deleted: true }).eq('id', req.params.id);
  res.json({ message: 'Order deleted' });
});

// ── Manual order (WhatsApp / Instagram) ──────────────────────────
export const createManualOrder = asyncHandler(async (req, res) => {
  const { customer_name, customer_phone, customer_address, items, paymentMethod = 'cod', notes = '', source = 'whatsapp' } = req.body;
  if (!items?.length || !customer_name || !customer_phone) {
    return res.status(400).json({ message: 'customer_name, customer_phone and items required' });
  }

  const settings = await getSettings();
  let itemsTotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const { data: product } = await supabase.from('products')
      .select('id, name, image, price, cost_price, inventory(stock_qty)')
      .eq('id', item.product_id).single();
    if (!product) return res.status(404).json({ message: `Product not found` });
    verifiedItems.push({ product_id: product.id, name: product.name, image: product.image, price: item.price || product.price, cost_price: product.cost_price || 0, qty: item.qty });
    itemsTotal += (item.price || product.price) * item.qty;
  }

  const shippingCost = itemsTotal >= settings.free_delivery_threshold ? 0 : settings.delivery_charge;
  const totalAmount  = itemsTotal + shippingCost;

  const shippingAddress = {
    full_name: customer_name,
    phone:     customer_phone,
    street:    customer_address?.street    || '',
    city:      customer_address?.city      || '',
    province:  customer_address?.province  || '',
  };

  const { data: order, error } = await supabase.from('orders').insert({
    user_id: req.user.id, // admin creates it
    guest_email: null,
    items_total: itemsTotal, shipping_cost: shippingCost, total_amount: totalAmount,
    payment_method: paymentMethod, shipping_address: shippingAddress,
    notes: `[${source.toUpperCase()} ORDER] ${notes}`, source, is_manual: true, is_deleted: false,
  }).select().single();

  if (error) return res.status(400).json({ message: error.message });

  await supabase.from('order_items').insert(verifiedItems.map(i => ({ ...i, order_id: order.id })));

  for (const item of verifiedItems) {
    await supabase.from('inventory_transactions').insert({
      product_id: item.product_id, type: 'sale',
      qty_change: -item.qty, notes: `Manual Order #${order.id.slice(-8).toUpperCase()} [${source}]`,
    });
  }

  res.status(201).json(order);
});
