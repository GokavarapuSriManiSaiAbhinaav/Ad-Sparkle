import { createBrowserClient } from "@supabase/ssr";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    supabaseUrl = `https://${supabaseUrl}`;
}
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);