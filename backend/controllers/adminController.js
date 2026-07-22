import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [allOrders, products, users, revenueRes, lowStock, recentOrders] = await Promise.all([
    supabase.from('orders').select('id, status, total_amount, created_at, items_total, shipping_cost').eq('is_deleted', false),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('ledger_entries').select('amount').eq('credit_account', 'revenue'),
    supabase.from('inventory').select('*, products(name, image)').lte('stock_qty', 5),
    supabase.from('orders').select('*, users(name, email), order_items(*)').eq('is_deleted', false).order('created_at', { ascending: false }).limit(8),
  ]);

  const orders = allOrders.data || [];
  const totalOrders     = orders.length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const pendingOrders   = orders.filter(o => !['Delivered','Cancelled'].includes(o.status)).length;
  const totalRevenue    = (revenueRes.data || []).reduce((acc, r) => acc + Number(r.amount), 0);

  const statusCounts = {};
  for (const o of orders) statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;

  res.json({
    totalOrders, cancelledOrders, deliveredOrders, pendingOrders,
    totalProducts: products.count || 0,
    totalUsers:    users.count    || 0,
    totalRevenue,
    lowStock:      lowStock.data  || [],
    recentOrders:  recentOrders.data || [],
    statusCounts:  Object.entries(statusCounts).map(([_id, count]) => ({ _id, count })),
  });
});

export const getHeroConfig = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('hero_config').select('*').limit(1).single();

  // Return defaults if no row exists yet
  if (error || !data) {
    return res.json({
      headline: 'Andaaz', subheadline: 'اندازِ وقت',
      subtext: 'Premium watches crafted for those who understand that time is not just measured — it is worn.',
      image_url: '', badge_text: '', badge_sub: '', from_price: '', discount_text: '', cta_text: 'Shop Now',
      featured_product_id: null, featured_image_index: 0,
      product_size: 280, product_position: 'right',
      hero_height: '100vh', bg_opacity: 20, show_bg_media: true,
    });
  }
  res.json(data);
});

export const updateHeroConfig = asyncHandler(async (req, res) => {
  // Remove undefined/null keys that would cause issues
  const body = { ...req.body };

  // Clean up: ensure numeric fields are numbers
  if (body.product_size        !== undefined) body.product_size        = Number(body.product_size);
  if (body.featured_image_index !== undefined) body.featured_image_index = Number(body.featured_image_index);
  if (body.bg_opacity          !== undefined) body.bg_opacity          = Number(body.bg_opacity);

  // Remove empty string product ID (should be null)
  if (body.featured_product_id === '' || body.featured_product_id === undefined) {
    body.featured_product_id = null;
  }

  console.log('[Hero] Saving:', JSON.stringify(body, null, 2));

  const { data: existing, error: fetchErr } = await supabase
    .from('hero_config').select('id').limit(1).single();

  let result;
  if (existing?.id) {
    // Update existing row
    result = await supabase
      .from('hero_config')
      .update(body)
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    // No row exists — insert first row
    result = await supabase
      .from('hero_config')
      .insert(body)
      .select()
      .single();
  }

  if (result.error) {
    console.error('[Hero] Save error:', result.error);
    return res.status(400).json({ message: result.error.message, details: result.error.details });
  }

  console.log('[Hero] Saved successfully:', result.data?.id);
  res.json(result.data);
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  let query = supabase.from('users').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  const from = (Number(page) - 1) * Number(limit);
  query = query.range(from, from + Number(limit) - 1);
  const { data, error, count } = await query;
  if (error) return res.status(400).json({ message: error.message });
  res.json({ users: data, total: count });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { is_active, role } = req.body;
  const updates = {};
  if (is_active !== undefined) updates.is_active = is_active;
  if (role      !== undefined) updates.role       = role;
  const { data, error } = await supabase.from('users').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

export const getUserById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('users')
    .select('*, orders(id, total_amount, status, created_at), addresses(*)').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ message: 'User not found' });
  res.json(data);
});
