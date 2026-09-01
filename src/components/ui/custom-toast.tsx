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
  const isEn = typeof document !== "undefined" && (document.documentElement.lang === "en" || (typeof window !== "undefined" && localStorage.getItem("linkora_user_locale") === "en"));

  const iconConfig = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-success shrink-0" />,
      bgIcon: "bg-success-muted border-success/30",
      accentBorder: "border-success/30",
      glow: "shadow-success/15",
      barColor: "bg-success",
      defaultTitle: isEn ? "Success" : "Berhasil",
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-destructive shrink-0" />,
      bgIcon: "bg-destructive-muted border-destructive/30",
      accentBorder: "border-destructive/30",
      glow: "shadow-destructive/15",
      barColor: "bg-destructive",
      defaultTitle: isEn ? "Error" : "Terjadi Kesalahan",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
      bgIcon: "bg-warning-muted border-warning/30",
      accentBorder: "border-warning/30",
      glow: "shadow-warning/15",
      barColor: "bg-warning",
      defaultTitle: isEn ? "Warning" : "Peringatan",
    },
    info: {
      icon: <Info className="w-5 h-5 text-info shrink-0" />,
      bgIcon: "bg-info-muted border-info/30",
      accentBorder: "border-info/30",
      glow: "shadow-info/15",
      barColor: "bg-info",
      defaultTitle: isEn ? "Information" : "Informasi",
    },
    loading: {
      icon: <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />,
      bgIcon: "bg-primary-muted border-primary/30",
      accentBorder: "border-primary/30",
      glow: "shadow-primary/15",
      barColor: "bg-primary",
      defaultTitle: isEn ? "Processing..." : "Memproses...",
    },
  }[item.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      className={cn(
        "pointer-events-auto w-full relative overflow-hidden rounded-2xl p-3.5 flex gap-3 items-start",
        "bg-background/95 dark:bg-card/95 backdrop-blur-2xl border shadow-2xl ring-1 ring-black/5 dark:ring-white/10",
        iconConfig.accentBorder,
        iconConfig.glow
      )}
    >
      <div
        className={cn(
          "p-2 rounded-xl border flex items-center justify-center shrink-0",
          iconConfig.bgIcon
        )}
      >
        {iconConfig.icon}
      </div>

      <div className="flex-1 min-w-0 pr-6 pt-0.5">
        <h4 className="text-xs font-bold text-foreground tracking-tight">
          {item.title || iconConfig.defaultTitle}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed break-words font-medium">
          {item.message}
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup Notifikasi"
        className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 active:scale-90 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer touch-manipulation"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Subtle bottom progress animation bar */}
      {item.type !== "loading" && duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className={cn("absolute bottom-0 left-0 h-[2px] opacity-60", iconConfig.barColor)}
        />
      )}
    </motion.div>
  );
}
