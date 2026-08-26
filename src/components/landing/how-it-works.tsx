"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { PlusCircle, Layers, Search, ChevronRight } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"

// ── Data 3 Langkah Cara Kerja — Warna Senada dengan Brand Linkora ──
const steps = [
  {
    step: "01",
    title: "Simpan & Kumpulkan",
    description: "Simpan link, artikel, beasiswa, atau catatan dari mana saja dengan satu klik praktis.",
    icon: PlusCircle,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/30",
    activeBorder: "border-2 border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/20",
    activeBadge: "border-blue-500 bg-blue-600 text-white shadow-sm",
    activeText: "text-blue-600 dark:text-blue-400",
    topBar: "via-blue-500",
    initialOffset: { x: -80, y: 0 },
  },
  {
    step: "02",
    title: "AI Otomatis Merangkum",
    description: "AI membaca, mengkategorikan, mengekstrak wawasan, dan membuat intisari ringkas.",
    icon: Layers,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30",
    activeBorder: "border-2 border-indigo-500 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20",
    activeBadge: "border-indigo-500 bg-indigo-600 text-white shadow-sm",
    activeText: "text-indigo-600 dark:text-indigo-400",
    topBar: "via-indigo-500",
    initialOffset: { x: 0, y: 50 },
  },
  {
    step: "03",
    title: "Temukan Dalam Detik",
    description: "Cari ide dan dokumen lama kapan saja dengan pencarian semantik instan tanpa ribet.",
    icon: Search,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-500/15 border-cyan-200 dark:border-cyan-500/30",
    activeBorder: "border-2 border-cyan-500 dark:border-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/40 ring-2 ring-cyan-500/20",
    activeBadge: "border-cyan-500 bg-cyan-600 text-white shadow-sm",
    activeText: "text-cyan-600 dark:text-cyan-400",
    topBar: "via-cyan-500",
    initialOffset: { x: 80, y: 0 },
  },
]

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIKA SIKLUS TUTORIAL: Selalu mengalir maju (Step 1 -> 2 -> 3)
  // Ketika selesai di Step 3 atau saat scroll ke atas, pola langsung kembali ke Step 1
  // ─────────────────────────────────────────────────────────────────────────
  const prevScrollRef = useRef(0)

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const isScrollingUp = latest < prevScrollRef.current
    prevScrollRef.current = latest

    if (latest < 0.08 || latest > 0.94) {
      setActiveStepIndex(-1)
      return
    }

    // Normalisasi progress aktif (0.08 s/d 0.94)
    const normalized = (latest - 0.08) / (0.94 - 0.08)

    // Jika scroll ke atas, pola tutorial tetap mengalir maju (1 -> 2 -> 3)
    if (isScrollingUp) {
      const reverseFlow = (1 - normalized) % 1
      if (reverseFlow < 0.33) {
        setActiveStepIndex(0) // Step 01
      } else if (reverseFlow < 0.66) {
        setActiveStepIndex(1) // Step 02
      } else {
        setActiveStepIndex(2) // Step 03
      }
    } else {
      // Scroll turun normal: Step 01 -> Step 02 -> Step 03
      if (normalized < 0.33) {
        setActiveStepIndex(0) // Step 01
      } else if (normalized < 0.66) {
        setActiveStepIndex(1) // Step 02
      } else {
        setActiveStepIndex(2) // Step 03
      }
    }
  })

  return (
    <section id="cara-kerja" ref={containerRef} className="relative h-[320vh] bg-background">
      {/* ── Viewport Sticky: Konten Bersih & Tidak Terpotong ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center py-[4vh]">
        <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center max-h-[92vh] w-full">
          
          {/* ── Header: Judul dengan Huruf 'O' Berputar Halus ── */}
          <div className="text-center max-w-3xl mx-auto mb-6 md:mb-10 overflow-hidden py-1">
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{
                type: "spring",
                stiffness: 110,
                damping: 20,
              }}
              className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-foreground"
            >
              Bagaimana <LinkoraText /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">Bekerja?</span>
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 22,
                delay: 0.08,
              }}
              className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-muted-foreground"
            >
              Tiga langkah sederhana untuk membangun pustaka pengetahuan dan manajemen tautan pribadi Anda.
            </motion.p>
          </div>

          {/* ── Container 3 Cards dengan Jarak Lapang & Garis Penghubung ANTAR Card ── */}
          <div className="relative max-w-6xl mx-auto w-full pt-6">
            
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 relative z-10 items-stretch">
              {steps.map((item, idx) => {
                const Icon = item.icon
                const isActive = activeStepIndex === idx

                return (
                  <div key={item.step} className="relative flex flex-col items-center">
                    
                    {/* ── Garis Penghubung HANYA DI ANTARA CARD (Bukan di Dalam Card) ── */}
                    {idx < steps.length - 1 && (
                      <div className="hidden md:flex absolute top-[50%] -right-4 lg:-right-6 translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none">
                        <div className="w-5 lg:w-8 h-[2px] bg-slate-200 dark:bg-border relative overflow-hidden rounded-full">
                          <motion.div
                            animate={
                              activeStepIndex >= idx
                                ? { width: "100%" }
                                : { width: "0%" }
                            }
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                          />
                        </div>
                        <ChevronRight 
                          className={`w-4 h-4 -ml-1 transition-colors duration-300 ${
                            activeStepIndex >= idx
                              ? "text-indigo-500"
                              : "text-slate-300 dark:text-border"
                          }`} 
                        />
                      </div>
                    )}

                    {/* ── Card Wrapper ── */}
                    <motion.div
                      initial={item.initialOffset}
                      whileInView={{ x: 0, y: 0 }}
                      viewport={{ once: false, amount: 0.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 20,
                        mass: 0.85,
                        delay: 0.05 * idx,
                      }}
                      className="w-full h-full flex flex-col"
                    >
                      {/* ── Card Body Lebih Besar & Mewah ── */}
                      <motion.div
                        animate={
                          isActive
                            ? {
                                y: -8,
                                scale: 1.035,
                              }
                            : {
                                y: 0,
                                scale: 1,
                              }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 340,
                          damping: 24,
                          mass: 0.8,
                        }}
                        className={`
                          h-full min-h-[260px] sm:min-h-[285px] md:min-h-[305px]
                          p-6 sm:p-7 md:p-8 pt-9 sm:pt-10 rounded-3xl text-center cursor-default relative
                          flex flex-col justify-start transition-colors duration-250
                          ${
                            isActive
                              ? `${item.activeBorder} shadow-sm`
                              : "border border-slate-200 dark:border-border/80 bg-white dark:bg-card shadow-2xs"
                          }
                        `}
                      >
                        {/* Top Accent Indicator */}
                        <div
                          className={`
                            absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent ${item.topBar} to-transparent rounded-full
                            transition-opacity duration-250
                            ${isActive ? "opacity-100" : "opacity-0"}
                          `}
                        />

                        {/* Floating Step Number Badge (Lebih Besar, Elegan & Jarak Lapang) */}
                        <motion.div 
                          animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                          transition={{ type: "spring", stiffness: 380, damping: 20 }}
                          className={`
                            absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-250 z-30
                            ${
                              isActive
                                ? item.activeBadge
                                : "bg-white dark:bg-card border-2 border-slate-200 dark:border-border text-slate-700 dark:text-foreground shadow-xs"
                            }
                          `}
                        >
                          {item.step}
                        </motion.div>
                        
                        {/* Icon Badge: Diberi Ruang Jarak yang Lega dari Nomor Step */}
                        <div className="mt-4 sm:mt-5 mb-5 flex justify-center">
                          <motion.div 
                            animate={isActive ? { scale: 1.12, rotate: 4 } : { scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 360, damping: 20 }}
                            className={`w-15 h-15 sm:w-16 sm:h-16 rounded-2xl ${item.bg} border flex items-center justify-center shadow-2xs`}
                          >
                            <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${item.color}`} />
                          </motion.div>
                        </div>
                        
                        {/* Judul Step */}
                        <h3 
                          className={`
                            text-lg sm:text-xl font-bold mb-2 tracking-tight transition-colors duration-250
                            ${isActive ? item.activeText : "text-slate-800 dark:text-foreground"}
                          `}
                        >
                          {item.title}
                        </h3>

                        {/* Deskripsi Step */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground leading-relaxed flex-1">
                          {item.description}
                        </p>
                      </motion.div>
                    </motion.div>

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
