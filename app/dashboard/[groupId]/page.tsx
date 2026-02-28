/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    ArrowLeft,
    Search,
    Plus,
    Edit2,
    Phone,
    Loader2,
    AlertCircle,
    Users,
    CalendarDays,
    Filter,
    CheckCircle2,
    Copy,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { generatePaymentReport } from "@/utils/generateReport";
import dynamic from "next/dynamic";

const QRCode = dynamic(() => import("react-qr-code"), {
    ssr: false,
    loading: () => (
        <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted/20 animate-pulse rounded-2xl border border-border">
            <Loader2 className="animate-spin text-muted-foreground h-6 w-6" />
        </div>
    ),
});

type Group = {
    id: string;
    name: string;
    description?: string;
    [key: string]: any;
};

type Promoter = {
    id: string;
    group_id: string;
    name: string;
    phone: string;
    upi_id?: string;
    join_date: string;
    leave_date?: string | null;
    [key: string]: any;
};

type MonthlyRecord = {
    id: string;
    promoter_id: string;
    year: number;
    month: number;
    days: number;
    payment_completed: boolean;
    [key: string]: any;
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear + i);
const MONTHS = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

export default function GroupDetailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const groupId = params?.groupId as string;

    // Selection states (derive from URL)
    const selectedYear = searchParams.get("year") || "";
    const selectedMonth = searchParams.get("month") || "";

    const handleYearChange = (year: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("year", year);
        router.push(`/dashboard/${groupId}?${newParams.toString()}`, { scroll: false });
    };

    const handleMonthChange = (month: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("month", month);
        router.push(`/dashboard/${groupId}?${newParams.toString()}`, { scroll: false });
    };

    const [searchQuery, setSearchQuery] = useState("");

    // Data states
    const [group, setGroup] = useState<Group | null>(null);
    const [promoters, setPromoters] = useState<Promoter[]>([]);
    const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);

    // UI Flow states
    const [hasLoadedMembers, setHasLoadedMembers] = useState(false);
    const [isFetchingGroup, setIsFetchingGroup] = useState(true);
    const [isFetchingMembers, setIsFetchingMembers] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberPhone, setNewMemberPhone] = useState("");
    const [newMemberUpiId, setNewMemberUpiId] = useState("");
    const [newMemberDays, setNewMemberDays] = useState("");
    const [isAddingMember, setIsAddingMember] = useState(false);

    // Edit states
    const [editingMember, setEditingMember] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editUpiId, setEditUpiId] = useState("");
    const [editDays, setEditDays] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter states
    const [daysFilter, setDaysFilter] = useState("all");
    const [customDaysFilter, setCustomDaysFilter] = useState("");
    const [loadingPayments, setLoadingPayments] = useState<Set<string>>(new Set());

    const [qrModalData, setQrModalData] = useState<{ upiLink: string; upiId: string; memberName: string } | null>(null);
    const [paymentMember, setPaymentMember] = useState<any>(null);
    const [paymentModalStep, setPaymentModalStep] = useState<'initial' | 'apps'>('initial');

    // 1. Fetch Group details on initial load
    useEffect(() => {
        if (!groupId) {
            setError("Group ID missing.");
            return;
        }

        async function fetchGroup() {
            setIsFetchingGroup(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from("groups")
                    .select("*")
                    .eq("id", groupId)
                    .single();

                if (error && error.code !== "PGRST116") throw error;
                if (!data) {
                    setError("Group not found.");
                    return;
                }
                if (data) setGroup(data);
            } catch (err: any) {
                setError(err.message || "Failed to load group.");
            } finally {
                setIsFetchingGroup(false);
            }
        }

        fetchGroup();
    }, [groupId, router]);

    // 2. Fetch Members when "Load Members" is clicked
    const handleLoadMembers = useCallback(async () => {
        if (!selectedYear || !selectedMonth) return;

        setIsFetchingMembers(true);
        setError(null);
        setHasLoadedMembers(false);

        try {
            const yearInt = parseInt(selectedYear);
            const monthInt = parseInt(selectedMonth);

            if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
                setError("Invalid year or month selected.");
                return;
            }

            const selectedYM = yearInt * 12 + monthInt;

            // Fetch promoters
            const { data: pData, error: pError } = await supabase
                .from("promoters")
                .select("*")
                .eq("group_id", groupId);

            if (pError) throw pError;

            const allPromoters = pData ?? [];

            // Filter promoters
            const activePromoters = allPromoters.filter((p: Promoter) => {
                if (!p.join_date) return true;

                const jDate = new Date(p.join_date);
                const joinYM = jDate.getFullYear() * 12 + (jDate.getMonth() + 1);

                if (joinYM > selectedYM) return false;

                if (p.leave_date) {
                    const lDate = new Date(p.leave_date);
                    const leaveYM = lDate.getFullYear() * 12 + (lDate.getMonth() + 1);
                    if (leaveYM <= selectedYM) return false;
                }

                return true;
            });

            setPromoters(activePromoters);

            let mData: any[] = [];
            const promoterIds = activePromoters.map((p: Promoter) => p.id);

            if (promoterIds.length > 0) {
                // Fetch monthly records cleanly via relation using IN clause
                const { data, error: mError } = await supabase
                    .from("monthly_records")
                    .select("*")
                    .in("promoter_id", promoterIds)
                    .eq("year", yearInt)
                    .eq("month", monthInt);

                if (mError) throw mError;
                mData = data ?? [];
            }

            setMonthlyRecords(mData);
            setHasLoadedMembers(true);
        } catch (err: any) {
            setError(err.message || "Failed to load records.");
        } finally {
            setIsFetchingMembers(false);
        }
    }, [selectedYear, selectedMonth, groupId]);

    const handleGenerateReport = async () => {
        if (!group) {
            toast.error("Group details not loaded.");
            return;
        }
        if (mergedData.length === 0) {
            toast.error("No members found to generate a report.");
            return;
        }

        try {
            toast.loading("Generating PDF...", { id: "pdf-toast" });
            const yearInt = parseInt(selectedYear);
            const monthInt = parseInt(selectedMonth);

            await generatePaymentReport(
                group.name,
                yearInt,
                monthInt,
                mergedData
            );
            toast.success("Report generated successfully!", { id: "pdf-toast" });
        } catch (err: any) {
            console.error("PDF generation failed", err);
            toast.error("Failed to generate report.", { id: "pdf-toast" });
        }
    };

    const handleUpiPayment = useCallback((member: any, appType: 'generic' | 'paytm' = 'generic') => {
        const upiId = member.upi_id?.trim();

        if (!upiId) {
            toast.error("UPI ID is missing for this member. Cannot initiate payment.");
            return;
        }

        const name = encodeURIComponent(member.name || "Promoter");

        const genericLink = `upi://pay?pa=${upiId}&pn=${name}&cu=INR`;
        const upiLink = appType === 'paytm'
            ? `paytmmp://pay?pa=${upiId}&pn=${name}&cu=INR`
            : genericLink;

        // Native devices handler validation check
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isMobile) {
            toast.info("📱 UPI deep links open natively only on Mobile devices.");
        }

        router.push(upiLink);
    }, [router]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMemberPhone.trim()) {
            toast.error("Phone number is required.");
            return;
        }

        if (!newMemberUpiId.trim()) {
            toast.error("UPI ID is required.");
            return;
        }

        if (!selectedYear || !selectedMonth) {
            toast.error("Please select a year and month first.");
            return;
        }

        setIsAddingMember(true);
        try {
            const yearInt = parseInt(selectedYear);
            const monthInt = parseInt(selectedMonth);
            const monthStr = monthInt.toString().padStart(2, '0');
            const joinDate = `${yearInt}-${monthStr}-01`;

            // 1. Insert Promoter
            const { data: newPromoter, error: pError } = await supabase
                .from("promoters")
                .insert({
                    group_id: groupId,
                    name: newMemberName.trim() || undefined,
                    phone: newMemberPhone.trim(),
                    upi_id: newMemberUpiId.trim(),
                    join_date: joinDate,
                })
                .select()
                .single();

            if (pError) throw pError;

            // 2. Insert Monthly Record
            const daysInt = parseInt(newMemberDays) || 0;
            const { error: mError } = await supabase
                .from("monthly_records")
                .insert({
                    promoter_id: newPromoter.id,
                    year: yearInt,
                    month: monthInt,
                    days: daysInt,
                    payment_completed: false
                });

            if (mError) throw mError;

            toast.success("Member added successfully!");
            setIsAddMemberOpen(false);

            // Reset fields
            setNewMemberName("");
            setNewMemberPhone("");
            setNewMemberUpiId("");
            setNewMemberDays("");

            // Reload members
            handleLoadMembers();

        } catch (error: any) {
            toast.error(error.message || "Failed to add member.");
        } finally {
            setIsAddingMember(false);
        }
    };

    const handlePaymentToggle = async (member: any, isChecked: boolean) => {
        if (loadingPayments.has(member.id)) return;

        setLoadingPayments((prev) => new Set(prev).add(member.id));
        const previousRecords = [...monthlyRecords];

        // Optimistic update
        setMonthlyRecords((prev) => {
            const exists = prev.find((r) => r.promoter_id === member.id);
            if (exists) {
                return prev.map((r) =>
                    r.promoter_id === member.id ? { ...r, payment_completed: isChecked } : r
                );
            } else {
                return [
                    ...prev,
                    {
                        id: `temp-${member.id}`,
                        promoter_id: member.id,
                        payment_completed: isChecked,
                        year: parseInt(selectedYear),
                        month: parseInt(selectedMonth),
                        days: member.days || 0,
                    } as MonthlyRecord,
                ];
            }
        });

        try {
            const yearInt = parseInt(selectedYear);
            const monthInt = parseInt(selectedMonth);

            const recordToUpsert: any = {
                promoter_id: member.id,
                group_id: groupId,
                year: yearInt,
                month: monthInt,
                payment_completed: isChecked,
                days: member.days || 0,
            };

            // Use real ID if it exists to ensure update instead of insert
            if (member.record_id && !member.record_id.toString().startsWith('temp-')) {
                recordToUpsert.id = member.record_id;
            }

            const { data, error } = await supabase
                .from("monthly_records")
                .upsert(recordToUpsert, { onConflict: "promoter_id,year,month" })
                .select()
                .single();

            if (error) throw error;

            // Update state with real data from DB (replaces temp id)
            if (data) {
                setMonthlyRecords((prev) => {
                    const filtered = prev.filter((r) => r.promoter_id !== member.id || r.year !== yearInt || r.month !== monthInt);
                    return [...filtered, data];
                });
            }

            toast.success(isChecked ? "Payment marked as completed" : "Payment unmarked");
        } catch (err: any) {
            setMonthlyRecords(previousRecords);
            toast.error(err.message || "Failed to update payment.");
        } finally {
            setLoadingPayments((prev) => {
                const next = new Set(prev);
                next.delete(member.id);
                return next;
            });
        }
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember || !editPhone.trim()) {
            toast.error("Phone number is required.");
            return;
        }

        if (!editUpiId.trim()) {
            toast.error("UPI ID is required.");
            return;
        }

        setIsUpdating(true);
        try {
            const { error: pError } = await supabase
                .from("promoters")
                .update({
                    name: editName.trim() || null,
                    phone: editPhone.trim(),
                    upi_id: editUpiId.trim(),
                })
                .eq("id", editingMember.id);

            if (pError) throw pError;

            // Also update the days in the current selected month if available
            const yearInt = parseInt(selectedYear);
            const monthInt = parseInt(selectedMonth);
            const parsedDays = parseInt(editDays) || 0;

            if (editingMember.record_id) {
                const { error: mError } = await supabase
                    .from("monthly_records")
                    .update({ days: parsedDays })
                    .eq("id", editingMember.record_id);
                if (mError) throw mError;
            } else {
                const { error: mError } = await supabase
                    .from("monthly_records")
                    .insert({
                        promoter_id: editingMember.id,
                        year: yearInt,
                        month: monthInt,
                        days: parsedDays,
                        payment_completed: false
                    });
                if (mError) throw mError;
            }

            toast.success("Member updated successfully");
            setEditingMember(null);

            // Re-fetch to apply changes
            handleLoadMembers();
        } catch (error: any) {
            toast.error(error.message || "Failed to update member.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        setIsDeleting(true);
        try {
            if (!selectedYear || !selectedMonth) {
                toast.error("Please select a year and month.");
                return;
            }

            const monthStr = selectedMonth.toString().padStart(2, '0');
            const leaveDate = `${selectedYear}-${monthStr}-01`;

            // Perform a "soft delete" to maintain historical monthly records
            // Instead of deleting the record, we set a leave_date.
            // Our activePromoters filter handles hiding members after their leave_date.
            const { error: pError } = await supabase
                .from("promoters")
                .update({ leave_date: leaveDate })
                .eq("id", memberId);

            if (pError) throw pError;

            toast.success("Member removed from this month onwards");
            setEditingMember(null);
            handleLoadMembers();
        } catch (error: any) {
            toast.error(error.message || "Failed to remove member");
        } finally {
            setIsDeleting(false);
        }
    };

    // Auto-load members when both year and month are selected
    useEffect(() => {
        if (selectedYear && selectedMonth) {
            handleLoadMembers();
        } else {
            setPromoters([]);
            setMonthlyRecords([]);
            setHasLoadedMembers(false);
        }
    }, [selectedYear, selectedMonth, handleLoadMembers]);

    // Compute merged data
    const mergedData = useMemo(() => {
        if (!hasLoadedMembers || !selectedYear || !selectedMonth) return [];

        // Apply search filter
        const searchLower = searchQuery.toLowerCase();
        const searchedPromoters = promoters.filter(
            (p) =>
                p.name?.toLowerCase().includes(searchLower) ||
                p.phone?.toLowerCase().includes(searchLower) ||
                p.upi_id?.toLowerCase().includes(searchLower)
        );

        // Merge
        const merged = searchedPromoters.map((p) => {
            const rec = monthlyRecords.find((r) => r.promoter_id === p.id);
            return {
                ...p,
                days: rec?.days || 0,
                payment_completed: rec?.payment_completed || false,
                record_id: rec?.id || null,
            };
        });

        // Apply days/payment filter
        return merged.filter((member) => {
            const d = member.days;
            if (daysFilter === "all") return true;
            if (daysFilter === "paid") return member.payment_completed === true;
            if (daysFilter === "unpaid") return member.payment_completed === false;
            if (daysFilter === "0") return d === 0;
            if (daysFilter === "1-10") return d >= 1 && d <= 10;
            if (daysFilter === "11-20") return d >= 11 && d <= 20;
            if (daysFilter === "21-30") return d >= 21 && d <= 30;
            if (daysFilter === "custom") {
                const customD = parseInt(customDaysFilter);
                if (!isNaN(customD)) return d === customD;
                return true;
            }
            return true;
        });
    }, [hasLoadedMembers, selectedYear, selectedMonth, searchQuery, promoters, monthlyRecords, daysFilter, customDaysFilter]);

    const isSelectionComplete = selectedYear !== "" && selectedMonth !== "";

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
            {/* ── Header Bar ─────────────────────────────────────────────────── */}
            <div
                className="sticky top-0 z-10 w-full glass-navy"
                style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}
            >
                <div className="max-w-md md:max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        prefetch={true}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base md:text-xl font-bold leading-tight line-clamp-2 md:line-clamp-none break-words gold-gradient-text"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            {isFetchingGroup ? (
                                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#D4AF37" }} />
                            ) : group ? (
                                group.name
                            ) : (
                                "Loading Group..."
                            )}
                        </h1>
                        <p className="text-xs leading-none mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                            Group Detail
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <ProfileDropdown
                            showGenerateReport={hasLoadedMembers && mergedData.length > 0}
                            onGenerateReport={handleGenerateReport}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-md md:max-w-6xl mx-auto p-4 md:p-8 pt-6">
                {/* ── Selectors & Top Controls ─────────────────────────────────── */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="grid grid-cols-2 gap-3 flex-1 w-full">
                        <Select value={selectedYear} onValueChange={handleYearChange}>
                            <SelectTrigger className="rounded-xl h-11 bg-card border-border shadow-sm">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {YEARS.map((y) => (
                                    <SelectItem key={y} value={y.toString()} disabled={y > currentYear}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedMonth} onValueChange={handleMonthChange}>
                            <SelectTrigger className="rounded-xl h-11 bg-card border-border shadow-sm">
                                <SelectValue placeholder="Select Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* ── Status Messages (Error) ──────────────────────────────────── */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 flex items-start gap-4 mb-4"
                    >
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-destructive text-sm">
                                Error
                            </p>
                            <p className="text-xs text-destructive/80 mt-1">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* ── Subtle Empty State (Before Load) ─────────────────────────── */}
                {!hasLoadedMembers && !isFetchingMembers && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-12 flex flex-col items-center justify-center text-center px-4"
                    >
                        <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                            <CalendarDays className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Please select year and month to view members.
                        </p>
                    </motion.div>
                )}

                {/* ── Loading Skeleton ─────────────────────────── */}
                {isFetchingMembers && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-4">
                        <div className="flex justify-between items-end mb-6">
                            <div className="h-6 w-24 bg-muted/20 animate-pulse rounded" />
                            <div className="h-9 w-28 bg-muted/20 animate-pulse rounded-xl" />
                        </div>
                        <div className="h-11 w-full max-w-sm bg-muted/20 animate-pulse rounded-xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-40 w-full bg-muted/20 animate-pulse rounded-2xl border border-border" />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Members List Section ─────────────────────────────────────── */}
                <AnimatePresence>
                    {hasLoadedMembers && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="mt-8 space-y-5"
                        >
                            {/* Header with Title and Add Button */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight mb-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>Members</h2>
                                    <div className="h-0.5 w-10 mt-1" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
                                </div>
                                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="btn-gold h-9 gap-1.5 rounded-xl border-0">
                                            <Plus className="h-4 w-4" />
                                            Add Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent
                                        className="force-dark max-w-[340px] w-[calc(100%-32px)] rounded-3xl p-6 shadow-2xl"
                                        style={{
                                            background: "linear-gradient(to bottom, #0A1929, #050D14)",
                                            border: "1px solid rgba(212,175,55,0.3)",
                                            boxShadow: "0 0 40px rgba(212,175,55,0.15)",
                                        }}
                                    >
                                        {/* Gold top line */}
                                        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
                                            style={{ background: "linear-gradient(90deg, transparent, #D4AF37, #F5E6A6, #D4AF37, transparent)" }} />
                                        <DialogHeader>
                                            <DialogTitle
                                                className="text-xl font-bold tracking-tight gold-gradient-text"
                                                style={{ fontFamily: "'Playfair Display', serif" }}
                                            >
                                                Add New Member
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleAddMember} className="space-y-4 mt-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-[#B8A88A]">
                                                    Name (Optional)
                                                </label>
                                                <Input
                                                    placeholder="John Doe"
                                                    value={newMemberName}
                                                    onChange={(e) => setNewMemberName(e.target.value)}
                                                    className="h-11 rounded-xl bg-black/40 text-white border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50 focus-visible:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-[#B8A88A]">
                                                    Phone (Required)
                                                </label>
                                                <Input
                                                    placeholder="9876543210"
                                                    value={newMemberPhone}
                                                    onChange={(e) => setNewMemberPhone(e.target.value)}
                                                    required
                                                    className="h-11 rounded-xl bg-black/40 text-white border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50 focus-visible:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-[#B8A88A]">
                                                    UPI ID (Required)
                                                </label>
                                                <Input
                                                    placeholder="user@upi"
                                                    value={newMemberUpiId}
                                                    onChange={(e) => setNewMemberUpiId(e.target.value)}
                                                    required
                                                    className="h-11 rounded-xl bg-black/40 text-white border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50 focus-visible:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-[#B8A88A]">
                                                    Days (Optional)
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={newMemberDays}
                                                    onChange={(e) => setNewMemberDays(e.target.value)}
                                                    className="h-11 rounded-xl bg-black/40 text-white border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50 focus-visible:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isAddingMember}
                                                className="btn-gold w-full h-11 rounded-xl text-sm font-bold mt-2 border-0 shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                                            >
                                                {isAddingMember ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                {isAddingMember ? "Saving..." : "Save Member"}
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Search and Filter */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search members by name, phone or UPI..."
                                        className="pl-10 h-11 rounded-xl bg-card border-border shadow-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={daysFilter} onValueChange={setDaysFilter}>
                                        <SelectTrigger className="flex-1 h-11 rounded-xl bg-card border-border shadow-sm font-medium">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Filter className="h-4 w-4 shrink-0" />
                                                <span className="text-foreground truncate"><SelectValue placeholder="Filter by Days" /></span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="unpaid">Unpaid</SelectItem>
                                            <SelectItem value="0">0 days</SelectItem>
                                            <SelectItem value="1-10">1–10 days</SelectItem>
                                            <SelectItem value="11-20">11–20 days</SelectItem>
                                            <SelectItem value="21-30">21–30 days</SelectItem>
                                            <SelectItem value="custom">Custom exact match</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <AnimatePresence>
                                        {daysFilter === "custom" && (
                                            <motion.div
                                                initial={{ opacity: 0, width: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, width: "auto", scale: 1 }}
                                                exit={{ opacity: 0, width: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="w-[120px]"
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="Exact days"
                                                    value={customDaysFilter}
                                                    onChange={(e) => setCustomDaysFilter(e.target.value)}
                                                    className="h-11 rounded-xl bg-card border-border shadow-sm"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Empty state for Search/Filter */}
                            {mergedData.length === 0 && (
                                <div className="rounded-2xl py-12 flex flex-col items-center gap-3 text-center"
                                    style={{ background: "var(--card)", border: "1px dashed var(--border)" }}>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl"
                                        style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.14)" }}>
                                        <Users className="h-6 w-6" style={{ color: "var(--primary)" }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-foreground">No members found</p>
                                        <p className="text-xs mt-1 px-4" style={{ color: "var(--text-secondary)" }}>
                                            No active promoters matched the filters for{" "}
                                            {MONTHS.find((m) => m.value === selectedMonth)?.label}{" "}
                                            {selectedYear}.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Card List */}
                            {mergedData.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6" style={{ willChange: "auto" }}>
                                    <AnimatePresence>
                                        {mergedData.map((member, idx) => (
                                            <motion.div
                                                key={member.id}
                                                initial={{ opacity: 0, scale: 0.98, y: 5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                                className="h-full"
                                            >
                                                <Card className={`h-full rounded-2xl transition-all duration-200 hover:-translate-y-1 ${member.payment_completed ? "paid-card-style" : "luxury-card"}`}
                                                    style={{ padding: 0 }}>
                                                    <div className="p-4 flex flex-col h-full gap-3.5">
                                                        {/* Top Row: Info */}
                                                        <div className="flex justify-between items-start gap-3 flex-1">
                                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold mt-0.5"
                                                                    style={{ background: "linear-gradient(135deg, #D4AF37, #C9A227)", color: "#0B1C2D" }}>
                                                                    {idx + 1}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start gap-2 max-w-full">
                                                                        <h3 className="text-sm md:text-base font-bold line-clamp-2 md:line-clamp-none leading-tight break-words flex-1 text-foreground">
                                                                            {member.name}
                                                                        </h3>
                                                                        {member.payment_completed && (
                                                                            <span className="paid-badge flex items-center gap-1 shrink-0 mt-0.5">
                                                                                <CheckCircle2 className="h-2.5 w-2.5" />
                                                                                PAID
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs flex items-center gap-1.5 mt-1 truncate text-foreground/80">
                                                                        <Phone className="h-3 w-3 flex-shrink-0" />
                                                                        {member.phone || "N/A"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <Dialog open={editingMember?.id === member.id} onOpenChange={(open) => {
                                                                if (open) {
                                                                    setEditingMember(member);
                                                                    setEditName(member.name || "");
                                                                    setEditPhone(member.phone || "");
                                                                    setEditUpiId(member.upi_id || "");
                                                                    setEditDays(member.days?.toString() || "");
                                                                } else {
                                                                    setEditingMember(null);
                                                                }
                                                            }}>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-lg -mr-1 -mt-1"
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Button>
                                                                </DialogTrigger>

                                                                <DialogContent
                                                                    className="force-dark max-w-[340px] w-[calc(100%-32px)] rounded-3xl p-6 shadow-2xl"
                                                                    style={{
                                                                        background: "linear-gradient(to bottom, #0A1929, #050D14)",
                                                                        border: "1px solid rgba(212,175,55,0.3)",
                                                                        boxShadow: "0 0 40px rgba(212,175,55,0.15)",
                                                                    }}
                                                                >
                                                                    {/* Gold top line */}
                                                                    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
                                                                        style={{ background: "linear-gradient(90deg, transparent, #D4AF37, #F5E6A6, #D4AF37, transparent)" }} />
                                                                    <DialogHeader>
                                                                        <DialogTitle
                                                                            className="text-xl font-bold tracking-tight gold-gradient-text"
                                                                            style={{ fontFamily: "'Playfair Display', serif" }}
                                                                        >
                                                                            Edit Member
                                                                        </DialogTitle>
                                                                    </DialogHeader>
                                                                    <form onSubmit={handleEditSave} className="space-y-4 mt-2">
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-bold uppercase tracking-widest text-[#B8A88A]">
                                                                                Name
                                                                            </label>
                                                                            <Input
                                                                                placeholder="Name"
                                                                                value={editName}
                                                                                onChange={(e) => setEditName(e.target.value)}
                                                                                className="h-11 rounded-xl bg-black/40 text-white border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50 focus-visible:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-bold uppercase tracking-widest text-[#B8A88A]">
                                                                                Phone (Required)
                                                                            </label>
                                                                            <Input
                                                                                placeholder="Phone"
                                                                                value={editPhone}
                                                                                onChange={(e) => setEditPhone(e.target.value)}
                                                                                required
                                                                                className="h-11 rounded-xl bg-black/40 text-white border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50 focus-visible:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-bold uppercase tracking-widest text-[#B8A88A]">
                                                                                UPI ID (Required)
                                                                            </label>
                                                                            <Input
                                                                                placeholder="UPI ID"
                                                                                value={editUpiId}
                                                                                onChange={(e) => setEditUpiId(e.target.value)}
                                                                                required
                                                                                className="h-11 rounded-xl bg-black/40 text-white border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50 focus-visible:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-bold uppercase tracking-widest text-[#B8A88A]">
                                                                                Days
                                                                            </label>
                                                                            <Input
                                                                                type="number"
                                                                                placeholder="0"
                                                                                value={editDays}
                                                                                onChange={(e) => setEditDays(e.target.value)}
                                                                                className="h-11 rounded-xl bg-black/40 text-white border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50 focus-visible:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
                                                                            />
                                                                        </div>

                                                                        <div className="flex gap-3 pt-2">
                                                                            <Button
                                                                                type="button"
                                                                                variant="destructive"
                                                                                disabled={isDeleting || isUpdating}
                                                                                onClick={() => handleDeleteMember(member.id)}
                                                                                className="flex-1 h-11 rounded-xl text-sm font-bold bg-red-950/60 text-red-400 hover:bg-red-900/60 border border-red-800/40"
                                                                            >
                                                                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                                                                            </Button>

                                                                            <Button
                                                                                type="submit"
                                                                                disabled={isUpdating || isDeleting}
                                                                                className="btn-gold flex-1 h-11 rounded-xl text-sm font-bold border-0 shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                                                                            >
                                                                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                                                {isUpdating ? "Saving..." : "Save"}
                                                                            </Button>
                                                                        </div>
                                                                    </form>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>

                                                        <div className="h-px w-full" style={{ background: "rgba(212,175,55,0.1)" }} />

                                                        {/* Bottom Row: Actions */}
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(184,168,138,0.7)" }}>
                                                                    Days
                                                                </span>
                                                                <span className="text-sm font-bold mt-0.5 gold-gradient-text">
                                                                    {member.days}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setPaymentMember(member);
                                                                        setPaymentModalStep('initial');
                                                                    }}
                                                                    className={`h-8 text-xs font-bold rounded-lg px-4 border-0 ${member.payment_completed ? "paid-btn-style" : "btn-gold"}`}
                                                                >
                                                                    {member.payment_completed ? "Paid ✓" : "Pay"}
                                                                </Button>

                                                                <div className="flex items-center justify-center p-1.5 rounded-md transition-colors"
                                                                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                                                                    <Checkbox
                                                                        checked={member.payment_completed}
                                                                        disabled={loadingPayments.has(member.id)}
                                                                        onCheckedChange={(c) => handlePaymentToggle(member, c === true)}
                                                                        className="rounded-[4px] data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-all border-muted-foreground/30"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Payment Choice Modal ─────────────────────────────────────── */}
            <Dialog open={!!paymentMember} onOpenChange={(open) => {
                if (!open) {
                    setPaymentMember(null);
                    setPaymentModalStep('initial');
                }
            }}>
                <DialogContent className="max-w-[320px] rounded-3xl p-6 shadow-2xl" style={{ background: "#0F2540", border: "1px solid rgba(212,175,55,0.25)" }} showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold tracking-tight gold-gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>Complete Payment</DialogTitle>
                    </DialogHeader>
                    {paymentModalStep === 'initial' ? (
                        <div className="flex flex-col gap-3 mt-4">
                            <Button
                                onClick={() => setPaymentModalStep('apps')}
                                className="btn-gold w-full h-12 rounded-xl text-sm font-bold tracking-wide border-0"
                            >
                                Via UPI
                            </Button>
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}></div>
                                <span className="flex-shrink-0 mx-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>OR</span>
                                <div className="flex-grow" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}></div>
                            </div>
                            <Button
                                onClick={() => {
                                    const upiId = paymentMember?.upi_id?.trim();
                                    if (upiId) {
                                        const name = encodeURIComponent(paymentMember.name || "Promoter");
                                        const genericLink = `upi://pay?pa=${upiId}&pn=${name}&cu=INR`;
                                        setQrModalData({ upiLink: genericLink, upiId: upiId, memberName: paymentMember.name || "Promoter" });
                                        setPaymentMember(null);
                                        setPaymentModalStep('initial');
                                    } else {
                                        toast.error("UPI ID missing.");
                                    }
                                }}
                                className="w-full h-12 rounded-xl text-sm font-bold tracking-wide transition-colors border-0"
                                style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.25)" }}
                            >
                                Scan QR
                            </Button>
                            <Button variant="ghost" className="mt-1 w-full text-xs" style={{ color: "var(--text-muted)" }} onClick={() => {
                                setPaymentMember(null);
                                setPaymentModalStep('initial');
                            }}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 mt-4">
                            <Button
                                onClick={() => handleUpiPayment(paymentMember, 'generic')}
                                className="btn-gold w-full h-12 rounded-xl text-sm font-bold tracking-wide border-0"
                            >
                                Pay via PhonePe
                            </Button>
                            <Button
                                onClick={() => handleUpiPayment(paymentMember, 'generic')}
                                className="w-full h-12 rounded-xl text-sm font-bold tracking-wide border-0"
                                style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.2)" }}
                            >
                                Pay via GPay
                            </Button>
                            <p className="text-xs text-center mt-3 px-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                Complete payment on your device, then manually check the box to mark as paid.
                            </p>
                            <Button variant="ghost" className="mt-1 w-full text-xs" style={{ color: "var(--text-muted)" }} onClick={() => setPaymentModalStep('initial')}>
                                Back
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── QR Code Fallback Modal ─────────────────────────────────────── */}
            <Dialog open={!!qrModalData} onOpenChange={(open) => {
                if (!open) setQrModalData(null);
            }}>
                <DialogContent className="max-w-[340px] rounded-3xl p-6 shadow-2xl" style={{ background: "#0F2540", border: "1px solid rgba(212,175,55,0.3)" }}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold tracking-tight gold-gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>Scan to Pay</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-center mt-1 mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Scan this QR using any UPI app from your mobile.
                    </p>
                    <div className="p-3 rounded-2xl mx-auto w-max mb-5" style={{ background: "#FFFFFF", border: "3px solid #D4AF37", boxShadow: "0 0 20px rgba(212,175,55,0.25)" }}>
                        <QRCode value={qrModalData?.upiLink || ""} size={200} />
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="px-4 py-2 rounded-xl w-full text-center" style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)" }}>
                            <p className="text-xs uppercase tracking-wider font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>UPI ID</p>
                            <p className="font-medium text-sm truncate text-foreground">{qrModalData?.upiId}</p>
                        </div>
                        <Button
                            className="btn-gold w-full rounded-xl h-11 font-semibold gap-2 border-0"
                            onClick={() => {
                                navigator.clipboard.writeText(qrModalData?.upiId || "");
                                toast.success("UPI ID copied to clipboard!");
                            }}
                        >
                            <Copy className="h-4 w-4" />
                            Copy UPI ID
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}
