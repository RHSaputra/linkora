import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Sparkles, Cpu, FileText, ArrowRight, BrainCircuit, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Link Analysis & URL Analyzer Tool — Linkorian",
  description:
    "Analisis isi halaman web dan artikel secara instan menggunakan AI Link Analysis dari Linkorian. Ekstrak poin utama, rangkuman, dan wawasan dalam hitungan detik.",
  alternates: {
    canonical: "https://linkorian.online/features/ai-link-analysis",
  },
  openGraph: {
    title: "AI Link Analysis & URL Analyzer Tool — Linkorian",
    description:
      "Ekstrak poin penting dan wawasan dari tautan apa pun secara instan dengan mesin analisis AI Linkorian.",
    url: "https://linkorian.online/features/ai-link-analysis",
    siteName: "Linkorian",
    images: [{ url: "/icon.jpg", width: 1200, height: 630, alt: "Linkorian AI Link Analysis" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Link Analysis & URL Analyzer Tool — Linkorian",
    description:
      "Ekstrak poin penting dan wawasan dari tautan apa pun secara instan dengan mesin analisis AI Linkorian.",
    images: ["/icon.jpg"],
  },
};

export default function AiLinkAnalysisFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Link Analysis & URL Analyzer — Linkorian",
    "description":
      "Alat analisis URL berbasis AI untuk mengabstraksi dan merangkum isi artikel web secara otomatis.",
    "url": "https://linkorian.online/features/ai-link-analysis",
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
            <Sparkles className="w-4 h-4" />
            <span>AI URL Analyzer & Link Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-6 leading-tight">
            Analisis Konten Web & Artikel Secara Instan dengan AI <span className="text-primary">Linkorian</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Tidak sempat membaca artikel panjang 15 halaman? Fitur AI Link Analysis Linkorian secara otomatis mengekstrak wawasan utama, poin ringkasan, dan taksonomi kategori tanpa Anda harus membaca seluruh halaman dari awal.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Ringkasan Otomatis Instant</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dapatkan ringkasan poin-poin krusial dari artikel riset, berita, atau dokumentasi teknis hanya dalam waktu 3 detik.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Ekstraksi Entitas & Topik</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI secara pintar mengenali topik utama, nama organisasi, teknologi, dan kata kunci penting yang terkandung di dalam tautan.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Pencarian Kontekstual Vektor</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cari jawaban dari kumpulan tautan yang pernah Anda simpan dengan mengajukan pertanyaan langsung ke asisten AI.
            </p>
          </div>
        </div>

        {/* Deep Dive Section */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border/60 mb-20 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading">
            Bagaimana Cara Kerja AI Link Analysis di Linkorian?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Saat Anda memasukkan URL ke dalam Linkorian, mesin pengumpul data kami akan mengunduh dan membersihkan elemen halaman yang tidak penting. Selanjutnya, model kecerdasan buatan (AI) memproses teks utama untuk menghasilkan analisis komprehensif.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Hasil analisis ini disimpan bersama tautan Anda, sehingga kapan pun Anda membutuhkan kembali informasi tersebut, Anda dapat membacanya secara langsung tanpa harus membuka ulang situs aslinya.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 border border-primary/30">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Mulai Analisis Tautan Web Anda Sekarang</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8">
            Hemat hingga 80% waktu membaca riset dengan bantuan kecerdasan buatan Linkorian.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
          >
            <span>Daftar Linkorian Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
