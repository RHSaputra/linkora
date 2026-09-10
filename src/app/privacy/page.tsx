"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  ArrowLeft,
  Mail,
  Instagram,
  CheckCircle2,
  XCircle,
  FileText,
  HelpCircle,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { LinkoraText } from "@/components/ui/linkora-text";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/components/providers/i18n-provider";
import { BackToTop } from "@/components/ui/back-to-top";

export default function PrivacyPage() {
  const { locale } = useTranslation();
  const isEn = locale === "en";

  // Mode baca: "quick" (Ringkasan Cepat) vs "legal" (Klausul Lengkap)
  const [readMode, setReadMode] = useState<"quick" | "legal">("quick");

  // Accordion FAQ active state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const pillars = isEn
    ? [
        {
          icon: Lock,
          color: "text-blue-500 dark:text-blue-400",
          bg: "bg-blue-500/10 border-blue-500/20",
          title: "End-to-End Protection",
          desc: "Passwords and sessions are safeguarded using industry-standard one-way cryptographic encryption and secure session cookies.",
        },
        {
          icon: ShieldCheck,
          color: "text-emerald-500 dark:text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/20",
          title: "Google Sign-In Compliance",
          desc: "We strictly adhere to Google API Services User Data Policy, ensuring minimal permissions and zero unauthorized data transfer.",
        },
        {
          icon: EyeOff,
          color: "text-purple-500 dark:text-purple-400",
          bg: "bg-purple-500/10 border-purple-500/20",
          title: "Zero Data Selling Guarantee",
          desc: "Your personal links, notes, and collections are never monetized, rented, or disclosed to advertising brokers.",
        },
        {
          icon: UserCheck,
          color: "text-cyan-500 dark:text-cyan-400",
          bg: "bg-cyan-500/10 border-cyan-500/20",
          title: "Complete User Sovereignty",
          desc: "Export your documents whenever you want, or request permanent account and data deletion at any moment.",
        },
      ]
    : [
        {
          icon: Lock,
          color: "text-blue-500 dark:text-blue-400",
          bg: "bg-blue-500/10 border-blue-500/20",
          title: "Perlindungan Data Terenkripsi",
          desc: "Kata sandi dan sesi pengguna dilindungi menggunakan enkripsi searah berstandar industri dan cookie sesi yang aman.",
        },
        {
          icon: ShieldCheck,
          color: "text-emerald-500 dark:text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/20",
          title: "Kepatuhan Akun Google",
          desc: "Sepenuhnya mematuhi kebijakan Google API Services User Data Policy dengan izin akses minimal tanpa penyalahgunaan.",
        },
        {
          icon: EyeOff,
          color: "text-purple-500 dark:text-purple-400",
          bg: "bg-purple-500/10 border-purple-500/20",
          title: "Bebas Penjualan Data",
          desc: "Tautan, folder, dan catatan Anda adalah hak milik pribadi Anda 100%, tanpa iklan maupun broker data pihak ketiga.",
        },
        {
          icon: UserCheck,
          color: "text-cyan-500 dark:text-cyan-400",
          bg: "bg-cyan-500/10 border-cyan-500/20",
          title: "Kendali Penuh Pengguna",
          desc: "Ekspor dokumen Anda kapan saja, atau hapus akun beserta seluruh isinya secara permanen dari sistem kami.",
        },
      ];

  const accessMatrix = isEn
    ? [
        {
          label: "Google Account Password",
          allowed: false,
          note: "Never requested or accessed. Authenticated directly on Google's domain.",
        },
        {
          label: "Google Drive, Files, & Emails",
          allowed: false,
          note: "We do not ask for or hold permissions to access your private files or inbox.",
        },
        {
          label: "Contacts & Address Book",
          allowed: false,
          note: "Zero harvesting or scanning of your personal contact lists.",
        },
        {
          label: "Commercial Ad Tracking",
          allowed: false,
          note: "No commercial trackers, profiling algorithms, or advertising brokers.",
        },
        {
          label: "Verified Name & Email",
          allowed: true,
          note: "Used strictly for account authentication and critical security notices.",
        },
        {
          label: "Profile Avatar Image",
          allowed: true,
          note: "Used solely to display your profile picture in your workspace header.",
        },
        {
          label: "Personal Links & Notes Content",
          allowed: true,
          note: "Stored privately and exclusively accessible to your authenticated account.",
        },
      ]
    : [
        {
          label: "Kata Sandi Akun Google",
          allowed: false,
          note: "Tidak pernah diminta atau diakses. Otentikasi diproses langsung oleh Google.",
        },
        {
          label: "Google Drive, File, & Email Pribadi",
          allowed: false,
          note: "Kami tidak meminta izin akses file Google Drive maupun kotak masuk email Anda.",
        },
        {
          label: "Daftar Kontak / Buku Telepon",
          allowed: false,
          note: "Bebas dari pelacakan, pemindaian, atau penyalinan data kontak Anda.",
        },
        {
          label: "Pelacak Iklan Pihak Ketiga",
          allowed: false,
          note: "Tanpa pelacak iklan komersial maupun broker profil data pengguna.",
        },
        {
          label: "Nama & Alamat Email Terverifikasi",
          allowed: true,
          note: "Hanya untuk identifikasi akun Anda dan notifikasi keamanan penting.",
        },
        {
          label: "Foto Profil Publik",
          allowed: true,
          note: "Hanya untuk menampilkan foto profil di dashboard ruang kerja Anda.",
        },
        {
          label: "Konten Tautan & Catatan Pribadi",
          allowed: true,
          note: "Tersimpan secara privat dan hanya dapat diakses oleh akun Anda sendiri.",
        },
      ];

  const faqs: { q: ReactNode; a: ReactNode }[] = isEn
    ? [
        {
          q: <>Does <LinkoraText /> have access to my Google password?</>,
          a: <>Never. <LinkoraText /> uses Google&apos;s standard Sign-In service. When you log in with Google, authentication occurs securely on Google&apos;s official servers. Google only provides a verified confirmation token containing your name and email.</>,
        },
        {
          q: "Is my personal content used to train public AI models?",
          a: "No. When using AI summary or search features, link content or queries are processed on-demand in real-time. Your personal identifiers are never attached, and your data is never retained for public machine learning training.",
        },
        {
          q: "Can other people see my saved links or notes?",
          a: "No. All links, collections, tags, and document notes are strictly private by default and scoped exclusively to your authenticated account.",
        },
        {
          q: <>What happens if I delete my <LinkoraText /> account?</>,
          a: "Account deletion triggers a permanent erase: all your saved links, document notes, reminders, and profile data are completely removed from our production databases.",
        },
        {
          q: <>How does <LinkoraText /> respect Google&apos;s user data policies?</>,
          a: <><LinkoraText /> complies with Google API Services User Data Policy, specifically the Limited Use requirements. We request only the minimal basic profile information needed for identity verification.</>,
        },
      ]
    : [
        {
          q: <>Apakah <LinkoraText /> memiliki akses ke kata sandi akun Google saya?</>,
          a: <>Sama sekali tidak pernah. <LinkoraText /> menggunakan layanan Masuk dengan Google resmi. Saat Anda masuk, verifikasi diproses langsung di server resmi Google. Google hanya mengirimkan token konfirmasi terverifikasi berisi nama dan email Anda.</>,
        },
        {
          q: "Apakah catatan atau data saya dipakai untuk melatih model AI publik?",
          a: "Tidak. Saat menggunakan fitur ringkasan atau pencarian cerdas, data hanya diproses secara transaksional saat itu juga. Identitas Anda tidak dilampirkan, dan data Anda tidak disimpan untuk melatih model AI publik.",
        },
        {
          q: "Bisakah orang lain melihat tautan atau catatan pribadi saya?",
          a: "Tidak bisa. Seluruh tautan, koleksi folder, tag, dan catatan dokumen Anda bersifat 100% privat dan hanya dapat dibuka melalui akun Anda yang terotentikasi.",
        },
        {
          q: <>Apa yang terjadi jika saya menghapus akun <LinkoraText /> saya?</>,
          a: "Permintaan hapus akun akan menghapus seluruh data secara permanen: semua tautan, catatan, jadwal pengingat, dan profil Anda akan dibersihkan tuntas dari database.",
        },
        {
          q: <>Bagaimana <LinkoraText /> mematuhi kebijakan perlindungan data Google?</>,
          a: <><LinkoraText /> mematuhi persyaratan Penggunaan Terbatas (Limited Use) dari Google. Kami hanya meminta izin profil paling mendasar yang diperlukan untuk verifikasi identitas akun Anda.</>,
        },
      ];

  const sectionsNav = isEn
    ? [
        { id: "sec-intro", title: "1. Scope & Purpose" },
        { id: "sec-collect", title: "2. Data We Collect" },
        { id: "sec-google", title: "3. Google Account Compliance" },
        { id: "sec-ai", title: "4. Intelligent Features" },
        { id: "sec-security", title: "5. Security Measures" },
        { id: "sec-rights", title: "6. User Rights" },
        { id: "sec-contact", title: "7. Contact Us" },
      ]
    : [
        { id: "sec-intro", title: "1. Lingkup & Tujuan" },
        { id: "sec-collect", title: "2. Data yang Dikumpulkan" },
        { id: "sec-google", title: "3. Kepatuhan Akun Google" },
        { id: "sec-ai", title: "4. Fitur Kecerdasan Cerdas" },
        { id: "sec-security", title: "5. Standar Keamanan" },
        { id: "sec-rights", title: "6. Hak Pengguna" },
        { id: "sec-contact", title: "7. Hubungi Kami" },
      ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col font-sans">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-all p-2 rounded-xl hover:bg-foreground/5 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isEn ? "Back to Home" : "Kembali ke Beranda"}</span>
            </Link>
            <div className="h-4 w-px bg-border/60 hidden sm:block" />
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Linkora Logo" className="h-8 sm:h-9 w-auto object-contain" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="pill" />
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 py-8 sm:py-12 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* ── Hero Presentation Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="p-6 sm:p-8 md:p-10 rounded-3xl border border-border/70 bg-card/80 shadow-lg backdrop-blur-md mb-8 sm:mb-12"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
              {/* Liko Avatar Clean */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-border/60 bg-background shadow-md shrink-0">
                <img
                  src="/maskot.jpeg"
                  alt="Liko Mascot Linkora"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Title & Description */}
              <div className="flex-1 space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isEn ? "Data Protection & Privacy" : "Perlindungan Data & Privasi"}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                  {isEn ? "Privacy Policy " : "Kebijakan Privasi "}
                  <LinkoraText />
                </h1>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {isEn ? (
                    <>Your trust is essential to us. <LinkoraText /> protects your digital workspace data with transparency, confidentiality, and respect for your personal sovereignty.</>
                  ) : (
                    <>Kepercayaan Anda adalah amanah utama kami. <LinkoraText /> melindungi ruang kerja digital Anda dengan transparansi penuh, kerahasiaan, dan penghormatan atas hak pribadi Anda.</>
                  )}
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {isEn ? "Encrypted Connection" : "Koneksi Terenkripsi"}
                  </span>
                  <span>•</span>
                  <span>{isEn ? "Last Updated: September 2026" : "Pembaruan: September 2026"}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Mode Switcher: Ringkasan vs Teks Lengkap ── */}
          <div className="flex items-center justify-center mb-8">
            <div className="p-1 rounded-2xl bg-card border border-border/70 shadow-sm flex items-center gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setReadMode("quick")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  readMode === "quick"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isEn ? "Quick Summary" : "Ringkasan Cepat"}</span>
              </button>
              <button
                type="button"
                onClick={() => setReadMode("legal")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  readMode === "legal"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isEn ? "Full Clauses" : "Klausul Lengkap"}</span>
              </button>
            </div>
          </div>

          {/* ── Quick Summary Mode Content ── */}
          <AnimatePresence mode="wait">
            {readMode === "quick" && (
              <motion.div
                key="quick-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-8 sm:space-y-10 mb-10 sm:mb-14"
              >
                {/* 4 Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pillars.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-border/60 bg-card/60 shadow-xs flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3.5 mb-3">
                          <div className={`w-10 h-10 rounded-xl ${item.bg} border flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">
                              {item.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isEn ? <><LinkoraText /> Standard</> : <>Standar <LinkoraText /></>}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Matrix: What We Access vs What We NEVER Access ── */}
                <div className="p-5 sm:p-7 rounded-2xl border border-border/70 bg-card/50 shadow-sm">
                  <div className="mb-5 text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                      {isEn ? "Data Boundaries & Privacy Scope" : "Batasan Akses Data Pengguna"}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {isEn
                        ? "Clear boundaries between your private information and our application."
                        : "Batas yang tegas dan transparan mengenai apa yang diakses dan apa yang tidak disentuh."}
                    </p>
                  </div>

                  <div className="divide-y divide-border/60 border border-border/60 rounded-xl overflow-hidden bg-background/50">
                    {accessMatrix.map((row, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          {row.allowed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                          <span className="text-xs sm:text-sm font-semibold text-foreground">
                            {row.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pl-6 sm:pl-0">
                          <span className="text-xs text-muted-foreground">
                            {row.note}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              row.allowed
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25"
                            }`}
                          >
                            {row.allowed ? (isEn ? "Permitted" : "Diizinkan") : (isEn ? "NEVER" : "TIDAK PERNAH")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Full Legal Clauses Section ── */}
          <div className="space-y-8 sm:space-y-10 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-card/40 border border-border/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-10 sm:mb-14">
            <div className="border-b border-border/60 pb-5 mb-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                    {isEn ? "Legal Clauses & Governance" : "Klausul Kebijakan Resmi"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isEn ? (
                      <>Official provisions governing your relationship with <LinkoraText />.</>
                    ) : (
                      <>Ketentuan resmi yang mengatur perlindungan data akun Anda di <LinkoraText />.</>
                    )}
                  </p>
                </div>

                {/* Section Quick Jump Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {sectionsNav.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-foreground/5 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      {sec.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clause 1 */}
            <section id="sec-intro" className="space-y-2.5">
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  1
                </span>
                {isEn ? "Scope & Purpose" : "Lingkup Layanan & Tujuan"}
              </h3>
              <p>
                {isEn ? (
                  <>Welcome to <LinkoraText /> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the platform&rdquo;). <LinkoraText /> provides a personal digital workspace empowering users to organize saved links, manage rich document notes, schedule reminders, and synthesize knowledge. This Privacy Policy describes how we handle, protect, and respect your data.</>
                ) : (
                  <>Selamat datang di <LinkoraText /> (&ldquo;kami&rdquo;, &ldquo;aplikasi&rdquo;, atau &ldquo;platform&rdquo;). <LinkoraText /> menyediakan ruang kerja digital pribadi untuk menyimpan tautan penting, mengelola catatan dokumen, mengatur pengingat, dan merangkum wawasan. Kebijakan Privasi ini menjelaskan bagaimana informasi Anda dikelola dan dilindungi secara bertanggung jawab.</>
                )}
              </p>
            </section>

            {/* Clause 2 */}
            <section id="sec-collect" className="space-y-2.5 pt-4 border-t border-border/50">
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  2
                </span>
                {isEn ? "Information We Collect" : "Informasi yang Kami Kumpulkan"}
              </h3>
              <p>
                {isEn
                  ? "We only collect data strictly necessary to operate your personalized workspace:"
                  : "Kami hanya mengumpulkan data yang mutlak diperlukan untuk operasional ruang kerja Anda:"}
              </p>
              <ul className="space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground">{isEn ? "Account Details:" : "Identitas Akun:"}</strong>{" "}
                    {isEn
                      ? "When authenticating via Google, we receive your verified email, full name, and avatar picture. For password accounts, credentials are encrypted securely."
                      : "Saat masuk menggunakan akun Google, kami menerima nama, alamat email terverifikasi, dan foto profil publik Anda. Untuk akun berbasis kata sandi, sandi dienkripsi secara aman."}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground">{isEn ? "Workspace Content:" : "Konten Ruang Kerja:"}</strong>{" "}
                    {isEn
                      ? "Bookmarks, custom tags, collection folders, notes created in the rich editor, and deadlines you specify."
                      : "Tautan URL yang disimpan, tag, folder koleksi, catatan di dalam editor, serta pengingat waktu yang Anda tentukan."}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground">{isEn ? "Session Security:" : "Keamanan Sesi:"}</strong>{" "}
                    {isEn
                      ? "Encrypted session cookies to maintain your login status securely without storing plaintext credentials."
                      : "Cookie sesi terenkripsi untuk mempertahankan status login Anda dengan aman."}
                  </div>
                </li>
              </ul>
            </section>

            {/* Clause 3 */}
            <section id="sec-google" className="space-y-2.5 pt-4 border-t border-border/50">
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  3
                </span>
                {isEn ? "Google API Services User Data Policy Compliance" : "Kepatuhan Akun Google"}
              </h3>
              <p>
                {isEn ? (
                  <><LinkoraText />&apos;s use and transfer to any other app of information received from Google APIs will strictly adhere to the{" "}</>
                ) : (
                  <>Penggunaan dan transfer informasi yang diterima <LinkoraText /> dari Google API sepenuhnya tunduk pada ketentuan resmi{" "}</>
                )}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <span>Google API Services User Data Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {isEn ? ", including the Limited Use requirements." : ", termasuk persyaratan Penggunaan Terbatas (Limited Use)."}
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground">
                <strong>{isEn ? "Limited Use Affirmation:" : "Penegasan Penggunaan Terbatas:"}</strong>{" "}
                {isEn ? (
                  <>We never disclose, share, or sell Google user data to third parties, advertising networks, or data brokers. Google profile data is used exclusively to authenticate and display your identity in <LinkoraText />.</>
                ) : (
                  <>Kami tidak pernah menyerahkan, membagikan, atau memperjualbelikan data pengguna Google kepada pihak ketiga atau jaringan periklanan. Data profil Google semata-mata dipakai untuk otentikasi akun Anda di <LinkoraText />.</>
                )}
              </div>
            </section>

            {/* Clause 4 */}
            <section id="sec-ai" className="space-y-2.5 pt-4 border-t border-border/50">
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  4
                </span>
                {isEn ? "Intelligent Summarization & Search" : "Fitur Analisis & Perangkum Cerdas"}
              </h3>
              <p>
                {isEn
                  ? "When you trigger summarization or semantic search features, the requested link content or query is processed transactionally in real-time. Your personal account identity is never attached to these requests, and query data is not retained to train public foundational AI models."
                  : "Saat Anda memakai fitur perangkum atau pencarian cerdas, tautan atau kueri diproses secara transaksional saat itu juga. Identitas pribadi Anda tidak pernah dilampirkan, dan data Anda tidak disimpan untuk melatih model kecerdasan buatan publik."}
              </p>
            </section>

            {/* Clause 5 */}
            <section id="sec-security" className="space-y-2.5 pt-4 border-t border-border/50">
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  5
                </span>
                {isEn ? "Security Standards & Safeguards" : "Standar & Langkah Keamanan"}
              </h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-foreground">{isEn ? "Encrypted Connections:" : "Koneksi Aman:"}</strong>{" "}
                  {isEn ? "All data transmission between your browser and our servers is strictly encrypted via HTTPS / TLS protocol." : "Seluruh pertukaran data antara perangkat Anda dan server dienkripsi melalui protokol HTTPS / TLS."}
                </li>
                <li>
                  <strong className="text-foreground">{isEn ? "Cryptographic Protection:" : "Proteksi Kriptografi:"}</strong>{" "}
                  {isEn ? "Stored credentials use secure one-way encryption to prevent unauthorized exposure." : "Kredensial akun dilindungi dengan enkripsi searah yang aman."}
                </li>
                <li>
                  <strong className="text-foreground">{isEn ? "Isolated Workspace Storage:" : "Penyimpanan Terisolasi:"}</strong>{" "}
                  {isEn ? "Data records are segregated strictly by authenticated user accounts." : "Data ruang kerja disimpan secara terpisah dan terisolasi khusus untuk akun Anda."}
                </li>
              </ul>
            </section>

            {/* Clause 6 */}
            <section id="sec-rights" className="space-y-2.5 pt-4 border-t border-border/50">
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  6
                </span>
                {isEn ? "User Rights & Data Deletion" : "Hak Pengguna & Penghapusan Data"}
              </h3>
              <p>
                {isEn
                  ? "You retain complete ownership over your information. You hold the full right to:"
                  : "Anda memegang kendali penuh atas informasi Anda, termasuk hak untuk:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>{isEn ? "Update your personal details, tags, and collections anytime." : "Memperbarui data profil, tag, dan koleksi Anda kapan saja."}</li>
                <li>{isEn ? "Export your notes and link collections to standard document formats." : "Mengekspor catatan dan tautan ke format dokumen standar."}</li>
                <li>{isEn ? "Request permanent account deletion, wiping all saved links, notes, and records from our databases." : "Meminta penghapusan akun secara permanen yang akan menghapus bersih seluruh data Anda."}</li>
              </ul>
            </section>

            {/* Clause 7 */}
            <section id="sec-contact" className="space-y-2.5 pt-4 border-t border-border/50">
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  7
                </span>
                {isEn ? "Official Contact Channels" : "Kontak Resmi"}
              </h3>
              <p>
                {isEn
                  ? "For inquiries or requests regarding this Privacy Policy, please contact our team:"
                  : "Untuk pertanyaan atau klarifikasi seputar Kebijakan Privasi ini, silakan hubungi kami:"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://www.instagram.com/linkora_new?stkn=OG1lZ2MwaGpybWxm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 text-xs sm:text-sm font-semibold text-foreground transition-all"
                >
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span>Instagram: @linkora_new</span>
                </a>
                <a
                  href="mailto:support@linkora.app"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 bg-foreground/5 hover:bg-foreground/10 text-xs sm:text-sm font-semibold text-foreground transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email: support@linkora.app</span>
                </a>
              </div>
            </section>
          </div>

          {/* ── FAQ Section ── */}
          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/70 bg-card/60 shadow-sm mb-10 sm:mb-14">
            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{isEn ? "FAQ" : "Tanya Jawab"}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {isEn ? "Frequently Asked Questions" : "Pertanyaan Seputar Privasi"}
              </h2>
            </div>

            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-border/60 rounded-xl overflow-hidden bg-background/50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left font-semibold text-xs sm:text-sm hover:text-primary transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 text-muted-foreground ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-7 border-t border-border/60 bg-background text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} <LinkoraText />. {isEn ? "All rights reserved." : "Hak cipta dilindungi undang-undang."}</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-primary transition-colors">
              {isEn ? "Home" : "Beranda"}
            </Link>
            <span>•</span>
            <a
              href="https://www.instagram.com/linkora_new?stkn=OG1lZ2MwaGpybWxm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-500" />
              <span>@linkora_new</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating BackToTop Button */}
      <BackToTop />
    </div>
  );
}
