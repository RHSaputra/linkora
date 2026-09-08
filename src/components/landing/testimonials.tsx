"use client"

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
      <>The Reminders and Opportunity Tracker are game-changers. I haven't missed a single scholarship application deadline or competition date since all due dates are tracked automatically.</>
    ) : (
      <>Fitur Reminder dan Opportunity Tracker sangat membantu. Saya tidak pernah lagi kelewatan deadline pendaftaran beasiswa dan workshop karena semua sudah terekam dan ada pengingat otomatisnya.</>
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
]

export function Testimonials() {
  const { t, locale } = useTranslation()
  const testimonials = getTestimonials(locale)

  return (
    <section className="py-14 md:py-18 relative overflow-hidden bg-background">
      {/* Background glow */}
      <div className="absolute right-0 top-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-accent/10 rounded-full blur-[70px] md:blur-[140px] pointer-events-none" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-foreground"
          >
            {locale === "en" ? "Loved by Students & Professionals" : "Disukai oleh Pelajar & Profesional"}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            {locale === "en" ? "How " : "Bagaimana "}<LinkoraText /> {locale === "en" ? "empowers thousands of learners and creators to stay organized." : "membantu ribuan pengguna tetap terorganisir dan produktif."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {testimonials.map((tItem, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="glass-panel p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl relative hover:border-primary/40 transition-all duration-300 border border-border/60 shadow-lg flex flex-col justify-between"
            >
              <div>
                <Quote className="absolute top-6 right-6 w-10 h-10 text-foreground/5 pointer-events-none" />
                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-6 relative z-10 font-normal">
                  &ldquo;{tItem.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-border/40">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tItem.bg} flex items-center justify-center font-bold text-white shadow-md text-sm shrink-0`}>
                  {tItem.initial}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground text-sm truncate">{tItem.author}</h4>
                  <p className="text-xs text-muted-foreground truncate">{tItem.role} • {tItem.univ}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
