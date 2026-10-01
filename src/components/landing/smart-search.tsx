"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  MonitorPlay, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  FolderOpen,
  Tag,
  Globe
} from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"
import { useTranslation } from "@/components/providers/i18n-provider"

const getSearchExamples = (locale: string) => [
  {
    id: "magang",
    query: locale === "en" ? "BCA Tech Internship 2026" : "Magang BCA Tech 2026",
    tag: locale === "en" ? "Internship" : "Magang",
    categoryColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    links: [
      {
        title: locale === "en" ? "BCA IT Trainee & Digital Development Program 2026" : "BCA IT Trainee & Program Magang Digital 2026",
        domain: "karir.bca.co.id",
        category: locale === "en" ? "Internship" : "Magang",
        categoryBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        description: locale === "en" ? "Official BCA IT Division recruitment portal. Check requirements, coding test topics, and online application deadline." : "Portal resmi penerimaan magang BCA divisi IT. Cek persyaratan, materi tes koding, dan batas waktu pendaftaran online.",
        icon: Briefcase,
        tags: ["#BCA", "#IT-Trainee", "#FrontEnd"],
        isStar: true,
        aiInsight: locale === "en" ? "Liko AI: 100% matched with 'Magang BCA Tech'" : "Liko AI: Sangat cocok dengan pencarian 'Magang BCA Tech'",
      },
      {
        title: locale === "en" ? "BCA Tech Test & Interview Cheat Sheet Note" : "Catatan Kisi-Kisi Tes Koding & Interview BCA Tech",
        domain: "notes.linkorian.online",
        category: locale === "en" ? "Notes" : "Catatan",
        categoryBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
        description: locale === "en" ? "Personal summary note: HackerRank problem types, logic test patterns, and STAR interview answer templates." : "Catatan ringkasan Liko AI: Tipe soal HackerRank, pola tes logika, dan templat jawaban interview STAR.",
        icon: FileText,
        tags: ["#CatatanLiko", "#HackerRank", "#KisiKisi"],
        isStar: false,
        aiInsight: locale === "en" ? "Liko AI: Related workspace note" : "Liko AI: Catatan ruang kerja terkait",
      },
    ],
  },
  {
    id: "lpdp",
    query: locale === "en" ? "LPDP Scholarship 2026" : "Beasiswa LPDP 2026",
    tag: locale === "en" ? "Scholarship" : "Beasiswa",
    categoryColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    links: [
      {
        title: locale === "en" ? "Official LPDP Scholarship Portal 2026 - Kemenkeu RI" : "Portal Resmi Pendaftaran Beasiswa LPDP 2026 - Kemenkeu RI",
        domain: "beasiswalpdp.kemenkeu.go.id",
        category: locale === "en" ? "Scholarship" : "Beasiswa",
        categoryBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
        description: locale === "en" ? "Official registration guidelines for Master's & Doctoral programs. Link to download booklet and recommendation letter formats." : "Panduan resmi pendaftaran LPDP Magister & Doktoral. Link download booklet syarat dan format surat rekomendasi.",
        icon: GraduationCap,
        tags: ["#LPDP2026", "#Kemenkeu", "#Magister"],
        isStar: true,
        aiInsight: locale === "en" ? "Liko AI: Direct match for LPDP Scholarship" : "Liko AI: Sangat cocok dengan Beasiswa LPDP",
      },
      {
        title: locale === "en" ? "LPDP Essay Template & Study Plan Draft" : "Templat Esai & Rencana Studi Beasiswa LPDP 2026",
        domain: "notes.linkorian.online",
        category: locale === "en" ? "Notes" : "Catatan",
        categoryBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        description: locale === "en" ? "Draft structure for 1,500-word Commitment to Returning to Indonesia essay and study plan outline." : "Draft struktur esai Komitmen Kembali ke Indonesia & Rencana Kontribusi 1500 kata.",
        icon: FileText,
        tags: ["#CatatanLiko", "#EsaiLPDP", "#Draft"],
        isStar: true,
        aiInsight: locale === "en" ? "Liko AI: High relevance study draft" : "Liko AI: Draft esai relevansi tinggi",
      },
    ],
  },
  {
    id: "database",
    query: locale === "en" ? "Database Architecture & SQL Notes" : "Catatan Basis Data & SQL",
    tag: locale === "en" ? "Notes" : "Catatan",
    categoryColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    links: [
      {
        title: locale === "en" ? "Database Normalization Summary (1NF to BCNF)" : "Ringkasan Kuliah Normalisasi Database (1NF - BCNF)",
        domain: "notes.linkorian.online",
        category: locale === "en" ? "Education" : "Pendidikan",
        categoryBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        description: locale === "en" ? "Liko AI Note: Functional Dependency concepts, BCNF decomposition examples, and complex SQL JOIN query exercises." : "Catatan Liko AI: Konsep Functional Dependency, contoh dekombinasi BCNF, dan latihan query SQL JOIN kompleks.",
        icon: FileText,
        tags: ["#BasisData", "#SQL", "#Normalisasi"],
        isStar: true,
        aiInsight: locale === "en" ? "Liko AI: Lecture summary note" : "Liko AI: Ringkasan materi kuliah",
      },
      {
        title: locale === "en" ? "PostgreSQL Performance Optimization Cheat Sheet" : "Cheat Sheet Optimasi Query & Indexing PostgreSQL",
        domain: "github.com",
        category: locale === "en" ? "Resource" : "Resource",
        categoryBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        description: locale === "en" ? "Guide on B-Tree indexing, EXPLAIN ANALYZE execution plans, and query speed-up strategies." : "Panduan pemahaman B-Tree index, analisis EXPLAIN ANALYZE, dan strategi percepatan query database.",
        icon: MonitorPlay,
        tags: ["#PostgreSQL", "#Indexing", "#Resource"],
        isStar: false,
        aiInsight: locale === "en" ? "Liko AI: Related tech bookmark" : "Liko AI: Tautan teknik terverifikasi",
      },
    ],
  },
  {
    id: "design",
    query: locale === "en" ? "UI Design System Masterclass" : "Workshop UI Design System",
    tag: locale === "en" ? "Design" : "Design",
    categoryColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    links: [
      {
        title: locale === "en" ? "Linkorian UI Design System & Component Library" : "Figma Design System Kit & Component Library 2026",
        domain: "figma.com",
        category: locale === "en" ? "Design" : "Design",
        categoryBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
        description: locale === "en" ? "Figma file containing Auto-layout v5 components, glassmorphic design tokens, and Tailwind CSS variable mappings." : "File Figma resmi berisi komponen Auto-layout v5, design tokens glassmorphism, dan variabel Tailwind CSS.",
        icon: MonitorPlay,
        tags: ["#Figma", "#DesignSystem", "#UIUX"],
        isStar: true,
        aiInsight: locale === "en" ? "Liko AI: Master Figma component asset" : "Liko AI: Asset komponen Figma utama",
      },
      {
        title: locale === "en" ? "Responsive Web Design Systems Video Workshop" : "Recording Video Workshop System Design Responsif",
        domain: "youtube.com",
        category: locale === "en" ? "Resource" : "Resource",
        categoryBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
        description: locale === "en" ? "2-hour recorded live coding session building responsive UI systems with CSS variables and React hooks." : "Video rekaman 2 jam sesi live coding pembuatan sistem desain UI responsif dengan variabel CSS dan React hooks.",
        icon: MonitorPlay,
        tags: ["#Video", "#Tutorial", "#LiveCoding"],
        isStar: false,
        aiInsight: locale === "en" ? "Liko AI: Video learning resource" : "Liko AI: Video panduan workshop",
      },
    ],
  },
]

