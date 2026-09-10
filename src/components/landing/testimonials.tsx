"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"
import { useTranslation } from "@/components/providers/i18n-provider"

const getTestimonials = (locale: string) => [
  {
    quote: locale === "en" ? (
      <>I used to lose thesis references and internship links inside chat apps. With <LinkoraText />, everything is neatly structured, and AI generates instant paper takeaways in seconds. It truly saved my final project!</>
    ) : (
      <>Dulu semua link magang dan tugas akhir tercecer di WhatsApp. Sejak pakai <LinkoraText />, semua tersusun rapi dan AI membantuku membuat ringkasan jurnal dalam hitungan detik. Benar-benar menyelamatkan skripsiku!</>
    ),
    author: "Nadia L.",
    role: locale === "en" ? "Final Year Student" : "Mahasiswa Semester Akhir",
    univ: locale === "en" ? "University of Indonesia" : "Universitas Indonesia",
    initial: "N",
    bg: "from-purple-500 to-pink-500",
  },
  {
    quote: locale === "en" ? (
      <>As an active job seeker, I bookmark hundreds of design portfolios and job postings. Smart Search in <LinkoraText /> lets me retrieve specific company links I saved weeks ago instantly.</>
    ) : (
      <>Sebagai job seeker, saya menyimpan ratusan referensi portofolio dan lowongan pekerjaan. Smart Search di <LinkoraText /> membuat saya bisa menemukan kembali link perusahaan spesifik yang saya simpan bulan lalu dengan instan.</>
    ),
    author: "Bima S.",
    role: locale === "en" ? "Fresh Graduate & Job Seeker" : "Fresh Graduate & Job Seeker",
    univ: "Institut Teknologi Bandung",
    initial: "B",
    bg: "from-blue-500 to-cyan-500",
  },
  {
    quote: locale === "en" ? (
      <>The Reminders and Opportunity Tracker are game-changers. I haven&apos;t missed a single scholarship application deadline or competition date since all due dates are tracked automatically in <LinkoraText />.</>
    ) : (
      <>Fitur Reminder dan Opportunity Tracker sangat membantu. Saya tidak pernah lagi kelewatan deadline pendaftaran beasiswa dan workshop karena semua sudah terekam dan ada pengingat otomatisnya di <LinkoraText />.</>
    ),
    author: "Rizky A.",
    role: locale === "en" ? "Scholarship Awardee" : "Awardee Beasiswa",
    univ: "Universitas Gadjah Mada",
    initial: "R",
    bg: "from-emerald-500 to-teal-500",
  },
  {
    quote: locale === "en" ? (
      <>I collect dozens of industry research articles and project notes every week. The sleek, distraction-free interface of <LinkoraText /> makes deep work a delight. It goes far beyond a typical bookmark tool.</>
    ) : (
      <>Saya menyimpan banyak artikel riset dan catatan proyek. Tampilan <LinkoraText /> yang premium dan rapi membuat saya lebih betah bekerja. Ini lebih dari sekadar bookmark manager biasa.</>
    ),
    author: "Dinda M.",
    role: "Product Designer",
    univ: "Tech Startup",
    initial: "D",
    bg: "from-amber-500 to-orange-500",
  },
  {
    quote: locale === "en" ? (
      <>Curating weekly newsletter sources used to be chaotic with 50+ open tabs. <LinkoraText /> lets me save URLs with one click, tag them by topic, and auto-summarize key takeaways before drafting.</>
    ) : (
      <>Dulu riset artikel mingguan selalu bikin pusing karena puluhan tab browser menumpuk. Di <LinkoraText />, saya tinggal simpan link, beri tag topik, dan rangkum poin pentingnya sebelum mulai menulis.</>
    ),
    author: "Fauzan R.",
    role: locale === "en" ? "Tech Writer & Creator" : "Tech Writer & Kreator",
    univ: "Digital Media",
    initial: "F",
    bg: "from-violet-500 to-indigo-500",
  },
  {
    quote: locale === "en" ? (
      <>Finding API docs, GitHub issues, and architecture articles I read months ago is now effortless. Semantic search in <LinkoraText /> understands context even when I only recall vague keywords.</>
    ) : (
      <>Menemukan kembali dokumentasi API, issue GitHub, dan artikel teknis yang pernah saya baca jadi sangat cepat. Fitur pencarian cerdas di <LinkoraText /> bisa mengerti konteks meski saya lupa judul persisnya.</>
    ),
    author: "Sarah K.",
    role: "Software Engineer",
    univ: "Fintech Company",
    initial: "S",
    bg: "from-cyan-500 to-blue-600",
  },
  {
    quote: locale === "en" ? (
      <>Studying clinical cases requires cross-referencing hundreds of medical guidelines and journals. Having my links and structured notes side-by-side inside <LinkoraText /> keeps my prep organized.</>
    ) : (
      <>Belajar kasus klinis butuh membaca ratusan jurnal dan panduan medis. Mengintegrasikan tautan dan catatan dokumen langsung di satu ruang kerja <LinkoraText /> sangat membantu persiapan ujian saya.</>
    ),
    author: "Kevin P.",
    role: locale === "en" ? "Medical Student" : "Mahasiswa Kedokteran",
    univ: "Universitas Airlangga",
    initial: "K",
    bg: "from-rose-500 to-pink-600",
  },
  {
    quote: locale === "en" ? (
      <>I synthesize competitive benchmarks daily. Being able to organize collections with custom tags and export polished notes directly from <LinkoraText /> saves our consulting team hours every week.</>
    ) : (
      <>Saya sering mengumpulkan riset kompetitor setiap hari. Kemampuan mengelompokkan folder koleksi dengan tag dan mengekspor catatan langsung dari <LinkoraText /> sangat menghemat waktu kerja tim kami.</>
    ),
    author: "Alisha W.",
    role: locale === "en" ? "Research Analyst" : "Analis Riset",
    univ: "Consulting Group",
    initial: "A",
    bg: "from-teal-500 to-emerald-600",
  },
  {
    quote: locale === "en" ? (
      <>As a frontend developer, I collect UI animation inspirations and code snippets constantly. The clean tags and fast preview in <LinkoraText /> make it my primary second brain for all web resources.</>
    ) : (
      <>Sebagai developer, saya mengoleksi banyak inspirasi UI dan snippet kode. Sistem tag yang rapi dan preview cepat di <LinkoraText /> menjadikannya second brain utama untuk seluruh referensi web saya.</>
    ),
    author: "Hendra T.",
    role: locale === "en" ? "Frontend Developer" : "Pengembang Web",
    univ: "Creative Studio",
    initial: "H",
    bg: "from-indigo-500 to-purple-600",
  },
  {
    quote: locale === "en" ? (
      <>Managing research literature and sharing curated reading lists with my thesis mentees became so straightforward. <LinkoraText /> brings order and focus to my academic workflow.</>
    ) : (
      <>Mengelola literatur penelitian dan membagikan daftar bacaan penting kepada mahasiswa bimbingan jadi jauh lebih mudah. <LinkoraText /> menghadirkan keteraturan dalam rutinitas akademik saya.</>
    ),
    author: "Maya S.",
    role: locale === "en" ? "Academic Lecturer" : "Dosen & Peneliti",
    univ: "Universitas Padjadjaran",
    initial: "M",
    bg: "from-pink-500 to-rose-600",
  },
]

