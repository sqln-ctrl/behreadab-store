import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// ── INVENTORY ──

// @GET /api/inventory  [admin]
export const getInventory = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(id, name, image, category, price, cost_price, is_active)')
    .order('stock_qty', { ascending: true });

  if (error) return res.status(400).json({ message: error.message });

  // Flag low stock
  const enriched = data.map((item) => ({
    ...item,
    available_qty: item.stock_qty - item.reserved_qty,
    is_low_stock:  item.stock_qty <= item.reorder_point,
  }));

  res.json(enriched);
});

// @POST /api/inventory/adjust  [admin] — manual stock adjustment
export const adjustStock = asyncHandler(async (req, res) => {
  const { product_id, qty_change, type = 'adjustment', notes = '' } = req.body;

  if (!product_id || qty_change === undefined)
    return res.status(400).json({ message: 'product_id and qty_change required' });

  // Check stock won't go negative
  const { data: inv } = await supabase
    .from('inventory').select('stock_qty').eq('product_id', product_id).single();

  if (!inv) return res.status(404).json({ message: 'Inventory record not found' });
  if (inv.stock_qty + Number(qty_change) < 0)
    return res.status(400).json({ message: 'Adjustment would result in negative stock' });

  const { data, error } = await supabase
    .from('inventory_transactions')
    .insert({ product_id, type, qty_change: Number(qty_change), notes })
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @GET /api/inventory/transactions  [admin]
export const getTransactions = asyncHandler(async (req, res) => {
  const { product_id, type, page = 1, limit = 30 } = req.query;

  let query = supabase
    .from('inventory_transactions')
    .select('*, products(name, image), suppliers(name)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (product_id) query = query.eq('product_id', product_id);
  if (type)       query = query.eq('type', type);

  const from = (Number(page) - 1) * Number(limit);
  query = query.range(from, from + Number(limit) - 1);

  const { data, error, count } = await query;
  if (error) return res.status(400).json({ message: error.message });
  res.json({ transactions: data, total: count });
});

// ── SUPPLIERS ──

// @GET /api/suppliers  [admin]
export const getSuppliers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*, purchase_orders(id, status, total_cost, created_at)')
    .eq('is_active', true)
    .order('name');

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @POST /api/suppliers  [admin]
export const createSupplier = asyncHandler(async (req, res) => {
  const { name, contact_name, email, phone, address, notes } = req.body;
  if (!name) return res.status(400).json({ message: 'Supplier name required' });

  const { data, error } = await supabase
    .from('suppliers')
    .insert({ name, contact_name, email, phone, address, notes })
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

// @PUT /api/suppliers/:id  [admin]
export const updateSupplier = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('suppliers')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @DELETE /api/suppliers/:id  [admin]
export const deleteSupplier = asyncHandler(async (req, res) => {
  await supabase.from('suppliers').update({ is_active: false }).eq('id', req.params.id);
  res.json({ message: 'Supplier deactivated' });
});

// ── PURCHASE ORDERS ──

// @GET /api/purchase-orders  [admin]
export const getPurchaseOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let query = supabase
    .from('purchase_orders')
    .select('*, suppliers(name, contact_name, email, phone), purchase_order_items(*, products(name, image, price))')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @POST /api/purchase-orders  [admin]
export const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { supplier_id, items, expected_date, notes } = req.body;

  if (!supplier_id || !items?.length)
    return res.status(400).json({ message: 'supplier_id and items required' });

  // Calculate total cost
  const total_cost = items.reduce((acc, i) => acc + i.qty * i.unit_cost, 0);

  const { data: po, error } = await supabase
    .from('purchase_orders')
    .insert({ supplier_id, total_cost, expected_date, notes })
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });

  // Insert PO items
  await supabase.from('purchase_order_items').insert(
    items.map((i) => ({
      purchase_order_id: po.id,
      product_id:        i.product_id,
      qty:               i.qty,
      unit_cost:         i.unit_cost,
    }))
  );

  // Ledger: record the liability — debit inventory_asset, credit accounts_payable
  await supabase.from('ledger_entries').insert({
    purchase_order_id: po.id,
    type:              'restock',
    debit_account:     'inventory_asset',
    credit_account:    'accounts_payable',
    amount:            total_cost,
    currency:          'PKR',
    description:       `Purchase Order #${po.id.slice(-8).toUpperCase()} — ${req.body.supplier_name || ''}`,
  });

  res.status(201).json(po);
});

// @PUT /api/purchase-orders/:id/receive  [admin]
// Called when stock physically arrives
export const receivePurchaseOrder = asyncHandler(async (req, res) => {
  const { received_items } = req.body; // [{purchase_order_item_id, qty_received}]

  const { data: po } = await supabase
    .from('purchase_orders')
    .select('*, purchase_order_items(*, products(id, name, cost_price))')
    .eq('id', req.params.id)
    .single();

  if (!po) return res.status(404).json({ message: 'Purchase order not found' });

  for (const received of received_items) {
    const poItem = po.purchase_order_items.find((i) => i.id === received.purchase_order_item_id);
    if (!poItem) continue;

    // Update qty_received
    await supabase.from('purchase_order_items')
      .update({ qty_received: poItem.qty_received + received.qty_received })
      .eq('id', received.purchase_order_item_id);

    // Log inventory transaction
    await supabase.from('inventory_transactions').insert({
      product_id:        poItem.product_id,
      supplier_id:       po.supplier_id,
      purchase_order_id: po.id,
      type:              'restock',
      qty_change:        received.qty_received,
      notes:             `Received from PO #${po.id.slice(-8).toUpperCase()}`,
    });

    // Update cost_price on product (weighted average can be added later)
    await supabase.from('products')
      .update({ cost_price: poItem.unit_cost })
      .eq('id', poItem.product_id);
  }

  // Mark PO as received
  await supabase.from('purchase_orders').update({
    status:        'Received',
    received_date: new Date().toISOString(),
  }).eq('id', req.params.id);

  // Ledger: pay supplier — debit accounts_payable, credit cash
  await supabase.from('ledger_entries').insert({
    purchase_order_id: po.id,
    type:              'expense',
    debit_account:     'accounts_payable',
    credit_account:    'cash',
    amount:            po.total_cost,
    currency:          'PKR',
    description:       `Payment to supplier — PO #${po.id.slice(-8).toUpperCase()}`,
  });

  res.json({ message: 'Purchase order received and inventory updated' });
});

// @PUT /api/purchase-orders/:id  [admin]
export const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});
