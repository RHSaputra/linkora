import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ringkasan statistik, aktivitas terbaru, dan analisis kecerdasan tautan Anda.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
