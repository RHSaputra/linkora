import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Layers, Link2, CheckCircle2, ArrowRight, Tag, LayoutGrid } from "lucide-react";

export const metadata: Metadata = {
  title: "Link Organizer — Simpan & Atur Tautan Web dengan Rapi | Linkorian",
  description:
    "Simpan dan organisasikan seluruh tautan web penting Anda dengan Linkorian Link Organizer. Tanpa tab berantakan, pencarian cepat, dan klasifikasi otomatis.",
  alternates: {
    canonical: "https://linkorian.online/features/link-organizer",
  },
  openGraph: {
    title: "Link Organizer — Linkorian",
    description:
      "Solusi pengorganisasi tautan web terbaik untuk menyimpan, memberi label, dan mengelompokkan koleksi URL Anda.",
    url: "https://linkorian.online/features/link-organizer",
    siteName: "Linkorian",
    images: [{ url: "/icon.jpg", width: 1200, height: 630, alt: "Linkorian Link Organizer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Link Organizer — Linkorian",
    description:
      "Solusi pengorganisasi tautan web terbaik untuk menyimpan, memberi label, dan mengelompokkan koleksi URL Anda.",
    images: ["/icon.jpg"],
  },
};

export default function LinkOrganizerFeaturePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Link Organizer — Linkorian",
    "description":
      "Aplikasi pengorganisasi tautan web untuk menyimpan dan mengelompokkan referensi digital secara terstruktur.",
    "url": "https://linkorian.online/features/link-organizer",
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
            <Link2 className="w-4 h-4" />
            <span>Smart Link Organizer</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-6 leading-tight">
            Pengorganisasi Tautan Terbaik untuk Menyimpan & Mengelompokkan URL di <span className="text-primary">Linkorian</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Hentikan kebiasaan membiarkan puluhan tab browser tetap terbuka. Dengan Linkorian Link Organizer, Anda dapat menyimpan URL dalam sekali klik dan menemukannya kembali kapan pun dibutuhkan.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Tampilan Grid & List Card</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pilih gaya visual favorit Anda untuk menampilkan tautan, lengkap dengan gambar pratinjau, domain, dan ringkasan singkat.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Sistem Tag Fleksibel</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Beri beberapa tag pada satu tautan untuk pengelompokan lintas topik yang cepat dan dinamis.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-border/60 hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Deteksi Tautan Duplikat</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sistem secara otomatis mendeteksi jika URL yang sama pernah Anda simpan sebelumnya agar koleksi tetap bersih.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 border border-primary/30">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Rapikan Tautan Web Anda Hari Ini</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8">
            Bebaskan browser Anda dari tumpukan tab yang berat dan berantakan.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
          >
            <span>Mulai Gunakan Linkorian</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
