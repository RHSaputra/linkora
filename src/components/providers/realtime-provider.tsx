"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { dispatchRefresh } from "@/hooks/use-data";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, Check, Clock, ExternalLink } from "lucide-react";

import { 
  playNotificationSound, 
  showWebNotification, 
  requestWebNotificationPermission 
} from "@/lib/notification-service";

export interface RealtimeNotification {
  id: string;
  type: "link" | "note";
  targetId: string;
  title: string;
  description: string;
  url?: string;
}

interface RealtimeContextType {
  notifications: RealtimeNotification[];
  dismissNotification: (id: string) => Promise<void>;
  snoozeNotification: (id: string, minutes: number) => Promise<void>;
  unreadCount: number;
  requestPermission: () => Promise<NotificationPermission>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [toasts, setToasts] = useState<(RealtimeNotification & { toastId: string })[]>([]);
  const playedNotifIdsRef = React.useRef<Set<string>>(new Set());

  // Request native web notification permissions
  const requestPermission = useCallback(async () => {
    return await requestWebNotificationPermission();
  }, []);

  const dismissNotification = useCallback(async (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif) return;

    try {
      const endpoint =
        notif.type === "link"
          ? `/api/links/${notif.targetId}`
          : `/api/notes/${notif.targetId}`;

      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderAt: null }),
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setToasts((prev) => prev.filter((t) => t.id !== id));

      // Trigger a refresh event so other pages know to update
      dispatchRefresh(["links", "notes"]);
    } catch (error) {
      console.error("Gagal menghapus reminder:", error);
    }
  }, [notifications]);

  const snoozeNotification = useCallback(async (id: string, minutes: number) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif) return;

    try {
      const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const endpoint =
        notif.type === "link"
          ? `/api/links/${notif.targetId}`
          : `/api/notes/${notif.targetId}`;

      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderAt: snoozeTime }),
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setToasts((prev) => prev.filter((t) => t.id !== id));

      dispatchRefresh(["links", "notes"]);
    } catch (error) {
      console.error("Gagal menunda reminder:", error);
    }
  }, [notifications]);

  useEffect(() => {
    if (!session?.user?.id) {
      setNotifications([]);
      return;
    }

    let isMounted = true;
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    // Delay SSE connection to avoid competing with initial page data fetches
    let initialDelay: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      if (!isMounted) return;

      try {
        eventSource = new EventSource("/api/realtime");

        eventSource.addEventListener("reminders", (event) => {
          try {
            const list: RealtimeNotification[] = JSON.parse(event.data);
            if (Array.isArray(list)) {
              setNotifications(list);

              // Mainkan crystal sound chime & trigger OS Notification untuk reminder baru
              const newItems = list.filter((item) => !playedNotifIdsRef.current.has(item.id));
              if (newItems.length > 0) {
                playNotificationSound();

                newItems.forEach((item) => {
                  playedNotifIdsRef.current.add(item.id);
                  showWebNotification({
                    title: `⏰ Pengingat: ${item.title}`,
                    body: item.description,
                    url: item.url,
                    tag: item.id,
                  });
                });
              }

              // Add to current active toasts if they aren't already there
              setToasts((current) => {
                const updated = [...current];
                list.forEach((item) => {
                  if (!current.some((t) => t.id === item.id)) {
                    updated.push({ ...item, toastId: `${item.id}-${Date.now()}` });
                  }
                });
                return updated;
              });
            }
          } catch (err) {
            console.warn("Gagal parse data reminders SSE:", err);
          }
        });

        eventSource.onerror = () => {
          if (!isMounted) return;
          // EventSource automatically retries if readyState === CONNECTING (0).
          // If CLOSED (2), manually re-establish connection after delay.
          if (eventSource?.readyState === EventSource.CLOSED) {
            eventSource.close();
            reconnectTimeout = setTimeout(() => {
              if (isMounted) connectSSE();
            }, 5000);
          }
        };
      } catch (err) {
        console.warn("Realtime SSE connection failed, will retry later:", err);
      }
    };

    // Wait 3 seconds before connecting SSE so initial API fetches complete first
    initialDelay = setTimeout(() => {
      if (isMounted) connectSSE();
    }, 3000);

    return () => {
      isMounted = false;
      if (initialDelay) clearTimeout(initialDelay);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [session?.user?.id]);

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  };

  return (
    <RealtimeContext.Provider
      value={{
        notifications,
        dismissNotification,
        snoozeNotification,
        unreadCount: notifications.length,
        requestPermission,
      }}
    >
      {children}

      {/* Linkorian Signature Realtime Reminder Overlay */}
      <div className="fixed bottom-6 left-6 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.toastId}
              initial={{ opacity: 0, x: -50, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -25, scale: 0.92, filter: "blur(4px)", transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="pointer-events-auto w-full relative overflow-hidden bg-card/90 dark:bg-card/95 backdrop-blur-2xl border border-primary/35 shadow-[0_16px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-white/10 dark:ring-white/15 rounded-2xl p-4 flex gap-3.5"
            >
              {/* Top Beam Light Accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-primary to-cyan-400 opacity-90" />

              {/* Ambient Glow Orb */}
              <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

              {/* Bell Icon Badge */}
              <div className="p-2.5 bg-primary/10 dark:bg-primary/15 border border-primary/30 rounded-xl text-primary h-10 w-10 flex items-center justify-center shrink-0 shadow-lg shadow-primary/10 z-10">
                <Bell className="h-5 w-5 animate-bounce drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
              </div>

              {/* Content & Actions */}
              <div className="flex-1 min-w-0 z-10">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-foreground font-heading tracking-tight truncate">{toast.title}</p>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 shrink-0">
                    Pengingat
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">
                  {toast.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {toast.type === "link" && toast.url && (
                    <a
                      href={toast.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground text-[11px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      Buka Tautan <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button
                    onClick={() => dismissNotification(toast.id)}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 active:scale-95 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Check className="h-3 w-3" /> Selesai
                  </button>
                  <button
                    onClick={() => snoozeNotification(toast.id, 15)}
                    className="px-2.5 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                    title="Tunda 15 Menit"
                  >
                    <Clock className="h-3 w-3" /> Tunda 15m
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.toastId)}
                aria-label="Tutup Pengingat"
                className="absolute top-3.5 right-3.5 p-1 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-primary/15 hover:border hover:border-primary/20 active:scale-90 transition-all duration-150 cursor-pointer z-20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </RealtimeContext.Provider>
  );
}
