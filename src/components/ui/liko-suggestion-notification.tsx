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
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-24 left-6 z-[70] max-w-sm w-[calc(100vw-3rem)] sm:w-96 rounded-2xl p-4 glass-panel bg-card/95 border border-primary/40 shadow-xl shadow-primary/20 backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            {/* Mascot Avatar with Rotating Glow */}
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-cyan-400 to-purple-500 p-[2px]"
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
                <span className="text-xs font-bold text-primary font-heading tracking-wide uppercase">
                  {suggestion.status === "already_categorized" ? "Liko Asisten AI" : "Saran dari Liko"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
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
                      className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
                    >
                      <Zap className="h-3.5 w-3.5" /> Bantu Rapikan
                    </button>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="px-3 py-1.5 rounded-xl text-muted-foreground hover:text-foreground text-xs font-medium hover:bg-muted/50 active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
                    >
                      Nanti Saja
                    </button>
                  </div>
                </>
              )}

              {suggestion.status === "already_categorized" && (
                <div className="py-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Tautan Berhasil Disimpan</span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-1 line-clamp-2">
                    <span className="font-bold text-foreground">"{suggestion.link.title || suggestion.link.url}"</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Kategori: <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{suggestion.assignedCategory}</span>
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
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-success">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Tautan Berhasil Dirapikan!
                  </div>
                  <p className="text-[11px] text-foreground/80 mt-1">
                    Dikategorikan ke: <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{suggestion.assignedCategory}</span>
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
              className="text-muted-foreground/60 hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