export function Testimonials() {
  const { locale } = useTranslation()
  const testimonials = getTestimonials(locale)
  // Triple copy for continuous infinite loop without any edge hit
  const allTestimonials = [...testimonials, ...testimonials, ...testimonials]

  const containerRef = useRef<HTMLDivElement>(null)
  const isInteractingRef = useRef(false)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startScrollLeftRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll loop: bergulir 24 jam nonstop dari kanan ke kiri
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Set posisi awal di sepertiga (Set B) setelah DOM selesai render
    const initTimer = setTimeout(() => {
      if (el && el.scrollWidth > 0) {
        el.scrollLeft = el.scrollWidth / 3
      }
    }, 50)

    let animationFrameId: number
    const speed = 0.75 // Kecepatan presisi, stabil, dan nyaman dibaca

    const step = () => {
      // Gulir terus 24 jam nonstop kecuali saat user sedang aktif menyentuh / mendrag
      if (!isInteractingRef.current && !isDraggingRef.current && el) {
        el.scrollLeft += speed

        const oneThird = el.scrollWidth / 3
        if (oneThird > 0) {
          // Seamless infinite wrap: menjaga posisi selalu di set tengah secara mulus
          if (el.scrollLeft >= 2 * oneThird) {
            el.scrollLeft -= oneThird
          } else if (el.scrollLeft < oneThird * 0.5) {
            el.scrollLeft += oneThird
          }
        }
      }
      animationFrameId = requestAnimationFrame(step)
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      clearTimeout(initTimer)
      cancelAnimationFrame(animationFrameId)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Global mouseup agar drag tetap dilepas meski mouse berada di luar container
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          isInteractingRef.current = false
        }, 400)
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp)
  }, [])

  // Resume helper saat interaksi pengguna selesai
  const triggerResume = (delay = 500) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false
    }, delay)
  }

  // Wheel interaction (mousewheel/trackpad)
  const handleWheel = () => {
    isInteractingRef.current = true
    triggerResume(500)
  }

  // Native scroll (misal momentum scroll pada mobile)
  const handleScroll = () => {
    const el = containerRef.current
    if (el && el.scrollWidth > 0) {
      const oneThird = el.scrollWidth / 3
      if (el.scrollLeft >= 2 * oneThird) {
        el.scrollLeft -= oneThird
      } else if (el.scrollLeft < oneThird * 0.5) {
        el.scrollLeft += oneThird
      }
    }

    if (isInteractingRef.current) {
      triggerResume(500)
    }
  }

  // Touch swipe interactions
  const handleTouchStart = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    isInteractingRef.current = true
  }

  const handleTouchEnd = () => {
    triggerResume(500)
  }

  // Mouse drag-to-scroll interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    isDraggingRef.current = true
    isInteractingRef.current = true
    startXRef.current = e.pageX - containerRef.current.offsetLeft
    startScrollLeftRef.current = containerRef.current.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startXRef.current) * 1.3
    containerRef.current.scrollLeft = startScrollLeftRef.current - walk

    const oneThird = containerRef.current.scrollWidth / 3
    if (oneThird > 0) {
      if (containerRef.current.scrollLeft >= 2 * oneThird) {
        containerRef.current.scrollLeft -= oneThird
        startScrollLeftRef.current -= oneThird
      } else if (containerRef.current.scrollLeft < oneThird * 0.5) {
        containerRef.current.scrollLeft += oneThird
        startScrollLeftRef.current += oneThird
      }
    }
  }

  return (
    <section className="py-14 md:py-20 relative overflow-hidden bg-background">
      {/* Background glow ambiance */}
      <div className="absolute right-0 top-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-accent/10 rounded-full blur-[70px] md:blur-[140px] pointer-events-none" />
      <div className="absolute left-0 bottom-1/4 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-primary/10 rounded-full blur-[80px] md:blur-[150px] pointer-events-none" />
      
      <div className="container px-4 md:px-6 relative z-10 mb-8 sm:mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground"
          >
            {locale === "en" ? "Loved by Students & Professionals" : "Disukai oleh Pelajar & Profesional"}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            {locale === "en" ? "How " : "Bagaimana "}<LinkoraText /> {locale === "en" ? "empowers thousands of learners and creators to stay organized." : "membantu ribuan pengguna tetap terorganisir dan produktif."}
          </motion.p>
        </div>
      </div>

      {/* Infinite 24/7 Auto-Scrolling Testimonial Carousel Track */}
      <div className="relative w-full overflow-hidden">
        {/* Soft edge gradient fades */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-28 bg-gradient-to-r from-background via-background/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-28 bg-gradient-to-l from-background via-background/80 to-transparent z-20 pointer-events-none" />

        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden py-4 px-6 sm:px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
        >
          {allTestimonials.map((tItem, idx) => (
            <div
              key={`${tItem.author}-${idx}`}
              className="w-[280px] sm:w-[320px] md:w-[370px] min-h-[220px] sm:min-h-[240px] shrink-0 glass-panel p-5 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl border border-border/60 hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-foreground/5 group-hover:text-primary/20 transition-colors duration-300 mb-2 pointer-events-none" />
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                  &ldquo;{tItem.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 mt-3 border-t border-border/40">
                <div className={`w-10 h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br ${tItem.bg} flex items-center justify-center font-bold text-white shadow-md text-xs sm:text-sm shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                  {tItem.initial}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground text-xs sm:text-sm truncate">{tItem.author}</h4>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{tItem.role} • {tItem.univ}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
