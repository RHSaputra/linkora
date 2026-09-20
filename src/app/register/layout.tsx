import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun Baru",
  description: "Buat akun Linkorian gratis dan bangun sistem manajemen bookmark serta AI knowledge base Anda.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
