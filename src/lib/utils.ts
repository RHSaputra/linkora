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

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "Never";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
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

export const COLLECTION_PRESETS = [
  { name: "Magang 2026", color: "#f59e0b", icon: "briefcase" },
  { name: "Beasiswa Luar Negeri", color: "#10b981", icon: "graduation-cap" },
  { name: "Belajar Next.js", color: "#3b82f6", icon: "code" },
  { name: "AI Tools", color: "#8b5cf6", icon: "folder" },
];
