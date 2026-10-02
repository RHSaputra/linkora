"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Globe, GitCommit, Search } from "lucide-react";
import { useTranslation } from "@/components/providers/i18n-provider";
import { FormatBrandText } from "@/components/ui/linkora-text";

/* ========================================================================= */
/* SHARED VISUAL PRIMITIVES: LIKO MASCOT WITH HOLOGRAM RING & LASER SCANNER  */
/* ========================================================================= */

interface LikoMascotProps {
  phase?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  isScanning?: boolean;
}

export function LikoMascotAvatar({
  phase = "processing",
  className = "",
  size = "md",
  isScanning = true,
}: LikoMascotProps) {
  const sizeClasses =
    size === "sm"
      ? "w-20 h-20 sm:w-24 sm:h-24"
      : size === "lg"
      ? "w-32 h-32 sm:w-40 sm:h-40"
      : "w-28 h-28 sm:w-32 sm:h-32";

  const ring1Classes =
    size === "sm"
      ? "w-24 h-24 sm:w-28 sm:h-28"
      : size === "lg"
      ? "w-36 h-36 sm:w-44 sm:h-44"
      : "w-32 h-32 sm:w-36 sm:h-36";

  const ring2Classes =
    size === "sm"
      ? "w-28 h-28 sm:w-32 sm:h-32"
      : size === "lg"
      ? "w-40 h-40 sm:w-48 sm:h-48"
      : "w-36 h-36 sm:w-40 sm:h-40";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Subtle Hologram Ring 1 (Slow 8s Rotation) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className={`absolute rounded-full border border-cyan-500/25 border-dashed pointer-events-none ${ring1Classes}`}
      />

      {/* Subtle Hologram Ring 2 (Slow 12s Counter Rotation) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className={`absolute rounded-full border border-primary/20 pointer-events-none ${ring2Classes}`}
      />

      {/* MASCOT AVATAR (CALM FLOATING & BREATHING MOTION) */}
      <motion.div
        animate={
          phase === "success"
            ? { scale: [1, 1.08, 1] }
            : { y: [0, -8, 0], rotate: [-1, 1, -1] }
        }
        transition={
          phase === "success"
            ? { duration: 0.6, ease: "easeInOut" }
            : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
        }
        className={`relative rounded-full overflow-hidden border-2 border-slate-700/80 shadow-[0_12px_30px_rgba(0,0,0,0.5)] bg-slate-950 z-10 ${sizeClasses}`}
      >
        <img
          src="/maskot.jpeg"
          alt="Liko AI Mascot"
          className="w-full h-full object-cover object-top scale-105"
        />

        {/* CYBER LASER SCANNER OVERLAY (Soft & Non-intrusive Cyan Line) */}
        {isScanning && phase !== "success" && phase !== "error" && (
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.7)] pointer-events-none z-20"
          />
        )}
      </motion.div>
    </div>
  );
}

/* ========================================================================= */
/* FITUR 2: AI LINK ANALYSIS MODAL (STANDALONE PORTAL ON TOP OF BODY)        */
/* ========================================================================= */

export interface LikoAnalyzeModalProps {
  open: boolean;
  url?: string;
  onClose?: () => void;
  stepIndex?: number;
}

const ANALYZE_STEPS = [
  { id: 1, labelId: "Menghubungkan ke tautan...", labelEn: "Connecting to link..." },
  { id: 2, labelId: "Menganalisis struktur halaman...", labelEn: "Analyzing page structure..." },
  { id: 3, labelId: "Memahami topik dan konteks konten...", labelEn: "Understanding content topic & context..." },
  { id: 4, labelId: "Mengidentifikasi kategori dan informasi penting...", labelEn: "Identifying categories & metadata..." },
];

