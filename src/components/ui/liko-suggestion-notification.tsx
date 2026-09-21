"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, CheckCircle, Loader2 } from "lucide-react";
import { SerializedLink } from "@/lib/types";
import { dispatchRefresh } from "@/hooks/use-data";

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
        const needsCategorizing =
          !link.category ||
          link.category === "Custom" ||
          link.category === "Uncategorized" ||
          link.category.trim() === "";

        if (needsCategorizing) {
          setSuggestion({
            link,
            status: "idle",
          });
        } else {
          setSuggestion({
            link,
            status: "already_categorized",
            assignedCategory: link.category,
          });

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

        dispatchRefresh(["links", "dashboard", "collections", "tags"], false);

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
          className="fixed bottom-20 left-4 right-4 sm:right-auto sm:left-6 z-[70] max-w-sm w-auto sm:w-96 rounded-2xl p-4 bg-card/95 text-card-foreground border border-primary/30 shadow-2xl backdrop-blur-xl"
        >
          <div className="relative flex items-start gap-3 z-10">
            {/* Mascot Avatar */}
            <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border-2 border-primary/30 bg-background shadow-sm">
              <img
                src="/maskot.jpeg"
                alt="Liko AI"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Content Area */}
            <div className="flex-1 text-left min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[11px] font-bold text-primary font-sans tracking-wide uppercase px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  {suggestion.status === "already_categorized" ? "Asisten Liko" : "Saran Liko"}
                </span>
              </div>

              {suggestion.status === "idle" && (
                <>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed font-medium break-words mt-1">
                    Tautan <span className="font-bold text-primary">"{suggestion.link.title || suggestion.link.url}"</span> belum memiliki kategori spesifik.
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bantu tentukan kategorinya sekarang?
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleOrganizeNow}
                      className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-md transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
                    >
                      <Zap className="h-3.5 w-3.5" /> Rapikan Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground text-xs font-semibold hover:bg-muted active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
                    >
                      Nanti Saja
                    </button>
                  </div>
                </>
              )}

              {suggestion.status === "already_categorized" && (
                <div className="py-0.5 mt-1">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Tautan Berhasil Disimpan</span>
                  </div>
                  <p className="text-xs text-foreground/90 mt-1 break-words font-medium">
                    <span className="font-semibold text-foreground">"{suggestion.link.title || suggestion.link.url}"</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-normal">
                    Kategori: <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{suggestion.assignedCategory}</span>
                  </p>
                </div>
              )}

              {suggestion.status === "organizing" && (
                <div className="py-1 mt-1">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                    Liko sedang menganalisis kategori...
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Mencocokkan topik konten link dengan kategori terbaik
                  </p>
                </div>
              )}

              {suggestion.status === "success" && (
                <div className="py-1 mt-1">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    Tautan Berhasil Dirapikan!
                  </div>
                  <p className="text-xs text-foreground/80 mt-1">
                    Dikategorikan ke: <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{suggestion.assignedCategory}</span>
                  </p>
                </div>
              )}

              {suggestion.status === "error" && (
                <div className="py-1 text-xs text-muted-foreground mt-1">
                  Belum dapat merapikan saat ini. Coba kembali di Dashboard.
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              aria-label="Tutup Saran"
              className="text-muted-foreground/60 hover:text-foreground p-1 rounded-full hover:bg-muted active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
