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
                className="flex items-center gap-2 h-10 px-2 rounded-xl bg-card border border-border hover:bg-muted transition-all shadow-sm group"
            >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-[10px] font-bold text-foreground shadow-sm border border-border/50">
                    A
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-52 rounded-2xl border border-border bg-muted/30 p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                    >
                        <div className="px-2.5 pb-2 pt-1 border-b border-border mb-1.5">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">Account</p>
                            <p className="text-sm font-bold text-foreground truncate mt-0.5">Admin User</p>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push("/dashboard");
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-[#7C3AED]/10 transition-colors"
                                >
                                    <FileText className="h-4 w-4" />
                                    Generate Report
                                </button>
                            )}

                            <div className="h-px bg-muted my-1" />

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