export function SmartSearchDemo() {
  const { locale } = useTranslation()
  const searchExamples = getSearchExamples(locale)
  const [currentIndex, setCurrentIndex] = useState(1) // Default Beasiswa LPDP
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % searchExamples.length)
    }, 4200)
    return () => clearInterval(timer)
  }, [isPaused, searchExamples.length])

  const current = searchExamples[currentIndex] || searchExamples[0]

  return (
    <section id="demo" className="py-10 sm:py-16 md:py-20 relative overflow-hidden bg-background">
      {/* Glow aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] md:w-[850px] h-[340px] sm:h-[650px] md:h-[850px] bg-primary/15 rounded-full blur-[90px] sm:blur-[140px] pointer-events-none" />

      <div className="container px-3.5 sm:px-6 relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-2.5 sm:mb-4 text-foreground font-heading"
          >
            {locale === "en" ? "Find Any Information " : "Temukan Informasi Apapun "}<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">
              {locale === "en" ? "in Milliseconds" : "dalam Hitungan Milidetik"}
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {locale === "en"
              ? "Experience Linkorian's actual workspace interface: instant semantic search, Liko AI tags, and smart bookmark cards."
              : "Rasakan antarmuka asli ruang kerja Linkorian: pencarian semantik instan, tag Liko AI, dan kartu bookmark cerdas."}
          </motion.p>
        </div>

        {/* ── Realistic Linkorian App Window Frame ── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-primary/30 bg-card/90 shadow-2xl shadow-primary/15 backdrop-blur-xl overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* App Header Bar Inside Window */}
          <div className="p-4 sm:p-6 border-b border-border/50 bg-background/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-primary/30 shadow-xs shrink-0">
                  <img src="/icon.jpg" alt="Linkorian Icon" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground font-heading flex items-center gap-1.5">
                    <LinkoraText /> <span>Workspace</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{locale === "en" ? "Personal Knowledge Hub" : "Ruang Kerja Digital Pribadi"}</p>
                </div>
              </div>
            </div>

            {/* Quick Search Preset Tags */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1">
              <span className="text-xs text-muted-foreground font-medium mr-1 hidden sm:inline">{locale === "en" ? "Suggested Query:" : "Coba Pencarian:"}</span>
              {searchExamples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer touch-manipulation select-none flex items-center gap-1.5 ${
                    currentIndex === idx
                      ? "bg-primary text-primary-foreground shadow-md font-bold ring-2 ring-primary/30"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                  }`}
                >
                  <span>{ex.query}</span>
                </button>
              ))}
            </div>

            {/* Linkorian Real Search Bar Input */}
            <div className="relative flex items-center rounded-2xl border-2 border-primary/50 bg-background shadow-lg shadow-primary/10 overflow-hidden">
              <div className="pl-4 pr-2 text-primary flex items-center shrink-0">
                <Search className="w-5 h-5 animate-pulse" />
              </div>

              <div className="flex-1 py-3 px-2 overflow-hidden relative min-h-[44px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs sm:text-sm md:text-base font-semibold text-foreground flex items-center gap-2 w-full truncate"
                  >
                    <span>{current.query}</span>
                    <span className="w-0.5 h-4 sm:h-5 bg-primary animate-pulse shrink-0" />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="pr-3 shrink-0 flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-[11px] font-mono text-muted-foreground border border-border/60">
                  Liko AI
                </span>
              </div>
            </div>
          </div>

          {/* Results Area (Rendering Authentic Linkorian Link Cards) */}
          <div className="p-4 sm:p-6 bg-muted/20 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                <span>{locale === "en" ? `Smart Results for "${current.query}"` : `Hasil Pencarian Cerdas untuk "${current.query}"`}</span>
              </div>
              <span className="text-[11px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                ⚡ {locale === "en" ? "0.04s Instant Match" : "Instan 0.04s"}
              </span>
            </div>

            {/* 2 Authentic Linkorian Cards Stack */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3.5"
              >
                {current.links.map((linkItem, idx) => {
                  const ItemIcon = linkItem.icon
                  return (
                    <div
                      key={idx}
                      className="group p-4 sm:p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden"
                    >
                      {/* Top Row: Icon + Title + Domain + Action Buttons */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Category Icon Badge */}
                          <div className={`p-2.5 sm:p-3 rounded-xl border ${linkItem.categoryBg} shrink-0 shadow-xs mt-0.5`}>
                            <ItemIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-foreground text-xs sm:text-base leading-snug group-hover:text-primary transition-colors">
                                {linkItem.title}
                              </h4>
                            </div>

                            {/* Metadata Pills: Domain & Category */}
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-[11px] border border-border/60">
                                <Globe className="w-3 h-3 text-muted-foreground" />
                                <span>{linkItem.domain}</span>
                              </span>

                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${linkItem.categoryBg}`}>
                                {linkItem.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Open Link */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            type="button"
                            className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium pl-1">
                        {linkItem.description}
                      </p>

                      {/* Bottom Row: Tags & Liko AI Insight */}
                      <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {linkItem.tags.map((tagStr, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded-md bg-foreground/5 text-muted-foreground font-semibold">
                              {tagStr}
                            </span>
                          ))}
                        </div>

                        <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                          <span>{linkItem.aiInsight}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Footer inside Window */}
          <div className="px-4 py-3 bg-muted/40 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{locale === "en" ? "Real-time AI Indexing Active" : "Sinkronisasi AI Real-Time Aktif"}</span>
            </span>
            <span className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1">
              <span>{locale === "en" ? "Explore Full Dashboard" : "Coba Selengkapnya di Dashboard"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
