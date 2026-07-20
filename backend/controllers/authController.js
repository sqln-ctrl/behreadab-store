import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
  if (error) return res.status(400).json({ message: error.message });
  await supabase.from('users').upsert({ id: data.user.id, name, email, role: 'user', is_active: true });
  const { data: session } = await supabase.auth.signInWithPassword({ email, password });
  const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
  res.status(201).json({ user: profile, session: session?.session });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ message: 'Invalid email or password' });
  const { data: profile, error: pe } = await supabase.from('users').select('*').eq('id', data.user.id).single();
  if (pe || !profile) {
    const { data: np } = await supabase.from('users').insert({ id: data.user.id, name: data.user.user_metadata?.name || email.split('@')[0], email, role: 'user', is_active: true }).select().single();
    return res.json({ user: np, session: data.session });
  }
  if (!profile.is_active) return res.status(403).json({ message: 'Account deactivated' });
  res.json({ user: profile, session: data.session });
});

export const logout = asyncHandler(async (req, res) => { await supabase.auth.signOut(); res.json({ message: 'Logged out' }); });
export const getMe  = asyncHandler(async (req, res) => { res.json(req.user); });
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (email || password) {
    const au = {}; if (email) au.email = email; if (password) au.password = password;
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, au);
    if (error) return res.status(400).json({ message: error.message });
  }
  const updates = {}; if (name) updates.name = name; if (email) updates.email = email;
  if (Object.keys(updates).length > 0) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', req.user.id).select().single();
    if (error) return res.status(400).json({ message: error.message });
    return res.json(data);
  }
  res.json(req.user);
});
