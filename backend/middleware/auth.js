import supabase from '../config/supabase.js';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    // Verify the JWT using service role client
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('Auth error:', error?.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Fetch profile — service role bypasses RLS, no recursion issue
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('Profile fetch:', profile?.email, profileError?.message);

    if (!profile) return res.status(401).json({ message: 'User profile not found' });
    if (!profile.is_active) return res.status(403).json({ message: 'Account deactivated' });

    req.user = profile;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};
