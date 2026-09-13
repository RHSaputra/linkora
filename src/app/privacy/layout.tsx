import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi dan standar perlindungan data pengguna Linkora.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
