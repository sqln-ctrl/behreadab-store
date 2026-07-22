import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort, minPrice, maxPrice, page = 1, limit = 12, featured } = req.query;
  let query = supabase.from('products').select('*, inventory(stock_qty, reserved_qty, reorder_point)', { count: 'exact' }).eq('is_active', true);
  if (category && category !== 'All') query = query.eq('category', category);
  if (featured === 'true') query = query.eq('is_featured', true);
  if (search)   query = query.ilike('name', `%${search}%`);
  if (minPrice) query = query.gte('price', Number(minPrice));
  if (maxPrice) query = query.lte('price', Number(maxPrice));
  const sortMap = { 'price-asc': { column:'price', ascending:true }, 'price-desc': { column:'price', ascending:false }, 'rating': { column:'rating', ascending:false }, 'newest': { column:'created_at', ascending:false } };
  const s = sortMap[sort] || { column:'created_at', ascending:false };
  query = query.order(s.column, { ascending: s.ascending });
  const from = (Number(page)-1)*Number(limit);
  query = query.range(from, from+Number(limit)-1);
  const { data, error, count } = await query;
  if (error) return res.status(400).json({ message: error.message });
  res.json({ products: data||[], total: count||0, page: Number(page), pages: Math.ceil((count||0)/Number(limit)) });
});

export const getProductById = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('products').select('*, inventory(*), reviews(*, users(name,avatar))').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ message: 'Product not found' });
  res.json(data);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, cost_price, category, badge, stock_qty, reorder_point, reorder_qty, is_featured, warranty_months, return_days } = req.body;
  if (!name || !price || !description) return res.status(400).json({ message: 'Name, price and description required' });
  const images = req.files?.filter(f=>f.path).map(f=>f.path)||[];
  const { data: product, error } = await supabase.from('products').insert({
    name: name.trim(), description: description.trim(), price: Number(price), cost_price: Number(cost_price||0),
    category: category||'Men', badge: badge||null, image: images[0]||'', images,
    is_featured: is_featured==='true'||is_featured===true, is_active: true,
    warranty_months: warranty_months ? Number(warranty_months) : null,
    return_days: return_days ? Number(return_days) : null,
  }).select().single();
  if (error) return res.status(400).json({ message: error.message });
  await supabase.from('inventory').insert({ product_id: product.id, stock_qty: Number(stock_qty||0), reorder_point: Number(reorder_point||5), reorder_qty: Number(reorder_qty||20) });
  if (Number(stock_qty)>0) await supabase.from('inventory_transactions').insert({ product_id: product.id, type:'restock', qty_change: Number(stock_qty), notes:'Initial stock' });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, cost_price, category, badge, is_featured, is_active, reorder_point, reorder_qty, warranty_months, return_days } = req.body;
  const updates = {};
  if (name!==undefined)        updates.name        = name;
  if (description!==undefined) updates.description = description;
  if (price!==undefined)       updates.price       = Number(price);
  if (cost_price!==undefined)  updates.cost_price  = Number(cost_price);
  if (category!==undefined)    updates.category    = category;
  if (badge!==undefined)       updates.badge       = badge||null;
  if (is_featured!==undefined) updates.is_featured = is_featured==='true'||is_featured===true;
  if (is_active!==undefined)   updates.is_active   = is_active==='true'||is_active===true;
  if (warranty_months!==undefined) updates.warranty_months = warranty_months ? Number(warranty_months) : null;
  if (return_days!==undefined)     updates.return_days     = return_days ? Number(return_days) : null;
  if (req.files?.length) {
    const newImgs = req.files.filter(f=>f.path).map(f=>f.path);
    if (newImgs.length) { const { data:ex } = await supabase.from('products').select('images').eq('id',id).single(); updates.images=[...(ex?.images||[]),...newImgs]; updates.image=updates.images[0]; }
  }
  const { data, error } = await supabase.from('products').update(updates).eq('id',id).select().single();
  if (error) return res.status(400).json({ message: error.message });
  if (reorder_point!==undefined||reorder_qty!==undefined) {
    const inv={}; if(reorder_point!==undefined) inv.reorder_point=Number(reorder_point); if(reorder_qty!==undefined) inv.reorder_qty=Number(reorder_qty);
    await supabase.from('inventory').update(inv).eq('product_id',id);
  }
  res.json(data);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await supabase.from('products').update({ is_active: false }).eq('id', req.params.id);
  res.json({ message: 'Product deactivated' });
});

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { data, error } = await supabase.from('reviews').insert({ product_id: req.params.id, user_id: req.user.id, rating: Number(rating), comment }).select().single();
  if (error) { if (error.code==='23505') return res.status(400).json({ message:'Already reviewed' }); return res.status(400).json({ message: error.message }); }
  res.status(201).json(data);
});
