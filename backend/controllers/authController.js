import asyncHandler from 'express-async-handler';
import supabase from '../config/supabase.js';
import { sendOTPEmail } from '../config/mailer.js';

// Generate 6-digit OTP
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

  // Create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { name },
  });
  if (error) return res.status(400).json({ message: error.message });

  // Generate OTP and store it
  const otp      = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  await supabase.from('users').upsert({
    id: data.user.id, name, email, role: 'user', is_active: true,
    otp, otp_expiry: otpExpiry, is_verified: false,
  });

  // Send OTP email
  sendOTPEmail({ to: email, name, otp }).catch(err => console.error('[Mail] OTP failed:', err));

  res.status(201).json({ message: 'OTP sent to your email. Please verify to continue.', userId: data.user.id, requiresOTP: true });
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ message: 'userId and OTP required' });

  const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single();
  if (!profile) return res.status(404).json({ message: 'User not found' });

  if (profile.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  if (new Date() > new Date(profile.otp_expiry)) return res.status(400).json({ message: 'OTP expired. Please register again.' });

  // Mark as verified
  await supabase.from('users').update({ is_verified: true, otp: null, otp_expiry: null }).eq('id', userId);

  // Auto-login
  const { data: session } = await supabase.auth.signInWithPassword({ email: profile.email, password: req.body.password }).catch(() => ({ data: null }));

  res.json({ message: 'Email verified!', user: { ...profile, is_verified: true }, session: session?.session || null });
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single();
  if (!profile) return res.status(404).json({ message: 'User not found' });

  const otp       = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await supabase.from('users').update({ otp, otp_expiry: otpExpiry }).eq('id', userId);
  sendOTPEmail({ to: profile.email, name: profile.name, otp }).catch(console.error);
  res.json({ message: 'New OTP sent' });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ message: 'Invalid email or password' });

  let { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
  if (!profile) {
    const { data: np } = await supabase.from('users').insert({ id: data.user.id, name: data.user.user_metadata?.name || email.split('@')[0], email, role: 'user', is_active: true, is_verified: true }).select().single();
    profile = np;
  }

  if (!profile.is_active) return res.status(403).json({ message: 'Account deactivated' });

  // If OTP verification is enabled and not verified
  if (profile.is_verified === false) {
    const otp       = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await supabase.from('users').update({ otp, otp_expiry: otpExpiry }).eq('id', profile.id);
    sendOTPEmail({ to: email, name: profile.name, otp }).catch(console.error);
    return res.status(403).json({ message: 'Email not verified. New OTP sent.', userId: profile.id, requiresOTP: true });
  }

  res.json({ user: profile, session: data.session });
});

export const logout = asyncHandler(async (req, res) => {
  await supabase.auth.signOut();
  res.json({ message: 'Logged out' });
});

export const getMe = asyncHandler(async (req, res) => { res.json(req.user); });

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
