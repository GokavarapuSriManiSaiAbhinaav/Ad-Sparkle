"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Loader2, LogOut, Users, ChevronRight, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileDropdown } from "@/components/profile-dropdown";

type Group = {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    [key: string]: unknown;
};

// ── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-6 shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[#27272A]" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/3 rounded bg-[#27272A]" />
                    <div className="h-4 w-2/3 rounded bg-[#27272A]/70" />
                </div>
            </div>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGroups() {
            try {
                const { data, error } = await supabase.from("groups").select("*").order("name", { ascending: true });
                if (error) throw error;
                setGroups(data ?? []);
            } catch (err: unknown) {
                const msg =
                    err instanceof Error ? err.message : "Failed to load groups.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, []);

    return (
        <main className="min-h-screen bg-[#0F0F12] text-white relative overflow-hidden font-sans selection:bg-[#7C3AED]/30">
            {/* Subtle radial glow behind content */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* ── Top header bar ─────────────────────────────────────────────── */}
            <div className="w-full bg-[#0F0F12]/80 backdrop-blur-md border-b border-[#27272A] shadow-sm sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md border border-[#27272A]/50"
                            style={{
                                background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
                            }}
                        >
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight tracking-tight">
                                AdSparkle Admin
                            </h1>
                            <p className="text-sm font-medium text-[#A1A1AA] leading-none mt-0.5">
                                Group Management
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <ProfileDropdown />
                    </div>
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
                {/* Section heading */}
                <div className="mb-10 pl-2">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Your Groups</h2>
                    <p className="text-base text-[#A1A1AA] mt-1 font-medium">
                        Select a group to manage promoters and track payments.
                    </p>
                </div>

                {/* ── Loading state ────────────────────────────────────────────── */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}

                {/* ── Error state ──────────────────────────────────────────────── */}
                {!loading && error && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 flex items-start gap-4 max-w-2xl"
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            <AlertCircle className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-red-400 text-base">
                                Unable to load groups
                            </p>
                            <p className="text-sm text-red-300 mt-1">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* ── Empty state ──────────────────────────────────────────────── */}
                {!loading && !error && groups.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-dashed border-[#27272A] bg-[#18181B]/50 shadow-sm py-20 flex flex-col items-center gap-4 text-center"
                    >
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#27272A]/50 shadow-sm border border-[#27272A]">
                            <Users className="h-8 w-8 text-[#A1A1AA]" />
                        </div>
                        <div>
                            <p className="font-semibold text-lg text-white">No groups yet</p>
                            <p className="text-sm text-[#A1A1AA] mt-1 max-w-sm mx-auto">
                                Manage your groups within Supabase to make them appear here.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* ── Group cards ──────────────────────────────────────────────── */}
                <AnimatePresence>
                    {!loading && !error && groups.length > 0 && (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.1 } },
                            }}
                        >
                            {groups.map((group) => {
                                const initials = (group.name || "G")
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((w: string) => w[0])
                                    .join("")
                                    .toUpperCase();

                                return (
                                    <motion.div
                                        key={group.id}
                                        variants={{
                                            hidden: { opacity: 0, scale: 0.95, y: 20 },
                                            visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
                                        }}
                                        onClick={() => router.push(`/dashboard/${group.id}`)}
                                        className="cursor-pointer group block"
                                    >
                                        <div className="bg-[#18181B] rounded-2xl shadow-lg hover:shadow-xl hover:shadow-[#7C3AED]/10 hover:-translate-y-1 transition-all duration-300 border border-[#27272A] hover:border-[#7C3AED]/30 h-full flex flex-col overflow-hidden relative">
                                            {/* Top accent line */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <div className="p-6 flex items-start gap-4 flex-1">
                                                {/* Avatar */}
                                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-white font-bold text-lg shadow-md border border-[#27272A]/50"
                                                    style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
                                                    {initials}
                                                </div>

                                                {/* Text */}
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <h3 className="text-lg font-semibold text-white truncate transition-colors drop-shadow-sm">
                                                        {group.name}
                                                    </h3>
                                                    {group.description && (
                                                        <p className="text-sm font-medium text-[#A1A1AA] mt-1.5 line-clamp-2 leading-relaxed">
                                                            {group.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-auto border-t border-[#27272A] p-4 px-6 flex justify-between items-center bg-[#131316] group-hover:bg-[#18181B] transition-colors">
                                                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest group-hover:text-white transition-colors">Manage group</span>
                                                <ChevronRight className="h-4 w-4 text-[#A1A1AA] group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all duration-300" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
