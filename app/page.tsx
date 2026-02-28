"use client";

import Link from "next/link";
import Image from "next/image";
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

// ── Feature cards data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Users className="h-6 w-6" style={{ color: "#0B1C2D" }} />,
    title: "Smart Group Management",
    desc: "Organize promoters into distinct groups. Track joining dates, manage active members, and filter effortlessly.",
  },
  {
    icon: <CreditCard className="h-6 w-6" style={{ color: "#0B1C2D" }} />,
    title: "Automated Payment Tracking",
    desc: "Calculate monthly active days automatically. One-click deep links for UPI payouts to streamline your workflow.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" style={{ color: "#0B1C2D" }} />,
    title: "Secure Admin Access",
    desc: "Enterprise-grade authentication powered by Supabase. Your data and payout records are fully protected.",
  },
];

const STATS = [
  { value: "300+", label: "Promoters" },
  { value: "5", label: "Active Groups" },
  { value: "100%", label: "Admin Controlled" },
];

export default function HomePage() {

  return (
    <main className="force-dark min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-[#D4AF37]/20 relative">

      {/* ── Radial glow (desktop only — no blur on mobile) ────────────── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none -z-10 hidden md:block"
        style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)" }}
      />

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5 flex items-center justify-between relative z-10 page-enter">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full overflow-hidden gold-border"
            style={{ background: "rgba(17,32,51,1)" }}
          >
            <Image
              src="/ad-sparkle-image.png"
              alt="AdSparkle Logo"
              width={40}
              height={40}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="font-bold text-sm tracking-widest uppercase gold-gradient-text">AdSparkle</span>
        </div>

        <Button
          asChild
          className="btn-gold h-9 px-5 md:px-6 rounded-full text-sm font-bold border-0 min-h-[44px]"
        >
          <Link href="/login" prefetch={true}>
            Sign In <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-20 md:pb-28 flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-16 z-10">

        {/* Left: Text */}
        <div className="flex-1 flex flex-col items-start text-left max-w-2xl relative z-10 page-enter">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 md:mb-6"
            style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)", color: "var(--accent)" }}
          >
            <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ background: "#D4AF37" }} />
            <Zap className="h-3 w-3" />
            Admin Dashboard
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="text-foreground">Ad </span>
            <span className="gold-gradient-text">Sparkle</span>
          </h1>

          <p className="text-lg md:text-xl mb-3 max-w-md leading-relaxed font-medium text-muted-foreground">
            Ignite your brand.{" "}
            <span className="gold-gradient-text font-semibold">Simplify payments.</span>
          </p>

          <p className="text-sm mb-8 md:mb-10 max-w-sm leading-relaxed text-muted-foreground">
            The all-in-one admin portal to manage promoter groups, track monthly activity, and automate UPI payouts—effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button
              asChild
              className="btn-gold w-full sm:w-auto h-12 px-7 py-3 rounded-full font-bold text-sm border-0 min-h-[48px]"
            >
              <Link href="/login" prefetch={true}>
                Admin Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto h-12 px-7 py-3 rounded-full font-semibold text-sm transition-transform duration-200 hover:scale-[1.02] gold-border text-foreground min-h-[48px]"
              style={{ background: "var(--secondary)", borderColor: "rgba(212,175,55,0.3)" }}
            >
              <Link href="/login" prefetch={true}>
                View Dashboard
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 mt-7 flex-wrap">
            {[
              { label: "300+ Promoters", color: "#D4AF37" },
              { label: "5 Active Groups", color: "#F5E6A6" },
              { label: "100% Secure", color: "#D4AF37" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: b.color }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dashboard Mockup — hidden on small screens to reduce DOM */}
        <div className="flex-1 w-full max-w-md relative z-10 hidden md:block">
          <div
            className="w-full rounded-3xl p-5 md:p-6 overflow-hidden relative page-enter"
            style={{
              background: "linear-gradient(160deg, #112033 0%, #0e1c2f 100%)",
              border: "1px solid rgba(212,175,55,0.22)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            }}
          >
            {/* Top gold strip */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
              style={{ background: "linear-gradient(90deg, #D4AF37, #F5E6A6, #D4AF37)" }}
            />

            {/* Mock Header */}
            <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 flex-shrink-0 rounded-full overflow-hidden" style={{ border: "2px solid rgba(212,175,55,0.35)" }}>
                  <Image src="/ad-sparkle-image.png" alt="AdSparkle Logo" width={36} height={36} className="object-cover w-full h-full" />
                </div>
                <div>
                  <div className="text-sm font-bold gold-gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>AdSparkle</div>
                  <div className="text-[10px] font-medium text-muted-foreground">Admin Dashboard</div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="h-5 w-5 rounded-full" style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.2)" }} />
                <div className="h-5 w-12 rounded-full" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl p-4" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.14)" }}>
                <div className="flex items-center gap-1.5 mb-2" style={{ color: "var(--accent)" }}>
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Groups</span>
                </div>
                <div className="text-2xl font-black" style={{ color: "#F5F5F5" }}>12</div>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "rgba(245,230,166,0.05)", border: "1px solid rgba(212,175,55,0.14)" }}>
                <div className="flex items-center gap-1.5 mb-2" style={{ color: "var(--accent)" }}>
                  <Activity className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Active</span>
                </div>
                <div className="text-2xl font-black" style={{ color: "var(--accent)" }}>84</div>
              </div>
              <div className="col-span-2 rounded-2xl p-4 flex items-center justify-between" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.14)" }}>
                <div>
                  <div className="flex items-center gap-1.5 mb-1" style={{ color: "var(--accent)" }}>
                    <Wallet className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Monthly Payout</span>
                  </div>
                  <div className="text-xl font-black" style={{ color: "#F5F5F5" }}>₹ 45,200</div>
                </div>
                <div className="h-10 w-20 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }}>
                  <BarChart3 className="h-5 w-5" style={{ color: "#D4AF37" }} />
                </div>
              </div>
            </div>

            {/* Mock List Items */}
            <div className="space-y-2">
              {[0.9, 0.7, 0.5].map((opacity, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.08)" }}>
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full" style={{ background: `linear-gradient(135deg, #D4AF37, #C9A227)`, opacity }} />
                    <div className="space-y-1.5">
                      <div className="h-2 w-20 rounded-full" style={{ background: "rgba(245,230,166,0.15)" }} />
                      <div className="h-1.5 w-12 rounded-full" style={{ background: "rgba(212,175,55,0.1)" }} />
                    </div>
                  </div>
                  <span className="paid-badge text-[8px] font-bold tracking-wider">PAID</span>
                </div>
              ))}
            </div>

            {/* Fade at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none rounded-b-3xl"
              style={{ background: "linear-gradient(to top, rgba(14,28,47,0.9), transparent)" }}
            />
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────────────────── */}
      <section
        className="w-full max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20 relative z-10"
        style={{ borderTop: "1px solid rgba(212,175,55,0.08)" }}
      >
        <div className="text-center mb-10 md:mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: "var(--accent)" }}>What you get</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Everything you need, <span className="gold-gradient-text">nothing you don&apos;t</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {FEATURES.map((card) => (
            <div key={card.title} className="group p-6 md:p-7 cursor-default rounded-2xl"
              style={{
                background: "rgba(17,32,51,0.9)",
                border: "1px solid rgba(212,175,55,0.18)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}>
              <div className="h-11 w-11 md:h-12 md:w-12 rounded-2xl flex items-center justify-center mb-5 btn-gold transition-transform duration-200 group-hover:scale-105">
                {card.icon}
              </div>
              <h3 className="text-base font-bold mb-2 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{card.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Section ────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 pb-24 md:pb-32 relative z-10">
        <div
          className="p-0.5 rounded-3xl"
          style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.4), rgba(245,230,166,0.1), rgba(212,175,55,0.4))" }}
        >
          <div
            className="rounded-[22px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-around gap-8 md:gap-10 text-center"
            style={{ background: "linear-gradient(160deg, #0F2540 0%, #0B1C2D 100%)" }}
          >
            {STATS.map((stat, i) => (
              <div key={stat.label} className="flex md:flex-row items-center gap-8 w-full md:w-auto justify-center">
                <div>
                  <div
                    className="text-4xl md:text-6xl font-black tracking-tight mb-2 gold-gradient-text"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</div>
                </div>
                {i < 2 && <div className="hidden md:block w-px h-14" style={{ background: "rgba(212,175,55,0.2)" }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
