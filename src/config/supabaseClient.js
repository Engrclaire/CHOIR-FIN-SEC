import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Supabase environment variables are missing! " +
    "Please check that your `.env` file is named correctly in your root folder " +
    "and that you restarted your local development server."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);