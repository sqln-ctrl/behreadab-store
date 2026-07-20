import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

const getSettings = async () => {
  const { data } = await supabase.from('store_settings').select('*').limit(1).single();
  return data || { delivery_charge: 500, free_delivery_threshold: 5000 };
};

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'cod', notes = '' } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'No items in order' });
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Login required to place order' });

  const settings = await getSettings();
  let itemsTotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const { data: product } = await supabase.from('products')
      .select('id, name, image, price, cost_price, inventory(stock_qty, reserved_qty)')
      .eq('id', item.product_id).eq('is_active', true).single();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const available = (product.inventory?.stock_qty || 0) - (product.inventory?.reserved_qty || 0);
    if (available < item.qty) return res.status(400).json({ message: `${product.name} only has ${available} units available` });
    verifiedItems.push({ product_id: product.id, name: product.name, image: product.image, price: product.price, cost_price: product.cost_price || 0, qty: item.qty });
    itemsTotal += product.price * item.qty;
  }

  const shippingCost = itemsTotal >= settings.free_delivery_threshold ? 0 : settings.delivery_charge;
  const totalAmount  = itemsTotal + shippingCost;

  const { data: order, error } = await supabase.from('orders').insert({
    user_id: userId, items_total: itemsTotal, shipping_cost: shippingCost,
    total_amount: totalAmount, payment_method: paymentMethod, shipping_address: shippingAddress, notes,
  }).select().single();
  if (error) return res.status(400).json({ message: error.message });

  await supabase.from('order_items').insert(verifiedItems.map(i => ({ ...i, order_id: order.id })));

  for (const item of verifiedItems) {
    await supabase.from('inventory_transactions').insert({
      product_id: item.product_id, type: 'sale', qty_change: -item.qty, notes: `Order ${order.id.slice(-8).toUpperCase()}`,
    });
  }

  await supabase.from('payments').insert({ order_id: order.id, provider: paymentMethod, amount: totalAmount, currency: 'PKR', status: 'pending' });

  // Ledger — NOT added to revenue until delivered
  await supabase.from('ledger_entries').insert([
    { order_id: order.id, type: 'sale', debit_account: 'accounts_receivable', credit_account: 'revenue_pending', amount: itemsTotal, currency: 'PKR', description: `Pending Sale — Order #${order.id.slice(-8).toUpperCase()}` },
  ]);

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('orders')
    .select('*, order_items(*)').eq('user_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('orders')
    .select('*, order_items(*), payments(*), users(name, email)').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ message: 'Order not found' });
  if (data.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
  res.json(data);
});

export const markAsPaid = asyncHandler(async (req, res) => {
  const { data: order } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
  if (!order) return res.status(404).json({ message: 'Order not found' });
  await supabase.from('orders').update({ is_paid: true, paid_at: new Date().toISOString() }).eq('id', req.params.id);
  await supabase.from('payments').update({ status: 'completed', paid_at: new Date().toISOString() }).eq('order_id', req.params.id);
  res.json({ message: 'Marked as paid' });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 30 } = req.query;
  let query = supabase.from('orders')
    .select('*, users(name, email), order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const from = (Number(page) - 1) * Number(limit);
  query = query.range(from, from + Number(limit) - 1);
  const { data, error, count } = await query;
  if (error) return res.status(400).json({ message: error.message });
  res.json({ orders: data, total: count, pages: Math.ceil(count / Number(limit)) });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, tracking_number } = req.body;
  const { data: order } = await supabase.from('orders').select('*, order_items(*)').eq('id', req.params.id).single();
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const updates = { status };
  if (tracking_number) updates.tracking_number = tracking_number;
  if (status === 'Delivered') {
    updates.delivered_at = new Date().toISOString();
    // NOW add to actual revenue (only on delivery)
    await supabase.from('ledger_entries').insert([
      { order_id: order.id, type: 'sale', debit_account: 'accounts_receivable', credit_account: 'revenue', amount: order.items_total, currency: 'PKR', description: `Delivered — Order #${order.id.slice(-8).toUpperCase()}` },
      ...(order.shipping_cost > 0 ? [{ order_id: order.id, type: 'shipping', debit_account: 'accounts_receivable', credit_account: 'shipping_income', amount: order.shipping_cost, currency: 'PKR', description: `Shipping — Order #${order.id.slice(-8).toUpperCase()}` }] : []),
    ]);
    const totalCogs = (order.order_items || []).reduce((acc, i) => acc + (i.cost_price || 0) * i.qty, 0);
    if (totalCogs > 0) {
      await supabase.from('ledger_entries').insert({ order_id: order.id, type: 'cogs', debit_account: 'cogs', credit_account: 'inventory_asset', amount: totalCogs, currency: 'PKR', description: `COGS — Order #${order.id.slice(-8).toUpperCase()}` });
    }
  }

  if (status === 'Cancelled') {
    // Restore inventory
    for (const item of (order.order_items || [])) {
      await supabase.from('inventory_transactions').insert({ product_id: item.product_id, type: 'return', qty_change: item.qty, notes: `Cancelled — Order #${order.id.slice(-8).toUpperCase()}` });
    }
    // If was already delivered, deduct shipping cost from revenue (store paid for delivery)
    if (order.status === 'Delivered' && order.shipping_cost > 0) {
      await supabase.from('ledger_entries').insert({ order_id: order.id, type: 'expense', debit_account: 'delivery_loss', credit_account: 'cash', amount: order.shipping_cost, currency: 'PKR', description: `Delivery loss on cancelled delivered order #${order.id.slice(-8).toUpperCase()}` });
    }
  }

  const { data, error } = await supabase.from('orders').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Soft delete
  const { error } = await supabase.from('orders').update({ is_deleted: true }).eq('id', id);
  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: 'Order deleted' });
});
