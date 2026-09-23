"use client"

import { motion } from "framer-motion"
import { BookOpen, Briefcase, UserCircle2, Check } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"
import { useTranslation } from "@/components/providers/i18n-provider"

const getUseCases = (locale: string) => [
  {
    title: locale === "en" ? "For Students" : "Untuk Mahasiswa",
    subtitle: locale === "en" ? "Research, Thesis, & Competitions" : "Riset, Skripsi, & Kompetisi",
    icon: BookOpen,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    gradient: "from-blue-500/10 via-transparent to-transparent",
    features: locale === "en" ? [
      "Lecture Notes & Journal References",
      "Internship & Apprenticeship Portals",
      "Scholarship Requirements & Deadlines",
      "Competition Repositories & Problem Sets",
    ] : [
      "Catatan Kuliah & Referensi Jurnal",
      "Link Pendaftaran Magang MSIB/BUMN",
      "Informasi Beasiswa & Syarat Berkas",
      "Bank Soal & Referensi Lomba",
    ],
  },
  {
    title: locale === "en" ? "For Job Seekers" : "Untuk Job Seeker",
    subtitle: locale === "en" ? "Career & Portfolio Tracking" : "Karir & Portfolio Tracker",
    icon: UserCircle2,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    gradient: "from-purple-500/10 via-transparent to-transparent",
    features: locale === "en" ? [
      "Job Application Status Tracker",
      "Portfolio Inspiration & Project Links",
      "Interview Preparation Resources",
      "Recruiter Contacts & Professional Profiles",
    ] : [
      "Lacak Status Lowongan Pekerjaan",
      "Koleksi Inspirasi & Link Portfolio",
      "Materi Persiapan Interview Kerja",
      "Jejaring Kontak & Profil Rekruter",
    ],
  },
  {
    title: locale === "en" ? "For Professionals" : "Untuk Profesional",
    subtitle: locale === "en" ? "Knowledge Management & Projects" : "Knowledge Management & Proyek",
    icon: Briefcase,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    gradient: "from-amber-500/10 via-transparent to-transparent",
    features: locale === "en" ? [
      "Market & Industry Research Archive",
      "Project Documentation & Meeting Memos",
      "Design & Tooling Resource Repositories",
      "Skill Development & Deep-Dive Articles",
    ] : [
      "Arsip Link Riset Pasar & Industri",
      "Dokumentasi Proyek & Meeting Notes",
      "Resource Tools & Desain Terbaru",
      "Artikel Pengembangan Skill",
    ],
  },
]

export function UseCases() {
  const { t, locale } = useTranslation()
  const useCases = getUseCases(locale)

  return (
    <section id="use-cases" className="py-10 md:py-18 relative overflow-hidden bg-background">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] md:w-[700px] h-[340px] sm:h-[500px] md:h-[700px] bg-primary/10 rounded-full blur-[80px] md:blur-[150px] pointer-events-none" />

      <div className="container px-3.5 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-xl sm:text-3xl md:text-5xl font-bold tracking-tight leading-tight md:leading-snug mb-2 sm:mb-4 text-foreground"
          >
            {locale === "en" ? "Who is " : "Dibuat Khusus Untuk Siapa "}<LinkoraText />{locale === "en" ? " Built For?" : "?"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-[11px] sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            {locale === "en"
              ? "Flexible across all study workflows, career tracking, and knowledge creation."
              : "Fleksibel untuk berbagai alur kerja belajar, mencari peluang, dan mengelola karir."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase, idx) => {
            const Icon = useCase.icon
            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: idx * 0.12, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="glass-panel p-4.5 sm:p-7 md:p-8 rounded-xl sm:rounded-3xl relative group overflow-hidden border border-border/60 hover:border-primary/40 transition-all duration-300 shadow-xl"
              >
                {/* Dynamic Gradient Top Accent */}
                <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${useCase.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10 space-y-4 sm:space-y-6">
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${useCase.bg} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon className={`w-5.5 h-5.5 sm:w-7 sm:h-7 ${useCase.color}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1 tracking-tight">{useCase.title}</h3>
                    <p className="text-[10px] sm:text-xs font-semibold text-primary/80 uppercase tracking-wider">{useCase.subtitle}</p>
                  </div>
                  
                  <ul className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                    {useCase.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                        <div className="flex-shrink-0 w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                        </div>
                        <span className="text-muted-foreground group-hover:text-foreground/90 transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
