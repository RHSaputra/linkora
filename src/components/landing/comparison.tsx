"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Check,
  X,
  Minus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { LinkoraText } from "@/components/ui/linkora-text"
import { useTranslation } from "@/components/providers/i18n-provider"

interface FeatureItem {
  id: string
  name: string
  bookmark: "Yes" | "No" | "Limited"
  notes: "Yes" | "No" | "Limited"
  linkora: "Yes"
}

const getFeatures = (locale: string): FeatureItem[] => [
  {
    id: "links",
    name: locale === "en" ? "Cross-Platform Link Archiving & Previews" : "Simpan & Arsip Multi-Platform Links",
    bookmark: "Yes",
    notes: "Limited",
    linkora: "Yes",
  },
  {
    id: "editor",
    name: locale === "en" ? "Rich Document Editor (Word-Style Tools)" : "Editor Catatan Lengkap (Word-Style Tools)",
    bookmark: "No",
    notes: "Yes",
    linkora: "Yes",
  },
  {
    id: "opportunity",
    name: locale === "en" ? "Opportunity Tracker (Internships, Grants, Contests)" : "Opportunity Tracker (Magang, Beasiswa, Lomba)",
    bookmark: "No",
    notes: "No",
    linkora: "Yes",
  },
  {
    id: "ai-summary",
    name: locale === "en" ? "Automated AI Summaries & Takeaways" : "AI Ringkasan Intisari Otomatis",
    bookmark: "No",
    notes: "No",
    linkora: "Yes",
  },
  {
    id: "search",
    name: locale === "en" ? "Instant Semantic Natural Language Search" : "Smart Semantic Search Instan",
    bookmark: "Limited",
    notes: "Limited",
    linkora: "Yes",
  },
  {
    id: "deadline",
    name: locale === "en" ? "Deadline Tracker & Reminder Notifications" : "Deadline Tracker & Status Berkas",
    bookmark: "No",
    notes: "No",
    linkora: "Yes",
  },
  {
    id: "all-in-one",
    name: locale === "en" ? "All-in-One Unified Digital Workspace" : "All-in-One Ruang Kerja Terpadu",
    bookmark: "No",
    notes: "No",
    linkora: "Yes",
  },
]

