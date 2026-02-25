"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Activity,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-black selection:bg-black/20 overflow-hidden font-sans">

      {/* ── Vibrant Background Glows ───────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-black/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-[15%] right-[-5%] w-[500px] h-[500px] bg-black/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-slate-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* ── Navigation ─────────────────────────────────────── */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full overflow-hidden border-2 border-black/20 shadow-md bg-white">
            <Image src="/ad-sparkle-image.png" alt="AdSparkle Logo" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <span className="font-bold text-sm tracking-wide text-black">AdSparkle</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            onClick={() => router.push("/login")}
            className="h-9 px-5 rounded-full bg-black text-white hover:bg-neutral-800 text-sm font-semibold shadow-lg shadow-black/20 transition-all hover:scale-105 border-0"
          >
            Sign In <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-16 pb-28 lg:pt-24 flex flex-col lg:flex-row items-center justify-between gap-16 z-10">

        {/* Left: Text */}
        <div className="flex-1 flex flex-col items-start text-left max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-black text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-black animate-pulse" />
            <Zap className="h-3 w-3" />
            Admin Dashboard
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4"
          >
            <span className="text-black">Ad </span>
            <span className="text-black font-extrabold">
              Sparkle
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xl text-slate-500 mb-4 max-w-md leading-relaxed font-medium"
          >
            Ignite your brand.{" "}
            <span className="text-black font-semibold">Simplify payments.</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="text-sm text-slate-400 mb-10 max-w-sm leading-relaxed"
          >
            The all-in-one admin portal to manage promoter groups, track monthly activity, and automate UPI payouts—effortlessly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start gap-3 w-full sm:w-auto"
          >
            <Button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto h-13 px-8 py-3 rounded-full bg-black text-white hover:bg-neutral-800 font-bold text-sm shadow-xl shadow-black/20 transition-all hover:scale-[1.03] border-0"
            >
              Admin Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto h-13 px-8 py-3 rounded-full bg-white border-black/20 text-black hover:bg-slate-50 hover:border-black/30 font-semibold text-sm transition-all hover:scale-[1.03] shadow-sm"
            >
              View Dashboard
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex items-center gap-4 mt-8 flex-wrap"
          >
            {[
              { label: "300+ Promoters", color: "text-black" },
              { label: "5 Active Groups", color: "text-black" },
              { label: "100% Secure", color: "text-emerald-600" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full bg-current ${b.color}`} />
                <span className={b.color}>{b.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Vibrant Glass Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex-1 w-full max-w-md relative z-10"
        >
          {/* Glow Behind Card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-slate-400/10 blur-[60px] rounded-3xl -z-10 scale-90" />

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
            className="w-full bg-white/90 backdrop-blur-2xl border border-black/10 rounded-3xl p-6 shadow-2xl shadow-black/10 overflow-hidden relative"
          >
            {/* Top gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-neutral-700 to-slate-600 rounded-t-3xl" />

            {/* Mock Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 flex-shrink-0 rounded-full overflow-hidden border-2 border-black/20 shadow-sm">
                  <Image src="/ad-sparkle-image.png" alt="AdSparkle Logo" width={36} height={36} className="object-cover w-full h-full" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">AdSparkle</div>
                  <div className="text-[10px] text-slate-400 font-medium">Admin Dashboard</div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="h-5 w-5 rounded-full bg-black/10 border border-black/10" />
                <div className="h-5 w-12 rounded-full bg-slate-100 border border-slate-200" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/5 border border-black/10 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-black mb-2">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Groups</span>
                </div>
                <div className="text-2xl font-black text-black">12</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-emerald-500 mb-2">
                  <Activity className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Active</span>
                </div>
                <div className="text-2xl font-black text-emerald-700">84</div>
              </div>
              <div className="col-span-2 bg-black/5 border border-black/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-black mb-1">
                    <Wallet className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Monthly Payout</span>
                  </div>
                  <div className="text-xl font-black text-black">₹ 45,200</div>
                </div>
                <div className="h-10 w-20 bg-black/5 rounded-xl border border-black/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Mock List Items */}
            <div className="space-y-2">
              {[
                { color: "bg-black" },
                { color: "bg-slate-500" },
                { color: "bg-slate-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-full ${item.color} opacity-70`} />
                    <div className="space-y-1.5">
                      <div className="h-2 w-24 bg-slate-200 rounded-full" />
                      <div className="h-1.5 w-14 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                  <div className="h-5 w-14 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                    <div className="h-1 w-6 bg-emerald-400 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Fade at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent pointer-events-none rounded-b-3xl" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features Section ─────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-black/5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">What you get</p>
          <h2 className="text-3xl font-extrabold text-slate-800">Everything you need, nothing you don't</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Users className="h-6 w-6 text-white" />,
              bg: "from-violet-500 to-indigo-600",
              glow: "shadow-violet-500/30",
              border: "border-violet-200",
              hoverBorder: "hover:border-violet-300",
              tint: "from-violet-50 to-indigo-50",
              title: "Smart Group Management",
              desc: "Organize promoters into distinct groups. Track joining dates, manage active members, and filter effortlessly.",
              delay: 0,
            },
            {
              icon: <CreditCard className="h-6 w-6 text-white" />,
              bg: "from-emerald-500 to-teal-600",
              glow: "shadow-emerald-500/30",
              border: "border-emerald-200",
              hoverBorder: "hover:border-emerald-300",
              tint: "from-emerald-50 to-teal-50",
              title: "Automated Payment Tracking",
              desc: "Calculate monthly active days automatically. One-click deep links for UPI payouts to streamline your workflow.",
              delay: 0.1,
            },
            {
              icon: <ShieldCheck className="h-6 w-6 text-white" />,
              bg: "from-purple-500 to-pink-600",
              glow: "shadow-purple-500/30",
              border: "border-purple-200",
              hoverBorder: "hover:border-purple-300",
              tint: "from-purple-50 to-pink-50",
              title: "Secure Admin Access",
              desc: "Enterprise-grade authentication powered by Supabase. Your data and payout records are fully protected.",
              delay: 0.2,
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: card.delay }}
              whileHover={{ y: -8 }}
              whileTap={{ y: -2 }}
              style={{ willChange: "transform" }}
              className={`group p-6 rounded-3xl bg-gradient-to-br ${card.tint} border ${card.border} ${card.hoverBorder} shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-default`}
            >
              <div
                className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${card.bg} flex items-center justify-center mb-5 shadow-lg ${card.glow} p-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ease-out`}
              >
                {card.icon}
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">{card.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-gradient-to-br from-black via-neutral-800 to-slate-900 p-1 shadow-2xl shadow-black/30"
        >
          <div className="rounded-[22px] bg-gradient-to-br from-black via-neutral-800 to-slate-900 p-10 flex flex-col md:flex-row items-center justify-around gap-10 text-center">
            {[
              { value: "300+", label: "Promoters", color: "text-slate-300" },
              { value: "5", label: "Active Groups", color: "text-slate-300" },
              { value: "100%", label: "Admin Controlled", color: "text-emerald-400" },
            ].map((stat, i) => (
              <>
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2 drop-shadow-md">{stat.value}</div>
                  <div className={`text-xs font-bold uppercase tracking-[0.2em] ${stat.color}`}>{stat.label}</div>
                </motion.div>
                {i < 2 && <div className="hidden md:block w-px h-16 bg-white/20" />}
              </>
            ))}
          </div>
        </motion.div>
      </section>

    </main>
  );
}
