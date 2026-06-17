import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// Service role key bypasses ALL RLS policies — safe for server-side only
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
    realtime: {
      transport: ws,
    },
  }
);

export default supabase;
