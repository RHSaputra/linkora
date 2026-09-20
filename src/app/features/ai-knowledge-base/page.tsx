import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Database, BrainCircuit, BookOpen, ArrowRight, Layers, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Knowledge Base & Personal Knowledge Management — Linkorian",
  description:
    "Bangun Personal Knowledge Base berbasis AI dengan Linkorian. Hubungkan tautan web, catatan dokumen, dan pengetahuan pribadi Anda dalam satu sistem terpadu.",
  alternates: {
    canonical: "https://linkorian.online/features/ai-knowledge-base",
  },
  openGraph: {
    title: "AI Knowledge Base & Personal Knowledge Management — Linkorian",
    description:
      "Ubah ribuan tautan dan referensi acak menjadi repositori pengetahuan pribadi yang terstruktur dan siap pakai.",
    url: "https://linkorian.online/features/ai-knowledge-base",
    siteName: "Linkorian",
    images: [{ url: "/icon.jpg", width: 1200, height: 630, alt: "Linkorian AI Knowledge Base" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Knowledge Base & Personal Knowledge Management — Linkorian",
    description:
      "Ubah ribuan tautan dan referensi acak menjadi repositori pengetahuan pribadi yang terstruktur dan siap pakai.",
    images: ["/icon.jpg"],
  },
};

export default function AiKnowledgeBaseFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Knowledge Base & Personal Knowledge Management — Linkorian",
    "description":
      "Solusi Personal Knowledge Management (PKM) berbasis AI untuk menghubungkan tautan web dan catatan dokumen.",
    "url": "https://linkorian.online/features/ai-knowledge-base",
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
            <Database className="w-4 h-4" />
            <span>Second Brain & Knowledge System</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-6 leading-tight">
            Bangun Second Brain & AI Knowledge Base Pribadi Anda di <span className="text-primary">Linkorian</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Menyimpan tautan saja tidak cukup jika Anda tidak dapat menghubungkannya dengan wawasan pribadi Anda. Linkorian menyatukan pengelola tautan dan editor dokumen cerdas ke dalam satu ruang kerja *Second Brain*.
          </p>
        </div>

        {/* Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Editor Dokumen Terintegrasi</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tulis riset, draf tesis, atau catatan rapat langsung berdampingan dengan koleksi tautan referensi Anda.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Struktur Koleksi Bertingkat</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kelompokkan proyek, bidang studi, atau minat riset ke dalam struktur folder dan tag hirarkis yang rapi.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Privasi Data 100% Milik Anda</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seluruh catatan dan metadata pengetahuan yang Anda buat bersifat pribadi dan dilindungi standar keamanan tinggi.
            </p>
          </div>
        </div>

        {/* Knowledge Deep Dive */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border/60 mb-20 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading">
            Dari Tautan Acak Menjadi Aset Pengetahuan
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Konsep Personal Knowledge Management (PKM) di Linkorian dirancang agar informasi tidak berhenti menjadi sekadar tumpukan URL. Dengan menggabungkan pencarian AI kontekstual dan ruang catatan terpadu, Anda dapat menghubungkan ide antar-artikel secara natural.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 border border-primary/30">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Mulai Bangun Knowledge Base Anda</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8">
            Satukan semua referensi web dan catatan pemikiran Anda dalam satu tempat yang terorganisir.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
          >
            <span>Buat Account Linkorian</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
