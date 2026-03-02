import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hvpbmgkurabdjyyyjeeq.supabase.co";
    if (supabaseUrl && !supabaseUrl.startsWith("http")) {
        supabaseUrl = `https://${supabaseUrl}`;
    }

    const supabase = createServerClient(
        supabaseUrl,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
            cookieOptions: {
                name: "sb-adsparkle-auth-token",
            },
        }
    );

    // Get the current user session
    // Using getUser() performs a secure network check with Supabase to validate the token.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protect all routes under /dashboard
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        // If there's no user session, redirect to login
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/dashboard/:path*",
    ],
};
