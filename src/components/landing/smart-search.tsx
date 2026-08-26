"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Briefcase, GraduationCap, FileText, MonitorPlay, ArrowRight, Command } from "lucide-react"

const searchExamples = [
  { query: "Magang BCA Tech", icon: Briefcase, result: "12 Tautan Lowongan & Catatan Syarat", tag: "Magang", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { query: "Beasiswa LPDP 2026", icon: GraduationCap, result: "5 Link Pendaftaran & Format Esai", tag: "Beasiswa", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { query: "Catatan Basis Data", icon: FileText, result: "Ringkasan Kuliah Normalisasi & SQL", tag: "Catatan", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { query: "Workshop UI Design", icon: MonitorPlay, result: "3 Video Tutorial & File Figma", tag: "Resource", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" }
]

export function SmartSearchDemo() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % searchExamples.length)
    }, 3200)
    return () => clearInterval(timer)
  }, [isPaused])

  const current = searchExamples[currentIndex]
  const Icon = current.icon

  return (
    <section id="demo" className="py-14 md:py-18 relative overflow-hidden bg-background">
      {/* Glow aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground"
          >
            Temukan Informasi Apapun <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">dalam Hitungan Milidetik</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground"
          >
            Pencarian pintar memahami konteks maksud Anda, bukan sekadar mencocokkan kata kunci kaku.
          </motion.p>
        </div>

        {/* Interactive Search Box Simulation */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Quick Select Buttons */}
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            {searchExamples.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  currentIndex === idx
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                {ex.query}
              </button>
            ))}
          </div>

          <div className="glass-panel rounded-3xl p-3 md:p-5 border border-primary/30 shadow-[0_0_50px_rgba(var(--primary),0.15)] relative overflow-hidden">
            {/* Search Input Simulation */}
            <div className="flex items-center gap-3 bg-foreground/[0.04] rounded-2xl p-4 border border-border/60">
              <Search className="w-6 h-6 text-primary shrink-0 animate-pulse" />
              <div className="flex-1 overflow-hidden relative h-8 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute text-lg md:text-xl font-medium text-foreground flex items-center gap-2"
                  >
                    <span>{current.query}</span>
                    <span className="w-0.5 h-5 bg-primary animate-pulse" />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground bg-background/80 px-2 py-1 rounded-lg border border-border/50">
                <Command className="w-3 h-3" /> K
              </div>
            </div>

            {/* Results preview */}
            <div className="mt-4 px-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 font-medium">
                <span>Hasil Pencarian Cerdas</span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Instan 0.04s
                </span>
              </div>

              <div className="space-y-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-foreground/[0.03] hover:bg-foreground/[0.06] transition-all cursor-pointer border border-border/60 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-2.5 rounded-xl border ${current.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm truncate">{current.query}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                            {current.tag}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{current.result}</div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 ml-2">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

