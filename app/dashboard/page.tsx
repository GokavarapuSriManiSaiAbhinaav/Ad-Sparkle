"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Users, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileDropdown } from "@/components/profile-dropdown";

type Group = {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    [key: string]: unknown;
};

// ── Skeleton card (pure CSS animation, no Framer Motion) ──────────────────────
const SkeletonCard = memo(function SkeletonCard() {
    return (
        <div
            className="rounded-2xl p-6 luxury-card"
        >
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl skeleton flex-shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-2/3 skeleton" />
                    <div className="h-4 w-1/2 skeleton" />
                </div>
            </div>
            <div className="mt-6 h-px skeleton" />
            <div className="mt-4 h-3 w-1/3 skeleton" />
        </div>
    );
});

// ── Group card (memoized to prevent re-render on parent state change) ──────────
const GroupCard = memo(function GroupCard({
    group,
    onNavigate,
    onPrefetch,
}: {
    group: Group;
    onNavigate: (id: string) => void;
    onPrefetch: (id: string) => void;
}) {
    const initials = (group.name || "G")
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase();

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`Open group ${group.name}`}
            onClick={() => onNavigate(group.id)}
            onMouseEnter={() => onPrefetch(group.id)}
            onKeyDown={(e) => e.key === "Enter" && onNavigate(group.id)}
            className="cursor-pointer group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-2xl page-enter"
        >
            <div
                className="h-full flex flex-col overflow-hidden relative rounded-2xl transition-[border-color,transform] duration-200 hover:-translate-y-1 active:scale-[0.99] luxury-card"
            >
                {/* Top gold accent line — CSS only */}
                <div
                    className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "linear-gradient(90deg, transparent, #D4AF37, #F5E6A6, #D4AF37, transparent)" }}
                />

                <div className="p-5 md:p-6 flex items-start gap-4 flex-1">
                    {/* Gold Monogram Avatar */}
                    <div
                        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl font-bold text-lg transition-transform duration-200 group-hover:scale-105"
                        style={{
                            background: "linear-gradient(135deg, #D4AF37 0%, #F5E6A6 50%, #C9A227 100%)",
                            color: "#0B1C2D"
                        }}
                    >
                        {initials}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-base md:text-lg font-bold leading-snug break-words text-foreground">
                            {group.name}
                        </h3>
                        {group.description && (
                            <p
                                className="text-sm font-medium mt-1 line-clamp-2 leading-relaxed"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {group.description}
                            </p>
                        )}
                    </div>
                </div>

                <div
                    className="mt-auto px-5 md:px-6 py-3 flex justify-between items-center"
                    style={{ borderTop: "1px solid var(--border)" }}
                >
                    <span
                        className="text-[11px] font-bold uppercase tracking-widest"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Manage group
                    </span>
                    <ChevronRight
                        className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
                        style={{ color: "rgba(184,168,138,0.5)" }}
                    />
                </div>
            </div>
        </div>
    );
});

// ── Main page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function fetchGroups() {
            try {
                const { data, error } = await supabase
                    .from("groups")
                    .select("*")
                    .order("name", { ascending: true });
                if (error) throw error;
                if (!cancelled) setGroups(data ?? []);
            } catch (err: unknown) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load groups.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchGroups();
        return () => { cancelled = true; };
    }, []);

    const handleNavigate = useCallback((id: string) => {
        router.push(`/dashboard/${id}`);
    }, [router]);

    const handlePrefetch = useCallback((id: string) => {
        router.prefetch(`/dashboard/${id}`);
    }, [router]);

    return (
        <main className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans">
            {/* Subtle gold radial glow — desktop only */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none -z-10 hidden md:block"
                style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.05) 0%, transparent 70%)" }}
            />

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <header className="w-full sticky top-0 z-20 glass-navy" style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="flex h-9 w-9 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full overflow-hidden"
                            style={{ border: "1.5px solid rgba(212,175,55,0.35)" }}
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
                        <div className="min-w-0">
                            <h1
                                className="text-base md:text-lg font-bold leading-tight tracking-tight gold-gradient-text truncate"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                AdSparkle Admin
                            </h1>
                            <p className="text-xs font-medium leading-none mt-0.5 text-muted-foreground">Group Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <ThemeToggle />
                        <ProfileDropdown />
                    </div>
                </div>
            </header>

            {/* ── Content ─────────────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
                {/* Section heading */}
                <div className="mb-8 md:mb-10">
                    <h2
                        className="text-xl md:text-2xl font-bold tracking-tight text-foreground"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Your Groups
                    </h2>
                    <p className="text-sm mt-1 font-medium text-muted-foreground">
                        Select a group to manage promoters and track payments.
                    </p>
                    <div className="mt-2 h-px w-14" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
                </div>

                {/* ── Loading skeleton ─────────────────────────────────────────── */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* ── Error state ──────────────────────────────────────────────── */}
                {!loading && error && (
                    <div
                        className="rounded-2xl p-5 flex items-start gap-4 max-w-2xl page-enter"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-400">Unable to load groups</p>
                            <p className="text-sm text-red-300 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* ── Empty state ──────────────────────────────────────────────── */}
                {!loading && !error && groups.length === 0 && (
                    <div
                        className="rounded-3xl py-16 flex flex-col items-center gap-4 text-center page-enter"
                        style={{ background: "var(--card)", border: "1px dashed var(--border)" }}
                    >
                        <div
                            className="flex h-14 w-14 items-center justify-center rounded-2xl"
                            style={{ background: "rgba(212,175,55,0.07)", border: "1px solid var(--border)" }}
                        >
                            <Users className="h-7 w-7" style={{ color: "var(--primary)" }} />
                        </div>
                        <div>
                            <p className="font-semibold text-base text-foreground">No groups yet</p>
                            <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: "var(--text-secondary)" }}>
                                Manage your groups within Supabase to make them appear here.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Group cards ──────────────────────────────────────────────── */}
                {!loading && !error && groups.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {groups.map((group) => (
                            <GroupCard
                                key={group.id}
                                group={group}
                                onNavigate={handleNavigate}
                                onPrefetch={handlePrefetch}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
