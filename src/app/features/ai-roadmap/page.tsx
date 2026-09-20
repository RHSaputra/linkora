import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { GitFork, ArrowRight, ShieldCheck, Zap, Layers } from "lucide-react";
import { LinkorianText } from "@/components/ui/linkora-text";

export const metadata: Metadata = {
  title: "AI Visual Roadmap — Rancang Alur Kerja & Target Belajar | Linkorian",
  description:
    "Buat dan organisasikan alur kerja visual, roadmap belajar, dan alur proyek secara interaktif bersama Linkorian AI Visual Roadmap Builder.",
  alternates: {
    canonical: "https://linkorian.online/features/ai-roadmap",
  },
  openGraph: {
    title: "AI Visual Roadmap — Linkorian",
    description:
      "Rancang alur kerja, roadmap belajar, dan target proyek secara visual dengan kanvas interaktif dari Linkorian.",
    url: "https://linkorian.online/features/ai-roadmap",
    siteName: "Linkorian",
    images: [{ url: "/icon.jpg", width: 1200, height: 630, alt: "Linkorian AI Visual Roadmap" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Visual Roadmap — Linkorian",
    description:
      "Rancang alur kerja, roadmap belajar, dan target proyek secara visual dengan kanvas interaktif dari Linkorian.",
    images: ["/icon.jpg"],
  },
};

export default function AiRoadmapFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Visual Roadmap — Linkorian",
    "description":
      "Platform AI Visual Roadmap untuk merancang alur kerja dan peta belajar interaktif.",
    "url": "https://linkorian.online/features/ai-roadmap",
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
            <GitFork className="w-4 h-4" />
            <span>Interactive Visual Roadmap</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-6 leading-tight">
            Rancang Alur Kerja & Target Belajar Visual Bersama <LinkorianText />
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Pahami alur proyek dan langkah pembelajaran tanpa kehilangan arah. Fitur AI Roadmap di <LinkorianText /> membantu Anda menyusun node langkah interaktif, menghubungkan tautan referensi, dan melacak kemajuan alur secara visual.
          </p>
        </div>

        {/* Core Value Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <GitFork className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Kanvas Visual Interaktif</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Buat node alur kerja, hubungkan langkah-langkah proyek, dan susun alur secara visual dengan mudah.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Integrasi Tautan & Catatan</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sematkan tautan riset dan dokumen catatan langsung ke dalam setiap langkah roadmap Anda.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Pelacakan Progress Real-Time</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pantau status penyelesaian setiap node alur kerja dari belum dimulai, dalam proses, hingga selesai.
            </p>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border/60 mb-20 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading">
            Mengapa Menggunakan <LinkorianText /> AI Visual Roadmap?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Menyimpan puluhan tautan atau tugas tanpa struktur alur yang jelas sering membuat kita merasa bingung menentukan langkah berikutnya. Dengan <LinkorianText /> AI Visual Roadmap, Anda dapat memvisualisasikan perjalanan riset atau pengerjaan proyek dari awal hingga akhir.
          </p>
          <ul className="space-y-3 text-muted-foreground pt-2">
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span><strong className="text-foreground">Alur Kerja Terstruktur:</strong> Hubungkan node-node langkah sesuai urutan prioritas pengerjaan.</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span><strong className="text-foreground">Dua Mode Tampilan:</strong> Beralih kapan saja antara mode Kanvas Visual dan mode Daftar Langkah.</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span><strong className="text-foreground">Generasi AI Otomatis:</strong> Minta bantuan AI untuk membuatkan alur belajar atau rencana proyek secara otomatis.</span>
            </li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 border border-primary/30 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 text-foreground">
            Mulai Susun Roadmap Visual Anda Sekarang
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Bergabunglah bersama <LinkorianText /> dan nikmati cara yang jauh lebih jelas dan produktif dalam mengelola alur kerja Anda.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90 transition-all cursor-pointer text-sm sm:text-base"
          >
            <span>Coba Roadmap Gratis</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
