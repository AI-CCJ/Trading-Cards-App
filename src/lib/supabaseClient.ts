import { createClient } from '@supabase/supabase-js';

console.log('Initializing Supabase client...');
const supabaseUrl = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase Config:', { url: supabaseUrl, hasKey: !!supabaseAnonKey });

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
