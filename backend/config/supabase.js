import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// Service role key — full access, bypasses RLS. Only used server-side.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: ws, // Fix for Node.js < 22
    },
  }
);

export default supabase;
