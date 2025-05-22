import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL is not set.');
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set.');
}

if (!supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.');
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
