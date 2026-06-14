import supabase from '../config/supabase.js';

// Verify Supabase JWT and attach user to req
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ message: 'Invalid or expired token' });

  // Get full profile from our users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return res.status(401).json({ message: 'User profile not found' });
  if (!profile.is_active) return res.status(403).json({ message: 'Account deactivated' });

  req.user = profile;
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};
