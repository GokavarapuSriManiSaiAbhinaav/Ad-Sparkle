"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogOut, FileText, LayoutDashboard, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ProfileDropdownProps = {
    showGenerateReport?: boolean;
    onGenerateReport?: () => void;
};

export function ProfileDropdown({ showGenerateReport, onGenerateReport }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 h-10 px-2 rounded-xl transition-all shadow-sm group"
                style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                }}
            >
                {/* Gold monogram avatar */}
                <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-sm"
                    style={{
                        background: "linear-gradient(135deg, #D4AF37 0%, #F5E6A6 50%, #C9A227 100%)",
                        color: "#0B1C2D",
                    }}>
                    A
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: "var(--text-muted)" }} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-52 rounded-2xl p-1.5 z-50 overflow-hidden"
                        style={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.04)",
                        }}
                    >
                        {/* Top gold accent */}
                        <div className="absolute top-0 left-0 right-0 h-0.5"
                            style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />

                        <div className="px-2.5 pb-2 pt-3 mb-1.5"
                            style={{ borderBottom: "1px solid var(--border)" }}>
                            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5"
                                style={{ color: "var(--text-muted)" }}>Account</p>
                            <p className="text-sm font-bold text-foreground truncate mt-0.5">Admin User</p>
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push("/dashboard");
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-[rgba(212,175,55,0.08)]"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </button>

                            {showGenerateReport && onGenerateReport && (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        onGenerateReport();
                                    }}
                                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-[rgba(212,175,55,0.08)]"
                                    style={{ color: "#D4AF37" }}
                                >
                                    <FileText className="h-4 w-4" />
                                    Generate Report
                                </button>
                            )}

                            <div className="h-px my-1" style={{ background: "var(--border)" }} />

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
