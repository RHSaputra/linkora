/**
 * Linkora Notification & Audio Service
 * World-class notification engine supporting:
 * 1. Web Audio API Crystal Chime (In-App Sound Alert)
 * 2. Web Notification API (OS Background System Push)
 * 3. Capacitor Local Notifications (Android Native Offline Alarms)
 */

import { Capacitor } from "@capacitor/core";

// Audio Context Singleton for Web Audio API
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => { });
    }
    return audioCtx;
  } catch (_e) {
    return null;
  }
}

/**
 * Play a crystal modern chime chord (In-App Sound Alert)
 * Synthesized using Web Audio API for zero latency and zero external network dependency.
 */
export function playNotificationSound(): void {
  if (typeof window === "undefined") return;

  // Check if user has muted sound in settings
  const isSoundEnabled = localStorage.getItem("linkora_sound_enabled") !== "false";
  if (!isSoundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Notes: C6 (1046.5Hz), E6 (1318.5Hz), G6 (1567.98Hz), C7 (2093Hz) - Soft Crystal Marimba Chord
    const notes = [
      { freq: 1046.5, delay: 0.0, duration: 0.8, gain: 0.15 },
      { freq: 1318.5, delay: 0.06, duration: 0.8, gain: 0.12 },
      { freq: 1567.98, delay: 0.12, duration: 1.0, gain: 0.14 },
      { freq: 2093.0, delay: 0.18, duration: 1.2, gain: 0.18 },
    ];

    notes.forEach(({ freq, delay, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      // Smooth attack & exponential decay envelope
      gainNode.gain.setValueAtTime(0.0001, now + delay);
      gainNode.gain.linearRampToValueAtTime(gain, now + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.1);
    });
  } catch (err) {
    console.warn("[Notification Audio] Could not play synthetic chime:", err);
  }
}

/**
 * Request OS Web Notification Permission
 */
export async function requestWebNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (_e) {
      return "denied";
    }
  }

  return Notification.permission;
}

/**
 * Trigger Native OS Web Notification (works when browser is in background / minimized)
 */
export function showWebNotification(options: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    try {
      const notif = new Notification(options.title, {
        body: options.body,
        icon: "/icon.jpg",
        badge: "/icon.jpg",
        tag: options.tag || "linkora-reminder",
        silent: true, // We already play our crystal chime
      });

      notif.onclick = () => {
        window.focus();
        if (options.url) {
          window.open(options.url, "_blank");
        }
        notif.close();
      };
    } catch (err) {
      console.warn("[Web Notification] Could not display OS notification:", err);
    }
  }
}

/**
 * Android / Native Capacitor Local Notifications Engine
 */
export async function scheduleCapacitorLocalNotification(options: {
  id: number;
  title: string;
  body: string;
  scheduleDate: Date;
  url?: string;
  targetId?: string;
}): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");

    // Request permissions on mobile
    const permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return false;
    }

    // Ensure notification channel exists (Android 8.0+)
    if (Capacitor.getPlatform() === "android") {
      await LocalNotifications.createChannel({
        id: "linkora_reminders",
        name: "Pengingat Linkora",
        description: "Notifikasi jadwal pengingat tautan dan catatan Linkora",
        importance: 5, // HIGH importance for heads-up alerts
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: "#6366f1",
      });
    }

    // Schedule exact notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: options.id,
          title: options.title,
          body: options.body,
          schedule: { at: options.scheduleDate, allowWhileIdle: true },
          channelId: "linkora_reminders",
          smallIcon: "ic_stat_name",
          iconColor: "#6366f1",
          extra: {
            url: options.url,
            targetId: options.targetId,
          },
        },
      ],
    });

    return true;
  } catch (err) {
    console.warn("[Capacitor Notification] Could not schedule mobile alarm:", err);
    return false;
  }
}

/**
 * Cancel scheduled local notification on mobile
 */
export async function cancelCapacitorLocalNotification(id: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch (err) {
    console.warn("[Capacitor Notification] Could not cancel notification:", err);
  }
}
