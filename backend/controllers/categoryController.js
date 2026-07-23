import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// Public — get all categories
export const getCategories = asyncHandler(async (req, res) => {
  const { featured } = req.query;
  let query = supabase.from('categories').select('*').order('sort_order', { ascending: true });
  if (featured === 'true') query = query.eq('is_featured', true);
  const { data, error } = await query;
  if (error) return res.status(400).json({ message: error.message });
  res.json(data || []);
});

// Admin — create category
export const createCategory = asyncHandler(async (req, res) => {
  const { name, image_url, is_featured, sort_order } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const { data, error } = await supabase.from('categories').insert({
    name: name.trim(), slug, image_url: image_url || '',
    is_featured: !!is_featured, sort_order: Number(sort_order || 0),
  }).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

// Admin — update category
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, image_url, is_featured, sort_order } = req.body;
  const updates = {};
  if (name       !== undefined) { updates.name = name.trim(); updates.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
  if (image_url  !== undefined) updates.image_url  = image_url;
  if (is_featured !== undefined) updates.is_featured = !!is_featured;
  if (sort_order !== undefined) updates.sort_order = Number(sort_order);
  const { data, error } = await supabase.from('categories').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// Admin — delete category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: 'Deleted' });
});
