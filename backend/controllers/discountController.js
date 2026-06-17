import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// @GET /api/discounts  — get all active discounts
export const getDiscounts = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('discounts')
    .select('*, products(id, name, image, price)')
    .eq('is_active', true)
    .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`);

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// @POST /api/discounts  [admin] — apply discount to a product
export const createDiscount = asyncHandler(async (req, res) => {
  const { product_id, type, value, starts_at, ends_at } = req.body;

  if (!product_id || !type || !value)
    return res.status(400).json({ message: 'product_id, type and value required' });

  // Calculate discounted price and update product
  const { data: product } = await supabase
    .from('products').select('price').eq('id', product_id).single();

  if (!product) return res.status(404).json({ message: 'Product not found' });

  const discountedPrice = type === 'percentage'
    ? product.price - (product.price * value / 100)
    : product.price - value;

  // Save original price and update product price
  await supabase.from('products').update({
    original_price: product.price,
    price:          Math.max(0, discountedPrice),
    badge:          'Sale',
  }).eq('id', product_id);

  const { data, error } = await supabase
    .from('discounts')
    .insert({ product_id, type, value, starts_at, ends_at })
    .select().single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

// @DELETE /api/discounts/:id  [admin] — remove discount, restore original price
export const removeDiscount = asyncHandler(async (req, res) => {
  const { data: discount } = await supabase
    .from('discounts').select('*, products(original_price)').eq('id', req.params.id).single();

  if (!discount) return res.status(404).json({ message: 'Discount not found' });

  // Restore original price
  if (discount.products?.original_price) {
    await supabase.from('products').update({
      price:          discount.products.original_price,
      original_price: null,
      badge:          null,
    }).eq('id', discount.product_id);
  }

  await supabase.from('discounts').update({ is_active: false }).eq('id', req.params.id);
  res.json({ message: 'Discount removed, original price restored' });
});

// @GET /api/discounts/all  [admin]
export const getAllDiscounts = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('discounts')
    .select('*, products(id, name, image, price, original_price)')
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});
