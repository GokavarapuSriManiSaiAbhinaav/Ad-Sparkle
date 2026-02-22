"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen flex items-center justify-center text-foreground relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0.02 285) 0%, oklch(0.14 0.005 285) 100%)",
      }}
    >
      {/* Subtle background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md mx-auto p-6 relative z-10 flex flex-col items-center text-center"
      >
        {/* App Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl mb-6"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 10px 40px -10px rgba(99, 102, 241, 0.5)",
          }}
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>

        {/* App Title */}
        <motion.h1
          className="text-4xl font-extrabold tracking-tight text-white mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          AdSparkle
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-white/60 text-sm mb-10 max-w-xs mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Manage your groups, track campaigns, and monitor promoter payments effortlessly.
        </motion.p>

        {/* Admin Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full"
        >
          <Button
            size="lg"
            onClick={() => router.push("/login")}
            className="w-full h-14 rounded-xl text-base font-bold shadow-xl flex items-center justify-center gap-2 group transition-all"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
            }}
          >
            Admin Login
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
