"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, CheckCircle, Loader2 } from "lucide-react";
import { SerializedLink } from "@/lib/types";
import { invalidateAndRefresh } from "@/hooks/use-data";

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

        setSuggestion((prev) => (prev ? {
          ...prev,
          status: "success",
          assignedCategory: assigned,
          link: { ...prev.link, category: assigned }
        } : null));

        // Invalidate cache and refresh UI across links, dashboard, collections, tags
        invalidateAndRefresh(["links", "dashboard", "collections", "tags"]);

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
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.15 } }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="fixed bottom-20 left-4 right-4 sm:right-auto sm:left-6 z-[70] max-w-sm w-auto sm:w-96 rounded-xl p-3.5 sm:p-4 bg-card text-card-foreground border border-border shadow-lg"
        >
          <div className="relative flex items-start gap-3 z-10">
            {/* Mascot Avatar */}
            <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border border-border bg-background shadow-xs">
              <img
                src="/maskot.jpeg"
                alt="Liko"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Content Area */}
            <div className="flex-1 text-left min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-primary font-sans tracking-wide uppercase">
                  {suggestion.status === "already_categorized" ? "Asisten Liko" : "Saran Liko"}
                </span>
              </div>

              {suggestion.status === "idle" && (
                <>
                  <p className="text-xs text-foreground leading-relaxed font-medium break-words">
                    Tautan <span className="font-bold text-foreground">"{suggestion.link.title || suggestion.link.url}"</span> belum memiliki kategori spesifik.
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Bantu tentukan kategorinya sekarang?
                  </p>

                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={handleOrganizeNow}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
                    >
                      <Zap className="h-3.5 w-3.5" /> Rapikan Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground text-xs font-medium hover:bg-muted active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
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
                    <span>Tautan Berhasil Disimpan</span>
                  </div>
                  <p className="text-xs text-foreground/90 mt-1 break-words">
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
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" />
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
              className="text-muted-foreground/60 hover:text-foreground p-1 rounded-md hover:bg-muted active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
