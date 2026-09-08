"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  XCircle,
  KeyRound,
  FileCheck,
  Zap,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Bot,
  Layers,
  Database,
} from "lucide-react";
import { LinkoraText } from "@/components/ui/linkora-text";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/components/providers/i18n-provider";
import { BackToTop } from "@/components/ui/back-to-top";

export default function PrivacyPage() {
  const { locale } = useTranslation();
  const isEn = locale === "en";

  // Mode pembaca: "quick" (Intisari Cepat 2 Menit) vs "legal" (Klausul Hukum Lengkap)
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
          bg: "bg-blue-500/10 border-blue-500/25",
          title: "Military-Grade Encryption",
          desc: "Passwords hashed via Bcrypt with dynamic salts. Sessions protected by encrypted HTTP-only JWT cookies.",
        },
        {
          icon: ShieldCheck,
          color: "text-emerald-500 dark:text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/25",
          title: "Google OAuth 2.0 Compliance",
          desc: "We strictly adhere to Google API Services User Data Policy Limited Use requirements.",
        },
        {
          icon: EyeOff,
          color: "text-purple-500 dark:text-purple-400",
          bg: "bg-purple-500/10 border-purple-500/25",
          title: "Zero Data Selling Guarantee",
          desc: "Your personal bookmarks, vault collections, and notes are never monetized, traded, or sold.",
        },
        {
          icon: UserCheck,
          color: "text-cyan-500 dark:text-cyan-400",
          bg: "bg-cyan-500/10 border-cyan-500/25",
          title: "100% User Sovereignty",
          desc: "Export your notes anytime (PDF, DOCX) or request permanent account erasure in one click.",
        },
      ]
    : [
        {
          icon: Lock,
          color: "text-blue-500 dark:text-blue-400",
          bg: "bg-blue-500/10 border-blue-500/25",
          title: "Enkripsi Berlapis Standar Tinggi",
          desc: "Kata sandi dienkripsi dengan algoritma Bcrypt & sesi login diamankan oleh HTTP-only JWT cookies.",
        },
        {
          icon: ShieldCheck,
          color: "text-emerald-500 dark:text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/25",
          title: "Kepatuhan Resmi Google OAuth 2.0",
          desc: "Sepenuhnya tunduk pada standar Limited Use dari Google API Services User Data Policy.",
        },
        {
          icon: EyeOff,
          color: "text-purple-500 dark:text-purple-400",
          bg: "bg-purple-500/10 border-purple-500/25",
          title: "Jaminan Bebas Penjualan Data",
          desc: "Tautan, folder, dan catatan pribadi Anda adalah milik Anda 100%, tanpa iklan atau monetisasi pihak ketiga.",
        },
        {
          icon: UserCheck,
          color: "text-cyan-500 dark:text-cyan-400",
          bg: "bg-cyan-500/10 border-cyan-500/25",
          title: "Kedaulatan Penuh Pengguna",
          desc: "Ekspor catatan kapan saja (PDF, DOCX) atau hapus akun beserta seluruh isinya secara permanen.",
        },
      ];

  const accessMatrix = isEn
    ? [
        {
          label: "Google Account Password",
          allowed: false,
          note: "Never requested or stored. Authenticated directly by Google.",
        },
        {
          label: "Google Drive & Personal Files",
          allowed: false,
          note: "We do NOT request Google Drive or Gmail scope permissions.",
        },
        {
          label: "Contacts & Address Book",
          allowed: false,
          note: "Zero contact list reading or harvesting.",
        },
        {
          label: "Third-Party Ad Trackers",
          allowed: false,
          note: "No commercial ad tracking pixels or behavioral data brokers.",
        },
        {
          label: "Verified Name & Email",
          allowed: true,
          note: "Solely used to identify your account and dispatch critical security notices.",
        },
        {
          label: "Public Profile Avatar",
          allowed: true,
          note: "Used strictly to display your user avatar in the header dashboard.",
        },
        {
          label: "User Vault Links & Notes",
          allowed: true,
          note: "Encrypted and isolated in your private workspace database.",
        },
      ]
    : [
        {
          label: "Kata Sandi Akun Google Anda",
          allowed: false,
          note: "Tidak pernah diminta atau disimpan. Diverifikasi langsung oleh server Google.",
        },
        {
          label: "File Google Drive & Email Pribadi",
          allowed: false,
          note: "Kami TIDAK meminta izin akses file Google Drive atau pesan Gmail Anda.",
        },
        {
          label: "Daftar Kontak / Buku Telepon",
          allowed: false,
          note: "Bebas dari pembacaan atau penyalinan data kontak Anda.",
        },
        {
          label: "Pelacak Iklan Komersial Pihak Ketiga",
          allowed: false,
          note: "Tidak ada pixel iklan pelacak perilaku atau broker data komersial.",
        },
        {
          label: "Nama & Alamat Email Terverifikasi",
          allowed: true,
          note: "Semata-mata untuk otentikasi login akun Anda dan verifikasi keamanan.",
        },
        {
          label: "Foto Profil Publik Google",
          allowed: true,
          note: "Hanya untuk menampilkan foto avatar Anda di pojok dashboard.",
        },
        {
          label: "Tautan & Catatan yang Anda Simpan",
          allowed: true,
          note: "Tersimpan aman & terisolasi khusus di ruang kerja digital pribadi Anda.",
        },
      ];

  const faqs = isEn
    ? [
        {
          q: "Does Linkora have access to my Google Account password?",
          a: "Never. Linkora utilizes Google's official OAuth 2.0 standard flow. When you click 'Login with Google', you authenticate directly on Google's encrypted domain. Google simply returns a verified token confirming your email address and name.",
        },
        {
          q: "Is my personal data used to train public AI models?",
          a: "Absolutely not. When using Linkora's AI Summarizer or Semantic Search powered by Google Gemini, the link or text prompt is analyzed transactionally in real-time. Your personal identifiers are stripped, and queries are never retained to train public foundational AI models.",
        },
        {
          q: "Can other Linkora users see my notes and bookmarked links?",
          a: "No. By default, all notes, bookmarks, tags, and collections are strictly private and isolated to your authenticated user ID in our PostgreSQL database.",
        },
        {
          q: "What happens if I delete my Linkora account?",
          a: "Under our 'Right to be Forgotten' policy, deleting your account triggers a permanent cascade delete across our production database: all saved links, notes, reminders, and linked OAuth credentials are fundamentally wiped.",
        },
        {
          q: "How does Linkora ensure compliance with Google's API User Data Policy?",
          a: "Linkora complies strictly with Google API Services User Data Policy, specifically the Limited Use requirements. We only access the minimal scope ('email', 'profile', 'openid') necessary for single sign-on authentication.",
        },
      ]
    : [
        {
          q: "Apakah Linkora memiliki akses ke kata sandi akun Google saya?",
          a: "Sama sekali tidak pernah. Linkora menggunakan alur resmi Google OAuth 2.0. Saat Anda mengklik 'Masuk dengan Google', otentikasi diproses langsung di server aman Google. Google hanya mengirimkan token verifikasi yang berisi nama dan email Anda.",
        },
        {
          q: "Apakah catatan atau data saya dipakai untuk melatih model AI publik?",
          a: "Tidak. Ketika Anda memakai fitur AI Summarizer atau Pencarian Semantik berbasis Google Gemini API, tautan atau teks hanya diproses secara transaksional saat itu juga. Identitas Anda tidak dilampirkan, dan data Anda tidak dimasukkan ke dataset pelatihan publik.",
        },
        {
          q: "Bisakah pengguna Linkora lain mengintip catatan atau tautan saya?",
          a: "Tidak bisa. Secara default, seluruh tautan, catatan di editor, folder, dan tag bersifat 100% privat dan terisolasi dengan ID akun Anda di database PostgreSQL.",
        },
        {
          q: "Apa yang terjadi jika saya ingin menghapus akun Linkora saya?",
          a: "Sesuai hak 'Right to be Forgotten', penghapusan akun akan memicu cascade delete permanen di database: seluruh koleksi tautan, catatan, jadwal pengingat, dan kredensial akun Anda dihapus bersih selamanya.",
        },
        {
          q: "Bagaimana Linkora mematuhi kebijakan Google API User Data Policy?",
          a: "Linkora mematuhi persyaratan Penggunaan Terbatas (Limited Use) dari Google. Kami hanya meminta izin skop paling minimal ('email', 'profile', 'openid') yang mutlak diperlukan untuk otentikasi Single Sign-On.",
        },
      ];

  const sectionsNav = isEn
    ? [
        { id: "sec-intro", title: "1. Scope & Commitment" },
        { id: "sec-collect", title: "2. Data We Collect" },
        { id: "sec-google", title: "3. Google OAuth & Compliance" },
        { id: "sec-ai", title: "4. AI & Gemini Processing" },
        { id: "sec-security", title: "5. Security & Encryption" },
        { id: "sec-rights", title: "6. User Rights & Deletion" },
        { id: "sec-contact", title: "7. Official Channels" },
      ]
    : [
        { id: "sec-intro", title: "1. Lingkup & Komitmen" },
        { id: "sec-collect", title: "2. Data yang Dikumpulkan" },
        { id: "sec-google", title: "3. Kepatuhan Google OAuth" },
        { id: "sec-ai", title: "4. Pemrosesan AI Gemini" },
        { id: "sec-security", title: "5. Keamanan & Enkripsi" },
        { id: "sec-rights", title: "6. Hak Pengguna & Hapus Akun" },
        { id: "sec-contact", title: "7. Kontak Resmi & Saluran" },
      ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col font-sans">
      {/* ── Top Floating Glassmorphic Header ── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-4 md:px-6 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-all p-2 rounded-xl hover:bg-foreground/5 active:scale-95 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
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

      {/* ── Main Container ── */}
      <main className="flex-1 py-8 sm:py-14 relative overflow-hidden">
        {/* Dynamic Glow Meshes */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[340px] sm:w-[600px] md:w-[850px] h-[340px] sm:h-[600px] md:h-[650px] bg-gradient-to-tr from-primary/15 via-purple-500/10 to-cyan-400/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none -z-10" />

        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          {/* ── Hero Greeting Card dengan Maskot Liko & Live Trust Badge ── */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, type: "spring", stiffness: 120 }}
            className="relative p-6 sm:p-8 md:p-10 rounded-3xl sm:rounded-[2.5rem] border border-primary/30 bg-gradient-to-b from-card/90 via-card/70 to-card/90 shadow-2xl backdrop-blur-xl overflow-hidden mb-10 sm:mb-14"
          >
            {/* Shimmer Ambient Accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 text-center md:text-left">
              {/* Maskot Liko Avatar dengan Glow */}
              <div className="relative shrink-0 group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-primary via-accent to-purple-500 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/40 dark:border-white/20 bg-background shadow-xl">
                  <img
                    src="/maskot.jpeg"
                    alt="Liko Mascot Linkora"
                    className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {/* Live Shield Badge */}
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-wider flex items-center gap-1 shadow-md border-2 border-background">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  SAFE
                </div>
              </div>

              {/* Headline & Explanation */}
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isEn ? "100% Transparent • Google OAuth Verified" : "100% Transparan • Terverifikasi Google OAuth"}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  {isEn ? "Your Privacy is " : "Privasi Anda adalah "}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">
                    {isEn ? "Non-Negotiable." : "Prioritas Utama."}
                  </span>
                </h1>

                <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  {isEn
                    ? "Linkora is designed from the ground up to respect your digital workspace. We never sell your bookmarks, monetize your private notes, or misuse your Google profile data."
                    : "Linkora dirancang untuk menghormati kedaulatan ruang kerja digital Anda. Kami tidak pernah menjual tautan yang Anda simpan, mengintip catatan pribadi Anda, ataupun menyalahgunakan data profil Google Anda."}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> {isEn ? "Active SSL/TLS 1.3" : "Enkripsi Aktif SSL/TLS 1.3"}
                  </span>
                  <span>•</span>
                  <span>{isEn ? "Last Updated: September 2026" : "Pembaruan: September 2026"}</span>
                  <span>•</span>
                  <span>{isEn ? "Version 2.0" : "Versi Kebijakan 2.0"}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Mode Switcher: Ringkasan 2 Menit vs Klausul Hukum Lengkap ── */}
          <div className="flex items-center justify-center mb-8 sm:mb-12">
            <div className="p-1.5 rounded-2xl bg-card border border-border/60 shadow-lg flex items-center gap-1">
              <button
                type="button"
                onClick={() => setReadMode("quick")}
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  readMode === "quick"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{isEn ? "Quick Visual Summary (2 Min)" : "Intisari Visual Cepat (2 Menit)"}</span>
              </button>
              <button
                type="button"
                onClick={() => setReadMode("legal")}
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  readMode === "legal"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>{isEn ? "Full Legal Clauses" : "Klausul Hukum Lengkap"}</span>
              </button>
            </div>
          </div>

          {/* ── Quick Visual Summary Mode ── */}
          <AnimatePresence mode="wait">
            {readMode === "quick" && (
              <motion.div
                key="quick-mode"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="space-y-10 sm:space-y-14 mb-12 sm:mb-16"
              >
                {/* 4 Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pillars.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -4 }}
                        className="p-5 sm:p-6 rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <div className={`w-12 h-12 rounded-2xl ${item.bg} border flex items-center justify-center shrink-0`}>
                            <Icon className={`w-6 h-6 ${item.color}`} />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                              {item.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-primary">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isEn ? "Guaranteed in Linkora" : "Terjamin di Linkora"}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ── Matrix: What We Access vs What We NEVER Access ── */}
                <div className="p-6 sm:p-8 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-xl">
                  <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isEn ? "Data Boundaries" : "Batasan Akses Data"}</span>
                    </div>
                    <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                      {isEn ? "What We Access vs What We NEVER Touch" : "Apa yang Kami Akses vs Apa yang TIDAK Pernah Disentuh"}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      {isEn
                        ? "Clear, unambiguous boundaries between your personal privacy and our system."
                        : "Batas tegas dan tanpa kompromi antara privasi pribadi Anda dengan sistem kami."}
                    </p>
                  </div>

                  <div className="divide-y divide-border/60 border border-border/60 rounded-2xl overflow-hidden bg-background/50">
                    {accessMatrix.map((row, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-foreground/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {row.allowed ? (
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                              <XCircle className="w-4 h-4" />
                            </div>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-foreground">
                            {row.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pl-10 sm:pl-0">
                          <span className="text-xs text-muted-foreground">
                            {row.note}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${
                              row.allowed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {row.allowed ? (isEn ? "Permitted" : "Diizinkan") : (isEn ? "NEVER" : "TIDAK PERNAH")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Architecture Data Flow Card ── */}
                <div className="p-6 sm:p-8 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-purple-500/5 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold">
                        {isEn ? "How Your Data Flows in Linkora" : "Alur Keamanan Data di Linkora"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isEn ? "Zero intermediate eavesdropping. Full database encryption." : "Tanpa perantara. Terenkripsi dari browser hingga database."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-card border border-border/60 text-center space-y-1.5 shadow-xs">
                      <div className="w-8 h-8 mx-auto rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h4 className="text-xs font-bold text-foreground">Google OAuth Flow</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {isEn ? "Secure handshake directly with Google server. Verified token issued." : "Handshake aman langsung ke Google. Mengeluarkan token verified."}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-card border border-border/60 text-center space-y-1.5 shadow-xs">
                      <div className="w-8 h-8 mx-auto rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h4 className="text-xs font-bold text-foreground">NextAuth Session JWT</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {isEn ? "Encrypted session stored in HTTP-only, secure browser cookies." : "Sesi dienkripsi kuat di dalam HTTP-only cookie anti-XSS."}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-card border border-border/60 text-center space-y-1.5 shadow-xs">
                      <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <h4 className="text-xs font-bold text-foreground">Supabase PostgreSQL</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {isEn ? "Links & notes isolated by userId with SSL-enforced connections." : "Tautan & catatan terisolasi per user dengan enkripsi SSL database."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Full Legal Clauses Section ── */}
          <div className="space-y-8 sm:space-y-10 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed bg-card/50 border border-border/60 rounded-3xl p-6 sm:p-10 shadow-sm backdrop-blur-md mb-12 sm:mb-16">
            <div className="border-b border-border/60 pb-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    {isEn ? "Official Legal Clauses" : "Klausul Hukum Resmi & Kepatuhan"}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {isEn ? "Standard documentation for Google Cloud verification & user rights." : "Dokumentasi standar untuk verifikasi Google Cloud dan perlindungan pengguna."}
                  </p>
                </div>
                {/* Section Quick Jump Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {sectionsNav.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-foreground/5 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      {sec.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clause 1 */}
            <section id="sec-intro" className="space-y-3 pt-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  1
                </span>
                {isEn ? "Scope & Commitment" : "Lingkup Layanan & Komitmen"}
              </h3>
              <p>
                {isEn
                  ? "Welcome to Linkora (\"we\", \"our\", or \"the platform\"). Linkora provides an intelligent Personal Knowledge Hub that empowers students, job seekers, and professionals to collect bookmarks, author rich documents, track deadlines, and generate insights using artificial intelligence. This Privacy Policy governs our relationship with you regarding how your personal information is treated."
                  : "Selamat datang di Linkora (\"kami\", \"aplikasi\", atau \"platform\"). Linkora menyediakan Personal Knowledge Hub cerdas untuk mengorganisasi tautan, mengelola catatan kaya fitur, melacak peluang karir atau beasiswa, serta merangkum wawasan menggunakan AI. Kebijakan Privasi ini mengatur hubungan kami dengan Anda mengenai bagaimana data Anda diperlakukan dengan penuh tanggung jawab."}
              </p>
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs sm:text-sm text-foreground flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <strong>{isEn ? "Plain Language Summary:" : "Intisari Ringkas:"}</strong>{" "}
                  {isEn
                    ? "We exist solely to give you a clean, productive workspace. We don't track you across the web or sell your habits."
                    : "Tujuan kami semata-mata memberi Anda ruang kerja yang produktif. Kami tidak melacak Anda di web lain atau memperjualbelikan data Anda."}
                </span>
              </div>
            </section>

            {/* Clause 2 */}
            <section id="sec-collect" className="space-y-3 pt-4 border-t border-border/50">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  2
                </span>
                {isEn ? "Information We Collect" : "Informasi yang Kami Kumpulkan"}
              </h3>
              <p>
                {isEn
                  ? "We only collect data strictly necessary to operate your personalized workspace:"
                  : "Kami hanya mengumpulkan data yang mutlak diperlukan untuk operasional ruang kerja Anda:"}
              </p>
              <ul className="space-y-2.5 pl-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground">
                      {isEn ? "Authentication Credentials:" : "Kredensial Akun:"}
                    </strong>{" "}
                    {isEn
                      ? "When logging in via Google OAuth 2.0, we store your Google user ID, verified email address, full name, and avatar image. When using email/password credentials, passwords are encrypted with salted Bcrypt hashes."
                      : "Saat masuk via Google OAuth 2.0, kami menyimpan ID Google, email terverifikasi, nama, dan foto profil. Untuk email/password biasa, kata sandi dienkripsi searah menggunakan Bcrypt ber-salt."}
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground">
                      {isEn ? "Workspace Content:" : "Konten Ruang Kerja:"}
                    </strong>{" "}
                    {isEn
                      ? "Saved URLs, page titles, automated summaries, user-assigned categories, custom tags, rich document notes, folder structures, and reminder deadlines."
                      : "Tautan URL, judul halaman, intisari AI, kategori, tag, catatan dokumen kaya fitur, folder koleksi, dan batas waktu pengingat yang Anda tentukan."}
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <strong className="text-foreground">
                      {isEn ? "Security Tokens & Cookies:" : "Token Keamanan & Cookie:"}
                    </strong>{" "}
                    {isEn
                      ? "NextAuth session cookies (encrypted JWT) to keep your authenticated session securely active without exposing raw credentials."
                      : "Cookie sesi terenkripsi (JWT NextAuth) untuk menjaga sesi login Anda tetap aman tanpa membocorkan kredensial asli."}
                  </div>
                </li>
              </ul>
            </section>

            {/* Clause 3 */}
            <section id="sec-google" className="space-y-3 pt-4 border-t border-border/50">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  3
                </span>
                {isEn ? "Google API Services User Data Policy Compliance" : "Kepatuhan Google API Services User Data Policy"}
              </h3>
              <p>
                {isEn
                  ? "Linkora's use and transfer to any other app of information received from Google APIs will strictly adhere to the "
                  : "Penggunaan dan transfer data yang diterima Linkora dari Google API sepenuhnya tunduk pada ketentuan resmi "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <span>Google API Services User Data Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {isEn
                  ? ", including the Limited Use requirements."
                  : ", termasuk persyaratan Penggunaan Terbatas (Limited Use requirements)."}
              </p>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs sm:text-sm text-foreground space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  {isEn ? "Explicit Affirmation of Limited Use:" : "Penegasan Eksplisit Klausul Limited Use:"}
                </p>
                <p>
                  {isEn
                    ? "We do not transfer or disclose Google user data to third parties, advertising platforms, data brokers, or information resellers. Google user data is strictly utilized to authenticate your identity in Linkora."
                    : "Kami tidak pernah mentransfer atau membagikan data pengguna Google ke pihak ketiga, platform periklanan, broker data, atau pihak lain mana pun. Data pengguna Google semata-mata dipakai untuk otentikasi identitas akun Anda di Linkora."}
                </p>
              </div>
            </section>

            {/* Clause 4 */}
            <section id="sec-ai" className="space-y-3 pt-4 border-t border-border/50">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  4
                </span>
                {isEn ? "Artificial Intelligence & Google Gemini Processing" : "Pemrosesan AI & Google Gemini API"}
              </h3>
              <p>
                {isEn
                  ? "When you trigger AI summarization, semantic search, or smart tagging, the relevant web content or search query is securely processed via the Google Gemini API. These queries are executed purely on-demand, without attaching your personal identity, and are not retained to train public foundational AI models."
                  : "Saat Anda mengaktifkan perangkum AI, pencarian semantik, atau tag pintar, tautan atau teks diproses secara aman melalui Google Gemini API. Pemrosesan ini murni bersifat on-demand, tanpa melampirkan identitas pribadi Anda, dan tidak pernah disimpan untuk melatih model kecerdasan buatan publik."}
              </p>
            </section>

            {/* Clause 5 */}
            <section id="sec-security" className="space-y-3 pt-4 border-t border-border/50">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  5
                </span>
                {isEn ? "Security, Encryption & Storage Architecture" : "Arsitektur Keamanan & Penyimpanan"}
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">{isEn ? "Transit Encryption:" : "Enkripsi Transit:"}</strong>{" "}
                  {isEn
                    ? "All client-server communications are strictly forced over HTTPS / TLS 1.3 protocol."
                    : "Semua komunikasi data antar browser dan server diwajibkan melewati protokol HTTPS / TLS 1.3."}
                </li>
                <li>
                  <strong className="text-foreground">{isEn ? "Cryptographic Hashing:" : "Hashing Kriptografi:"}</strong>{" "}
                  {isEn
                    ? "User passwords use Bcrypt with salt rounds preventing rainbow-table attacks."
                    : "Kata sandi menggunakan Bcrypt dengan salt rounds untuk mencegah serangan rainbow table."}
                </li>
                <li>
                  <strong className="text-foreground">{isEn ? "PostgreSQL Pooler Isolation:" : "Isolasi Database:"}</strong>{" "}
                  {isEn
                    ? "Data is stored on Supabase managed PostgreSQL instances with encrypted connections (pgbouncer port 6543) and scoped relational constraints."
                    : "Data disimpan dalam PostgreSQL terkelola Supabase dengan koneksi terenkripsi (port pooler 6543) dan pembatasan relasional per ID pengguna."}
                </li>
              </ul>
            </section>

            {/* Clause 6 */}
            <section id="sec-rights" className="space-y-3 pt-4 border-t border-border/50">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  6
                </span>
                {isEn ? "User Rights & Permanent Deletion (Right to be Forgotten)" : "Hak Pengguna & Penghapusan Permanen"}
              </h3>
              <p>
                {isEn
                  ? "You retain full authority over your data. Under applicable privacy frameworks (including GDPR & Indonesian PDP Law), you enjoy the right to:"
                  : "Anda memegang kendali penuh atas data Anda. Sesuai regulasi privasi data (termasuk UU Perlindungan Data Pribadi / PDP), Anda memiliki hak untuk:"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-1">
                  <div className="text-xs font-bold text-foreground">{isEn ? "1. Access & Modify" : "1. Akses & Ubah"}</div>
                  <p className="text-[11px] text-muted-foreground">
                    {isEn ? "Update your name, profile photo, and categories whenever you wish." : "Perbarui nama, foto profil, dan koleksi Anda kapan saja."}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-1">
                  <div className="text-xs font-bold text-foreground">{isEn ? "2. Data Portability" : "2. Ekspor Portabel"}</div>
                  <p className="text-[11px] text-muted-foreground">
                    {isEn ? "Export notes and link collections to standard PDF, DOCX, or JSON formats." : "Ekspor catatan dan tautan ke dokumen standar PDF atau DOCX."}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-1">
                  <div className="text-xs font-bold text-foreground">{isEn ? "3. Permanent Erasure" : "3. Hapus Permanen"}</div>
                  <p className="text-[11px] text-muted-foreground">
                    {isEn ? "Request full account deletion, permanently wiping all links, notes, and records." : "Hapus akun secara permanen, menghapus bersih seluruh riwayat data."}
                  </p>
                </div>
              </div>
            </section>

            {/* Clause 7 */}
            <section id="sec-contact" className="space-y-3 pt-4 border-t border-border/50">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                  7
                </span>
                {isEn ? "Official Contact Channels" : "Kontak & Saluran Resmi"}
              </h3>
              <p>
                {isEn
                  ? "For inquiries, data requests, or compliance questions regarding this policy, reach us via:"
                  : "Untuk pertanyaan, permintaan data, atau konfirmasi kepatuhan privasi, hubungi kami melalui:"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="https://www.instagram.com/linkora_new?stkn=OG1lZ2MwaGpybWxm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white transition-all text-xs sm:text-sm font-bold text-foreground group shadow-xs cursor-pointer"
                >
                  <Instagram className="w-4 h-4 text-pink-500 group-hover:text-white transition-colors" />
                  <span>Instagram Resmi: @linkora_new</span>
                </a>
                <a
                  href="mailto:support@linkora.app"
                  className="inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-border/60 bg-foreground/5 hover:bg-primary/10 hover:text-primary transition-all text-xs sm:text-sm font-bold text-foreground shadow-xs cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email: support@linkora.app</span>
                </a>
              </div>
            </section>
          </div>

          {/* ── Interactive FAQ Section ── */}
          <div className="p-6 sm:p-10 rounded-3xl border border-border/60 bg-card/70 backdrop-blur-md shadow-xl mb-12 sm:mb-16">
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{isEn ? "Frequently Asked Questions" : "Pertanyaan Populer"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isEn ? "Privacy FAQ" : "Tanya Jawab Seputar Privasi"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                {isEn
                  ? "Direct answers to the questions our community asks most."
                  : "Jawaban langsung dan jelas atas pertanyaan yang paling sering diajukan."}
              </p>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-border/60 rounded-2xl overflow-hidden bg-background/50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0">
                          Q
                        </span>
                        {faq.q}
                      </span>
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
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
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

          {/* ── Bottom CTA Card ── */}
          <div className="p-8 sm:p-12 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-tr from-primary/20 via-card to-accent/15 border border-primary/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {isEn ? "Ready to organize your digital world safely?" : "Siap menata ruang kerja digital Anda dengan aman?"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {isEn
                ? "Join thousands of students, researchers, and professionals who trust Linkora everyday."
                : "Bergabung bersama mahasiswa, peneliti, dan profesional yang mempercayakan arsip digital mereka pada Linkora."}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
              >
                {isEn ? "Get Started Free" : "Mulai Gratis Sekarang"}
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground text-sm font-semibold transition-all border border-border/60"
              >
                {isEn ? "Explore Features" : "Pelajari Fitur Linkora"}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── Simple Footer ── */}
      <footer className="py-8 border-t border-border/60 bg-background text-center text-xs text-muted-foreground mt-auto">
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
