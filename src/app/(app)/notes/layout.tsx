import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catatan Saya",
  description: "Ruang kerja catatan cerdas dengan format rich text dan ringkasan AI.",
};

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
