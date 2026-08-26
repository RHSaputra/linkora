"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Link2, FileEdit, GraduationCap, Search, BrainCircuit, CalendarClock } from "lucide-react"

// ── Data 6 Card Solusi — Warna Senada & Harmonis dengan Brand Linkora ──
const solutions = [
  {
    title: "Smart Link Vault",
    description: "Simpan semua tautan penting dengan metadata otomatis tanpa takut terselip atau rusak.",
    icon: Link2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/30",
    activeBorder: "border-2 border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/20",
    activeText: "text-blue-600 dark:text-blue-400",
    topBar: "via-blue-500",
    // Arah Masuk: Kiri Atas
    initialOffset: { x: -120, y: -50 },
  },
  {
    title: "Catatan & Knowledge Hub",
    description: "Editor kaya fitur dengan Word-style image management, tabel, checklist, dan format profesional.",
    icon: FileEdit,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30",
    activeBorder: "border-2 border-indigo-500 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20",
    activeText: "text-indigo-600 dark:text-indigo-400",
    topBar: "via-indigo-500",
    // Arah Masuk: Atas Tengah
    initialOffset: { x: 0, y: -70 },
  },
  {
    title: "Opportunity Tracker",
    description: "Lacak magang, beasiswa, lomba, dan peluang karir dengan status tahapan terstruktur.",
    icon: GraduationCap,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/15 border-violet-200 dark:border-violet-500/30",
    activeBorder: "border-2 border-violet-500 dark:border-violet-400 bg-violet-50/80 dark:bg-violet-950/40 ring-2 ring-violet-500/20",
    activeText: "text-violet-600 dark:text-violet-400",
    topBar: "via-violet-500",
    // Arah Masuk: Kanan Atas
    initialOffset: { x: 120, y: -50 },
  },
  {
    title: "Smart Semantic Search",
    description: "Temukan kembali link & catatan lama dalam hitungan milidetik hanya dengan kata kunci alami.",
    icon: Search,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-500/15 border-cyan-200 dark:border-cyan-500/30",
    activeBorder: "border-2 border-cyan-500 dark:border-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/40 ring-2 ring-cyan-500/20",
    activeText: "text-cyan-600 dark:text-cyan-400",
    topBar: "via-cyan-500",
    // Arah Masuk: Kiri Bawah
    initialOffset: { x: -120, y: 50 },
  },
  {
    title: "AI Summary & Wawasan",
    description: "Ekstrak ringkasan intisari otomatis dari konten panjang langsung di dalam dashboard.",
    icon: BrainCircuit,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-500/15 border-purple-200 dark:border-purple-500/30",
    activeBorder: "border-2 border-purple-500 dark:border-purple-400 bg-purple-50/80 dark:bg-purple-950/40 ring-2 ring-purple-500/20",
    activeText: "text-purple-600 dark:text-purple-400",
    topBar: "via-purple-500",
    // Arah Masuk: Bawah Tengah
    initialOffset: { x: 0, y: 70 },
  },
  {
    title: "Deadline & Pengingat",
    description: "Jangan pernah melewatkan batas waktu pendaftaran atau deadline tugas penting.",
    icon: CalendarClock,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/30",
    activeBorder: "border-2 border-sky-500 dark:border-sky-400 bg-sky-50/80 dark:bg-sky-950/40 ring-2 ring-sky-500/20",
    activeText: "text-sky-600 dark:text-sky-400",
    topBar: "via-sky-500",
    // Arah Masuk: Kanan Bawah
    initialOffset: { x: 120, y: 50 },
  },
]

