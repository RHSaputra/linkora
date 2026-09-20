import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { BookOpen, ArrowRight, BrainCircuit } from "lucide-react";
import { LinkorianText } from "@/components/ui/linkora-text";

export const metadata: Metadata = {
  title: "How to Build a Personal Knowledge Base from Saved Links — Linkorian",
  description:
    "Panduan membangun Personal Knowledge Base (Second Brain) dari tautan web dan catatan Anda menggunakan integrasi AI Linkorian.",
  alternates: {
    canonical: "https://linkorian.online/guides/how-to-build-a-personal-knowledge-base-from-saved-links",
  },
  openGraph: {
    title: "How to Build a Personal Knowledge Base from Saved Links — Linkorian",
    description:
      "Ubah tautan tersimpan menjadi sistem pengetahuan pribadi terstruktur dengan alur kerja PKM modern.",
    url: "https://linkorian.online/guides/how-to-build-a-personal-knowledge-base-from-saved-links",
    siteName: "Linkorian",
    images: [{ url: "/icon.jpg", width: 1200, height: 630, alt: "Build AI Knowledge Base" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Build a Personal Knowledge Base from Saved Links — Linkorian",
    description:
      "Ubah tautan tersimpan menjadi sistem pengetahuan pribadi terstruktur dengan alur kerja PKM modern.",
    images: ["/icon.jpg"],
  },
};

export default function GuideBuildKnowledgeBasePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "How to Build a Personal Knowledge Base from Saved Links",
    "description": "Panduan membangun Second Brain dari tautan dan dokumen menggunakan AI Linkorian.",
    "url": "https://linkorian.online/guides/how-to-build-a-personal-knowledge-base-from-saved-links",
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Utama</Link>
          <span>/</span>
          <span className="text-foreground">Panduan</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-6 leading-tight">
          Cara Membangun Personal Knowledge Base dari Tautan Web Tersimpan
        </h1>

        <div className="flex items-center gap-3 text-xs text-muted-foreground pb-8 mb-8 border-b border-border/40">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Panduan Knowledge Management • Oleh Tim <LinkorianText /></span>
        </div>

        <article className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed text-sm sm:text-base">
          <p className="text-base sm:text-lg text-foreground font-medium">
            Tautan web yang disimpan tanpa wawasan pendukung akan cepat dilupakan. Membangun <span className="text-foreground italic font-normal">Personal Knowledge Base</span> (PKM) mengubah tumpukan URL menjadi sistem pengetahuan pribadi yang bernilai jangka panjang.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground pt-4">
            Mengapa Tautan dan Catatan Harus Menyatu?
          </h2>
          <p>
            Ketika Anda membaca sebuah artikel teknis atau laporan pasar, gagasan terbaik muncul saat Anda sedang membaca. Dengan menyatukan tautan dan editor catatan dokumen di <strong className="text-foreground"><LinkorianText /></strong>, Anda dapat menulis sintesis pemikiran langsung di samping artikel referensi Anda.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground pt-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary inline" />
            Manfaatkan AI untuk Menghubungkan Ide
          </h2>
          <p>
            Dengan pencarian kontekstual berbasis AI di <strong className="text-foreground"><LinkorianText /></strong>, Anda tidak perlu lagi menghafal judul persis suatu dokumen. Mengajukan pertanyaan terkait konsep akan menampilkan tautan dan catatan relevan yang tersimpan di repositori pengetahuan Anda.
          </p>
        </article>

        {/* CTA */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 border border-primary/30 text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Mulai Bangun Second Brain Anda</h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
            Dapatkan ruang kerja terpadu untuk tautan dan catatan Anda di <LinkorianText />.
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
