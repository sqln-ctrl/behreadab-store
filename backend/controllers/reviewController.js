import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// @GET /api/reviews [admin] - all reviews with user+product
export const getAllReviews = asyncHandler(async (req, res) => {
  const { featured, page = 1, limit = 30 } = req.query;
  let query = supabase.from('reviews')
    .select('*, users(name, email, avatar), products(name, image)', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (featured === 'true') query = query.eq('is_featured', true);
  const from = (Number(page) - 1) * Number(limit);
  query = query.range(from, from + Number(limit) - 1);
  const { data, error, count } = await query;
  if (error) return res.status(400).json({ message: error.message });
  res.json({ reviews: data, total: count });
});

// @POST /api/reviews/manual [admin] - add manual review (WhatsApp/Instagram customers)
export const createManualReview = asyncHandler(async (req, res) => {
  const { product_id, customer_name, rating, comment, is_featured = false } = req.body;
  if (!product_id || !customer_name || !rating) {
    return res.status(400).json({ message: 'product_id, customer_name and rating required' });
  }
  // Create a guest entry in reviews without user_id
  const { data, error } = await supabase.from('reviews').insert({
    product_id,
    guest_name:  customer_name,
    rating:      Number(rating),
    comment:     comment || '',
    is_featured: !!is_featured,
    source:      'manual',
  }).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

// @PUT /api/reviews/:id/feature [admin]
export const featureReview = asyncHandler(async (req, res) => {
  const { is_featured } = req.body;
  const { data, error } = await supabase.from('reviews')
    .update({ is_featured: !!is_featured }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @DELETE /api/reviews/:id [admin]
export const deleteReview = asyncHandler(async (req, res) => {
  await supabase.from('reviews').delete().eq('id', req.params.id);
  res.json({ message: 'Review deleted' });
});

// @GET /api/reviews/featured - public endpoint for homepage testimonials
export const getFeaturedReviews = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('reviews')
    .select('*, users(name, avatar), products(name)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});
