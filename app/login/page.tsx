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
import { Sparkle, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
        <main className="min-h-screen flex items-center justify-center p-6 bg-[#0F0F12] text-white relative overflow-hidden font-sans selection:bg-[#7C3AED]/30">
            {/* Background glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED]/10 rounded-full blur-[150px] pointer-events-none -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md mx-auto relative z-10"
            >
                <div className="rounded-3xl border border-[#27272A] bg-[#18181B] shadow-2xl overflow-hidden p-2">
                    <Card className="border-0 bg-transparent shadow-none">
                        <CardHeader className="space-y-3 pb-6 text-center pt-8">
                            <div className="flex justify-center mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#27272A]/50 shadow-inner" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                                    <Sparkle className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-white">
                                Admin Login
                            </CardTitle>
                            <CardDescription className="text-sm text-[#A1A1AA]">
                                Enter your credentials to access the AdSparkle dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="admin@adsparkle.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="h-12 rounded-xl bg-[#0F0F12] border-[#27272A] text-white placeholder:text-[#3F3F46] focus-visible:ring-2 focus-visible:ring-[#7C3AED]/50 focus-visible:border-[#7C3AED] transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                                            Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            className="h-12 rounded-xl bg-[#0F0F12] border-[#27272A] text-white placeholder:text-[#3F3F46] focus-visible:ring-2 focus-visible:ring-[#7C3AED]/50 focus-visible:border-[#7C3AED] transition-all pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white transition-colors h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#27272A]"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-white bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#6D28D9] hover:to-[#4C1D95] border border-[#7C3AED]/30 shadow-[0_0_20px_rgba(124,58,237,0.15)] hover:shadow-[0_0_25px_rgba(124,58,237,0.25)] hover:-translate-y-0.5"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </main>
    );
}
