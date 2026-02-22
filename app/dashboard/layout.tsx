"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function checkSession() {
            // 1. Get current session from local storage/cookies via Supabase
            const { data: { session }, error } = await supabase.auth.getSession();

            if (isMounted) {
                if (error || !session) {
                    router.replace("/login");
                } else {
                    setIsAuthenticated(true);
                    setIsChecking(false);
                }
            }
        }

        checkSession();

        // 2. Listen to active auth state changes (e.g., if user tabs out and logs out)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                if (!session) {
                    router.replace("/login");
                } else {
                    setIsAuthenticated(true);
                    setIsChecking(false);
                }
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [router]);

    // Handle the loading overlay state cleanly using Framer Motion
    if (isChecking) {
        return (
            <main
                className="min-h-screen flex items-center justify-center text-foreground relative overflow-hidden"
                style={{
                    background:
                        "linear-gradient(135deg, oklch(0.18 0.02 285) 0%, oklch(0.14 0.005 285) 100%)",
                }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center relative z-10"
                >
                    <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 shadow-xl mb-6 backdrop-blur-md">
                        <ShieldCheck className="h-8 w-8 text-indigo-400" />
                    </div>
                    <Loader2 className="h-6 w-6 text-white/70 animate-spin mb-4" />
                    <p className="text-sm font-semibold text-white/70 tracking-wide uppercase">
                        Verifying Access
                    </p>
                </motion.div>
            </main>
        );
    }

    // Prevent UI flash if jumping to login
    if (!isAuthenticated) return null;

    return <>{children}</>;
}
