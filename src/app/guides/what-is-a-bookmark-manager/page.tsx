import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { LinkorianText } from "@/components/ui/linkora-text";

export const metadata: Metadata = {
  title: "What is a Bookmark Manager? Guide & Benefits — Linkorian",
  description:
    "Pelajari apa itu Bookmark Manager, fungsi utamanya dalam mengelola tautan web, dan bagaimana teknologi AI seperti Linkorian meningkatkan produktivitas riset Anda.",
  alternates: {
    canonical: "https://linkorian.online/guides/what-is-a-bookmark-manager",
  },
  openGraph: {
    title: "What is a Bookmark Manager? Guide & Benefits — Linkorian",
    description:
      "Panduan lengkap mengenai definisi, manfaat, dan cara kerja Bookmark Manager modern berbasis AI.",
    url: "https://linkorian.online/guides/what-is-a-bookmark-manager",
    siteName: "Linkorian",
    images: [{ url: "/icon.jpg", width: 1200, height: 630, alt: "What is a Bookmark Manager" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "What is a Bookmark Manager? Guide & Benefits — Linkorian",
    description:
      "Panduan lengkap mengenai definisi, manfaat, dan cara kerja Bookmark Manager modern berbasis AI.",
    images: ["/icon.jpg"],
  },
};

export default function GuideWhatIsBookmarkManagerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "What is a Bookmark Manager? Definition, Benefits, and Modern AI Features",
    "description":
      "Panduan mendalam mengenai definisi bookmark manager dan evolusi pengelola markah buku berbasis AI.",
    "url": "https://linkorian.online/guides/what-is-a-bookmark-manager",
    "author": {
      "@type": "Organization",
      "name": "Linkorian",
    },
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

        {/* Article Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-6 leading-tight">
          Apa itu Bookmark Manager? Panduan Lengkap & Manfaatnya untuk Produktivitas
        </h1>

        <div className="flex items-center gap-3 text-xs text-muted-foreground pb-8 mb-8 border-b border-border/40">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Panduan Informasi • Oleh Tim <LinkorianText /></span>
        </div>

        {/* Article Body */}
        <article className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed text-sm sm:text-base">
          <p className="text-base sm:text-lg text-foreground font-medium">
            Dalam dunia digital saat ini, kita mengonsumsi puluhan hingga ratusan sumber informasi setiap hari — mulai dari artikel berita, dokumen riset, repositori kode, hingga video tutorial.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground pt-4">
            Definisi Bookmark Manager
          </h2>
          <p>
            <strong className="text-foreground">Bookmark Manager</strong> (Pengelola Markah Buku) adalah aplikasi atau perangkat lunak yang dirancang khusus untuk menyimpan, mengelompokkan, dan mengorganisasi alamat halaman web (URL) agar pengguna dapat menemukannya kembali dengan cepat dan rapi.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground pt-4">
            Perbedaan Bookmark Browser Bawaan vs Bookmark Manager Modern
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl glass-panel border border-border/60">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Bookmark Browser Bawaan:</strong> Hanya menyimpan judul dan URL dalam struktur folder sederhana tanpa pratinjau gambar, pencarian konteks, atau analisis isi.
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl glass-panel border border-border/60">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Modern AI Bookmark Manager (seperti <LinkorianText />):</strong> Mengekstrak pratinjau gambar, deskripsi otomatis, ringkasan AI, pencarian teks kontekstual, serta integrasi catatan dokumen dalam satu ruang kerja.
              </div>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground pt-4">
            Mengapa Anda Membutuhkan AI Bookmark Manager?
          </h2>
          <p>
            Ketika jumlah tautan yang Anda simpan mencapai ratusan, pencarian berbasis judul statis tidak lagi efektif. AI Bookmark Manager seperti <strong className="text-foreground"><LinkorianText /></strong> memungkinkan Anda mengajukan pertanyaan atau mencari kata kunci samar untuk menemukan tautan yang relevan secara instan tanpa perlu mengingat judul persisnya.
          </p>
        </article>

        {/* CTA Card */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 border border-primary/30 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-4">
            <span>Mulai Bersama <LinkorianText /></span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Coba AI Bookmark Manager Cerdas</h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
            Kelola seluruh tautan dan referensi web Anda dalam satu tempat yang terorganisir bersama <LinkorianText />.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <span>Daftar <LinkorianText /> Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
