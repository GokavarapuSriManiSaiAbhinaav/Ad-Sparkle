"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
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
import { Loader2, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

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
        <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-black/20 bg-gradient-to-br from-slate-50 via-white to-slate-100">

            {/* Background glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-black/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-black/[0.04] rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-400/8 rounded-full blur-[80px] pointer-events-none -z-10" />

            {/* Floating decorative circles */}
            <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
                className="absolute top-[15%] left-[10%] h-12 w-12 rounded-full bg-black opacity-5 blur-sm pointer-events-none"
            />
            <motion.div
                animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity, delay: 1 }}
                className="absolute top-[25%] right-[12%] h-8 w-8 rounded-full bg-black opacity-5 blur-sm pointer-events-none"
            />
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-[20%] left-[15%] h-6 w-6 rounded-full bg-slate-400 opacity-10 blur-sm pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md mx-auto relative z-10"
            >
                {/* Top gradient line accent */}
                <div className="h-1.5 w-full rounded-t-3xl bg-gradient-to-r from-black via-neutral-700 to-slate-600" />

                <div className="rounded-b-3xl border border-black/10 bg-white/90 backdrop-blur-xl shadow-2xl shadow-black/10 overflow-hidden">
                    <Card className="border-0 bg-transparent shadow-none">
                        <CardHeader className="space-y-4 pb-6 text-center pt-8 px-8">
                            {/* Logo */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="flex justify-center"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-black opacity-10 blur-md scale-110" />
                                    <div className="h-20 w-20 rounded-full overflow-hidden border-[3px] border-black/20 shadow-xl shadow-black/15 bg-white relative">
                                        <Image
                                            src="/ad-sparkle-image.png"
                                            alt="AdSparkle Logo"
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                            priority
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-800">
                                    Welcome back!
                                </CardTitle>
                                <CardDescription className="text-sm text-slate-400 mt-1.5 font-medium">
                                    Sign in to access the{" "}
                                    <span className="text-black font-semibold">AdSparkle</span>{" "}
                                    Admin Dashboard.
                                </CardDescription>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="px-8 pb-8">
                            <motion.form
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                                onSubmit={handleLogin}
                                className="space-y-5"
                            >
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="admin@adsparkle.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:border-black/40 transition-all font-medium"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            className="h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:border-black/40 transition-all pr-12 font-medium"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="pt-3">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 text-white bg-black hover:bg-neutral-800 border-0 shadow-lg shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Sign In
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.form>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="text-center text-xs text-slate-400 mt-4 font-medium"
                >
                    Protected by{" "}
                    <span className="text-black font-semibold">Supabase Auth</span>
                </motion.p>
            </motion.div>
        </main>
    );
}
