"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { PlusCircle, Layers, Search, ArrowRight, ArrowDown } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"
import { useTranslation } from "@/components/providers/i18n-provider"

// ── Data 3 Langkah Cara Kerja — Warna Senada dengan Brand Linkora ──
const getSteps = (locale: string) => [
  {
    step: "01",
    title: locale === "en" ? "Save & Collect" : "Simpan & Kumpulkan",
    description: locale === "en" 
      ? "Save links, articles, scholarships, or research notes from anywhere with a single click."
      : "Simpan link, artikel, beasiswa, atau catatan dari mana saja dengan satu klik praktis.",
    icon: PlusCircle,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/30",
    activeBorder: "border border-blue-500/80 dark:border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-500/20",
    activeBadge: "border-blue-500 bg-blue-600 text-white shadow-xs",
    activeText: "text-blue-600 dark:text-blue-400",
    topBar: "via-blue-500",
    initialOffset: { x: -30, y: 0 },
  },
  {
    step: "02",
    title: locale === "en" ? "AI Auto-Summarizes" : "AI Otomatis Merangkum",
    description: locale === "en"
      ? "Liko AI analyzes webpage content, categorizes topics, and generates concise takeaways."
      : "AI membaca, mengkategorikan, mengekstrak wawasan, dan membuat intisari ringkas.",
    icon: Layers,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30",
    activeBorder: "border border-indigo-500/80 dark:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-500/20",
    activeBadge: "border-indigo-500 bg-indigo-600 text-white shadow-xs",
    activeText: "text-indigo-600 dark:text-indigo-400",
    topBar: "via-indigo-500",
    initialOffset: { x: 0, y: 25 },
  },
  {
    step: "03",
    title: locale === "en" ? "Find in Seconds" : "Temukan Dalam Detik",
    description: locale === "en"
      ? "Retrieve ideas, documents, and references anytime with lightning-fast semantic search."
      : "Cari ide dan dokumen lama kapan saja dengan pencarian semantik instan tanpa ribet.",
    icon: Search,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-500/15 border-cyan-200 dark:border-cyan-500/30",
    activeBorder: "border border-cyan-500/80 dark:border-cyan-400 bg-cyan-50/40 dark:bg-cyan-950/20 ring-1 ring-cyan-500/20",
    activeBadge: "border-cyan-500 bg-cyan-600 text-white shadow-xs",
    activeText: "text-cyan-600 dark:text-cyan-400",
    topBar: "via-cyan-500",
    initialOffset: { x: 30, y: 0 },
  },
]

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1)
  const [isDesktop, setIsDesktop] = useState(false)
  const { t, locale } = useTranslation()

  const steps = getSteps(locale)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Direction tracking: "down" when scrolling downwards, "up" when scrolling upwards
  const currentDirRef = useRef<"down" | "up">("down")
  const downStartRef = useRef(0.08)
  const upStartRef = useRef(0.92)
  const prevScrollRef = useRef(0)

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!isDesktop) return

    // Outside the sticky interactive area
    if (latest < 0.06) {
      currentDirRef.current = "down"
      downStartRef.current = 0.08
      setActiveStepIndex(-1)
      prevScrollRef.current = latest
      return
    }
    if (latest > 0.94) {
      currentDirRef.current = "up"
      upStartRef.current = 0.92
      setActiveStepIndex(-1)
      prevScrollRef.current = latest
      return
    }

    const delta = latest - prevScrollRef.current
    prevScrollRef.current = latest

    // Smooth direction detection with hysteresis buffer
    if (delta > 0.003 && currentDirRef.current !== "down") {
      currentDirRef.current = "down"
      downStartRef.current = latest
    } else if (delta < -0.003 && currentDirRef.current !== "up") {
      currentDirRef.current = "up"
      upStartRef.current = latest
    }

    // ALWAYS CALCULATE 1 -> 2 -> 3 FOR BOTH DOWN AND UP SCROLL!
    // DILARANG 3 -> 2 -> 1
    let progress = 0

    if (currentDirRef.current === "down") {
      // Scrolling down: progress advances as latest increases
      const span = Math.max(0.18, 0.92 - downStartRef.current)
      progress = (latest - downStartRef.current) / span
    } else {
      // Scrolling up: progress advances as latest DECREASES (1 -> 2 -> 3)
      const span = Math.max(0.18, upStartRef.current - 0.08)
      progress = (upStartRef.current - latest) / span
    }

    const clampedProgress = Math.max(0, Math.min(0.999, progress))

    if (clampedProgress < 0.33) {
      setActiveStepIndex(0)
    } else if (clampedProgress < 0.66) {
      setActiveStepIndex(1)
    } else {
      setActiveStepIndex(2)
    }
  })

  return (
    <section id="cara-kerja" ref={containerRef} className="relative h-auto lg:h-[300vh] bg-background py-14 sm:py-20 lg:py-0">
      <div className="relative lg:sticky lg:top-0 h-auto lg:h-screen w-full lg:overflow-hidden flex flex-col items-center justify-center lg:py-[4vh]">
        <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center max-h-none lg:max-h-[92vh] w-full">
          
          <div className="text-center max-w-3xl mx-auto mb-6 md:mb-10 overflow-hidden py-1">
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                type: "spring",
                stiffness: 110,
                damping: 20,
              }}
              className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-foreground"
            >
              {locale === "en" ? "How " : "Bagaimana "}<LinkoraText /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">{locale === "en" ? "Works" : "Bekerja?"}</span>
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 22,
                delay: 0.08,
              }}
              className="text-xs sm:text-base md:text-lg text-slate-600 dark:text-muted-foreground max-w-xl mx-auto leading-relaxed"
            >
              {locale === "en"
                ? "Three simple steps to build your personal knowledge base and link management powerhouse."
                : "Tiga langkah sederhana untuk membangun pustaka pengetahuan dan manajemen tautan pribadi Anda."}
            </motion.p>
          </div>

          <div className="relative max-w-6xl mx-auto w-full pt-2 sm:pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 relative z-10 items-stretch">
              {steps.map((item, idx) => {
                const Icon = item.icon
                const isActive = isDesktop ? activeStepIndex === idx : false

                return (
                  <div key={item.step} className="relative flex flex-col items-center w-full">
                    {/* Desktop Horizontal Flow Bridge - Natural, Clean & Clear */}
                    {idx < steps.length - 1 && (
                      <div className="hidden md:flex absolute top-1/2 -right-3.5 lg:-right-5 translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none">
                        {/* Connecting Line Track */}
                        <div className="w-8 lg:w-11 h-0.5 bg-slate-200 dark:bg-slate-700/80 rounded-full relative overflow-hidden flex items-center">
                          <motion.div
                            animate={{
                              width: activeStepIndex > idx ? "100%" : "0%",
                            }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                          />
                        </div>

                        {/* Natural Circular Badge with Arrow */}
                        <div className="absolute flex items-center justify-center">
                          <div
                            className={`
                              w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center border transition-all duration-300 shadow-xs
                              ${
                                activeStepIndex > idx
                                  ? "border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400"
                                  : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500"
                              }
                            `}
                          >
                            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                          </div>
                        </div>
                      </div>
                    )}

                    <motion.div
                      initial={{ ...item.initialOffset, opacity: 0 }}
                      whileInView={{ x: 0, y: 0, opacity: 1 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                        mass: 0.85,
                        delay: 0.05 * idx,
                      }}
                      className="w-full h-full flex flex-col"
                    >
                      <motion.div
                        onClick={() => setActiveStepIndex(idx)}
                        animate={
                          isActive
                            ? {
                                y: -5,
                                scale: 1.015,
                              }
                            : {
                                y: 0,
                                scale: 1,
                              }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          mass: 0.8,
                        }}
                        className={`
                          w-full h-full min-h-[260px] sm:min-h-[280px] md:min-h-[300px]
                          p-6 md:p-8 rounded-3xl cursor-pointer relative overflow-hidden
                          flex flex-col justify-between transition-colors duration-300
                          ${
                            isActive
                              ? `${item.activeBorder} shadow-md shadow-blue-500/5`
                              : "border border-slate-200 dark:border-border/80 bg-white dark:bg-card shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
                          }
                        `}
                      >
                        <div
                          className={`
                            absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent ${item.topBar} to-transparent
                            transition-opacity duration-300
                            ${isActive ? "opacity-100" : "opacity-0"}
                          `}
                        />

                        <div className="flex items-center justify-between mb-6">
                          <motion.div
                            animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                            transition={{ type: "spring", stiffness: 360, damping: 20 }}
                            className={`w-13 h-13 rounded-2xl ${item.bg} border flex items-center justify-center shadow-xs`}
                          >
                            <Icon className={`w-6 h-6 ${item.color}`} />
                          </motion.div>

                          <div
                            className={`
                              px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider border transition-colors duration-300
                              ${
                                isActive
                                  ? item.activeBadge
                                  : "border-slate-200 dark:border-border bg-slate-50 dark:bg-card text-slate-500 dark:text-muted-foreground"
                              }
                            `}
                          >
                            STEP {item.step}
                          </div>
                        </div>

                        <div className="space-y-2.5 flex-1">
                          <h3
                            className={`
                              text-xl font-bold tracking-tight transition-colors duration-300
                              ${isActive ? item.activeText : "text-slate-800 dark:text-foreground"}
                            `}
                          >
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Mobile Vertical Flow Connector - Natural & Clean */}
                    {idx < steps.length - 1 && (
                      <div className="flex md:hidden flex-col items-center justify-center my-3 py-0.5 relative z-10 pointer-events-none">
                        <div className="w-0.5 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="my-1 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-xs">
                          <ArrowDown className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                        <div className="w-0.5 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

