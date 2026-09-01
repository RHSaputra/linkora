"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useInView, useMotionValueEvent } from "framer-motion"
import { XCircle, CheckCircle2, MessageCircle, Bookmark, FileText, Send, AlertCircle } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"
import { useTranslation } from "@/components/providers/i18n-provider"
import { cn } from "@/lib/utils"

// ── Data 5 Card Masalah — Warna Senada & Harmonis dengan Brand Linkora ──
const getProblems = (locale: string) => [
  { 
    text: locale === "en" ? "Internship links lost in WhatsApp & personal chats." : "Link magang tersimpan di WhatsApp & chat personal.", 
    icon: MessageCircle, 
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30",
    activeClass: "border-2 border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-sm",
  },
  { 
    text: locale === "en" ? "Scholarship portals buried in browser bookmarks." : "Link beasiswa tersimpan di Telegram / bookmark browser.", 
    icon: Send, 
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30",
    activeClass: "border-2 border-indigo-500 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-sm",
  },
  { 
    text: locale === "en" ? "Competition announcements piled up across hundreds of tabs." : "Link lomba & kompetisi tertumpuk di tab tak terbaca.", 
    icon: Bookmark, 
    color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/30",
    activeClass: "border-2 border-violet-500 dark:border-violet-400 bg-violet-50/80 dark:bg-violet-950/40 ring-2 ring-violet-500/20 shadow-sm",
  },
  { 
    text: locale === "en" ? "Research notes & draft outlines scattered across different apps." : "Catatan tugas & materi riset terpencar di banyak aplikasi.", 
    icon: FileText, 
    color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30",
    activeClass: "border-2 border-cyan-500 dark:border-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/40 ring-2 ring-cyan-500/20 shadow-sm",
  },
  { 
    text: locale === "en" ? "When urgently needed, everything is lost and hard to find." : "Saat dibutuhkan segera, semua hilang dan sulit dicari.", 
    icon: AlertCircle, 
    color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30", 
    activeClass: "border-2 border-purple-500 dark:border-purple-400 bg-purple-50/80 dark:bg-purple-950/40 ring-2 ring-purple-500/20 shadow-sm",
  },
]

// ── Typewriter Subtitle ──
function TypewriterSubtitle({ subtitle }: { subtitle: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })
  const [displayedText, setDisplayedText] = useState("")
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (!isInView) {
      setDisplayedText("")
      setIsDone(false)
      return
    }

    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex++
      setDisplayedText(subtitle.slice(0, currentIndex))
      if (currentIndex >= subtitle.length) {
        clearInterval(interval)
        setIsDone(true)
      }
    }, 16)

    return () => clearInterval(interval)
  }, [isInView, subtitle])

  return (
    <p 
      ref={ref}
      className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal min-h-[3rem] sm:min-h-[2.5rem]"
    >
      {displayedText || (isInView ? "" : subtitle)}
      {!isDone && isInView && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-primary/70 animate-pulse align-middle" />
      )}
    </p>
  )
}

