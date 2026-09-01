import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags);
}

export function getFaviconUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return "";
  }
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "Belum pernah";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Baru saja";

  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return "Baru saja";

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari yang lalu`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} minggu yang lalu`;
  }

  const isThisYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    ...(isThisYear ? {} : { year: "numeric" }),
  });
}

export const DEFAULT_CATEGORIES = [
  "Magang",
  "Beasiswa",
  "Video",
  "AI Tools",
  "Kampus",
  "Tutorial",
  "Lowongan Kerja",
  "Project",
  "Custom",
] as const;

export type Category = (typeof DEFAULT_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Magang: "#f59e0b",
  Beasiswa: "#10b981",
  Video: "#ef4444",
  "AI Tools": "#8b5cf6",
  Kampus: "#3b82f6",
  Tutorial: "#06b6d4",
  "Lowongan Kerja": "#f97316",
  Project: "#ec4899",
  Custom: "#6b7280",
};
