import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Koleksi Saya",
  description: "Organisasi tautan dan catatan Anda ke dalam folder & koleksi berwarna.",
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
