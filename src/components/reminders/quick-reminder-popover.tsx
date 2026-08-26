"use client";

import React, { useState } from "react";
import { format, addHours, addDays, nextSaturday, nextMonday, setHours, setMinutes } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Bell, BellOff, Calendar, Clock, Sparkles, Check, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/custom-toast";
import {
  scheduleCapacitorLocalNotification,
  cancelCapacitorLocalNotification,
  requestWebNotificationPermission,
  playNotificationSound,
} from "@/lib/notification-service";

interface QuickReminderPopoverProps {
  targetId: string;
  type: "link" | "note";
  title: string;
  url?: string;
  currentReminderAt?: string | null;
  onReminderChange?: (newReminderAt: string | null) => void;
  className?: string;
  buttonVariant?: "ghost" | "secondary" | "outline";
  buttonSize?: "icon" | "sm" | "default";
}

export function QuickReminderPopover({
  targetId,
  type,
  title,
  url,
  currentReminderAt,
  onReminderChange,
  className,
  buttonVariant = "ghost",
  buttonSize = "icon",
}: QuickReminderPopoverProps) {
  const [open, setOpen] = useState(false);
  const [customDateTime, setCustomDateTime] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const hasActiveReminder =
    currentReminderAt && new Date(currentReminderAt) > new Date();

  // Helper function to calculate preset dates
  const getPresets = () => {
    const now = new Date();

    // 1 Hour Later
    const in1Hour = addHours(now, 1);

    // Tonight at 20:00 (or +2 hours if already past 20:00)
    let tonight = setMinutes(setHours(now, 20), 0);
    if (tonight <= now) {
      tonight = addHours(now, 3);
    }

    // Tomorrow Morning at 09:00
    const tomorrowMorning = setMinutes(setHours(addDays(now, 1), 9), 0);

    // This/Next Saturday at 10:00
    const weekend = setMinutes(setHours(nextSaturday(now), 10), 0);

    // Next Monday at 09:00
    const nextWeek = setMinutes(setHours(nextMonday(now), 9), 0);

    return [
      {
        id: "1h",
        label: "1 Jam Lagi",
        timeLabel: format(in1Hour, "HH:mm", { locale: idLocale }),
        date: in1Hour,
        icon: Clock,
      },
      {
        id: "tonight",
        label: "Malam Ini",
        timeLabel: format(tonight, "HH:mm", { locale: idLocale }),
        date: tonight,
        icon: Sparkles,
      },
      {
        id: "tomorrow",
        label: "Besok Pagi",
        timeLabel: format(tomorrowMorning, "EEE, 09:00", { locale: idLocale }),
        date: tomorrowMorning,
        icon: Calendar,
      },
      {
        id: "weekend",
        label: "Akhir Pekan (Sabtu)",
        timeLabel: format(weekend, "d MMM, 10:00", { locale: idLocale }),
        date: weekend,
        icon: Calendar,
      },
      {
        id: "next_week",
        label: "Minggu Depan (Senin)",
        timeLabel: format(nextWeek, "d MMM, 09:00", { locale: idLocale }),
        date: nextWeek,
        icon: Calendar,
      },
    ];
  };

  const handleApplyReminder = async (targetDate: Date | null) => {
    setIsUpdating(true);
    const isoString = targetDate ? targetDate.toISOString() : null;
    const notificationId = Math.abs(
      targetId.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)
    );

    try {
      const endpoint = type === "link" ? `/api/links/${targetId}` : `/api/notes/${targetId}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderAt: isoString }),
      });

      if (!res.ok) {
        throw new Error("Gagal memperbarui pengingat di server");
      }

      if (targetDate) {
        // Schedule mobile native notification and request web notification permission
        requestWebNotificationPermission().catch(() => {});
        scheduleCapacitorLocalNotification({
          id: notificationId,
          title: `⏰ Pengingat ${type === "link" ? "Tautan" : "Catatan"}: ${title}`,
          body: `Waktunya meninjau: ${title}`,
          scheduleDate: targetDate,
          url,
          targetId,
        }).catch(() => {});

        playNotificationSound();
        const formattedDate = format(targetDate, "EEEE, d MMMM yyyy 'pukul' HH:mm", { locale: idLocale });
        toast.success(`Pengingat disetel untuk ${formattedDate}`, "Pengingat Aktif");
      } else {
        cancelCapacitorLocalNotification(notificationId).catch(() => {});
        toast.info("Pengingat berhasil dinonaktifkan.", "Pengingat Dihapus");
      }

      onReminderChange?.(isoString);
      window.dispatchEvent(new CustomEvent("refreshData"));
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan sistem", "Gagal");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDateTime) return;
    const date = new Date(customDateTime);
    if (isNaN(date.getTime()) || date <= new Date()) {
      toast.error("Waktu pengingat harus berada di masa mendatang.", "Waktu Tidak Valid");
      return;
    }
    handleApplyReminder(date);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className={cn(
            "p-1.5 rounded-xl transition-all duration-200 cursor-pointer relative group/bell flex items-center justify-center",
            hasActiveReminder
              ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 shadow-xs"
              : "text-muted-foreground/60 hover:text-amber-500 hover:bg-amber-500/10",
            className
          )}
          title={
            hasActiveReminder
              ? `Pengingat Aktif: ${format(new Date(currentReminderAt!), "d MMM yyyy, HH:mm", { locale: idLocale })} (Klik untuk ubah)`
              : "Atur Pengingat Cepat"
          }
        >
          <Bell className={cn("w-3.5 h-3.5", hasActiveReminder && "fill-amber-500")} />
          {hasActiveReminder && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-76 p-0 rounded-2xl glass-panel border border-primary/20 bg-card/95 shadow-2xl backdrop-blur-2xl overflow-hidden z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-border/40 bg-foreground/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Atur Pengingat Cepat</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                  {title}
                </p>
              </div>
            </div>
          </div>

          {hasActiveReminder && (
            <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                {format(new Date(currentReminderAt!), "d MMM, HH:mm", { locale: idLocale })}
              </span>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleApplyReminder(null)}
                className="text-[10px] font-bold text-destructive hover:underline cursor-pointer flex items-center gap-1"
                title="Batalkan Pengingat"
              >
                <BellOff className="w-3 h-3" /> Hapus
              </button>
            </div>
          )}
        </div>

        {/* 1-Click Presets */}
        <div className="p-2 space-y-0.5">
          <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Pilihan Cepat
          </p>
          {getPresets().map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={isUpdating}
                onClick={() => handleApplyReminder(preset.date)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-foreground/90 hover:text-foreground hover:bg-foreground/5 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                  <span className="font-medium">{preset.label}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-primary">
                  <span>{preset.timeLabel}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Datetime Input */}
        <div className="p-3 border-t border-border/40 bg-foreground/[0.01]">
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Kustom Tanggal & Waktu
            </label>
            <div className="flex gap-1.5">
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-background/60 border border-border/60 rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!customDateTime || isUpdating}
                className="h-8 px-3 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
