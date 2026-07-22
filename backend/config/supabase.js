import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }, realtime: { transport: ws } }
);
export default supabase;
