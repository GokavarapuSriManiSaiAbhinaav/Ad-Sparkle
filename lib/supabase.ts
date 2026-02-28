import { createBrowserClient } from "@supabase/ssr";

// Cache the connection details to avoid recalculation every render
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const getSupabaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvpbmgkurabdjyyyjeeq.supabase.co';
    if (url && !url.startsWith('http')) {
        url = `https://${url}`;
    }
    if (typeof window !== 'undefined') {
        url = `${window.location.origin}/supabase-proxy`;
    }
    return url;
};

const supabaseUrl = getSupabaseUrl();

// Singleton instance wrapper to prevent unnecessary instantiations
let __supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
    if (!__supabaseInstance) {
        __supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
            cookieOptions: {
                name: 'sb-adsparkle-auth-token',
            },
        });
    }
    return __supabaseInstance;
}

// Global instance exported for backward compatibility
export const supabase = getSupabaseBrowserClient();