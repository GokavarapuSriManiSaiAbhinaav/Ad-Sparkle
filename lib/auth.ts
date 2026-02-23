import { createClient } from "@/lib/supabase/server";

/**
 * Validates the current user session and checks if the user is an admin.
 * Requires user.id to be listed in the public 'admins' table. 
 */
export async function verifyAdmin() {
    const supabase = await createClient();

    // 1. Get current session securely via server client
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { isAuth: false, isAdmin: false, user: null };
    }

    // 2. Fetch admin row from "admins" table using auth.uid()
    const { data: admin, error } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .single();

    if (error || !admin) {
        return { isAuth: true, isAdmin: false, user };
    }

    // 3. Return true if admin exists
    return { isAuth: true, isAdmin: true, user };
}
