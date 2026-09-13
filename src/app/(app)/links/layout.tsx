import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tautan Saya",
  description: "Kelola, cari, dan kategorikan semua bookmark & tautan tersimpan Anda.",
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
