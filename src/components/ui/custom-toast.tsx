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
import { Button } from "@/components/ui/button";

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
      icon: (
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/10">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
        </div>
      ),
      accentBar: "bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-500",
      defaultTitle: isEn ? "Success" : "Berhasil",
    },
    error: {
      icon: (
        <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-xs shadow-rose-500/10">
          <AlertCircle className="w-4 h-4 stroke-[2.5]" />
        </div>
      ),
      accentBar: "bg-gradient-to-b from-rose-400 via-rose-500 to-pink-500",
      defaultTitle: isEn ? "Error" : "Terjadi Kesalahan",
    },
    warning: {
      icon: (
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs shadow-amber-500/10">
          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
        </div>
      ),
      accentBar: "bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500",
      defaultTitle: isEn ? "Warning" : "Peringatan",
    },
    info: {
      icon: (
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-xs shadow-indigo-500/10">
          <Info className="w-4 h-4 stroke-[2.5]" />
        </div>
      ),
      accentBar: "bg-gradient-to-b from-indigo-400 via-indigo-500 to-violet-500",
      defaultTitle: isEn ? "Information" : "Informasi",
    },
    loading: {
      icon: (
        <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 shadow-xs shadow-primary/10">
          <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
        </div>
      ),
      accentBar: "bg-gradient-to-b from-primary via-accent to-primary",
      defaultTitle: isEn ? "Processing..." : "Memproses...",
    },
  }[item.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 420, damping: 26, mass: 0.8 }}
      className={cn(
        "pointer-events-auto w-full relative overflow-hidden rounded-2xl p-3.5 sm:p-4 flex gap-3.5 items-center pl-4.5",
        "bg-popover/95 dark:bg-slate-900/95 backdrop-blur-2xl text-popover-foreground border border-border/80 dark:border-white/10 shadow-2xl shadow-black/25 transition-all duration-200"
      )}
    >
      {/* Left Neon Glowing Accent Line */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.2 rounded-l-full", iconConfig.accentBar)} />

      {/* Animated Icon Badge */}
      {iconConfig.icon}

      {/* Message Content */}
      <div className="flex-1 min-w-0 pr-6">
        <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug tracking-tight font-heading">
          {item.title || iconConfig.defaultTitle}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed break-words font-medium">
          {item.message}
        </p>
      </div>

      {/* Close Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onDismiss}
        aria-label="Tutup Notifikasi"
        className="absolute top-3 right-3 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 z-20 rounded-full w-6 h-6"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </motion.div>
  );
}
