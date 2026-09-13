import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk Akun",
  description: "Masuk ke akun Linkora Anda untuk mengakses ruang kerja AI.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
