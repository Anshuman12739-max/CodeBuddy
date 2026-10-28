import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseReady = Boolean(
  supabaseUrl && 
  !supabaseUrl.includes('placeholder') && 
  supabaseKey && 
  !supabaseKey.includes('placeholder')
);

export const supabase = isSupabaseReady 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
