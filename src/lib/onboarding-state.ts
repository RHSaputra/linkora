/**
 * Onboarding State — Platform-Agnostic Core
 *
 * This file contains ZERO DOM/React dependencies.
 * It can be shared with Android (via transpilation or manual port).
 */

export const CURRENT_ONBOARDING_VERSION = 2;

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
    title: "Beranda Utama",
    description:
      "Pusat aktivitas utama kamu. Dapatkan ringkasan statistik tautan, catatan, dan akses cepat ke seluruh fitur Linkora.",
    placement: "right",
  },
  {
    id: "add-link",
    targetId: "add-link",
    title: "Tambah & Analisis Tautan AI",
    description:
      "Klik tombol ini untuk menyimpan tautan baru. Cukup tempel URL, dan Liko AI akan otomatis menganalisis judul, deskripsi, kategori, serta tag relevan.",
    placement: "right",
  },
  {
    id: "links",
    targetId: "links",
    title: "Kelola Tautan & Filter Cerdas",
    description:
      "Lihat, cari, dan kelola semua tautan yang tersimpan. Kamu dapat memfilter berdasarkan kategori, tag, status favorit, atau tanggal pengingat.",
    placement: "right",
  },
  {
    id: "collections",
    targetId: "collections",
    title: "Koleksi Tautan Terstruktur",
    description:
      "Kelompokkan tautan favoritmu ke dalam folder koleksi khusus agar lebih terorganisir dan mudah dipelajari kembali kapan saja.",
    placement: "right",
  },
  {
    id: "notes",
    targetId: "notes",
    title: "Catatan Pribadi & Konverter AI",
    description:
      "Tulis ide, memo, atau ubah hasil analisis tautan menjadi dokumen catatan pribadi berformat lengkap secara otomatis menggunakan Liko AI.",
    placement: "right",
  },
  {
    id: "roadmaps",
    targetId: "roadmaps",
    title: "Roadmap & Alur Kerja Visual",
    description:
      "Rancang alur kerja, roadmap belajar, dan strategi proyek secara visual pada kanvas interaktif dengan bantuan generator Liko AI.",
    placement: "right",
  },
  {
    id: "reminders",
    targetId: "reminders",
    title: "Pusat Pengingat & Notifikasi",
    description:
      "Pantau jadwal pengingat tautan dan catatan penting. Dapatkan notifikasi pengingat tepat waktu agar tidak ada tugas yang terlewat.",
    placement: "right",
  },
  {
    id: "liko-chat",
    targetId: "liko-chat",
    title: "Asisten AI Liko",
    description:
      "Tanya apa saja seputar tautan dan catatanmu! Liko siap menyimpan link langsung dari percakapan chat, menjawab pertanyaan, dan membantumu 24/7.",
    placement: "top",
  },
  {
    id: "profile",
    targetId: "profile",
    title: "Profil & Pengaturan Akun",
    description:
      "Kelola informasi akun, foto avatar profil, ubah kata sandi, beralih bahasa (ID/EN), atau jalankan kembali panduan interaktif ini kapan saja.",
    placement: "top",
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