// ── Main Component ──
export function PainPoints() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [activeCardIndex, setActiveCardIndex] = useState<number>(-1)
  const { t, locale } = useTranslation()

  const problems = getProblems(locale)
  const fullSubtitle = locale === "en" 
    ? "Valuable digital information is scattered everywhere, causing you to lose precious hours searching for old links." 
    : "Informasi berharga tersebar di berbagai sudut digital, membuat Anda membuang jam kerja berharga hanya untuk mencari kembali tautan lama."

  // Deteksi desktop vs mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 0.04 && latest < 0.14) {
      setActiveCardIndex(0)
    } else if (latest >= 0.14 && latest < 0.24) {
      setActiveCardIndex(1)
    } else if (latest >= 0.24 && latest < 0.34) {
      setActiveCardIndex(2)
    } else if (latest >= 0.34 && latest < 0.44) {
      setActiveCardIndex(3)
    } else if (latest >= 0.44 && latest < 0.55) {
      setActiveCardIndex(4)
    } else {
      setActiveCardIndex(-1)
    }
  })

  // ── TRANSFORMS KOLOM KIRI (5 CARDS) ──
  const leftColumnX = useTransform(
    scrollYProgress,
    [0.00, 0.55, 0.66, 0.78, 0.90, 1.00],
    isDesktop ? ["50%", "50%", "0%", "0%", "44%", "44%"] : ["0%", "0%", "0%", "0%", "0%", "0%"]
  )

  const cardTextOpacity = useTransform(
    scrollYProgress,
    [0.76, 0.83, 1.00],
    [1, 0, 0]
  )

  // ── TRANSFORMS KOLOM KANAN (CARD BESAR SOLUSI) ──
  const rightColumnOpacity = useTransform(
    scrollYProgress,
    [0.00, 0.66, 0.72, 1.00],
    [0, 0, 1, 1]
  )

  const rightColumnX = useTransform(
    scrollYProgress,
    [0.00, 0.78, 0.90, 1.00],
    isDesktop ? ["0%", "0%", "-50%", "-50%"] : ["0%", "0%", "0%", "0%"]
  )

  const rightCardScale = useTransform(
    scrollYProgress,
    [0.66, 0.72, 0.78, 0.90, 1.00],
    [0.92, 1.0, 1.0, 1.03, 1.03]
  )

  const checkScale = useTransform(
    scrollYProgress,
    [0.66, 0.72, 0.78, 0.84, 0.90, 0.96],
    [0.88, 1.24, 1.0, 1.0, 1.30, 1.0]
  )

  const checkGlow = useTransform(
    scrollYProgress,
    [0.66, 0.72, 0.78, 0.84, 0.90, 0.96],
    [
      "0 0 0px rgba(59, 130, 246, 0)",
      "0 0 35px rgba(59, 130, 246, 0.7)",
      "0 0 0px rgba(59, 130, 246, 0)",
      "0 0 0px rgba(59, 130, 246, 0)",
      "0 0 45px rgba(59, 130, 246, 0.85)",
      "0 0 0px rgba(59, 130, 246, 0)",
    ]
  )

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500vh] bg-slate-50 dark:bg-background"
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-center items-center">
        {/* Atmospheric Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-6xl my-auto py-4 sm:py-6">
          {/* ── Header: Title + Typewriter Subtitle ── */}
          <div className="text-center max-w-3xl mx-auto mb-6 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-foreground">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">
                {locale === "en" ? "Before Using" : "Sebelum Menggunakan"}
              </span>{" "}
              <span className="text-slate-900 dark:text-foreground inline-block">
                <LinkoraText />
              </span>
            </h2>
            <TypewriterSubtitle subtitle={fullSubtitle} />
          </div>

          {/* ── Main Grid Container ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 lg:gap-10 items-stretch max-w-5xl mx-auto relative">
            
            {/* ── Kolom Kiri: 5 Chaos Cards (Layer z-10) ── */}
            <motion.div
              style={{
                x: leftColumnX,
                zIndex: 10,
                willChange: "transform",
              }}
              className="space-y-2.5 sm:space-y-3 flex flex-col justify-center relative"
            >
              {problems.map((problem, idx) => {
                const Icon = problem.icon
                const isActive = activeCardIndex === idx

                return (
                  <motion.div
                    key={idx}
                    animate={{
                      scale: isActive ? 1.035 : 1.0,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 26,
                    }}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 border transition-all duration-300 overflow-hidden ${
                      isActive
                        ? problem.activeClass
                        : "border-slate-200 dark:border-border/80 bg-white dark:bg-card shadow-sm opacity-90 hover:opacity-100"
                    }`}
                  >
                    {/* Badge Ikon */}
                    <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${problem.color} flex items-center justify-center shrink-0 shadow-xs z-20 transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Teks */}
                    <motion.p 
                      style={{ 
                        opacity: cardTextOpacity,
                        willChange: "opacity" 
                      }}
                      className="flex-1 text-xs sm:text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug"
                    >
                      {problem.text}
                    </motion.p>

                    {/* Ikon X */}
                    <motion.div
                      style={{ 
                        opacity: cardTextOpacity,
                        willChange: "opacity" 
                      }}
                      className="shrink-0"
                    >
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400" />
                    </motion.div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* ── Kolom Kanan: Card Besar Linkora (Layer Paling Atas z-30) ── */}
            <motion.div
              style={{
                x: rightColumnX,
                opacity: rightColumnOpacity,
                scale: rightCardScale,
                zIndex: 30,
                willChange: "transform, opacity",
              }}
              className={cn(
                "min-h-[240px] sm:min-h-[340px] md:min-h-[420px] flex flex-col justify-center items-center rounded-2xl sm:rounded-3xl bg-white dark:bg-card p-5 sm:p-8 md:p-10 text-center border-2 border-primary/40 dark:border-primary/50 shadow-2xl overflow-hidden",
                isDesktop ? "relative" : "absolute inset-0 z-30 shadow-primary/20 backdrop-blur-xl"
              )}
            >
              {/* Gradient ambient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-sky-500/5 to-transparent rounded-2xl sm:rounded-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4 sm:space-y-6 w-full max-w-md mx-auto">
                <motion.div
                  style={{
                    scale: checkScale,
                    boxShadow: checkGlow,
                    willChange: "transform, box-shadow",
                  }}
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-tr from-primary via-accent to-purple-500 p-0.5 shadow-xl shadow-primary/25 flex items-center justify-center"
                >
                  <div className="w-full h-full bg-white dark:bg-card rounded-[10px] sm:rounded-[14px] md:rounded-[22px] flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
                  </div>
                </motion.div>

                {/* Headline & Body */}
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    <LinkoraText /> {locale === "en" ? "Unifies Everything." : "Menyatukan Semuanya."}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {locale === "en" 
                      ? "One centralized workspace to save, analyze, summarize with AI, and retrieve all your critical information effortlessly."
                      : "Satu tempat terpusat untuk menyimpan, menganalisis, merangkum dengan AI, dan menemukan kembali semua informasi penting Anda tanpa stres."}
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