export function Comparison() {
  const { locale } = useTranslation()
  const features = getFeatures(locale)
  const isEn = locale === "en"

  // Interactive state
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<"all" | "bookmark" | "notes">("all")

  const renderCompetitorIcon = (status: "Yes" | "No" | "Limited") => {
    if (status === "Yes") {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs transition-transform duration-200 group-hover:scale-105">
          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
        </div>
      )
    }
    if (status === "Limited") {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-2xs transition-transform duration-200 group-hover:scale-105">
          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3.5]" />
        </div>
      )
    }
    return (
      <div className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 shadow-2xs transition-transform duration-200 group-hover:scale-105">
        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
      </div>
    )
  }

  const renderLinkoraCheck = (isHovered: boolean) => (
    <div className="flex items-center justify-center py-0.5">
      <motion.div
        animate={isHovered ? { scale: [1, 1.15, 1.08] } : { scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative inline-flex items-center justify-center"
      >
        {/* Glow ambient ring */}
        <div className="absolute inset-0 rounded-full bg-primary/40 blur-xs animate-pulse" />
        
        {/* Glowing gradient button checkmark */}
        <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-primary via-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-md shadow-primary/40 ring-1.5 ring-primary/30">
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3.5] drop-shadow" />
        </div>
      </motion.div>
    </div>
  )

  return (
    <section className="py-10 sm:py-14 md:py-16 relative overflow-hidden bg-background">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] lg:w-[800px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-[90px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="container px-3.5 sm:px-6 relative z-10 max-w-5xl mx-auto">
        
        {/* ========================================================================= */}
        {/* SECTION HEADER (RATA TENGAH - UKURAN PENUH) */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-3 sm:mb-4 text-foreground leading-[1.15] text-center"
          >
            {isEn ? "Why Switch to " : "Mengapa Harus Beralih ke "}<span className="inline-block whitespace-nowrap"><LinkoraText />?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed text-center"
          >
            {isEn
              ? "See how Linkorian replaces chaotic browser bookmarks and messy notes with a powerful, all-in-one AI operating system."
              : "Bandingkan bagaimana Linkorian menyatukan semua yang kamu butuhkan dalam satu sistem cerdas, menggantikan batas alat konvensional."}
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE SEGMENTED CONTROL (Touch Selector for HP/Mobile) */}
        {/* ========================================================================= */}
        <div className="md:hidden flex items-center justify-center mb-4">
          <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 shadow-xs">
            <button
              type="button"
              onClick={() => setMobileTab("all")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                mobileTab === "all"
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {isEn ? "All Matrix" : "Semua Kolom"}
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("bookmark")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                mobileTab === "bookmark"
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              vs Bookmark
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("notes")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                mobileTab === "notes"
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              vs Catatan
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPARISON CARD CONTAINER (Sleek Compact Architecture) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-4xl mx-auto rounded-2xl sm:rounded-3xl p-[1.5px] bg-gradient-to-b from-primary/35 via-white/15 to-primary/30 dark:from-primary/45 dark:via-white/10 dark:to-purple-500/35 shadow-xl shadow-primary/10 overflow-hidden"
        >
          {/* Inner Card */}
          <div className="rounded-[22px] overflow-hidden bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl">
            
            {/* Mobile Scroll Indicator Cue (Only when 'all' tab is selected) */}
            {mobileTab === "all" && (
              <div className="md:hidden flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10 border-b border-primary/20 text-[11px] font-semibold text-primary">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {isEn ? "Feature Matrix" : "Matriks Fitur"}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-primary/80 animate-pulse">
                  {isEn ? "Swipe horizontally →" : "Geser ke samping →"}
                </span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FULL MATRIX TABLE (Desktop, Tablet, & Mobile 'all' mode) */}
            {/* ========================================================================= */}
            {(mobileTab === "all" || typeof window === "undefined") && (
              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left border-collapse min-w-[540px] sm:min-w-[660px] md:min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-900/60">
                      
                      {/* COL 1: FITUR & KAPABILITAS (RATA TENGAH - HANYA TEKS BOLD) */}
                      <th className="py-4 px-4 sm:px-6 text-center font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base uppercase tracking-wider w-[36%] sm:w-[34%] sticky left-0 z-20 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-md md:static md:bg-transparent border-r border-slate-200/60 dark:border-white/5 md:border-r-0">
                        {isEn ? "Features & Capabilities" : "Fitur & Kapabilitas"}
                      </th>

                      {/* COL 2: BOOKMARK BROWSER (HANYA TEKS BOLD) */}
                      <th className="py-4 px-2.5 sm:px-4 text-center w-[20%] sm:w-[21%]">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm md:text-base tracking-tight block">
                          {isEn ? "Browser Bookmarks" : "Bookmark Browser"}
                        </span>
                      </th>

                      {/* COL 3: APLIKASI CATATAN (HANYA TEKS BOLD) */}
                      <th className="py-4 px-2.5 sm:px-4 text-center w-[20%] sm:w-[21%]">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm md:text-base tracking-tight block">
                          {isEn ? "Standard Notes" : "Aplikasi Catatan"}
                        </span>
                      </th>

                      {/* COL 4: LINKORIAN (THE STAR COLUMN - TANPA BADGE PALING LENGKAP) */}
                      <th className="py-4 px-2.5 sm:px-4 text-center w-[24%] sm:w-[24%] relative bg-gradient-to-b from-primary/[0.18] via-primary/[0.10] to-purple-500/[0.18] border-l-2 border-r border-primary/40 shadow-inner">
                        <div className="flex flex-col items-center justify-center">
                          <div className="scale-95 sm:scale-105 mb-0.5 filter drop-shadow">
                            <LinkoraText />
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-primary dark:text-blue-300 tracking-wider uppercase">
                            {isEn ? "All-in-One AI Platform" : "Platform AI Terpadu"}
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-xs sm:text-[13px] md:text-sm">
                    {features.map((feature) => {
                      const isHovered = hoveredRow === feature.id

                      return (
                        <tr
                          key={feature.id}
                          onMouseEnter={() => setHoveredRow(feature.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          onClick={() => setHoveredRow(isHovered ? null : feature.id)}
                          className={`transition-all duration-200 cursor-pointer group ${
                            isHovered
                              ? "bg-primary/[0.04] dark:bg-primary/[0.08]"
                              : "hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                          }`}
                        >
                          {/* CELL 1: Feature Title (Hanya Teks Bold, Tanpa Icon, Tanpa Teks Tambahan) */}
                          <td className="py-3.5 px-4 sm:px-6 font-bold sticky left-0 z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md md:static md:bg-transparent border-r border-slate-200/60 dark:border-white/5 md:border-r-0 leading-snug">
                            <span className={`transition-colors ${isHovered ? "text-primary dark:text-white" : "text-slate-900 dark:text-slate-100"}`}>
                              {feature.name}
                            </span>
                          </td>

                          {/* CELL 2: Bookmark Browser (Hanya Icon Check/Cross/Minus) */}
                          <td className="py-3.5 px-2 sm:px-4 text-center">
                            {renderCompetitorIcon(feature.bookmark)}
                          </td>

                          {/* CELL 3: Aplikasi Catatan (Hanya Icon Check/Cross/Minus) */}
                          <td className="py-3.5 px-2 sm:px-4 text-center">
                            {renderCompetitorIcon(feature.notes)}
                          </td>

                          {/* CELL 4: Linkorian (Hanya Icon Centang Glowing) */}
                          <td className={`py-3.5 px-2 sm:px-4 text-center border-l-2 border-r border-primary/30 transition-all duration-200 ${
                            isHovered
                              ? "bg-primary/[0.12] dark:bg-primary/[0.18]"
                              : "bg-primary/[0.06] dark:bg-primary/[0.10]"
                          }`}>
                            {renderLinkoraCheck(isHovered)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MOBILE COMPARISON CARD VIEW (vs Bookmark or vs Catatan) */}
            {/* ========================================================================= */}
            {mobileTab !== "all" && (
              <div className="md:hidden p-3 space-y-2.5">
                <div className="px-2 py-1 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-white/10 pb-1.5 text-center">
                  <span>{isEn ? "Feature" : "Fitur"}</span>
                  <div className="flex items-center gap-6">
                    <span>{mobileTab === "bookmark" ? "Bookmark" : "Catatan"}</span>
                    <span className="text-primary font-extrabold">Linkorian</span>
                  </div>
                </div>

                {features.map((feature) => {
                  const competitorStatus = mobileTab === "bookmark" ? feature.bookmark : feature.notes

                  return (
                    <div
                      key={feature.id}
                      className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 flex items-center justify-between gap-3 active:scale-[0.98] transition-transform"
                    >
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex-1 min-w-0 pr-2">
                        {feature.name}
                      </span>

                      <div className="flex items-center gap-6 shrink-0">
                        {/* Competitor Status */}
                        <div className="flex items-center justify-center">
                          {renderCompetitorIcon(competitorStatus)}
                        </div>

                        {/* Linkorian Status */}
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-purple-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ========================================================================= */}
            {/* BOTTOM SUMMARY & CTA BAR */}
            {/* ========================================================================= */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-primary/[0.08] via-purple-500/[0.05] to-blue-500/[0.08] border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 hidden sm:flex">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">
                    {isEn ? "Stop wasting hours hunting through lost bookmarks." : "Jangan buang waktu mencari link dan dokumen yang hilang."}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {isEn
                      ? "Get started with Linkorian in 60 seconds — completely free."
                      : "Mulai rapikan link, catatan, dan peluang dalam hitungan detik — gratis."}
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold text-xs shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                <span>{isEn ? "Try Linkorian Now" : "Coba Linkorian Sekarang"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}
