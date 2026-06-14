import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';

// @POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name } },
  });

  if (error) return res.status(400).json({ message: error.message });

  res.status(201).json({
    user: { id: data.user.id, email: data.user.email, name },
    session: data.session,
    message: 'Account created. Check your email to verify.',
  });
});

// @POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ message: 'Invalid email or password' });

  console.log('Auth UID:', data.user.id);

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  console.log('Profile:', profile);
  console.log('Profile error:', profileError?.message);
  console.log('Profile code:', profileError?.code);

  if (!profile?.is_active)
    return res.status(403).json({ message: 'Account has been deactivated' });

  res.json({ user: profile, session: data.session });
});

// @POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  await supabase.auth.signOut();
  res.json({ message: 'Logged out' });
});

// @GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const updates = {};

  if (name || email) {
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
      ...(email && { email }),
      ...(password && { password }),
    });
    if (error) return res.status(400).json({ message: error.message });
  }

  if (name) updates.name = name;
  if (email) updates.email = email;

  if (Object.keys(updates).length > 0) {
    const { data, error } = await supabase
      .from('users').update(updates).eq('id', req.user.id).select().single();
    if (error) return res.status(400).json({ message: error.message });
    return res.json(data);
  }

  res.json(req.user);
});