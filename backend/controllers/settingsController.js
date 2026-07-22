import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// Default settings
const DEFAULTS = {
  delivery_charge: 500,
  free_delivery_threshold: 5000,
  return_days: 30,
  warranty_months: 24,
};

export const getSettings = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('store_settings').select('*').limit(1).single();
  if (error || !data) return res.json(DEFAULTS);
  res.json({ ...DEFAULTS, ...data });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { delivery_charge, free_delivery_threshold, return_days, warranty_months } = req.body;
  const { data: existing } = await supabase.from('store_settings').select('id').limit(1).single();
  const updates = {};
  if (delivery_charge           !== undefined) updates.delivery_charge           = Number(delivery_charge);
  if (free_delivery_threshold   !== undefined) updates.free_delivery_threshold   = Number(free_delivery_threshold);
  if (return_days               !== undefined) updates.return_days               = Number(return_days);
  if (warranty_months           !== undefined) updates.warranty_months           = Number(warranty_months);
  let result;
  if (existing) {
    result = await supabase.from('store_settings').update(updates).eq('id', existing.id).select().single();
  } else {
    result = await supabase.from('store_settings').insert(updates).select().single();
  }
  if (result.error) return res.status(400).json({ message: result.error.message });
  res.json(result.data);
});
