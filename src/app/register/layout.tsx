import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun Baru",
  description: "Buat akun gratis di Linkora dan mulai kelola pengetahuan Anda.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
