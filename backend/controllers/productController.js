import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// @GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort, minPrice, maxPrice, page = 1, limit = 12, featured } = req.query;

  let query = supabase
    .from('products')
    .select('*, inventory(stock_qty, reserved_qty, reorder_point)', { count: 'exact' })
    .eq('is_active', true);

  if (category && category !== 'All') query = query.eq('category', category);
  if (featured === 'true') query = query.eq('is_featured', true);
  if (search) query = query.ilike('name', `%${search}%`);
  if (minPrice) query = query.gte('price', Number(minPrice));
  if (maxPrice) query = query.lte('price', Number(maxPrice));

  const sortMap = {
    'price-asc':  { column: 'price',      ascending: true },
    'price-desc': { column: 'price',      ascending: false },
    'rating':     { column: 'rating',     ascending: false },
    'newest':     { column: 'created_at', ascending: false },
  };
  const s = sortMap[sort] || { column: 'created_at', ascending: false };
  query = query.order(s.column, { ascending: s.ascending });

  const from = (Number(page) - 1) * Number(limit);
  query = query.range(from, from + Number(limit) - 1);

  const { data, error, count } = await query;
  if (error) return res.status(400).json({ message: error.message });

  res.json({ products: data, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
});

// @GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, inventory(*), reviews(*, users(name, avatar))')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ message: 'Product not found' });
  res.json(data);
});

// @POST /api/products [admin]
export const createProduct = asyncHandler(async (req, res) => {
  console.log('Create product body:', req.body);
  console.log('Create product files:', req.files?.length);

  const {
    name, description, price, cost_price,
    category, badge, stock_qty, reorder_point,
    reorder_qty, is_featured,
  } = req.body;

  if (!name || !price || !description) {
    return res.status(400).json({ message: 'Name, price and description are required' });
  }

  const images        = req.files?.map((f) => f.path)     || [];
  const imagePublicIds = req.files?.map((f) => f.filename) || [];

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name:          name.trim(),
      description:   description.trim(),
      price:         Number(price),
      cost_price:    Number(cost_price || 0),
      category:      category || 'Men',
      badge:         badge || null,
      image:         images[0] || '',
      images:        images,
      is_featured:   is_featured === 'true' || is_featured === true,
      is_active:     true,
    })
    .select()
    .single();

  if (error) {
    console.error('Create product error:', error);
    return res.status(400).json({ message: error.message });
  }

  // Create inventory record
  const { error: invError } = await supabase.from('inventory').insert({
    product_id:    product.id,
    stock_qty:     Number(stock_qty || 0),
    reorder_point: Number(reorder_point || 5),
    reorder_qty:   Number(reorder_qty || 20),
  });

  if (invError) console.error('Inventory insert error:', invError);

  // Log initial stock
  if (Number(stock_qty) > 0) {
    await supabase.from('inventory_transactions').insert({
      product_id: product.id,
      type:       'restock',
      qty_change: Number(stock_qty),
      notes:      'Initial stock on product creation',
    });
  }

  res.status(201).json(product);
});

// @PUT /api/products/:id [admin]
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('Update product body:', req.body);

  const {
    name, description, price, cost_price,
    category, badge, is_featured, is_active,
    reorder_point, reorder_qty,
  } = req.body;

  const updates = {};
  if (name        !== undefined) updates.name        = name;
  if (description !== undefined) updates.description = description;
  if (price       !== undefined) updates.price       = Number(price);
  if (cost_price  !== undefined) updates.cost_price  = Number(cost_price);
  if (category    !== undefined) updates.category    = category;
  if (badge       !== undefined) updates.badge       = badge || null;
  if (is_featured !== undefined) updates.is_featured = is_featured === 'true' || is_featured === true;
  if (is_active   !== undefined) updates.is_active   = is_active === 'true' || is_active === true;

  // New images uploaded
  if (req.files?.length) {
    const newImages = req.files.map((f) => f.path);
    const { data: existing } = await supabase
      .from('products').select('images').eq('id', id).single();
    updates.images = [...(existing?.images || []), ...newImages];
    updates.image  = updates.images[0];
  }

  const { data, error } = await supabase
    .from('products').update(updates).eq('id', id).select().single();

  if (error) {
    console.error('Update product error:', error);
    return res.status(400).json({ message: error.message });
  }

  // Update inventory settings
  const invUpdates = {};
  if (reorder_point !== undefined) invUpdates.reorder_point = Number(reorder_point);
  if (reorder_qty   !== undefined) invUpdates.reorder_qty   = Number(reorder_qty);
  if (Object.keys(invUpdates).length > 0) {
    await supabase.from('inventory').update(invUpdates).eq('product_id', id);
  }

  res.json(data);
});

// @DELETE /api/products/:id [admin]
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('products').update({ is_active: false }).eq('id', id);
  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: 'Product deactivated' });
});

// @POST /api/products/:id/reviews
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { id: product_id }  = req.params;

  const { data, error } = await supabase
    .from('reviews')
    .insert({ product_id, user_id: req.user.id, rating: Number(rating), comment })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(400).json({ message: 'Already reviewed' });
    return res.status(400).json({ message: error.message });
  }
  res.status(201).json(data);
});
