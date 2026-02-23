"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkle,
  ArrowRight,
  Users,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Activity,
  Wallet
} from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Prevent hydration errors with framer-motion

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-hidden font-sans">
      {/* ── Subtle Background Glows & Patterns ───────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none -z-10" />

      {/* ── Navigation (Minimal) ─────────────────────────────────────── */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 shadow-inner">
            <Sparkle className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="font-semibold text-sm tracking-wide">AdSparkle</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 text-sm h-9 px-4 rounded-full"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
        </motion.div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-20 pb-32 lg:pt-32 flex flex-col lg:flex-row items-center justify-between gap-16 z-10">

        {/* Left: Text Content */}
        <div className="flex-1 flex flex-col items-start text-left max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Admin Dashboard
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 leading-[1.1] mb-6"
          >
            Ad Sparkle
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-lg text-neutral-400 mb-10 max-w-xl leading-relaxed capitalize"
          >
            Ignite your brand
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02]"
            >
              Admin Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto h-12 px-8 rounded-full bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 font-semibold text-sm transition-all hover:scale-[1.02]"
            >
              View Dashboard Preview
            </Button>
          </motion.div>
        </div>

        {/* Right: Glass Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex-1 w-full max-w-lg relative z-10"
        >
          {/* Subtle Glow Behind Card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[80px] rounded-3xl -z-10" />

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="w-full bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative"
          >
            {/* Mock Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">AdSparkle</div>
                  <div className="text-[10px] text-neutral-500">Admin Dashboard</div>
                </div>
              </div>
              <div className="h-6 w-16 bg-white/5 rounded-full border border-white/10" />
            </div>

            {/* Mock Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 mb-2">
                  <Users className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-medium">Total Groups</span>
                </div>
                <div className="text-2xl font-bold text-white">12</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 mb-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-medium">Active Promoters</span>
                </div>
                <div className="text-2xl font-bold text-white">84</div>
              </div>
              <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-neutral-400 mb-1">
                    <Wallet className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-medium">Monthly Payout</span>
                  </div>
                  <div className="text-xl font-bold text-white">₹ 45,200</div>
                </div>
                <div className="h-10 w-24 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-neutral-500" />
                </div>
              </div>
            </div>

            {/* Mock List Items */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-800" />
                    <div className="space-y-1.5">
                      <div className="h-2 w-20 bg-neutral-700 rounded-full" />
                      <div className="h-1.5 w-12 bg-neutral-800 rounded-full" />
                    </div>
                  </div>
                  <div className="h-5 w-12 rounded-md bg-emerald-500/20 border border-emerald-500/30" />
                </div>
              ))}
            </div>

            {/* Glass Fade Overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111111]/90 to-transparent pointer-events-none" />
          </motion.div>
        </motion.div>

      </section>

      {/* ── Features Section ─────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3 }}
            className="group p-6 rounded-3xl bg-neutral-900/40 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Group Management</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Organize promoters into distinct groups. Track joining dates, manage active members, and filter effortlessly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="group p-6 rounded-3xl bg-neutral-900/40 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CreditCard className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Payment Tracking</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Calculate monthly active days automatically. One-click deep links for UPI payouts to streamline your workflow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="group p-6 rounded-3xl bg-neutral-900/40 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secure Admin Access</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Enterprise-grade authentication powered by Supabase. Your data and payout records are fully protected and private.
            </p>
          </motion.div>

        </div>
      </section>

      {/* ── Trust / Stats Section ─────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-gradient-to-r from-neutral-900/50 to-neutral-900/30 border border-white/5 p-10 flex flex-col md:flex-row items-center justify-around gap-10 text-center"
        >
          <div>
            <div className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">300+</div>
            <div className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Promoters</div>
          </div>
          <div className="hidden md:block w-px h-16 bg-white/10" />
          <div>
            <div className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">5</div>
            <div className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Active Groups</div>
          </div>
          <div className="hidden md:block w-px h-16 bg-white/10" />
          <div>
            <div className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">100%</div>
            <div className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Admin Controlled</div>
          </div>
        </motion.div>
      </section>

    </main>
  );
}
