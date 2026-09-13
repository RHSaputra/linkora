"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, default 4000
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalAddToast: ((toast: Omit<ToastItem, "id">) => string) | null = null;
let globalRemoveToast: ((id: string) => void) | null = null;

export const toast = {
  success: (message: string, title?: string, duration?: number) => {
    return globalAddToast?.({ type: "success", message, title, duration }) || "";
  },
  error: (message: string, title?: string, duration?: number) => {
    return globalAddToast?.({ type: "error", message, title, duration: duration ?? 5000 }) || "";
  },
  warning: (message: string, title?: string, duration?: number) => {
    return globalAddToast?.({ type: "warning", message, title, duration }) || "";
  },
  info: (message: string, title?: string, duration?: number) => {
    return globalAddToast?.({ type: "info", message, title, duration }) || "";
  },
  loading: (message: string, title?: string, duration?: number) => {
    return globalAddToast?.({ type: "loading", message, title, duration: duration ?? 10000 }) || "";
  },
  dismiss: (id: string) => {
    globalRemoveToast?.(id);
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toastData: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { ...toastData, id };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 visible

      const duration = toastData.duration ?? 4000;
      if (duration > 0 && toastData.type !== "loading") {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  useEffect(() => {
    globalAddToast = addToast;
    globalRemoveToast = removeToast;
    return () => {
      globalAddToast = null;
      globalRemoveToast = null;
    };
  }, [addToast, removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container (Center of Screen) */}
      <div
        aria-live="polite"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2.5 max-w-md w-[calc(100vw-2rem)] pointer-events-none select-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const duration = item.duration ?? 4000;
  const isEn =
    typeof document !== "undefined" &&
    (document.documentElement.lang === "en" ||
      (typeof window !== "undefined" &&
        localStorage.getItem("linkora_user_locale") === "en"));

  const iconConfig = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />,
      badgeStyle: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-500 dark:text-emerald-400 shadow-emerald-500/10",
      accentBorder: "border-emerald-500/35 dark:border-emerald-500/30",
      glowBg: "bg-emerald-500",
      topBeamGradient: "from-emerald-500/80 via-primary/60 to-emerald-400/20",
      barGradient: "bg-gradient-to-r from-emerald-500 via-primary to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
      defaultTitle: isEn ? "Success" : "Berhasil Disimpan",
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]" />,
      badgeStyle: "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400 shadow-rose-500/10",
      accentBorder: "border-rose-500/35 dark:border-rose-500/30",
      glowBg: "bg-rose-500",
      topBeamGradient: "from-rose-500/80 via-primary/60 to-rose-400/20",
      barGradient: "bg-gradient-to-r from-rose-500 via-primary to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
      defaultTitle: isEn ? "Error" : "Terjadi Kesalahan",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" />,
      badgeStyle: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-amber-500 dark:text-amber-400 shadow-amber-500/10",
      accentBorder: "border-amber-500/35 dark:border-amber-500/30",
      glowBg: "bg-amber-500",
      topBeamGradient: "from-amber-500/80 via-primary/60 to-amber-400/20",
      barGradient: "bg-gradient-to-r from-amber-500 via-primary to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
      defaultTitle: isEn ? "Warning" : "Peringatan",
    },
    info: {
      icon: <Info className="w-5 h-5 text-cyan-500 dark:text-cyan-400 shrink-0 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]" />,
      badgeStyle: "bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/30 text-cyan-500 dark:text-cyan-400 shadow-cyan-500/10",
      accentBorder: "border-cyan-500/35 dark:border-cyan-500/30",
      glowBg: "bg-cyan-500",
      topBeamGradient: "from-cyan-500/80 via-primary/60 to-cyan-400/20",
      barGradient: "bg-gradient-to-r from-cyan-500 via-primary to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]",
      defaultTitle: isEn ? "Information" : "Informasi",
    },
    loading: {
      icon: <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />,
      badgeStyle: "bg-primary/10 dark:bg-primary/15 border-primary/30 text-primary shadow-primary/10",
      accentBorder: "border-primary/45 dark:border-primary/35",
      glowBg: "bg-primary",
      topBeamGradient: "from-primary via-cyan-400 to-primary",
      barGradient: "bg-gradient-to-r from-primary via-cyan-400 to-primary animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.5)]",
      defaultTitle: isEn ? "Processing..." : "Memproses...",
    },
  }[item.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -28, scale: 0.92, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -16, scale: 0.94, filter: "blur(4px)", transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "pointer-events-auto w-full relative overflow-hidden rounded-2xl p-4 flex gap-3.5 items-start",
        "bg-card/90 dark:bg-card/95 backdrop-blur-2xl border shadow-[0_16px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-white/10 dark:ring-white/15 transition-all duration-200",
        iconConfig.accentBorder
      )}
    >
      {/* Top Beam Light Accent */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-90",
          iconConfig.topBeamGradient
        )}
      />

      {/* Ambient background blur orb */}
      <div
        className={cn(
          "absolute -top-10 -left-10 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none",
          iconConfig.glowBg
        )}
      />

      {/* Status Icon Badge */}
      <div
        className={cn(
          "relative p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md",
          iconConfig.badgeStyle
        )}
      >
        {iconConfig.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6 pt-0.5 z-10">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-foreground font-heading tracking-tight">
            {item.title || iconConfig.defaultTitle}
          </h4>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            Linkora
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed break-words font-medium">
          {item.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup Notifikasi"
        className="absolute top-3.5 right-3.5 p-1 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-primary/15 hover:border hover:border-primary/20 active:scale-90 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer touch-manipulation z-20"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Subtle bottom progress animation bar */}
      {item.type !== "loading" && duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className={cn("absolute bottom-0 left-0 h-[2.5px] rounded-full", iconConfig.barGradient)}
        />
      )}
    </motion.div>
  );
}