export function LikoAnalyzeModal({
  open,
  url = "",
  stepIndex = 0,
}: LikoAnalyzeModalProps) {
  const { locale } = useTranslation();
  const isEn = locale === "en";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Domain extraction for clean display
  const getDisplayDomain = (targetUrl: string) => {
    if (!targetUrl) return "https://example.com";
    try {
      const parsed = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
      return parsed.hostname.replace("www.", "");
    } catch {
      return targetUrl;
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden pointer-events-auto">
          {/* Backdrop Overlay (Standalone, decoupled from any parent dialog card) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl pointer-events-auto"
          />

          {/* Clean Modern Modal Container (Standalone Screen Card) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-slate-900/95 text-slate-100 border border-slate-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl z-10 overflow-hidden"
          >
            {/* Header Mascot & Scanner Stage */}
            <div className="flex flex-col items-center text-center mt-2 mb-6">
              <LikoMascotAvatar phase="processing" size="md" isScanning={true} />

              {/* Title & Domain Pill */}
              <div className="mt-4 space-y-2 w-full">
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold max-w-full truncate">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{getDisplayDomain(url)}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
                  <FormatBrandText text="Liko AI" className="text-cyan-400 font-bold mr-1.5" />
                  <span>{isEn ? "Analyzing Link" : "Menganalisis Tautan"}</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xs sm:max-w-md mx-auto font-normal leading-relaxed">
                  {isEn
                    ? "Reading page structure and discovering category metadata..."
                    : "Membaca struktur halaman dan mengekstrak informasi penting..."}
                </p>
              </div>
            </div>

            {/* HOLOGRAPHIC LINK CARD PREVIEW WITH SWEEPING LASER LINE */}
            <div className="relative mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-semibold text-slate-200 truncate">{url || "Target URL"}</p>
                  <p className="text-[11px] text-slate-400">{isEn ? "AI Link Inspection" : "Inspeksi AI Linkorian"}</p>
                </div>
              </div>

              {/* Laser Scanning Line across Link Representation */}
              <motion.div
                animate={{ left: ["-100%", "200%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent skew-x-12 pointer-events-none"
              />
            </div>

            {/* SEQUENTIAL PROGRESS STEPS (CRYSTAL CLEAR HIGH CONTRAST TEXT) */}
            <div className="space-y-2.5 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
              {ANALYZE_STEPS.map((step, idx) => {
                const isActive = idx === stepIndex;
                const isDone = idx < stepIndex;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "bg-slate-800/90 border-cyan-500/50 text-white font-medium shadow-sm"
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ========================================================================= */
/* FITUR 3: AI ROADMAP MODAL (STANDALONE PORTAL ON TOP OF BODY)               */
/* ========================================================================= */

export interface LikoRoadmapModalProps {
  open: boolean;
  topic?: string;
  stepIndex?: number;
}

const ROADMAP_STEPS = [
  { id: 1, labelId: "Memahami tujuan roadmap...", labelEn: "Understanding roadmap goal..." },
  { id: 2, labelId: "Menyusun tahapan yang diperlukan...", labelEn: "Structuring required milestones..." },
  { id: 3, labelId: "Menghubungkan langkah berdasarkan prioritas...", labelEn: "Connecting steps by priority..." },
  { id: 4, labelId: "Menyempurnakan urutan dan rekomendasi...", labelEn: "Refining order & recommendations..." },
];

export function LikoRoadmapModal({
  open,
  topic = "",
  stepIndex = 0,
}: LikoRoadmapModalProps) {
  const { locale } = useTranslation();
  const isEn = locale === "en";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden pointer-events-auto">
          {/* Backdrop Overlay (Always in front of roadmap form dialog z-[9999]) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl pointer-events-auto"
          />

          {/* Clean Modern Modal Container (Standalone Screen Card) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-slate-900/95 text-slate-100 border border-slate-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl z-10 overflow-hidden"
          >
            {/* Header Mascot & Stage */}
            <div className="flex flex-col items-center text-center mt-2 mb-5">
              <LikoMascotAvatar phase="processing" size="md" isScanning={true} />

              <div className="mt-4 space-y-1.5 w-full">
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>{isEn ? "AI Planner" : "Asisten AI Planner"}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
                  <FormatBrandText text="Liko AI" className="text-indigo-400 font-bold mr-1.5" />
                  <span>{isEn ? "Building Roadmap Canvas" : "Merancang Roadmap"}</span>
                </h3>

                {topic && (
                  <p className="text-xs text-slate-300 max-w-xs sm:max-w-md mx-auto line-clamp-2 italic bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    "{topic}"
                  </p>
                )}
              </div>
            </div>

            {/* HOLOGRAPHIC ROADMAP CANVAS NODES PREVIEW */}
            <div className="relative mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                {/* Node 1 */}
                <motion.div
                  animate={{ scale: stepIndex >= 0 ? 1 : 0.8, opacity: stepIndex >= 0 ? 1 : 0.4 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 flex items-center justify-center font-bold text-xs shadow-md">
                    1
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">Dasar</span>
                </motion.div>

                {/* Connecting Beam Line 1 */}
                <div className="flex-1 h-0.5 mx-2 bg-slate-800 relative overflow-hidden">
                  <motion.div
                    animate={{ x: stepIndex >= 1 ? ["-100%", "100%"] : "-100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full bg-indigo-400/80 w-1/2 shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                  />
                </div>

                {/* Node 2 */}
                <motion.div
                  animate={{ scale: stepIndex >= 1 ? 1 : 0.8, opacity: stepIndex >= 1 ? 1 : 0.4 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 flex items-center justify-center font-bold text-xs shadow-md">
                    2
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">Proses</span>
                </motion.div>

                {/* Connecting Beam Line 2 */}
                <div className="flex-1 h-0.5 mx-2 bg-slate-800 relative overflow-hidden">
                  <motion.div
                    animate={{ x: stepIndex >= 2 ? ["-100%", "100%"] : "-100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full bg-cyan-400/80 w-1/2 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  />
                </div>

                {/* Node 3 */}
                <motion.div
                  animate={{ scale: stepIndex >= 2 ? 1 : 0.8, opacity: stepIndex >= 2 ? 1 : 0.4 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center justify-center font-bold text-xs shadow-md">
                    3
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">Hasil</span>
                </motion.div>
              </div>
            </div>

            {/* SEQUENTIAL PROGRESS STEPS */}
            <div className="space-y-2.5 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
              {ROADMAP_STEPS.map((step, idx) => {
                const isActive = idx === stepIndex;
                const isDone = idx < stepIndex;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "bg-slate-800/90 border-indigo-500/50 text-white font-medium shadow-sm"
                        : isDone
                        ? "bg-slate-900/50 border-slate-800 text-slate-300"
                        : "bg-slate-950/40 border-transparent text-slate-500 opacity-50"
                    }`}
                  >
                    <div className="shrink-0 flex items-center justify-center w-5 h-5">
                      {isDone ? (
                        <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
