import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Linkorian Anda untuk mengakses bookmark manager dan ruang kerja AI.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