export function Solution() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeCardIndex, setActiveCardIndex] = useState<number>(-1)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // ─────────────────────────────────────────────────────────────────────────
  // SCROLL TIMELINE: KONTEN TETAP STAY 100% & TIDAK PERNAH HILANG
  //
  // Step Denyut Berurutan (Card 1 s/d 6):
  // - 0.10 s/d 0.24 : Card 1 Berdenyut Tegas (Smart Link Vault)
  // - 0.24 s/d 0.38 : Card 2 Berdenyut Tegas (Catatan Hub)
  // - 0.38 s/d 0.52 : Card 3 Berdenyut Tegas (Opportunity Tracker)
  // - 0.52 s/d 0.66 : Card 4 Berdenyut Tegas (Semantic Search)
  // - 0.66 s/d 0.80 : Card 5 Berdenyut Tegas (AI Summary)
  // - 0.80 s/d 0.94 : Card 6 Berdenyut Tegas (Deadline & Reminder)
  // - 0.94 s/d 1.00 : Semua Konten Tetap Stay di Layar, Lanjut ke Session Baru
  // ─────────────────────────────────────────────────────────────────────────
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 0.10 && latest < 0.24) {
      setActiveCardIndex(0)
    } else if (latest >= 0.24 && latest < 0.38) {
      setActiveCardIndex(1)
    } else if (latest >= 0.38 && latest < 0.52) {
      setActiveCardIndex(2)
    } else if (latest >= 0.52 && latest < 0.66) {
      setActiveCardIndex(3)
    } else if (latest >= 0.66 && latest < 0.80) {
      setActiveCardIndex(4)
    } else if (latest >= 0.80 && latest < 0.94) {
      setActiveCardIndex(5)
    } else {
      setActiveCardIndex(-1)
    }
  })

  return (
    <section id="solusi" ref={containerRef} className="relative h-[350vh] bg-background">
      {/* ── Viewport Sticky: Konten Selalu Terlihat & Tetap Stay ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center py-[3vh] sm:py-[4vh]">
        <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center max-h-[94vh] w-full">
          
          {/* ── Judul Section: Meluncur Mulus dari Kiri & Kanan, Lalu TETAP STAY 100% ── */}
          <div className="text-center max-w-3xl mx-auto mb-4 md:mb-6 overflow-hidden py-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 md:mb-3 text-slate-900 dark:text-foreground flex flex-col items-center gap-1">
              <motion.span
                initial={{ x: -140 }}
                whileInView={{ x: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{
                  type: "spring",
                  stiffness: 110,
                  damping: 20,
                  mass: 0.8,
                }}
                className="inline-block"
              >
                Satu Ekosistem Untuk Semua
              </motion.span>
              <motion.span
                initial={{ x: 140 }}
                whileInView={{ x: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{
                  type: "spring",
                  stiffness: 110,
                  damping: 20,
                  mass: 0.8,
                  delay: 0.06,
                }}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400"
              >
                Kebutuhan Produktivitas Anda
              </motion.span>
            </h2>
            <motion.p
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 22,
                delay: 0.12,
              }}
              className="text-sm md:text-base text-slate-600 dark:text-muted-foreground"
            >
              Didesain khusus untuk mahasiswa, pencari kerja, dan profesional yang ingin ruang kerja digital yang rapi dan terorganisir.
            </motion.p>
          </div>

          {/* ── Grid 6 Cards: Ukuran Konsisten 100% Seragam & Smooth Entrance ── */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-4 max-w-6xl mx-auto w-full items-stretch">
            {solutions.map((item, idx) => {
              const Icon = item.icon
              const isActive = activeCardIndex === idx

              return (
                <motion.div
                  key={item.title}
                  initial={item.initialOffset}
                  whileInView={{ x: 0, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    mass: 0.85,
                    delay: 0.04 * idx,
                  }}
                  className="h-full flex flex-col"
                >
                  {/* ── Card Body: Tinggi Seragam & Sorotan Denyut Empuk ── */}
                  <motion.div
                    animate={
                      isActive
                        ? {
                            y: -6,
                          }
                        : {
                            y: 0,
                          }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 24,
                      mass: 0.8,
                    }}
                    className={`
                      h-full min-h-[170px] sm:min-h-[185px] md:min-h-[195px]
                      p-4 sm:p-5 rounded-2xl sm:rounded-3xl cursor-default relative overflow-hidden
                      flex flex-col justify-start transition-colors duration-250
                      ${
                        isActive
                          ? `${item.activeBorder} shadow-sm`
                          : "border border-slate-200 dark:border-border/80 bg-white dark:bg-card shadow-2xs"
                      }
                    `}
                  >
                    {/* Top Accent Bar */}
                    <div
                      className={`
                        absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent ${item.topBar} to-transparent
                        transition-opacity duration-250
                        ${isActive ? "opacity-100" : "opacity-0"}
                      `}
                    />

                    {/* Icon Badge */}
                    <motion.div
                      animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 360, damping: 20 }}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl ${item.bg} border flex items-center justify-center mb-3 shrink-0`}
                    >
                      <Icon className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${item.color}`} />
                    </motion.div>

                    {/* Judul Card */}
                    <h3
                      className={`
                        text-base sm:text-lg font-bold mb-1.5 tracking-tight transition-colors duration-250
                        ${isActive ? item.activeText : "text-slate-800 dark:text-foreground"}
                      `}
                    >
                      {item.title}
                    </h3>

                    {/* Deskripsi Card */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground leading-relaxed flex-1">
                      {item.description}
                    </p>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
