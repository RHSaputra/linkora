import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Bookmark, Folder, ArrowRight, ShieldCheck, Zap, Search } from "lucide-react";
import { LinkorianText } from "@/components/ui/linkora-text";

export const metadata: Metadata = {
  title: "AI Bookmark Manager — Organize & Manage Bookmarks Cerdas",
  description:
    "Gantikan bookmark browser biasa dengan Linkorian AI Bookmark Manager. Simpan, kelompokkan dalam folder, beri tag, dan temukan kembali tautan Anda secara instan.",
  alternates: {
    canonical: "https://linkorian.online/features/bookmark-manager",
  },
  openGraph: {
    title: "AI Bookmark Manager — Linkorian",
    description:
      "Kelola ribuan markah buku dan tautan web secara rapi dengan AI Bookmark Manager dari Linkorian.",
    url: "https://linkorian.online/features/bookmark-manager",
    siteName: "Linkorian",
    images: [{ url: "/icon.jpg", width: 1200, height: 630, alt: "Linkorian AI Bookmark Manager" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Bookmark Manager — Linkorian",
    description:
      "Kelola ribuan markah buku dan tautan web secara rapi dengan AI Bookmark Manager dari Linkorian.",
    images: ["/icon.jpg"],
  },
};

export default function BookmarkManagerFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Bookmark Manager — Linkorian",
    "description":
      "Platform AI Bookmark Manager untuk mengorganisasi dan mengelola tautan web secara terstruktur.",
    "url": "https://linkorian.online/features/bookmark-manager",
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
            <Bookmark className="w-4 h-4" />
            <span>Modern Bookmark Manager</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-6 leading-tight">
            Kelola & Organisasi Bookmark Web Anda Tanpa Batas Bersama <LinkorianText />
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Bookmark browser biasa sering membuat tautan menumpuk dan sulit ditemukan. <LinkorianText /> menghadirkan sistem manajemen markah buku modern berbasis AI yang terstruktur, rapi, dan cepat.
          </p>
        </div>

        {/* Core Value Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Folder className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Folder & Tag Kategori Cerdas</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kelompokkan tautan riset, pekerjaan, atau materi belajar dalam folder warna-warni dan tag yang dinamis.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Pencarian Kontekstual AI</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cari tautan lama hanya berdasarkan kata kunci samar atau ingatan konteks. AI <LinkorianText /> memahami apa yang Anda maksud.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Penyimpanan Aman & Tersinkron</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seluruh bookmark tersimpan aman di cloud dan dapat diakses dari perangkat mana pun kapan saja.
            </p>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border/60 mb-20 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading">
            Mengapa Memilih <LinkorianText /> AI Bookmark Manager?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Seiring bertambahnya aktivitas online, kita menyimpan puluhan hingga ratusan tautan setiap minggu. Tanpa sistem pengorganisasian yang tepat, bookmark tersebut dengan cepat menjadi sampah digital yang tidak terpakai.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            <LinkorianText /> memecahkan masalah ini dengan menggabungkan penyimpanan 1-klik, ekstraksi metadata otomatis (judul, deskripsi, favicon, gambar pratinjau), serta asisten AI yang secara otomatis menyaring poin penting dari setiap tautan.
          </p>
        </div>

        {/* CTA Banner */}
        <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 border border-primary/30">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Siap Merapikan Bookmark Anda?</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8">
            Mulai simpan dan kelola seluruh tautan penting Anda secara gratis bersama <LinkorianText />.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
          >
            <span>Coba <LinkorianText /> Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
