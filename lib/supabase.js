import { createClient } from '@supabase/supabase-js';

// This module is server-side only. Never import it in browser-side code.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;
