"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, CheckCircle2 } from "lucide-react";
import { useOnboarding } from "@/components/providers/onboarding-provider";
import { OnboardingWelcomeScreen } from "@/components/onboarding/welcome-screen";
import { OnboardingSkipConfirm } from "@/components/onboarding/skip-confirm";
import { ONBOARDING_STEPS } from "@/lib/onboarding-state";
import { getPrevStep } from "@/lib/onboarding-state";
import { LinkoraText } from "@/components/ui/linkora-text";
import { useTranslation } from "@/components/providers/i18n-provider";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPos {
  top: number;
  left: number;
  placement: "top" | "bottom" | "left" | "right";
}

const SPOTLIGHT_PADDING = 8;
const TOOLTIP_GAP = 12;
const TOOLTIP_WIDTH = 340;
const TOOLTIP_WIDTH_MOBILE = 290;

const SIDEBAR_TARGETS = new Set([
  "dashboard",
  "links",
  "collections",
  "notes",
  "roadmaps",
  "reminders",
  "profile",
]);

function getTooltipPosition(
  rect: TargetRect,
  preferredPlacement: "top" | "bottom" | "left" | "right",
  viewportWidth: number,
  viewportHeight: number,
  targetId?: string
): TooltipPos {
  const tooltipW = viewportWidth < 640 ? TOOLTIP_WIDTH_MOBILE : TOOLTIP_WIDTH;
  const tooltipEstH = 230; // Realistic height of tour card

  // On small mobile screens (< 640px), prefer top/bottom over right/left to avoid side truncation
  let placement = preferredPlacement;
  if (viewportWidth < 640 && (placement === "right" || placement === "left")) {
    placement = rect.top > viewportHeight / 2 ? "top" : "bottom";
  }

  let top = 0;
  let left = 0;

  switch (placement) {
    case "right":
      top = rect.top - 8;
      left = rect.left + rect.width + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      // If right placement overflows right boundary, fallback to top/bottom
      if (left + tooltipW > viewportWidth - 16) {
        placement = rect.top > viewportHeight / 2 ? "top" : "bottom";
        top = placement === "top"
          ? rect.top - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipEstH
          : rect.top + rect.height + SPOTLIGHT_PADDING + TOOLTIP_GAP;
        left = rect.left + rect.width / 2 - tooltipW / 2;
      }
      break;

    case "left":
      top = rect.top - 8;
      left = rect.left - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipW;
      if (left < 16) {
        placement = rect.top > viewportHeight / 2 ? "top" : "bottom";
        top = placement === "top"
          ? rect.top - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipEstH
          : rect.top + rect.height + SPOTLIGHT_PADDING + TOOLTIP_GAP;
        left = rect.left + rect.width / 2 - tooltipW / 2;
      }
      break;

    case "bottom":
      top = rect.top + rect.height + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      break;

    case "top":
      const extraTopOffset = (targetId === "liko-chat" || targetId === "profile") ? 64 : 20;
      top = rect.top - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipEstH - extraTopOffset;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      break;
  }

  // Clamp safely within viewport bounds
  left = Math.max(16, Math.min(left, viewportWidth - tooltipW - 16));
  // For top placement, only clamp against going off the top edge, never push down over target
  if (placement === "top") {
    top = Math.max(16, top);
  } else {
    top = Math.max(16, Math.min(top, viewportHeight - tooltipEstH - 16));
  }

  return { top, left, placement };
}

function CompletionScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-primary/15 via-emerald-500/15 to-cyan-500/15 border border-primary/25 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {t("onboarding.completionTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("onboarding.completionDesc")}
          </p>
        </div>
        <div className="px-8 pb-8">
          <button
            onClick={onComplete}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
          >
            {t("onboarding.startUsing")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function ProductTour() {
  const {
    phase,
    currentStep,
    currentStepIndex,
    totalAvailableSteps,
    currentStepPosition,
    nextStep,
    prevStep,
    requestSkip,
    completeTour,
  } = useOnboarding();

  const { t, locale } = useTranslation();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  // Get available targets for prev step check
  const getAvailableTargets = useCallback((): Set<string> => {
    const targets = new Set<string>();
    if (typeof document === "undefined") return targets;
    document.querySelectorAll("[data-tour]").forEach((el) => {
      const val = el.getAttribute("data-tour");
      if (val) targets.add(val);
    });
    return targets;
  }, []);

  const hasPrev = getPrevStep(currentStepIndex, getAvailableTargets()) !== -1;

  // Measure target element
  const measureTarget = useCallback(() => {
    if (!currentStep || phase !== "touring") {
      setTargetRect(null);
      setTooltipPos(null);
      return;
    }

    const el = document.querySelector(
      `[data-tour="${currentStep.targetId}"]`
    );
    if (!el) {
      // Target not found, skip this step
      setTargetRect(null);
      setTooltipPos(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const newRect: TargetRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };

    setTargetRect(newRect);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setViewportSize({ w: vw, h: vh });

    const pos = getTooltipPosition(
      newRect,
      currentStep.placement,
      vw,
      vh,
      currentStep.targetId
    );
    setTooltipPos(pos);

    // Scroll target into view if needed
    if (rect.top < 0 || rect.bottom > vh) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep, phase]);

  // Mobile sidebar auto-open effect for sidebar targets
  useEffect(() => {
    if (phase !== "touring" || !currentStep) {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        window.dispatchEvent(
          new CustomEvent("linkora_open_mobile_sidebar", { detail: { open: false } })
        );
      }
      return;
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    const isSidebarStep = SIDEBAR_TARGETS.has(currentStep.targetId);

    if (isMobile) {
      if (isSidebarStep) {
        window.dispatchEvent(
          new CustomEvent("linkora_open_mobile_sidebar", { detail: { open: true } })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent("linkora_open_mobile_sidebar", { detail: { open: false } })
        );
      }
    }
  }, [phase, currentStep]);

  // Measure on step change and window resize
  useEffect(() => {
    if (phase !== "touring") return;

    // Small delay to let any navigation/drawer slide animation settle
    const timer = setTimeout(measureTarget, 200);
    const timer2 = setTimeout(measureTarget, 350);

    const handleResize = () => measureTarget();
    window.addEventListener("resize", handleResize);

    // ResizeObserver on target
    if (currentStep) {
      const el = document.querySelector(
        `[data-tour="${currentStep.targetId}"]`
      );
      if (el) {
        observerRef.current = new ResizeObserver(measureTarget);
        observerRef.current.observe(el);
      }
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener("resize", handleResize);
      observerRef.current?.disconnect();
    };
  }, [phase, currentStep, measureTarget]);

  // Keyboard navigation
  useEffect(() => {
    if (phase !== "touring") return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        requestSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, nextStep, prevStep, requestSkip]);

  // Render welcome screen
  if (phase === "welcome") {
    return <OnboardingWelcomeScreen />;
  }

  // Render skip confirm
  if (phase === "skip-confirm") {
    return (
      <>
        {/* Keep overlay visible behind skip dialog */}
        {targetRect && (
          <div className="fixed inset-0 z-[9998] pointer-events-none">
            <svg className="w-full h-full">
              <defs>
                <mask id="tour-mask-skip">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={targetRect.left - SPOTLIGHT_PADDING}
                    y={targetRect.top - SPOTLIGHT_PADDING}
                    width={targetRect.width + SPOTLIGHT_PADDING * 2}
                    height={targetRect.height + SPOTLIGHT_PADDING * 2}
                    rx="12"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.6)"
                mask="url(#tour-mask-skip)"
              />
            </svg>
          </div>
        )}
        <OnboardingSkipConfirm />
      </>
    );
  }

  // Render completion screen
  if (phase === "complete") {
    return <CompletionScreen onComplete={completeTour} />;
  }

  // Render touring overlay + tooltip
  if (phase !== "touring" || !targetRect || !tooltipPos || !currentStep) {
    return null;
  }

  const tooltipW =
    viewportSize.w < 640 ? TOOLTIP_WIDTH_MOBILE : TOOLTIP_WIDTH;

  const stepTitle =
    locale === "en" && currentStep.titleEn
      ? currentStep.titleEn
      : currentStep.title;
  const stepDesc =
    locale === "en" && currentStep.descriptionEn
      ? currentStep.descriptionEn
      : currentStep.description;

  return (
    <>
      {/* Overlay with spotlight cutout using SVG mask */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={requestSkip}
        aria-hidden="true"
      >
        <svg className="w-full h-full" role="presentation">
          <defs>
            <mask id="tour-spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - SPOTLIGHT_PADDING}
                y={targetRect.top - SPOTLIGHT_PADDING}
                width={targetRect.width + SPOTLIGHT_PADDING * 2}
                height={targetRect.height + SPOTLIGHT_PADDING * 2}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.6)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>
      </div>

      {/* Spotlight border ring around target */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed z-[9999] pointer-events-none rounded-xl border-2 border-primary/50 shadow-[0_0_0_4000px_rgba(0,0,0,0)]"
        style={{
          top: targetRect.top - SPOTLIGHT_PADDING,
          left: targetRect.left - SPOTLIGHT_PADDING,
          width: targetRect.width + SPOTLIGHT_PADDING * 2,
          height: targetRect.height + SPOTLIGHT_PADDING * 2,
        }}
      />

      {/* Tooltip / Coach Mark */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[10000]"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            width: tooltipW,
          }}
          role="dialog"
          aria-label={stepTitle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[calc(100vh-24px)] overflow-y-auto">
            {/* Progress bar */}
            <div className="h-1 w-full bg-muted sticky top-0 z-10">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentStepPosition / totalAvailableSteps) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-5">
              {/* Step counter */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {locale === "en"
                    ? `Step ${currentStepPosition} of ${totalAvailableSteps}`
                    : `Langkah ${currentStepPosition} dari ${totalAvailableSteps}`}
                </span>
                <button
                  onClick={requestSkip}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                  aria-label={t("onboarding.skip")}
                  title={t("onboarding.skip")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-foreground leading-tight">
                {stepTitle}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {stepDesc}
              </p>

              {/* Step dots */}
              <div className="flex items-center gap-1.5 mt-4 mb-4 justify-center">
                {Array.from({ length: totalAvailableSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 === currentStepPosition
                        ? "w-5 bg-primary"
                        : i + 1 < currentStepPosition
                          ? "w-1.5 bg-primary/40"
                          : "w-1.5 bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 mt-4 border-t border-border/40">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  disabled={!hasPrev}
                  whileHover={hasPrev ? { scale: 1.02 } : {}}
                  whileTap={hasPrev ? { scale: 0.97 } : {}}
                  transition={{ duration: 0.15 }}
                  className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground bg-muted/70 hover:bg-muted border border-border/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer select-none shrink-0"
                  aria-label={t("onboarding.prev")}
                >
                  <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span>{t("onboarding.prev")}</span>
                </motion.button>

                {currentStepPosition < totalAvailableSteps && (
                  <motion.button
                    type="button"
                    onClick={requestSkip}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer select-none shrink-0"
                  >
                    {t("onboarding.skip")}
                  </motion.button>
                )}

                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="group flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-primary via-indigo-600 to-cyan-600 hover:from-primary/90 hover:to-cyan-500 text-white shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all cursor-pointer select-none shrink-0 whitespace-nowrap"
                  aria-label={currentStepPosition === totalAvailableSteps ? t("onboarding.finish") : t("onboarding.next")}
                >
                  {currentStepPosition === totalAvailableSteps ? (
                    <>
                      <span>{t("onboarding.finish")}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    </>
                  ) : (
                    <>
                      <span>{t("onboarding.next")}</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

