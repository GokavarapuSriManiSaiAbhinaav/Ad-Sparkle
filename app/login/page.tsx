"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Sparkles, Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter both email and password.");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            // Verify if user is an admin
            if (data?.user) {
                const { data: admin, error: adminError } = await supabase
                    .from("admins")
                    .select("id")
                    .eq("id", data.user.id)
                    .single();

                if (adminError || !admin) {
                    await supabase.auth.signOut();
                    toast.error("Access denied. Admin privileges required.");
                    setLoading(false);
                    return;
                }
            }

            toast.success("Successfully logged in!");
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Failed to log in.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="min-h-screen flex items-center justify-center p-6 text-foreground relative overflow-hidden"
            style={{
                background:
                    "linear-gradient(135deg, oklch(0.18 0.02 285) 0%, oklch(0.14 0.005 285) 100%)",
            }}
        >
            {/* Background glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                className="w-full max-w-md mx-auto relative z-10"
            >
                <Card className="rounded-2xl border-border/60 shadow-2xl bg-card overflow-hidden">
                    <CardHeader className="space-y-3 pb-6 text-center pt-8">
                        <div className="flex justify-center mb-2">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                                style={{
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                }}
                            >
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Admin Login
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Welcome back to AdSparkle. Please enter your credentials to access the admin dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="admin@adsparkle.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className="h-12 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/50"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Password
                                    </label>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    className="h-12 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/50"
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                                    style={{
                                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                        color: "white",
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="h-5 w-5" />
                                            Sign in securely
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    );
}
