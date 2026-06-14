import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// @GET /api/users/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*, products(id, name, image, price, rating, badge, category)')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @POST /api/users/wishlist/toggle
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { product_id } = req.body;

  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('product_id', product_id)
    .single();

  if (existing) {
    await supabase.from('wishlist_items').delete().eq('id', existing.id);
    return res.json({ wishlisted: false });
  }

  await supabase.from('wishlist_items').insert({ user_id: req.user.id, product_id });
  res.json({ wishlisted: true });
});

// @GET /api/users/addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', req.user.id)
    .order('is_default', { ascending: false });

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @POST /api/users/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const { full_name, phone, street, city, province, postal_code, is_default } = req.body;

  if (is_default) {
    await supabase.from('addresses')
      .update({ is_default: false })
      .eq('user_id', req.user.id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({ user_id: req.user.id, full_name, phone, street, city, province, postal_code: postal_code || '', is_default: !!is_default })
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

// @PUT /api/users/addresses/:id
export const updateAddress = asyncHandler(async (req, res) => {
  if (req.body.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @DELETE /api/users/addresses/:id
export const deleteAddress = asyncHandler(async (req, res) => {
  await supabase.from('addresses')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  res.json({ message: 'Address deleted' });
});
