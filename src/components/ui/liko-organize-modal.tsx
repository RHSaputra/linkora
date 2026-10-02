import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { dispatchRefresh } from "@/hooks/use-data";
import { useTranslation } from "@/components/providers/i18n-provider";
import { FormatBrandText } from "@/components/ui/linkora-text";
import { LikoMascotAvatar } from "@/components/ui/liko-ai-modal";

export interface OrganizeDetail {
  linkId?: string;
  isAll?: boolean;
}

interface StepItem {
  id: number;
  labelId: string;
  labelEn: string;
}

const PROCESS_STEPS: StepItem[] = [
  {
    id: 1,
    labelId: "Menganalisis tautan & struktur ruang kerja...",
    labelEn: "Analyzing links & workspace structure...",
  },
  {
    id: 2,
    labelId: "Mencocokkan topik konten dengan AI Liko...",
    labelEn: "Matching content topics with Liko AI...",
  },
  {
    id: 3,
    labelId: "Mengelompokkan kategori & tag secara otomatis...",
    labelEn: "Auto-grouping categories & tags...",
  },
];

type ModalPhase =
  | "idle"
  | "coin-spin"
  | "modal-morph"
  | "modal-settled"
  | "processing"
  | "success"
  | "error";

export function LikoOrganizeModal() {
  const { t, locale } = useTranslation();
  const isEn = locale === "en";

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<ModalPhase>("idle");

  useEffect(() => {
    setMounted(true);
  }, []);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [resultData, setResultData] = useState<{
    message?: string;
    processed?: number;
    assignedCategory?: string;
    changes?: any[];
    error?: string;
  } | null>(null);

  const pendingDetailRef = useRef<OrganizeDetail | null>(null);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<OrganizeDetail>;
      const detail = customEvent.detail || {};
      pendingDetailRef.current = detail;

      // Reset state and begin PHASE 1: 3D Coin Spin
      setResultData(null);
      setActiveStepIndex(0);
      setPhase("coin-spin");
    };

    window.addEventListener("liko-trigger-organize", handleTrigger);
    return () => {
      window.removeEventListener("liko-trigger-organize", handleTrigger);
    };
  }, []);

  // Handle phase progression timers (Staged Animation Sequence)
  useEffect(() => {
    if (phase === "coin-spin") {
      // PHASE 2: 1.8s - 2.2s 3D Coin Rotation -> Morph to Modal
      const spinTimer = setTimeout(() => {
        setPhase("modal-morph");
      }, 1900);
      return () => clearTimeout(spinTimer);
    }

    if (phase === "modal-morph") {
      // PHASE 3: 800ms Morph Transition -> Modal Settled
      const morphTimer = setTimeout(() => {
        setPhase("modal-settled");
      }, 800);
      return () => clearTimeout(morphTimer);
    }

    if (phase === "modal-settled") {
      // PHASE 4: 300ms Settled Pause -> Start Processing
      const settledTimer = setTimeout(() => {
        setPhase("processing");
        if (pendingDetailRef.current) {
          runAiOrganization(pendingDetailRef.current);
        }
      }, 300);
      return () => clearTimeout(settledTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const runAiOrganization = async (detail: OrganizeDetail) => {
    // PHASE 6: Step progression animation (spaced out cleanly for readability)
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < PROCESS_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1400);

    try {
      const res = await fetch("/api/ai/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          detail.linkId
            ? { linkId: detail.linkId, locale }
            : { organizeAll: true, locale }
        ),
      });

      clearInterval(stepInterval);

      if (res.ok) {
        const data = await res.json();
        const processed = typeof data.processed === "number" ? data.processed : (data.changes?.length || 0);
        const assignedCategory = data.changes?.[0]?.category || null;

        setResultData({
          message: data.message || (isEn ? "Organized Successfully!" : "Berhasil Dirapikan!"),
          processed,
          assignedCategory,
          changes: data.changes || [],
        });

        // Ensure all steps are completed before transitioning to victory state
        setActiveStepIndex(PROCESS_STEPS.length - 1);

        // PHASE 8: Victory State Transition
        setTimeout(() => {
          setPhase("success");
          if (processed > 0) {
            dispatchRefresh(["links", "dashboard", "collections", "tags"], false);
          }
        }, 700);
      } else {
        const errData = await res.json().catch(() => ({}));
        setResultData({
          error: errData.error || (isEn ? "Failed to organize links." : "Gagal merapikan tautan."),
        });
        setTimeout(() => setPhase("error"), 700);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setResultData({
        error: err?.message || (isEn ? "Network error occurred." : "Terjadi kendala jaringan."),
      });
      setTimeout(() => setPhase("error"), 700);
    }
  };

  const handleClose = () => {
    setPhase("idle");
    setResultData(null);
    setActiveStepIndex(0);
    pendingDetailRef.current = null;
  };

  const isOpen = phase !== "idle";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden pointer-events-auto">
          {/* ========================================================================= */}
          {/* BACKDROP BLUR OVERLAY (Fades smoothly opacity 0 -> 1)                     */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onClick={phase === "success" || phase === "error" ? handleClose : undefined}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xl"
          />

          {/* ========================================================================= */}
          {/* PHASE 1 & 2: 3D METALLIC SPINNING COIN (1.9s Smooth Deceleration)        */}
          {/* ========================================================================= */}
          {phase === "coin-spin" && (
            <div className="relative [perspective:1000px] pointer-events-none select-none z-10">
              <motion.div
                initial={{ rotateY: 0, scale: 0.5, y: 15 }}
                animate={{
                  rotateY: [0, 720, 1440],
                  scale: [0.5, 1.2, 1],
                  y: [15, -10, 0],
                }}
                transition={{
                  duration: 1.9,
                  ease: [0.22, 1, 0.36, 1], // Smooth deceleration curve
                }}
                className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full [transform-style:preserve-3d] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
              >
                {/* 3D Coin Front Face (Metallic Gold / Cyan Rim) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-1 shadow-2xl [backface-visibility:hidden]">
                  <div className="w-full h-full rounded-full bg-slate-950 p-2 relative overflow-hidden border-2 border-amber-300/70 flex items-center justify-center">
                    {/* Metallic Moving Surface Highlight */}
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.9, ease: "linear" }}
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    />

                    {/* Mascot Image */}
                    <div className="relative w-full h-full rounded-full overflow-hidden border border-cyan-400/50 shadow-md">
                      <img
                        src="/maskot.jpeg"
                        alt="Liko 3D Coin"
                        className="w-full h-full object-cover object-top scale-105"
                      />
                    </div>
                  </div>
                </div>

                {/* 3D Coin Back Face (Linkorian Emblem) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-600 to-amber-500 p-1 shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <div className="w-full h-full rounded-full bg-slate-950 p-2 relative overflow-hidden border-2 border-cyan-300/70 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mb-1">
                      <span className="text-amber-300 font-bold text-lg">L</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase font-mono">
                      LINKORIAN
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 3 - 8: CLEAN MODERN POP-UP MODAL                                    */}
          {/* ========================================================================= */}
          {phase !== "coin-spin" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-slate-900/95 text-slate-100 border border-slate-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl z-10 overflow-hidden"
            >
              {/* Close Button (Enabled when finished) */}
              {(phase === "success" || phase === "error") && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={t("common.close")}
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* ========================================================================= */}
              {/* PHASE 5: MASKOT LIKO — FLOATING, BREATHING & CYBER SCANNER               */}
              {/* ========================================================================= */}
              <div className="relative flex flex-col items-center text-center mt-2 mb-6">
                <LikoMascotAvatar
                  phase={phase}
                  size="md"
                  isScanning={phase === "processing" || phase === "modal-settled"}
                />

                {/* MODAL TITLE & SUBTITLE (CRYSTAL CLEAR HIGH CONTRAST READABILITY) */}
                <div className="mt-4 space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight flex items-center justify-center gap-2">
                    {phase === "success" ? (
                      resultData?.processed && resultData.processed > 0 ? (
                        <span className="flex items-center gap-2 text-emerald-400">
                          <Check className="w-6 h-6 stroke-[3]" />
                          <span>{isEn ? "Workspace Organized" : "Berhasil Dirapikan"}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-amber-400">
                          <Check className="w-6 h-6 stroke-[3]" />
                          <span>{isEn ? "Already Organized" : "Semua Tautan Sudah Rapi"}</span>
                        </span>
                      )
                    ) : phase === "error" ? (
                      <span className="text-rose-400">{isEn ? "Organize Failed" : "Gagal Merapikan"}</span>
                    ) : (
                      <span>
                        <FormatBrandText text="Liko AI" className="text-primary font-bold mr-1.5" />
                        <span>{isEn ? "Organizing Workspace" : "Merapikan Tautan"}</span>
                      </span>
                    )}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 max-w-xs sm:max-w-md mx-auto font-normal leading-relaxed">
                    {phase === "success"
                      ? resultData?.processed && resultData.processed > 0
                        ? resultData?.message || (isEn ? "Links grouped into optimal categories." : "Tautan dikelompokkan ke kategori terbaik.")
                        : (isEn ? "No links need organizing at this moment." : "Tidak ada tautan yang perlu dirapikan saat ini.")
                      : phase === "error"
                        ? resultData?.error || (isEn ? "Please try again later." : "Silakan coba beberapa saat lagi.")
                        : (isEn ? "Organizing and categorizing your links..." : "Menganalisis dan mengelompokkan tautan Anda...")}
                  </p>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PHASE 6: SEQUENTIAL PROGRESS STEPS (CRYSTAL CLEAR READABILITY)           */}
              {/* ========================================================================= */}
              {(phase === "processing" || phase === "modal-settled" || phase === "modal-morph") && (
                <div className="space-y-2.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-2">
                  {PROCESS_STEPS.map((step, idx) => {
                    const isActive = idx === activeStepIndex && phase === "processing";
                    const isDone = idx < activeStepIndex;

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                          isActive
                            ? "bg-slate-800/90 border-primary/50 text-white font-medium shadow-sm"
                            : isDone
                              ? "bg-slate-900/50 border-slate-800 text-slate-300"
                              : "bg-slate-950/40 border-transparent text-slate-500 opacity-50"
                        }`}
                      >
                        <div className="shrink-0 flex items-center justify-center w-5 h-5">
                          {isDone ? (
                            <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                          ) : isActive ? (
                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-600" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-200 flex-1 leading-snug text-left">
                          {isEn ? step.labelEn : step.labelId}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* ========================================================================= */}
              {/* PHASE 8: CLEAN VICTORY / EMPTY STATE & RESULTS ACTION                     */}
              {/* ========================================================================= */}
              {phase === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4 mb-1"
                >
                  {resultData?.processed && resultData.processed > 0 ? (
                    <>
                      <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl text-left space-y-3 shadow-inner">
                        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300">
                          <span>{isEn ? "Total links organized:" : "Total tautan dirapikan:"}</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                            {resultData.processed} {isEn ? "links" : "tautan"}
                          </span>
                        </div>

                        {resultData?.assignedCategory && (
                          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 pt-2 border-t border-slate-800/80">
                            <span>{isEn ? "Main Category:" : "Kategori Utama:"}</span>
                            <span className="font-bold text-primary bg-primary/10 border border-primary/30 px-3 py-0.5 rounded-full">
                              {resultData.assignedCategory}
                            </span>
                          </div>
                        )}

                        {/* LIST OF ACTUAL LINKS ORGANIZED */}
                        {resultData?.changes && resultData.changes.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/80 space-y-2">
                            <span className="text-xs font-semibold text-slate-400 block">
                              {isEn ? "Organized Links Details:" : "Detail Tautan Dirapikan:"}
                            </span>
                            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-left custom-scrollbar">
                              {resultData.changes.map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                                >
                                  <span className="font-medium text-slate-200 truncate flex-1" title={item.title}>
                                    {item.title || (isEn ? "Untitled Link" : "Tautan Tanpa Judul")}
                                  </span>
                                  <span className="text-[10px] font-bold text-primary bg-primary/15 border border-primary/30 px-2 py-0.5 rounded-md shrink-0">
                                    {item.category}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SHARP CLEAN ACTION BUTTON */}
                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span>{isEn ? "Awesome, Show Results!" : "Hebat, Lihat Hasilnya!"}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* NO LINKS NEED ORGANIZING STATE */}
                      <div className="bg-slate-950/90 border border-slate-800 p-4.5 rounded-2xl text-center space-y-2 shadow-inner">
                        <p className="text-xs sm:text-sm text-slate-200 font-semibold">
                          {isEn ? "No links need organizing right now." : "Tidak ada tautan yang perlu dirapikan saat ini."}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isEn
                            ? "All your links already have specific categories."
                            : "Semua tautan Anda sudah memiliki kategori spesifik."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-bold text-sm flex items-center justify-center transition-all duration-150 cursor-pointer"
                      >
                        <span>{isEn ? "Got It" : "Mengerti"}</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}

              {/* ERROR RECOVERY STATE */}
              {phase === "error" && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all cursor-pointer"
                  >
                    {t("common.close")}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
