"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Scale,
  ShieldAlert,
  UserCheck,
  ArrowLeft,
  Mail,
  Instagram,
  CheckCircle2,
  XCircle,
  Lock,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Zap,
} from "lucide-react";
import { LinkoraText } from "@/components/ui/linkora-text";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/components/providers/i18n-provider";
import { BackToTop } from "@/components/ui/back-to-top";

export default function TermsPage() {
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
          icon: Scale,
          color: "text-blue-500 dark:text-blue-400",
          bg: "bg-blue-500/10 border-blue-500/20",
          title: "100% User Data Ownership",
          desc: "You retain full ownership and intellectual property rights over all links, notes, documents, and assets created on Linkora.",
        },
        {
          icon: UserCheck,
          color: "text-emerald-500 dark:text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/20",
          title: "Fair & Ethical Access",
          desc: "Free and transparent platform usage with zero hidden subscription traps or mandatory paid paywalls for core features.",
        },
        {
          icon: ShieldAlert,
          color: "text-purple-500 dark:text-purple-400",
          bg: "bg-purple-500/10 border-purple-500/20",
          title: "Zero Abuse Tolerance",
          desc: "Strict prohibition against automated spam, malicious code distribution, system exploitation, or unauthorized API abuse.",
        },
        {
          icon: Lock,
          color: "text-cyan-500 dark:text-cyan-400",
          bg: "bg-cyan-500/10 border-cyan-500/20",
          title: "Account Sovereignty",
          desc: "Complete freedom to export your content or permanently delete your account and associated data at any time.",
        },
      ]
    : [
        {
          icon: Scale,
          color: "text-blue-500 dark:text-blue-400",
          bg: "bg-blue-500/10 border-blue-500/20",
          title: "Kepemilikan Hak Cipta 100%",
          desc: "Anda memegang hak milik dan hak cipta penuh atas seluruh tautan, catatan, dokumen, dan konten yang disimpan di Linkora.",
        },
        {
          icon: UserCheck,
          color: "text-emerald-500 dark:text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/20",
          title: "Akses Adil & Transparan",
          desc: "Penggunaan platform yang adil tanpa jebakan biaya tersembunyi atau pemblokiran fitur utama untuk pengguna.",
        },
        {
          icon: ShieldAlert,
          color: "text-purple-500 dark:text-purple-400",
          bg: "bg-purple-500/10 border-purple-500/20",
          title: "Zero Abuse & Keamanan",
          desc: "Larangan keras terhadap penyalahgunaan sistem, penyebaran malware, peretasan, maupun spamming otomatis.",
        },
        {
          icon: Lock,
          color: "text-cyan-500 dark:text-cyan-400",
          bg: "bg-cyan-500/10 border-cyan-500/20",
          title: "Kebebasan Pengguna",
          desc: "Hak penuh untuk mengekspor dokumen Anda atau menghapus akun beserta seluruh data terkait kapan saja.",
        },
      ];

  const faqs = isEn
    ? [
        {
          q: "Do I retain full rights to the documents and links I save?",
          a: "Yes, absolutely. Linkora claims zero ownership over your personal links, document drafts, notes, or uploaded assets. You maintain 100% intellectual property ownership.",
        },
        {
          q: "What happens if I decide to delete my Linkora account?",
          a: "When you request account deletion from your profile settings, your account, authentication tokens, and personal stored links/notes are permanently erased from our primary databases.",
        },
        {
          q: "Are there any strict prohibitions I should be aware of?",
          a: "You may not use Linkora to distribute malware, attempt SQL injection/cyber attacks, engage in automated bot scraping, or store content that violates applicable internet laws.",
        },
        {
          q: "How are updates to these Terms communicated?",
          a: "Any significant changes to our Terms of Service will be posted on this page with an updated 'Effective Date' and, when necessary, announced via email or platform notification.",
        },
      ]
    : [
        {
          q: "Apakah saya memegang hak cipta penuh atas dokumen dan tautan saya?",
          a: "Ya, 100%. Linkora tidak pernah mengklaim kepemilikan atas tautan pribadi, dokumen, catatan, atau berkas yang Anda simpan. Seluruh hak cipta sepenuhnya milik Anda.",
        },
        {
          q: "Apa yang terjadi jika saya memutuskan untuk menghapus akun?",
          a: "Jika Anda mengajukan penghapusan akun dari halaman profil, akun Anda beserta seluruh tautan dan catatan yang tersimpan akan dihapus secara permanen dari database utama kami.",
        },
        {
          q: "Apa saja larangan utama dalam penggunaan layanan Linkora?",
          a: "Anda dilarang menggunakan Linkora untuk menyebarkan malware, mencoba peretasan/eksploitasi sistem, melakukan bot scraping otomatis, atau menyimpan konten ilegal yang melanggar hukum.",
        },
        {
          q: "Bagaimana jika ada pembaruan pada Ketentuan Layanan ini?",
          a: "Perubahan penting pada Ketentuan Layanan akan diperbarui di halaman ini dengan tanggal efektif baru dan diumumkan melalui pemberitahuan aplikasi atau email resmi.",
        },
      ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary relative overflow-x-hidden">
      {/* Background Subtle Gradient Blurs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
        <div className="absolute top-1/3 right-10 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px] dark:bg-cyan-500/15" />
        <div className="absolute bottom-10 left-10 h-[450px] w-[450px] rounded-full bg-purple-500/10 blur-[110px] dark:bg-purple-500/15" />
      </div>

      <div className="relative z-10">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>{isEn ? "Back to Homepage" : "Kembali ke Beranda"}</span>
            </Link>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                href="/login"
                className="hidden rounded-xl bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary border border-primary/20 transition-all hover:bg-primary/20 sm:inline-flex"
              >
                {isEn ? "Sign In" : "Masuk Akun"}
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Header */}
        <section className="mx-auto max-w-4xl px-4 pt-12 pb-8 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary shadow-sm mb-6">
              <Scale className="h-4 w-4" />
              <span>{isEn ? "Terms of Service Agreement" : "Ketentuan Layanan & Syarat Penggunaan"}</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl font-heading">
              {isEn ? "Terms of Service" : "Ketentuan Layanan"} <LinkoraText />
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              {isEn
                ? "Transparent, fair, and user-first principles governing your access and usage of Linkora platform."
                : "Aturan penggunaan yang adil, transparan, dan melindungi hak Anda sebagai pengguna platform Linkora."}
            </p>

            <div className="mt-4 text-xs font-medium text-muted-foreground/80 flex items-center justify-center gap-2">
              <span>{isEn ? "Effective Date:" : "Berlaku Efektif:"} 14 September 2026</span>
              <span>•</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> {isEn ? "Official Legal Terms" : "Dokumen Hukum Resmi"}
              </span>
            </div>
          </motion.div>

          {/* Mode Switcher Tabs */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-2xl border border-border/80 bg-card/60 p-1.5 backdrop-blur-md shadow-inner">
              <button
                type="button"
                onClick={() => setReadMode("quick")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  readMode === "quick"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>{isEn ? "Quick Summary" : "Ringkasan Poin Utama"}</span>
              </button>
              <button
                type="button"
                onClick={() => setReadMode("legal")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  readMode === "legal"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{isEn ? "Full Legal Terms" : "Klausul Hukum Lengkap"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4 Core Pillars Grid */}
        <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="group relative rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-xl shadow-md transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div
                  className={`inline-flex rounded-xl border p-2.5 ${pillar.bg} ${pillar.color} mb-3`}
                >
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground font-heading">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed font-medium">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Main Content Body */}
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="rounded-3xl border border-border/80 bg-card/80 p-6 backdrop-blur-2xl shadow-xl sm:p-10">
            <AnimatePresence mode="wait">
              {readMode === "quick" ? (
                <motion.div
                  key="quick-summary"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex items-start gap-3.5">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                      {isEn ? (
                        <>
                          <strong className="text-foreground">In simple terms:</strong> Linkora is designed to be your trusted personal digital workspace. You own 100% of your data, you can delete your account anytime, and we promise never to lock your data behind unethical paywalls.
                        </>
                      ) : (
                        <>
                          <strong className="text-foreground">Secara sederhana:</strong> Linkora dirancang sebagai ruang kerja digital pribadi Anda. Anda memegang 100% hak atas konten Anda, bebas mengekspor atau menghapus data kapan saja, tanpa jebakan biaya tersembunyi.
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Card 1 */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 font-heading">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs font-extrabold text-primary">1</span>
                      {isEn ? "Account Creation & Eligibility" : "Ketentuan Akun & Pendaftaran"}
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground pl-8 list-disc font-medium leading-relaxed">
                      <li>{isEn ? "You must be at least 13 years old (or equivalent legal age in your jurisdiction) to use Linkora." : "Pengguna berusia minimal 13 tahun (atau usia legal yang berlaku) untuk menggunakan platform Linkora."}</li>
                      <li>{isEn ? "You are responsible for keeping your login credentials and Google OAuth session safe." : "Anda bertanggung jawab penuh atas keamanan kredensial akun dan sesi login Google OAuth Anda."}</li>
                    </ul>
                  </div>

                  {/* Quick Card 2 */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 font-heading">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs font-extrabold text-primary">2</span>
                      {isEn ? "Your Content & Rights" : "Hak Cipta & Kebebasan Konten"}
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground pl-8 list-disc font-medium leading-relaxed">
                      <li>{isEn ? "All links, documents, notes, and metadata you save belong exclusively to you." : "Seluruh tautan, dokumen, catatan, dan metadata yang Anda simpan adalah milik pribadi Anda 100%."}</li>
                      <li>{isEn ? "Linkora never claims ownership or monetizes your personal content." : "Linkora tidak pernah mengambil alih hak cipta maupun menjual konten pribadi Anda kepada pihak mana pun."}</li>
                    </ul>
                  </div>

                  {/* Quick Card 3 */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2 font-heading">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs font-extrabold text-primary">3</span>
                      {isEn ? "Prohibited Activities" : "Hal-Hal yang Dilarang"}
                    </h3>
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-500">
                        <XCircle className="h-4 w-4" />
                        <span>{isEn ? "Strictly Forbidden on Linkora:" : "Dilarang Keras di Linkora:"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {isEn
                          ? "Attempting automated cyber attacks, reverse engineering, storing malware, distributing illegal payloads, or abusing platform APIs."
                          : "Melakukan serangan cyber otomatis, peretasan, menyimpan malware, menyebarkan konten ilegal, atau menyalahgunakan API platform."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/60 text-center">
                    <button
                      type="button"
                      onClick={() => setReadMode("legal")}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      <span>{isEn ? "Read the Complete Legal Document Below" : "Baca Dokumen Legalitas Selengkapnya"}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="legal-terms"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="prose dark:prose-invert max-w-none space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium"
                >
                  {/* Section 1 */}
                  <div id="section-1" className="space-y-3">
                    <h2 className="text-lg font-bold text-foreground font-heading tracking-tight border-b border-border/60 pb-2">
                      1. {isEn ? "Acceptance of Terms" : "Penerimaan Ketentuan Layanan"}
                    </h2>
                    <p>
                      {isEn ? (
                        <>
                          By accessing, registering, or using <LinkoraText /> (accessible via <strong className="text-foreground">https://linkorian.online</strong> or associated subdomains), you enter into a legally binding agreement governed by these Terms of Service. If you do not agree to these terms, please discontinue platform usage immediately.
                        </>
                      ) : (
                        <>
                          Dengan mengakses, mendaftar, atau menggunakan platform <LinkoraText /> (dapat diakses melalui <strong className="text-foreground">https://linkorian.online</strong> atau subdomain resminya), Anda menyetujui untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak menyetujui ketentuan ini, harap hentikan penggunaan platform.
                        </>
                      )}
                    </p>
                  </div>

                  {/* Section 2 */}
                  <div id="section-2" className="space-y-3">
                    <h2 className="text-lg font-bold text-foreground font-heading tracking-tight border-b border-border/60 pb-2">
                      2. {isEn ? "Description of Service" : "Deskripsi & Cakupan Layanan"}
                    </h2>
                    <p>
                      {isEn ? (
                        <>
                          <LinkoraText /> provides a unified personal digital workspace empowering users to aggregate bookmark links, organize categories with Liko AI assistant, edit rich WYSIWYG documents, schedule reminders, and synchronize digital knowledge assets seamlessly across devices.
                        </>
                      ) : (
                        <>
                          <LinkoraText /> menyediakan ruang kerja digital pribadi yang memungkinkan pengguna mengelola bookmark tautan, merapikan kategori dengan asisten AI Liko, mengedit dokumen profesional, mengatur pengingat jadwal, serta menyinkronkan aset pengetahuan secara aman.
                        </>
                      )}
                    </p>
                  </div>

                  {/* Section 3 */}
                  <div id="section-3" className="space-y-3">
                    <h2 className="text-lg font-bold text-foreground font-heading tracking-tight border-b border-border/60 pb-2">
                      3. {isEn ? "User Account & Security Obligations" : "Akun Pengguna & Kewajiban Keamanan"}
                    </h2>
                    <p>
                      {isEn
                        ? "To access features, you must authenticate via Google OAuth 2.0 or valid email credentials. You agree to maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access."
                        : "Untuk mengakses fitur, Anda perlu melakukan autentikasi melalui Google OAuth 2.0 atau email yang valid. Anda bertanggung jawab menjaga kerahasiaan akun dan wajib memberi tahu kami jika terjadi akses tidak sah."}
                    </p>
                  </div>

                  {/* Section 4 */}
                  <div id="section-4" className="space-y-3">
                    <h2 className="text-lg font-bold text-foreground font-heading tracking-tight border-b border-border/60 pb-2">
                      4. {isEn ? "Intellectual Property & Content Rights" : "Hak Cipta & Hak Milik Konten"}
                    </h2>
                    <p>
                      {isEn ? (
                        <>
                          You retain 100% full intellectual property ownership over all content, links, notes, and document drafts created or uploaded to <LinkoraText />. Linkora claims zero ownership or exclusive licensing over your user content.
                        </>
                      ) : (
                        <>
                          Anda memegang 100% hak cipta dan hak milik intelektual atas seluruh konten, tautan, dokumen, dan catatan yang Anda buat atau simpan di <LinkoraText />. Linkora tidak pernah mengklaim hak kepemilikan atas konten Anda.
                        </>
                      )}
                    </p>
                  </div>

                  {/* Section 5 */}
                  <div id="section-5" className="space-y-3">
                    <h2 className="text-lg font-bold text-foreground font-heading tracking-tight border-b border-border/60 pb-2">
                      5. {isEn ? "Prohibited Activities & System Protection" : "Batasan & Penggunaan Yang Dilarang"}
                    </h2>
                    <p>
                      {isEn
                        ? "Users are explicitly prohibited from engaging in automated bot scraping, launching cyber attacks, distributing malware/phishing payloads, or violating applicable internet communications laws."
                        : "Pengguna dilarang keras melakukan bot scraping otomatis, mencoba serangan siber, menyebarkan malware/phishing, atau melanggar hukum komunikasi internet yang berlaku."}
                    </p>
                  </div>

                  {/* Section 6 */}
                  <div id="section-6" className="space-y-3">
                    <h2 className="text-lg font-bold text-foreground font-heading tracking-tight border-b border-border/60 pb-2">
                      6. {isEn ? "Disclaimer of Warranties & Liability" : "Penolakan Jaminan & Batasan Tanggung Jawab"}
                    </h2>
                    <p>
                      {isEn ? (
                        <>
                          <LinkoraText /> is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. While we maintain 99.9% high availability, we recommend utilizing built-in export features for important document backups.
                        </>
                      ) : (
                        <>
                          <LinkoraText /> disediakan dalam kondisi &ldquo;SEBAGAIMANA ADANYA&rdquo;. Meskipun kami menjaga ketersediaan sistem yang tinggi, kami menyarankan pengguna memanfaatkan fitur ekspor untuk cadangan dokumen penting.
                        </>
                      )}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>FAQ</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl font-heading">
              {isEn ? "Frequently Asked Questions" : "Pertanyaan yang Sering Diajukan"}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-4.5 text-left text-xs sm:text-sm font-bold text-foreground cursor-pointer focus-visible:outline-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t border-border/40 px-4.5 py-4 text-xs text-muted-foreground leading-relaxed font-medium bg-muted/20">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Official Contact & Legal Inquiries */}
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 backdrop-blur-2xl text-center shadow-xl">
            <Mail className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground font-heading">
              {isEn ? "Legal & Terms Support Contact" : "Kontak Pertanyaan Hukum & Ketentuan"}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto font-medium">
              {isEn
                ? "For inquiries regarding these Terms of Service or official developer verification:"
                : "Jika Anda memiliki pertanyaan mengenai Ketentuan Layanan atau verifikasi pengembang:"}
            </p>

            <div className="mt-6 flex items-center justify-center">
              <a
                href="mailto:supportlinkorian@gmail.com"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary-hover active:scale-95"
              >
                <Mail className="h-4 w-4" />
                <span>supportlinkorian@gmail.com</span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-card/40 py-8 backdrop-blur-md text-center text-xs text-muted-foreground">
          <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
            <div className="flex items-center gap-2">
              <LinkoraText />
              <span>© {new Date().getFullYear()} Linkorian. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                {isEn ? "Privacy Policy" : "Kebijakan Privasi"}
              </Link>
              <Link href="/terms" className="text-primary font-bold hover:underline">
                {isEn ? "Terms of Service" : "Ketentuan Layanan"}
              </Link>
              <Link href="/" className="hover:text-foreground transition-colors">
                {isEn ? "Homepage" : "Beranda"}
              </Link>
            </div>
          </div>
        </footer>
      </div>

      <BackToTop />
    </div>
  );
}
