"use client";

import { motion } from "framer-motion";
import { useOnboarding } from "@/components/providers/onboarding-provider";
import { useTranslation } from "@/components/providers/i18n-provider";

export function OnboardingSkipConfirm() {
  const { phase, cancelSkip, confirmSkip } = useOnboarding();
  const { t } = useTranslation();

  if (phase !== "skip-confirm") return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-base font-bold text-foreground">
            {t("onboarding.skipConfirmTitle")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("onboarding.skipConfirmDesc")}
          </p>
        </div>

        <div className="px-6 pb-6 flex gap-2.5">
          <button
            type="button"
            onClick={cancelSkip}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-muted/50 active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
          >
            {t("onboarding.continueTour")}
          </button>
          <button
            type="button"
            onClick={confirmSkip}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-muted text-foreground hover:bg-muted/80 active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
          >
            {t("onboarding.skip")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

