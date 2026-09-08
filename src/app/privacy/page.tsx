"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  ArrowLeft,
  Server,
  Sparkles,
  Mail,
  Instagram,
  CheckCircle2,
} from "lucide-react";
import { LinkoraText } from "@/components/ui/linkora-text";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/components/providers/i18n-provider";
import { BackToTop } from "@/components/ui/back-to-top";

export default function PrivacyPage() {
  const { locale } = useTranslation();
  const isEn = locale === "en";

  const highlights = isEn
    ? [
        {
          icon: Lock,
          title: "End-to-End Protection",
          desc: "Passwords hashed with Bcrypt & sessions secured by encrypted JWT cookies.",
        },
        {
          icon: ShieldCheck,
          title: "Google OAuth 2.0 Compliance",
          desc: "We strictly adhere to Google API Services User Data Policy Limited Use requirements.",
        },
        {
          icon: EyeOff,
          title: "Zero Data Selling",
          desc: "Your links, personal notes, and bookmarks are never monetized or sold to third parties.",
        },
        {
          icon: UserCheck,
          title: "Complete User Control",
          desc: "Export your information or delete your account anytime with permanent data erasure.",
        },
      ]
    : [
        {
          icon: Lock,
          title: "Proteksi Terenkripsi",
          desc: "Kata sandi diamankan dengan Bcrypt hashing & sesi login berbasis encrypted JWT cookies.",
        },
        {
          icon: ShieldCheck,
          title: "Kepatuhan Google OAuth 2.0",
          desc: "Sepenuhnya mematuhi standar Limited Use dari Google API Services User Data Policy.",
        },
        {
          icon: EyeOff,
          title: "Bebas Penjualan Data",
          desc: "Tautan, catatan pribadi, dan data Anda tidak pernah dijual atau dimonetisasi ke pihak ketiga.",
        },
        {
          icon: UserCheck,
          title: "Kendali Penuh Akun",
          desc: "Hak penuh untuk mengekspor data maupun menghapus akun secara permanen kapan saja.",
        },
      ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col">
      {/* Top Floating Glassmorphic Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-foreground/5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isEn ? "Back to Home" : "Kembali ke Beranda"}</span>
            </Link>
            <div className="h-4 w-px bg-border/60 hidden sm:block" />
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="Linkora Logo" className="h-8 sm:h-9 w-auto object-contain" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="pill" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-10 sm:py-16 relative overflow-hidden">
        {/* Ambient Glow Aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Hero Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>{isEn ? "Transparency & Trust" : "Kepatuhan & Keamanan Data"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4">
              {isEn ? "Privacy Policy" : "Kebijakan Privasi"}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">
                Linkora
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {isEn
                ? "Your privacy and trust are our highest priorities. Learn how we collect, safeguard, and respect your personal digital workspace data."
                : "Privasi dan kepercayaan Anda adalah prioritas utama kami. Pelajari bagaimana kami mengumpulkan, melindungi, dan menghormati data ruang kerja digital Anda."}
            </p>
            <p className="text-xs text-muted-foreground/80 mt-2 font-medium">
              {isEn ? "Last updated: September 2026 • Version 2.0" : "Terakhir diperbarui: September 2026 • Versi 2.0"}
            </p>
          </motion.div>

          {/* 4 Pillars Highlight Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-12 sm:mb-16">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.4 }}
                  className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-foreground mb-1">
                      {item.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Structured Policy Clauses */}
          <div className="space-y-8 sm:space-y-10 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed bg-card/40 border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-sm backdrop-blur-md">
            {/* Clause 1 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  1
                </span>
                {isEn ? "Introduction & Scope" : "Pendahuluan & Lingkup Layanan"}
              </h2>
              <p>
                {isEn
                  ? "Welcome to Linkora (\"we\", \"our\", or \"the platform\"). Linkora provides an intelligent Personal Knowledge Hub allowing users to organize links, manage rich documents, track career/academic opportunities, and synthesize information using artificial intelligence. This Privacy Policy explains our commitment to transparency regarding what data we handle and how it is protected."
                  : "Selamat datang di Linkora (\"kami\", \"aplikasi\", atau \"platform\"). Linkora menyediakan Personal Knowledge Hub cerdas untuk mengorganisasi tautan, mengelola catatan dan dokumen, melacak peluang karir atau beasiswa, serta merangkum wawasan menggunakan kecerdasan buatan. Kebijakan Privasi ini menjelaskan komitmen transparansi kami mengenai data apa yang dikelola dan bagaimana keamanannya dijamin."}
              </p>
            </section>

            {/* Clause 2 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  2
                </span>
                {isEn ? "Information We Collect" : "Informasi yang Kami Kumpulkan"}
              </h2>
              <p>
                {isEn
                  ? "We only collect information strictly required to deliver the core functionalities of Linkora:"
                  : "Kami hanya mengumpulkan informasi yang esensial untuk menjalankan fungsi inti platform Linkora:"}
              </p>
              <ul className="space-y-2.5 pl-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground">
                      {isEn ? "Account Information:" : "Informasi Akun:"}
                    </strong>{" "}
                    {isEn
                      ? "When you sign in via Google OAuth 2.0 or credentials, we receive your verified email address, full name, and avatar picture. We never request or store your Google Account password."
                      : "Saat Anda masuk menggunakan Google OAuth 2.0 atau email/password, kami menerima nama lengkap, alamat email terverifikasi, dan foto profil Anda. Kami tidak pernah meminta atau menyimpan kata sandi akun Google Anda."}
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground">
                      {isEn ? "User Content (Vault & Notes):" : "Konten Ruang Kerja Pengguna:"}
                    </strong>{" "}
                    {isEn
                      ? "Bookmarks, saved links, custom tags, folder hierarchies, notes created in the rich editor, and deadlines you set."
                      : "Tautan yang disimpan, metadata situs, tag, hierarki folder koleksi, catatan di rich editor, serta pengingat batas waktu yang Anda tentukan."}
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground">
                      {isEn ? "Technical & Session Data:" : "Data Teknis & Sesi:"}
                    </strong>{" "}
                    {isEn
                      ? "Secure HTTP-only JWT session cookies to maintain your login status securely, and basic anonymized error telemetry to improve system stability."
                      : "Cookie sesi JWT yang aman dan terenkripsi untuk mempertahankan status login Anda, serta log diagnostik anonim untuk memastikan stabilitas server."}
                  </div>
                </li>
              </ul>
            </section>

            {/* Clause 3 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  3
                </span>
                {isEn ? "Google OAuth & Third-Party Compliance" : "Kepatuhan Layanan Google OAuth"}
              </h2>
              <p>
                {isEn
                  ? "Linkora's use and transfer to any other app of information received from Google APIs will adhere to "
                  : "Penggunaan dan transfer data yang diterima Linkora dari Google API sepenuhnya tunduk pada "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Google API Services User Data Policy
                </a>
                {isEn
                  ? ", including the Limited Use requirements."
                  : ", termasuk persyaratan Penggunaan Terbatas (Limited Use)."}
              </p>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs sm:text-sm">
                <strong>{isEn ? "Our Commitment:" : "Komitmen Kami:"}</strong>{" "}
                {isEn
                  ? "Google user data is solely used to authenticate your identity and display your user profile. We never use Google data to train generalized AI models, nor do we disclose it to advertising brokers."
                  : "Data profil Google Anda semata-mata dipakai untuk otentikasi login dan identitas akun Anda. Kami tidak pernah memakai data tersebut untuk melatih model AI publik maupun menyerahkannya kepada broker iklan."}
              </div>
            </section>

            {/* Clause 4 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  4
                </span>
                {isEn ? "Artificial Intelligence Processing (Google Gemini)" : "Pemrosesan AI (Google Gemini)"}
              </h2>
              <p>
                {isEn
                  ? "When you utilize the Linkora AI Summarizer, Semantic Search, or Smart Tagging features, the specific link content or text prompt you request is processed via the Google Gemini API to generate concise summaries. Your personal identity is never attached to these API prompts, and queries are executed on-demand only when triggered by you."
                  : "Saat Anda memakai fitur AI Summarizer, Semantic Search, atau rekomendasi tag pintar, tautan atau teks yang Anda minta dikirimkan secara aman ke Google Gemini API untuk diolah menjadi intisari. Identitas pribadi Anda tidak pernah dilampirkan dalam kueri pemrosesan, dan analisis hanya berjalan atas instruksi eksplisit Anda."}
              </p>
            </section>

            {/* Clause 5 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  5
                </span>
                {isEn ? "Security & Data Storage" : "Keamanan & Penyimpanan Data"}
              </h2>
              <p>
                {isEn
                  ? "Linkora is engineered with defense-in-depth security standards:"
                  : "Linkora dibangun dengan standar keamanan berlapis:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>{isEn ? "Password Security:" : "Keamanan Sandi:"}</strong>{" "}
                  {isEn
                    ? "Credentials passwords are encrypted using Bcrypt with salted rounds. Plaintext passwords never touch our storage."
                    : "Kata sandi pengguna dienkripsi searah menggunakan algoritma Bcrypt dengan salt rounds kuat. Teks sandi asli tidak pernah tersimpan di database."}
                </li>
                <li>
                  <strong>{isEn ? "Encrypted Connections:" : "Koneksi Aman:"}</strong>{" "}
                  {isEn
                    ? "All web traffic between your browser and our servers is strictly transmitted via HTTPS / TLS 1.3 encryption."
                    : "Seluruh pertukaran data antara browser Anda dan server wajib melalui enkripsi HTTPS / TLS 1.3."}
                </li>
                <li>
                  <strong>{isEn ? "Isolated Database:" : "Database Terproteksi:"}</strong>{" "}
                  {isEn
                    ? "Data is maintained on managed PostgreSQL infrastructure with isolated user-level scoping."
                    : "Data disimpan dalam infrastruktur PostgreSQL terkelola dengan pembatasan hak akses berbasis ID pengguna."}
                </li>
              </ul>
            </section>

            {/* Clause 6 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  6
                </span>
                {isEn ? "User Rights & Account Deletion" : "Hak Pengguna & Penghapusan Akun"}
              </h2>
              <p>
                {isEn
                  ? "You retain 100% ownership of your information. Under applicable privacy regulations, you hold the right to:"
                  : "Anda memegang kendali 100% atas informasi Anda. Anda berhak untuk:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>{isEn ? "Access, modify, or update your profile data anytime." : "Mengakses, mengubah, dan memperbarui informasi profil Anda kapan saja."}</li>
                <li>{isEn ? "Export notes and links to open formats (JSON, PDF, DOCX)." : "Mengekspor catatan dan kumpulan tautan ke format dokumen standar (PDF, DOCX)."}</li>
                <li>
                  {isEn
                    ? "Request permanent account deletion. Upon deletion, all your links, notes, folders, and linked accounts are permanently erased from our production databases."
                    : "Meminta penghapusan akun secara permanen. Seluruh tautan, catatan, dan riwayat akun Anda akan dihapus total dari database produksi."}
                </li>
              </ul>
            </section>

            {/* Clause 7 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  7
                </span>
                {isEn ? "Contact & Communications" : "Kontak & Saluran Resmi"}
              </h2>
              <p>
                {isEn
                  ? "If you have questions, inquiries, or privacy requests regarding this Privacy Policy, feel free to reach out to our team:"
                  : "Jika Anda memiliki pertanyaan, klarifikasi, atau permintaan seputar Kebijakan Privasi ini, silakan hubungi tim pengembang Linkora:"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://www.instagram.com/linkora_new?stkn=OG1lZ2MwaGpybWxm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-pink-500/30 bg-pink-500/5 hover:bg-gradient-to-r hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all text-xs sm:text-sm font-semibold text-foreground group shadow-xs"
                >
                  <Instagram className="w-4 h-4 text-pink-500 group-hover:text-white transition-colors" />
                  <span>Instagram: @linkora_new</span>
                </a>
                <a
                  href="mailto:support@linkora.app"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 bg-foreground/5 hover:bg-primary/10 hover:text-primary transition-all text-xs sm:text-sm font-semibold text-foreground shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email: support@linkora.app</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-border/50 bg-background text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} <LinkoraText />. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-primary transition-colors">
              {isEn ? "Home" : "Beranda"}
            </Link>
            <span>•</span>
            <a
              href="https://www.instagram.com/linkora_new?stkn=OG1lZ2MwaGpybWxm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Instagram @linkora_new
            </a>
          </div>
        </div>
      </footer>

      {/* Floating BackToTop Button */}
      <BackToTop />
    </div>
  );
}
