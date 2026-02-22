"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Users,
    ChevronRight,
    Sparkles,
    AlertCircle,
    Loader2,
} from "lucide-react";

type Group = {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    [key: string]: unknown;
};

// ── Accent colours cycling per card ─────────────────────────────────────────
const ACCENTS = [
    { from: "#6366f1", to: "#8b5cf6" }, // indigo → violet
    { from: "#0ea5e9", to: "#06b6d4" }, // sky → cyan
    { from: "#f43f5e", to: "#ec4899" }, // rose → pink
    { from: "#10b981", to: "#14b8a6" }, // emerald → teal
    { from: "#f59e0b", to: "#f97316" }, // amber → orange
];

// ── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
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
                const { data, error } = await supabase.from("groups").select("*");
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
        <main className="min-h-screen bg-background text-foreground">
            {/* ── Top header bar ─────────────────────────────────────────────── */}
            <div
                className="w-full border-b border-border/60"
                style={{
                    background:
                        "linear-gradient(135deg, oklch(0.18 0.02 285) 0%, oklch(0.14 0.005 285) 100%)",
                }}
            >
                <div className="max-w-md mx-auto px-4 py-5 flex items-center gap-3">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg"
                        style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        }}
                    >
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white leading-tight tracking-tight">
                            AdSparkle Admin
                        </h1>
                        <p className="text-xs text-white/50 leading-none mt-0.5">
                            Group Management
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────────────── */}
            <div className="max-w-md mx-auto p-4 pt-6">
                {/* Section heading */}
                <div className="mb-5">
                    <h2 className="text-lg font-bold tracking-tight">Your Groups</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Select a group to manage its campaigns
                    </p>
                </div>

                {/* ── Loading state ────────────────────────────────────────────── */}
                {loading && (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                        <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading groups…</span>
                        </div>
                    </div>
                )}

                {/* ── Error state ──────────────────────────────────────────────── */}
                {!loading && error && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 flex items-start gap-4"
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <p className="font-semibold text-destructive text-sm">
                                Unable to load groups
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* ── Empty state ──────────────────────────────────────────────── */}
                {!loading && !error && groups.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-dashed border-border bg-muted/30 py-14 flex flex-col items-center gap-3 text-center"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                            <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">No groups yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Create your first group in Supabase to get started.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* ── Group cards ──────────────────────────────────────────────── */}
                <AnimatePresence>
                    {!loading && !error && groups.length > 0 && (
                        <motion.div
                            className="space-y-3"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.07 } },
                            }}
                        >
                            {groups.map((group, idx) => {
                                const accent = ACCENTS[idx % ACCENTS.length];
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
                                            hidden: { opacity: 0, y: 16 },
                                            visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                                        }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.025 }}
                                            whileTap={{ scale: 0.975 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                                            onClick={() => router.push(`/dashboard/${group.id}`)}
                                            className="cursor-pointer"
                                        >
                                            <Card className="overflow-hidden border-border/70 shadow-sm hover:shadow-md transition-shadow duration-200 py-0 gap-0">
                                                <CardHeader className="p-5 pb-0">
                                                    <div className="flex items-center gap-4">
                                                        {/* Avatar */}
                                                        <div
                                                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm shadow"
                                                            style={{
                                                                background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
                                                            }}
                                                        >
                                                            {initials}
                                                        </div>

                                                        {/* Text */}
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-sm font-semibold truncate">
                                                                {group.name}
                                                            </CardTitle>
                                                            {group.description && (
                                                                <CardDescription className="text-xs mt-0.5 truncate">
                                                                    {group.description}
                                                                </CardDescription>
                                                            )}
                                                        </div>

                                                        {/* Arrow */}
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="px-5 pb-5 pt-4">
                                                    {/* Bottom accent stripe */}
                                                    <div
                                                        className="h-1 w-full rounded-full opacity-30"
                                                        style={{
                                                            background: `linear-gradient(90deg, ${accent.from} 0%, ${accent.to} 100%)`,
                                                        }}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </motion.div>
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
