/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
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
import { Loader2, ArrowRight, Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";

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
        <main className="force-dark min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-[#D4AF37]/20"
            style={{ background: "linear-gradient(160deg, #0B1C2D 0%, #0F2540 40%, #091522 100%)" }}>

            {/* ── Back to Home ────────────────────────────────────────────────── */}
            <button
                onClick={() => router.push("/")}
                className="absolute top-6 left-6 md:top-8 md:left-10 flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/5 z-50 group"
                style={{ color: "rgba(212,175,55,0.8)" }}
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-semibold tracking-wide">Back to Home</span>
            </button>

            {/* Background gold glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none -z-10"
                style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)" }} />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none -z-10"
                style={{ background: "rgba(212,175,55,0.04)" }} />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none -z-10"
                style={{ background: "rgba(15,37,64,0.6)" }} />

            {/* Floating gold orbs */}
            <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
                className="absolute top-[15%] left-[10%] h-12 w-12 rounded-full pointer-events-none"
                style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.1)", filter: "blur(2px)" }}
            />
            <motion.div
                animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity, delay: 1 }}
                className="absolute top-[25%] right-[12%] h-8 w-8 rounded-full pointer-events-none"
                style={{ background: "rgba(245,230,166,0.05)", border: "1px solid rgba(212,175,55,0.08)", filter: "blur(1px)" }}
            />
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-[20%] left-[15%] h-6 w-6 rounded-full pointer-events-none"
                style={{ background: "rgba(212,175,55,0.04)", filter: "blur(2px)" }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md mx-auto relative z-10"
            >
                {/* Gold top line */}
                <div className="h-0.5 w-full rounded-t-3xl"
                    style={{ background: "linear-gradient(90deg, transparent, #D4AF37, #F5E6A6, #D4AF37, transparent)" }} />

                <div className="rounded-b-3xl overflow-hidden"
                    style={{
                        background: "linear-gradient(160deg, #112033 0%, #0e1c2f 100%)",
                        border: "1px solid rgba(212,175,55,0.2)",
                        borderTop: "none",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.04)",
                    }}>
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
                                    <div className="absolute inset-0 rounded-full blur-xl scale-125"
                                        style={{ background: "rgba(212,175,55,0.2)" }} />
                                    <div className="h-20 w-20 rounded-full overflow-hidden relative"
                                        style={{ border: "2px solid rgba(212,175,55,0.45)", boxShadow: "0 0 24px rgba(212,175,55,0.2)" }}>
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
                                <CardTitle className="text-2xl font-extrabold tracking-tight"
                                    style={{ color: "#F5F5F5", fontFamily: "'Playfair Display', serif" }}>
                                    Welcome back
                                </CardTitle>
                                <CardDescription className="text-sm mt-1.5 font-medium"
                                    style={{ color: "var(--text-muted)" }}>
                                    Sign in to access the{" "}
                                    <span className="gold-gradient-text font-semibold">AdSparkle</span>{" "}
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
                                    <label className="text-xs font-bold uppercase tracking-widest"
                                        style={{ color: "var(--text-secondary)" }}>
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="admin@adsparkle.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="h-12 rounded-xl font-medium transition-all"
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(212,175,55,0.18)",
                                            color: "#F5F5F5",
                                        }}
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest"
                                        style={{ color: "var(--text-secondary)" }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            className="h-12 rounded-xl font-medium transition-all pr-12"
                                            style={{
                                                background: "rgba(255,255,255,0.04)",
                                                border: "1px solid rgba(212,175,55,0.18)",
                                                color: "#F5F5F5",
                                            }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
                                            style={{ color: "var(--text-muted)" }}
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
                                        className="btn-gold w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 border-0"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="gold-spinner h-5 w-5" style={{ borderTopColor: "#0B1C2D", borderColor: "rgba(11,28,45,0.2)" }} />
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
                    className="text-center text-xs mt-4 font-medium"
                    style={{ color: "var(--text-muted)" }}
                >
                    Protected by{" "}
                    <span className="gold-gradient-text font-semibold">Supabase Auth</span>
                </motion.p>
            </motion.div>
        </main>
    );
}
