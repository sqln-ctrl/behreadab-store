import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// @GET /api/admin/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [ordersRes, productsRes, usersRes, revenueRes, lowStockRes, recentOrdersRes, statusRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('ledger_entries').select('amount').eq('credit_account', 'revenue'),
    supabase.from('inventory').select('*, products(name, image)').lte('stock_qty', supabase.raw('reorder_point')),
    supabase.from('orders').select('*, users(name, email)').order('created_at', { ascending: false }).limit(8),
    supabase.from('orders').select('status'),
  ]);

  const totalRevenue = revenueRes.data?.reduce((acc, r) => acc + Number(r.amount), 0) || 0;

  // Status breakdown
  const statusCounts = {};
  for (const row of (statusRes.data || [])) {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  }

  res.json({
    totalOrders:   ordersRes.count   || 0,
    totalProducts: productsRes.count || 0,
    totalUsers:    usersRes.count    || 0,
    totalRevenue,
    lowStock:      lowStockRes.data  || [],
    recentOrders:  recentOrdersRes.data || [],
    statusCounts:  Object.entries(statusCounts).map(([_id, count]) => ({ _id, count })),
  });
});

// @GET /api/admin/hero
export const getHeroConfig = asyncHandler(async (req, res) => {
  const { data } = await supabase.from('hero_config').select('*').limit(1).single();
  res.json(data);
});

// @PUT /api/admin/hero  [admin]
export const updateHeroConfig = asyncHandler(async (req, res) => {
  const { data: existing } = await supabase.from('hero_config').select('id').limit(1).single();

  const { data, error } = await supabase
    .from('hero_config')
    .update(req.body)
    .eq('id', existing.id)
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @GET /api/admin/users  [admin]
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

  const from = (Number(page) - 1) * Number(limit);
  query = query.range(from, from + Number(limit) - 1);

  const { data, error, count } = await query;
  if (error) return res.status(400).json({ message: error.message });
  res.json({ users: data, total: count });
});

// @PUT /api/admin/users/:id  [admin]
export const updateUser = asyncHandler(async (req, res) => {
  const { is_active, role } = req.body;
  const updates = {};
  if (is_active !== undefined) updates.is_active = is_active;
  if (role !== undefined)      updates.role       = role;

  const { data, error } = await supabase
    .from('users').update(updates).eq('id', req.params.id).select().single();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @GET /api/admin/users/:id  [admin]
export const getUserById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, orders(id, total_amount, status, created_at), addresses(*)')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ message: 'User not found' });
  res.json(data);
});
