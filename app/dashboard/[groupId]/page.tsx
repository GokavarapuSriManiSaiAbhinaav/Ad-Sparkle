"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
    const router = useRouter();
    const params = useParams();
    const groupId = params?.groupId as string;

    // Selection states (initialize empty)
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");
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
        if (!groupId) return;

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
                if (data) setGroup(data);
            } catch (err: any) {
                setError(err.message || "Failed to load group.");
            } finally {
                setIsFetchingGroup(false);
            }
        }

        fetchGroup();
    }, [groupId]);

    // 2. Fetch Members when "Load Members" is clicked
    const handleLoadMembers = async () => {
        if (!selectedYear || !selectedMonth) return;

        setIsFetchingMembers(true);
        setError(null);
        setHasLoadedMembers(false);

        try {
            const yearInt = parseInt(selectedYear);
            const monthInt = parseInt(selectedMonth);
            const selectedYM = yearInt * 12 + monthInt;

            // Fetch promoters
            const { data: pData, error: pError } = await supabase
                .from("promoters")
                .select("*")
                .eq("group_id", groupId);

            if (pError) throw pError;

            const allPromoters = pData ?? [];

            // Filter promoters
            const activePromoters = allPromoters.filter((p) => {
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
            const promoterIds = activePromoters.map((p) => p.id);

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
    };

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

        window.location.href = upiLink;
    }, []);

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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear, selectedMonth]);

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
        <main className="min-h-screen bg-background text-foreground pb-20">
            {/* ── Header Bar ─────────────────────────────────────────────────── */}
            <div
                className="sticky top-0 z-10 w-full border-b border-border bg-background/95"
            >
                <div className="max-w-md md:max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base md:text-xl font-bold text-foreground leading-tight line-clamp-2 md:line-clamp-none break-words">
                            {isFetchingGroup ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : group ? (
                                group.name
                            ) : (
                                "Loading Group..."
                            )}
                        </h1>
                        <p className="text-xs text-muted-foreground/70 leading-none mt-0.5 truncate">
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
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="rounded-xl h-11 bg-card">
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

                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="rounded-xl h-11 bg-card">
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

                    <Button
                        onClick={handleLoadMembers}
                        disabled={!isSelectionComplete || isFetchingMembers}
                        className="w-full md:w-auto h-11 rounded-xl shadow-sm text-sm font-bold md:px-8"
                    >
                        {isFetchingMembers ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load Members"
                        )}
                    </Button>
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
                                <h2 className="text-xl font-bold tracking-tight mb-0.5">Members</h2>
                                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="h-9 gap-1.5 rounded-xl shadow-sm">
                                            <Plus className="h-4 w-4" />
                                            Add Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[340px] w-[calc(100%-32px)] rounded-3xl p-6 border-border shadow-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold tracking-tight">Add New Member</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleAddMember} className="space-y-4 mt-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Name (Optional)
                                                </label>
                                                <Input
                                                    placeholder="John Doe"
                                                    value={newMemberName}
                                                    onChange={(e) => setNewMemberName(e.target.value)}
                                                    className="h-11 rounded-xl bg-background border-border border-border"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Phone (Required)
                                                </label>
                                                <Input
                                                    placeholder="9876543210"
                                                    value={newMemberPhone}
                                                    onChange={(e) => setNewMemberPhone(e.target.value)}
                                                    required
                                                    className="h-11 rounded-xl bg-background border-border border-border"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    UPI ID (Required)
                                                </label>
                                                <Input
                                                    placeholder="user@upi"
                                                    value={newMemberUpiId}
                                                    onChange={(e) => setNewMemberUpiId(e.target.value)}
                                                    required
                                                    className="h-11 rounded-xl bg-background border-border border-border"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Days (Optional)
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={newMemberDays}
                                                    onChange={(e) => setNewMemberDays(e.target.value)}
                                                    className="h-11 rounded-xl bg-background border-border border-border"
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isAddingMember}
                                                className="w-full h-11 rounded-xl shadow-md text-sm font-bold mt-2"
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
                                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 py-12 flex flex-col items-center gap-3 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">No members found</p>
                                        <p className="text-xs text-muted-foreground mt-1 px-4">
                                            No active promoters matched the filters for{" "}
                                            {MONTHS.find((m) => m.value === selectedMonth)?.label}{" "}
                                            {selectedYear}.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Card List */}
                            {mergedData.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
                                    <AnimatePresence>
                                        {mergedData.map((member, idx) => (
                                            <motion.div
                                                key={member.id}
                                                initial={{ opacity: 0, scale: 0.98, y: 5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                                layout
                                                className="h-full"
                                            >
                                                <Card className={`h-full rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${member.payment_completed
                                                    ? "bg-green-500/10 border-green-500/30 border-l-4 border-l-green-500"
                                                    : "bg-card border-border p-0"
                                                    }`}>
                                                    <div className="p-4 flex flex-col h-full gap-3.5">
                                                        {/* Top Row: Info */}
                                                        <div className="flex justify-between items-start gap-3 flex-1">
                                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-xs font-semibold text-foreground mt-0.5">
                                                                    {idx + 1}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start gap-2 max-w-full">
                                                                        <h3 className="text-sm md:text-base font-bold line-clamp-2 md:line-clamp-none leading-tight dark:text-foreground text-gray-900 break-words flex-1">
                                                                            {member.name}
                                                                        </h3>
                                                                        {member.payment_completed && (
                                                                            <span className="flex items-center gap-1 text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 mt-0.5">
                                                                                <CheckCircle2 className="h-2.5 w-2.5" />
                                                                                Paid
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 truncate">
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

                                                                <DialogContent className="max-w-[340px] w-[calc(100%-32px)] rounded-3xl p-6 border-border shadow-2xl">
                                                                    <DialogHeader>
                                                                        <DialogTitle className="text-xl font-bold tracking-tight">Edit Member</DialogTitle>
                                                                    </DialogHeader>
                                                                    <form onSubmit={handleEditSave} className="space-y-4 mt-2">
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                                                Name
                                                                            </label>
                                                                            <Input
                                                                                placeholder="Name"
                                                                                value={editName}
                                                                                onChange={(e) => setEditName(e.target.value)}
                                                                                className="h-11 rounded-xl bg-background border-border border-border"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                                                Phone (Required)
                                                                            </label>
                                                                            <Input
                                                                                placeholder="Phone"
                                                                                value={editPhone}
                                                                                onChange={(e) => setEditPhone(e.target.value)}
                                                                                required
                                                                                className="h-11 rounded-xl bg-background border-border border-border"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                                                UPI ID (Required)
                                                                            </label>
                                                                            <Input
                                                                                placeholder="UPI ID"
                                                                                value={editUpiId}
                                                                                onChange={(e) => setEditUpiId(e.target.value)}
                                                                                required
                                                                                className="h-11 rounded-xl bg-background border-border border-border"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                                                Days
                                                                            </label>
                                                                            <Input
                                                                                type="number"
                                                                                placeholder="0"
                                                                                value={editDays}
                                                                                onChange={(e) => setEditDays(e.target.value)}
                                                                                className="h-11 rounded-xl bg-background border-border border-border"
                                                                            />
                                                                        </div>

                                                                        <div className="flex gap-3 pt-2">
                                                                            <Button
                                                                                type="button"
                                                                                variant="destructive"
                                                                                disabled={isDeleting || isUpdating}
                                                                                onClick={() => handleDeleteMember(member.id)}
                                                                                className="flex-1 h-11 rounded-xl shadow-sm text-sm font-bold bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                                            >
                                                                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                                                                            </Button>

                                                                            <Button
                                                                                type="submit"
                                                                                disabled={isUpdating || isDeleting}
                                                                                className="flex-1 h-11 rounded-xl shadow-md text-sm font-bold"
                                                                            >
                                                                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                                                {isUpdating ? "Saving..." : "Save"}
                                                                            </Button>
                                                                        </div>
                                                                    </form>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>

                                                        <div className="h-px w-full bg-border/50" />

                                                        {/* Bottom Row: Actions */}
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                                                    Days
                                                                </span>
                                                                <span className="text-sm font-bold mt-0.5 dark:text-foreground text-gray-900">
                                                                    {member.days}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <Button
                                                                    size="sm"
                                                                    variant={member.payment_completed ? "secondary" : "default"}
                                                                    onClick={() => {
                                                                        setPaymentMember(member);
                                                                        setPaymentModalStep('initial');
                                                                    }}
                                                                    className={`h-8 text-xs font-medium rounded-lg px-4 transition-colors ${!member.payment_completed
                                                                        ? "text-white bg-[#7C3AED] hover:bg-[#6D28D9] border-none"
                                                                        : ""
                                                                        }`}
                                                                >
                                                                    {member.payment_completed ? "Paid" : "Pay"}
                                                                </Button>

                                                                <div className="flex items-center justify-center bg-background border-border p-1.5 rounded-md border border-border shadow-sm transition-colors hover:bg-muted/50">
                                                                    <Checkbox
                                                                        checked={member.payment_completed}
                                                                        disabled={loadingPayments.has(member.id)}
                                                                        onCheckedChange={(c) => handlePaymentToggle(member, c === true)}
                                                                        className="rounded-[4px] data-[state=checked]:bg-[#22c55e] data-[state=checked]:border-[#22c55e] transition-all"
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
                <DialogContent className="max-w-[320px] rounded-3xl p-6 border-border shadow-2xl" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold tracking-tight">Complete Payment</DialogTitle>
                    </DialogHeader>
                    {paymentModalStep === 'initial' ? (
                        <div className="flex flex-col gap-3 mt-4">
                            <Button
                                onClick={() => setPaymentModalStep('apps')}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md text-sm font-bold tracking-wide transition-colors"
                            >
                                Via UPI
                            </Button>
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-border"></div>
                                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs font-semibold uppercase tracking-wider">OR</span>
                                <div className="flex-grow border-t border-border"></div>
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
                                className="w-full h-12 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl shadow-md text-sm font-bold tracking-wide transition-colors"
                            >
                                Scan QR
                            </Button>
                            <Button variant="ghost" className="mt-1 w-full text-xs text-muted-foreground" onClick={() => {
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
                                className="w-full h-12 bg-[#5f259f] hover:bg-[#4d1e82] text-white rounded-xl shadow-md text-sm font-bold tracking-wide transition-colors"
                            >
                                Pay via PhonePe
                            </Button>
                            <Button
                                onClick={() => handleUpiPayment(paymentMember, 'generic')}
                                className="w-full h-12 bg-[#1a73e8] hover:bg-[#1557af] text-white rounded-xl shadow-md text-sm font-bold tracking-wide transition-colors"
                            >
                                Pay via GPay
                            </Button>
                            <p className="text-xs text-center text-muted-foreground mt-3 px-2 leading-relaxed">
                                Complete payment on your device, then manually check the box to mark as paid.
                            </p>
                            <Button variant="ghost" className="mt-1 w-full text-xs text-muted-foreground" onClick={() => setPaymentModalStep('initial')}>
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
                <DialogContent className="max-w-[340px] rounded-3xl p-6 border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold tracking-tight">Scan to Pay</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-center text-muted-foreground mt-1 mb-4 leading-relaxed">
                        Scan this QR using any UPI app from your mobile.
                    </p>
                    <div className="bg-white p-4 rounded-2xl mx-auto w-max mb-5 shadow-sm border border-border">
                        <QRCode value={qrModalData?.upiLink || ""} size={200} />
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="bg-muted/50 px-4 py-2 rounded-xl border border-border w-full text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">UPI ID</p>
                            <p className="font-medium text-sm truncate">{qrModalData?.upiId}</p>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full rounded-xl h-11 shadow-sm font-semibold gap-2"
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
