"use client";

import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { useOnboarding } from "@/components/providers/onboarding-provider";
import { LinkoraText } from "@/components/ui/linkora-text";

export function OnboardingWelcomeScreen() {
  const { phase, startTour, dismissWelcome } = useOnboarding();

  if (phase !== "welcome") return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={dismissWelcome}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">
            <Compass className="h-7 w-7 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Selamat datang di <LinkoraText />
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Yuk kenali beberapa fitur utama agar kamu bisa menggunakan Linkora dengan lebih mudah.
          </p>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={startTour}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover active:scale-95 transition-all duration-150 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
          >
            Mulai Panduan
          </button>
          <button
            type="button"
            onClick={dismissWelcome}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
          >
            Nanti saja
          </button>
        </div>
      </motion.div>
    </div>
  );
}
