import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { BookOpen, ArrowRight, CheckCircle2, Folder, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Organize Bookmarks Efficiently — Step-by-Step Guide | Linkorian",
  description:
    "Pelajari strategi dan tips terbaik untuk merapikan bookmark web berantakan. Gunakan folder warna, tag kategori, dan fitur AI dari Linkorian.",
  alternates: {
    canonical: "https://linkorian.online/guides/how-to-organize-bookmarks-efficiently",
  },
  openGraph: {
    title: "How to Organize Bookmarks Efficiently — Step-by-Step Guide | Linkorian",
    description:
      "Panduan praktis merapikan tumpukan tautan web dan membangun workflow bookmark yang produktif.",
    url: "https://linkorian.online/guides/how-to-organize-bookmarks-efficiently",
    siteName: "Linkorian",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "How to Organize Bookmarks" }],
  },
};

export default function GuideHowToOrganizeBookmarksPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Organize Bookmarks Efficiently",
    "description": "Langkah-langkah praktis mengorganisasi markah buku web secara terstruktur.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Audit dan Hapus Tautan Rusak",
        "text": "Saring tautan lama yang tidak lagi aktif atau tidak dibutuhkan."
      },
      {
        "@type": "HowToStep",
        "name": "Buat Struktur Folder Berdasarkan Proyek",
        "text": "Kelompokkan URL dalam folder bertema seperti Pekerjaan, Riset, atau Belajar."
      },
      {
        "@type": "HowToStep",
        "name": "Gunakan Tag Lintas Kategori",
        "text": "Beri label tag fleksibel untuk tautan yang mencakup lebih dari satu topik."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Utama</Link>
          <span>/</span>
          <span className="text-foreground">Panduan</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-6 leading-tight">
          Cara Efektif Mengorganisasi Bookmark Web yang Berantakan
        </h1>

        <div className="flex items-center gap-3 text-xs text-muted-foreground pb-8 mb-8 border-b border-border/40">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Panduan Praktis • Oleh Tim Linkorian</span>
        </div>

        <article className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed text-sm sm:text-base">
          <p className="text-base sm:text-lg text-foreground font-medium">
            Memiliki ratusan tab browser terbuka adalah tanda bahwa Anda belum memiliki sistem pengorganisasian tautan yang efisien.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground pt-4 flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary inline" />
            1. Kelompokkan Berdasarkan Proyek, Bukan Jenis Media
          </h2>
          <p>
            Hindari membuat folder generik seperti "Video" atau "Artikel". Sebaliknya, buat folder berdasarkan tujuan penggunaan seperti <em>"Riset Tesis 2026"</em> atau <em>"Inspirasi UI Project A"</em>.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground pt-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary inline" />
            2. Manfaatkan Sistem Multi-Tag
          </h2>
          <p>
            Satu tautan sering kali mencakup beberapa topik sekaligus. Menggunakan tag fleksibel di **Linkorian** memungkinkan Anda menemukan artikel yang sama baik melalui tag `#React` maupun `#UI-Animation`.
          </p>
        </article>

        {/* CTA Card */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 border border-primary/30 text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Rapikan Bookmark Anda Bersama Linkorian</h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
            Gunakan folder warna, tag dinamis, dan ekstraksi AI otomatis sekarang juga.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <span>Daftar Linkorian</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
