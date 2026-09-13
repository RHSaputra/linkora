import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan layanan Linkora.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
