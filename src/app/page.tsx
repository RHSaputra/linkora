import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { LandingClientAddons } from "@/components/landing/landing-client-wrapper";

const PainPoints = dynamic(() => import("@/components/landing/pain-points").then((m) => m.PainPoints));
const Solution = dynamic(() => import("@/components/landing/solution").then((m) => m.Solution));
const HowItWorks = dynamic(() => import("@/components/landing/how-it-works").then((m) => m.HowItWorks));
const UseCases = dynamic(() => import("@/components/landing/use-cases").then((m) => m.UseCases));
const SmartSearchDemo = dynamic(() => import("@/components/landing/smart-search").then((m) => m.SmartSearchDemo));
const Comparison = dynamic(() => import("@/components/landing/comparison").then((m) => m.Comparison));
const Testimonials = dynamic(() => import("@/components/landing/testimonials").then((m) => m.Testimonials));
const CTA = dynamic(() => import("@/components/landing/footer").then((m) => m.CTA));
const Footer = dynamic(() => import("@/components/landing/footer").then((m) => m.Footer));

export const metadata: Metadata = {
  title: "Linkorian — AI-Powered Bookmark Manager & Link Organizer",
  description:
    "Simpan, kelola, analisis URL, dan bangun personal knowledge base cerdas bersama Linkorian. Bookmark manager berbasis AI untuk riset, dokumen, dan tautan Anda.",
  alternates: {
    canonical: "https://linkorian.online",
  },
  openGraph: {
    title: "Linkorian — AI-Powered Bookmark Manager & Link Organizer",
    description:
      "Platform cerdas untuk menyimpan, mengorganisasi, menganalisis URL, dan membangun personal knowledge base.",
    url: "https://linkorian.online",
    siteName: "Linkorian",
    images: [{ url: "/icon.jpg", width: 1200, height: 630, alt: "Linkorian Logo" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linkorian — AI-Powered Bookmark Manager & Link Organizer",
    description:
      "Platform cerdas untuk menyimpan, mengorganisasi, menganalisis URL, dan membangun personal knowledge base.",
    images: ["/icon.jpg"],
  },
};

export default function LandingPage() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Linkorian",
    "alternateName": ["Linkorian App", "Linkorian Bookmark Manager"],
    "url": "https://linkorian.online",
    "description":
      "Platform AI bookmark manager dan link organizer untuk menyimpan, mengorganisasi, menganalisis URL, dan membangun personal knowledge base.",
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Linkorian",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "All",
    "url": "https://linkorian.online",
    "description":
      "Aplikasi bookmark manager cerdas berbasis AI untuk mengelola tautan web, ringkasan otomatis, dan catatan pengetahuan pribadi.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Linkorian",
    "url": "https://linkorian.online",
    "logo": "https://linkorian.online/icon.jpg",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Apa itu Linkorian?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Linkorian adalah platform berbasis AI yang dirancang untuk menyimpan, mengorganisasi, menganalisis tautan web, serta membangun personal knowledge base secara cerdas.",
        },
      },
      {
        "@type": "Question",
        "name": "Untuk apa Linkorian digunakan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Linkorian digunakan untuk mengelola ribuan bookmark, menganalisis konten halaman web dengan AI, mengatur tautan riset, serta mengintegrasikan catatan dokumen dalam satu ruang kerja.",
        },
      },
      {
        "@type": "Question",
        "name": "Apa perbedaan Linkorian dengan bookmark browser bawaan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Bookmark browser bawaan hanya menyimpan judul dan URL statis. Linkorian menambahkan kecerdasan AI untuk ekstrak ringkasan otomatis, pencarian kontekstual, organisasi folder cerdas, dan sinkronisasi lintas perangkat.",
        },
      },
      {
        "@type": "Question",
        "name": "Apakah Linkorian dapat menganalisis tautan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Ya, Linkorian memiliki mesin analisis URL berbasis AI yang secara otomatis mengekstrak poin penting, topik utama, dan konteks dari artikel maupun halaman web yang Anda simpan.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <LandingClientAddons />
      <Navbar />

      <main className="relative flex flex-col">
        <Hero />
        <PainPoints />
        <Solution />
        <HowItWorks />
        <UseCases />
        <SmartSearchDemo />
        <Comparison />
        <Testimonials />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
