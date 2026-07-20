import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import supabase from '../config/supabase.js';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const authClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws } });
    const { data: { user }, error } = await authClient.auth.getUser(token);
    if (error || !user) return res.status(401).json({ message: 'Invalid token' });
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (!profile) return res.status(401).json({ message: 'User not found' });
    if (!profile.is_active) return res.status(403).json({ message: 'Account deactivated' });
    req.user = profile;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};
