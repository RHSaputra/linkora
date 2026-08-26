/**
 * Onboarding State — Platform-Agnostic Core
 *
 * This file contains ZERO DOM/React dependencies.
 * It can be shared with Android (via transpilation or manual port).
 */

export const CURRENT_ONBOARDING_VERSION = 1;

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface OnboardingStep {
  id: string;
  targetId: string; // maps to data-tour="xxx"
  title: string;
  description: string;
  placement: TooltipPlacement;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "dashboard",
    targetId: "dashboard",
    title: "Beranda Kamu",
    description:
      "Ini beranda utama. Lihat ringkasan aktivitas dan akses cepat ke semua fitur.",
    placement: "right",
  },
  {
    id: "links",
    targetId: "links",
    title: "Kelola Tautan",
    description:
      "Simpan, cari, dan kelola semua tautan kamu di sini. Cukup tempel URL dan biarkan AI menganalisisnya.",
    placement: "right",
  },
  {
    id: "collections",
    targetId: "collections",
    title: "Koleksi",
    description:
      "Kelompokkan tautan ke dalam koleksi agar lebih rapi dan mudah ditemukan.",
    placement: "right",
  },
  {
    id: "notes",
    targetId: "notes",
    title: "Catatan Pribadi",
    description:
      "Buat dan kelola catatan kamu. Tulis ide, memo, atau dokumen penting.",
    placement: "right",
  },
  {
    id: "add-link",
    targetId: "add-link",
    title: "Tambah Tautan Baru",
    description:
      "Klik tombol ini untuk menyimpan tautan baru. AI akan otomatis menganalisis dan mengkategorikan tautan kamu.",
    placement: "right",
  },
  {
    id: "profile",
    targetId: "profile",
    title: "Profil Kamu",
    description:
      "Kelola akun, ubah foto profil, dan sesuaikan pengaturan kamu dari sini.",
    placement: "right",
  },
];

export interface OnboardingStatus {
  completed: boolean;
  version: number;
  step: number;
  dismissedAt: string | null;
  currentVersion: number;
}

/**
 * Should the onboarding tour be shown?
 * Only if: not completed OR completed but for an older version.
 */
export function shouldShowOnboarding(status: OnboardingStatus): boolean {
  if (!status.completed) return true;
  if (status.version < status.currentVersion) return true;
  return false;
}

/**
 * Get the next valid step index, skipping steps whose targets don't exist.
 * Returns -1 if there are no more steps.
 */
export function getNextStep(
  current: number,
  availableTargets: Set<string>
): number {
  for (let i = current + 1; i < ONBOARDING_STEPS.length; i++) {
    if (availableTargets.has(ONBOARDING_STEPS[i].targetId)) {
      return i;
    }
  }
  return -1; // no more steps
}

/**
 * Get the previous valid step index, skipping steps whose targets don't exist.
 * Returns -1 if at the beginning.
 */
export function getPrevStep(
  current: number,
  availableTargets: Set<string>
): number {
  for (let i = current - 1; i >= 0; i--) {
    if (availableTargets.has(ONBOARDING_STEPS[i].targetId)) {
      return i;
    }
  }
  return -1;
}

/**
 * Get the first valid step index.
 */
export function getFirstValidStep(availableTargets: Set<string>): number {
  for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
    if (availableTargets.has(ONBOARDING_STEPS[i].targetId)) {
      return i;
    }
  }
  return -1;
}

/**
 * Count how many steps are available (have targets in the DOM).
 */
export function countAvailableSteps(availableTargets: Set<string>): number {
  return ONBOARDING_STEPS.filter((s) =>
    availableTargets.has(s.targetId)
  ).length;
}

/**
 * Get the position of current step among available steps (1-indexed).
 */
export function getStepPosition(
  current: number,
  availableTargets: Set<string>
): number {
  let pos = 0;
  for (let i = 0; i <= current && i < ONBOARDING_STEPS.length; i++) {
    if (availableTargets.has(ONBOARDING_STEPS[i].targetId)) {
      pos++;
    }
  }
  return pos;
}
