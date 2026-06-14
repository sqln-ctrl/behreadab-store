import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// @POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'cod', notes = '' } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'No items in order' });

  // Verify each product and build verified items
  let itemsTotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const { data: product } = await supabase
      .from('products')
      .select('id, name, image, price, cost_price, inventory(stock_qty, reserved_qty)')
      .eq('id', item.product_id)
      .eq('is_active', true)
      .single();

    if (!product) return res.status(404).json({ message: `Product not found` });

    const available = (product.inventory?.stock_qty || 0) - (product.inventory?.reserved_qty || 0);
    if (available < item.qty)
      return res.status(400).json({ message: `${product.name} has only ${available} units available` });

    verifiedItems.push({
      product_id: product.id,
      name:       product.name,
      image:      product.image,
      price:      product.price,
      cost_price: product.cost_price,
      qty:        item.qty,
    });
    itemsTotal += product.price * item.qty;
  }

  const shippingCost = itemsTotal >= 5000 ? 0 : 500; // Free shipping over PKR 5000
  const totalAmount  = itemsTotal + shippingCost;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: req.user.id,
      items_total:      itemsTotal,
      shipping_cost:    shippingCost,
      total_amount:     totalAmount,
      payment_method:   paymentMethod,
      shipping_address: shippingAddress,
      notes,
    })
    .select()
    .single();

  if (orderError) return res.status(400).json({ message: orderError.message });

  // Insert order items
  await supabase.from('order_items').insert(
    verifiedItems.map((i) => ({ ...i, order_id: order.id }))
  );

  // Reduce inventory + log transactions
  for (const item of verifiedItems) {
    await supabase.from('inventory_transactions').insert({
      product_id: item.product_id,
      type:       'sale',
      qty_change: -item.qty,
      notes:      `Order ${order.id.slice(-8).toUpperCase()}`,
    });
  }

  // Create payment record
  await supabase.from('payments').insert({
    order_id: order.id,
    provider: paymentMethod,
    amount:   totalAmount,
    currency: 'PKR',
    status:   paymentMethod === 'cod' ? 'pending' : 'pending',
  });

  // Double-entry ledger entries
  // 1. Revenue entry: debit accounts_receivable, credit revenue
  await supabase.from('ledger_entries').insert({
    order_id:       order.id,
    type:           'sale',
    debit_account:  'accounts_receivable',
    credit_account: 'revenue',
    amount:         itemsTotal,
    currency:       'PKR',
    description:    `Sale — Order #${order.id.slice(-8).toUpperCase()}`,
  });

  // 2. COGS entry: debit cogs, credit inventory_asset
  const totalCogs = verifiedItems.reduce((acc, i) => acc + i.cost_price * i.qty, 0);
  if (totalCogs > 0) {
    await supabase.from('ledger_entries').insert({
      order_id:       order.id,
      type:           'cogs',
      debit_account:  'cogs',
      credit_account: 'inventory_asset',
      amount:         totalCogs,
      currency:       'PKR',
      description:    `Cost of goods — Order #${order.id.slice(-8).toUpperCase()}`,
    });
  }

  // 3. Shipping entry
  if (shippingCost > 0) {
    await supabase.from('ledger_entries').insert({
      order_id:       order.id,
      type:           'shipping',
      debit_account:  'accounts_receivable',
      credit_account: 'shipping_income',
      amount:         shippingCost,
      currency:       'PKR',
      description:    `Shipping — Order #${order.id.slice(-8).toUpperCase()}`,
    });
  }

  res.status(201).json(order);
});

// @GET /api/orders/my
export const getMyOrders = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*), users(name, email)')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ message: 'Order not found' });

  if (data.user_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });

  res.json(data);
});

// @PUT /api/orders/:id/pay
export const markAsPaid = asyncHandler(async (req, res) => {
  const { provider_ref } = req.body;

  const { data: order } = await supabase
    .from('orders').select('*').eq('id', req.params.id).single();
  if (!order) return res.status(404).json({ message: 'Order not found' });

  await supabase.from('orders').update({
    is_paid: true,
    paid_at: new Date().toISOString(),
    status:  'Processing',
  }).eq('id', req.params.id);

  await supabase.from('payments').update({
    status: 'completed', paid_at: new Date().toISOString(), provider_ref: provider_ref || '',
  }).eq('order_id', req.params.id);

  // Ledger: cash received — debit cash, credit accounts_receivable
  await supabase.from('ledger_entries').insert({
    order_id:       order.id,
    type:           'sale',
    debit_account:  'cash',
    credit_account: 'accounts_receivable',
    amount:         order.total_amount,
    currency:       'PKR',
    description:    `Payment received — Order #${order.id.slice(-8).toUpperCase()}`,
  });

  res.json({ message: 'Order marked as paid' });
});

// ── Admin routes ──

// @GET /api/orders  [admin]
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  let query = supabase
    .from('orders')
    .select('*, users(name, email), order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const from = (Number(page) - 1) * Number(limit);
  query = query.range(from, from + Number(limit) - 1);

  const { data, error, count } = await query;
  if (error) return res.status(400).json({ message: error.message });

  res.json({ orders: data, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
});

// @PUT /api/orders/:id/status  [admin]
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, tracking_number } = req.body;

  const updates = { status };
  if (tracking_number) updates.tracking_number = tracking_number;
  if (status === 'Delivered') updates.delivered_at = new Date().toISOString();

  // If cancelled — reverse inventory
  if (status === 'Cancelled') {
    const { data: items } = await supabase
      .from('order_items').select('*').eq('order_id', req.params.id);

    for (const item of items) {
      await supabase.from('inventory_transactions').insert({
        product_id: item.product_id,
        type:       'return',
        qty_change: item.qty,
        notes:      `Cancelled order ${req.params.id.slice(-8).toUpperCase()}`,
      });
    }

    // Ledger reversal
    await supabase.from('ledger_entries').insert({
      order_id:       req.params.id,
      type:           'refund',
      debit_account:  'revenue',
      credit_account: 'accounts_receivable',
      amount:         (await supabase.from('orders').select('total_amount').eq('id', req.params.id).single()).data.total_amount,
      currency:       'PKR',
      description:    `Cancellation — Order #${req.params.id.slice(-8).toUpperCase()}`,
    });
  }

  const { data, error } = await supabase
    .from('orders').update(updates).eq('id', req.params.id).select().single();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});
