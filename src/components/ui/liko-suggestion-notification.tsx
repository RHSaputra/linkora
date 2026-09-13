"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, CheckCircle, Loader2 } from "lucide-react";
import { SerializedLink } from "@/lib/types";
import { invalidateCache, dispatchRefresh } from "@/hooks/use-data";

export function LikoSuggestionNotification() {
  const [suggestion, setSuggestion] = useState<{
    link: SerializedLink;
    status: "idle" | "organizing" | "success" | "error" | "already_categorized";
    assignedCategory?: string;
  } | null>(null);

  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
  };

  useEffect(() => {
    const handleLinkAdded = (e: Event) => {
      const customEvent = e as CustomEvent<{ link: SerializedLink }>;
      const link = customEvent.detail?.link;

      if (link) {
        clearTimer();
        // Check if link is uncategorized or "Custom"
        const needsCategorizing =
          !link.category ||
          link.category === "Custom" ||
          link.category === "Uncategorized" ||
          link.category.trim() === "";

        if (needsCategorizing) {
          // Trigger Liko suggestion to organize
          setSuggestion({
            link,
            status: "idle",
          });
        } else {
          // Link is already categorized — show Liko confirmation popup
          setSuggestion({
            link,
            status: "already_categorized",
            assignedCategory: link.category,
          });

          // Auto-close categorized notification after 4 seconds
          autoDismissTimerRef.current = setTimeout(() => {
            setSuggestion(null);
          }, 4000);
        }
      }
    };

    window.addEventListener("liko-link-added", handleLinkAdded);
    return () => {
      window.removeEventListener("liko-link-added", handleLinkAdded);
      clearTimer();
    };
  }, []);

  const handleOrganizeNow = async () => {
    if (!suggestion?.link?.id) return;

    clearTimer();
    setSuggestion((prev) => (prev ? { ...prev, status: "organizing" } : null));

    // Broadcast organizing state to sync animations in main dashboard
    window.dispatchEvent(new CustomEvent("liko-organize-state", { detail: { isOrganizing: true } }));

    try {
      const res = await fetch("/api/ai/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: suggestion.link.id }),
      });

      if (res.ok) {
        const data = await res.json();
        const assigned = data.changes?.[0]?.category || "Kategori Baru";

        setSuggestion((prev) => (prev ? { ...prev, status: "success", assignedCategory: assigned } : null));

        // Invalidate and refresh UI
        invalidateCache("/api/links");
        invalidateCache("/api/dashboard");
        invalidateCache("/api/collections");
        dispatchRefresh(["links", "dashboard", "collections"]);

        // Auto close after 4 seconds
        autoDismissTimerRef.current = setTimeout(() => {
          setSuggestion(null);
        }, 4000);
      } else {
        setSuggestion((prev) => (prev ? { ...prev, status: "error" } : null));
        autoDismissTimerRef.current = setTimeout(() => setSuggestion(null), 3500);
      }
    } catch {
      setSuggestion((prev) => (prev ? { ...prev, status: "error" } : null));
      autoDismissTimerRef.current = setTimeout(() => setSuggestion(null), 3500);
    } finally {
      window.dispatchEvent(new CustomEvent("liko-organize-state", { detail: { isOrganizing: false } }));
    }
  };

  const handleDismiss = () => {
    clearTimer();
    setSuggestion(null);
  };

  return (
    <AnimatePresence>
      {suggestion && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(4px)", transition: { duration: 0.18 } }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="fixed bottom-24 left-6 z-[70] max-w-sm w-[calc(100vw-3rem)] sm:w-96 rounded-2xl p-4 overflow-hidden bg-card/90 dark:bg-card/95 backdrop-blur-2xl border border-primary/35 shadow-[0_16px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-white/10 dark:ring-white/15"
        >
          {/* Top Beam Light Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-cyan-400 to-transparent opacity-90" />

          {/* Ambient Glow Orb */}
          <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-primary blur-2xl opacity-20 pointer-events-none" />

          <div className="relative flex items-start gap-3.5 z-10">
            {/* Mascot Avatar with Rotating Glow */}
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                animate={suggestion.status === "organizing" ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  suggestion.status === "organizing"
                    ? { duration: 1.5, repeat: Infinity, ease: "linear" }
                    : { duration: 0.3 }
                }
              >
                <div className="w-full h-full rounded-full bg-background" />
              </motion.div>

              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-background shadow-md bg-background z-10">
                <img
                  src="/maskot.jpeg"
                  alt="Liko"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 text-left min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-primary font-heading tracking-wide uppercase flex items-center gap-1">
                  {suggestion.status === "already_categorized" ? "Liko Asisten AI" : "Saran dari Liko"}
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                  AI
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping ml-auto" />
              </div>

              {suggestion.status === "idle" && (
                <>
                  <p className="text-xs text-foreground/90 leading-relaxed font-medium line-clamp-2">
                    Tautan <span className="font-bold text-foreground">"{suggestion.link.title || suggestion.link.url}"</span> belum memiliki kategori spesifik.
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Mau Liko bantu tentukan kategorinya sekarang?
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleOrganizeNow}
                      className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-primary/25 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
                    >
                      <Zap className="h-3.5 w-3.5" /> Bantu Rapikan
                    </button>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="px-3 py-1.5 rounded-xl text-muted-foreground hover:text-foreground text-xs font-medium hover:bg-primary/10 active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
                    >
                      Nanti Saja
                    </button>
                  </div>
                </>
              )}

              {suggestion.status === "already_categorized" && (
                <div className="py-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                    <span className="truncate">Tautan Berhasil Disimpan</span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-1 line-clamp-2">
                    <span className="font-bold text-foreground">"{suggestion.link.title || suggestion.link.url}"</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Kategori: <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">{suggestion.assignedCategory}</span>
                  </p>
                </div>
              )}

              {suggestion.status === "organizing" && (
                <div className="py-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    Liko sedang menganalisis kategori...
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Mencocokkan dengan topik konten link
                  </p>
                </div>
              )}

              {suggestion.status === "success" && (
                <div className="py-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                    Tautan Berhasil Dirapikan!
                  </div>
                  <p className="text-[11px] text-foreground/80 mt-1">
                    Dikategorikan ke: <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">{suggestion.assignedCategory}</span>
                  </p>
                </div>
              )}

              {suggestion.status === "error" && (
                <div className="py-1 text-xs text-muted-foreground">
                  Belum dapat merapikan saat ini. Coba kembali di Dashboard.
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              aria-label="Tutup Saran"
              className="text-muted-foreground/60 hover:text-foreground p-1 rounded-lg hover:bg-primary/15 hover:border hover:border-primary/20 active:scale-90 transition-all duration-150 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
