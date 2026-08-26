"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"

const testimonials = [
  {
    quote: <>Dulu semua link magang dan tugas akhir tercecer di WhatsApp. Sejak pakai <LinkoraText />, semua tersusun rapi dan AI membantuku membuat ringkasan jurnal dalam hitungan detik. Benar-benar menyelamatkan skripsiku!</>,
    author: "Nadia L.",
    role: "Mahasiswa Semester Akhir",
    univ: "Universitas Indonesia",
    initial: "N",
    bg: "from-purple-500 to-pink-500",
  },
  {
    quote: <>Sebagai job seeker, saya menyimpan ratusan referensi portofolio dan lowongan pekerjaan. Smart Search di <LinkoraText /> membuat saya bisa menemukan kembali link perusahaan spesifik yang saya simpan bulan lalu dengan instan.</>,
    author: "Bima S.",
    role: "Fresh Graduate & Job Seeker",
    univ: "Institut Teknologi Bandung",
    initial: "B",
    bg: "from-blue-500 to-cyan-500",
  },
  {
    quote: "Fitur Reminder dan Opportunity Tracker sangat membantu. Saya tidak pernah lagi kelewatan deadline pendaftaran beasiswa dan workshop karena semua sudah terekam dan ada pengingat otomatisnya.",
    author: "Rizky A.",
    role: "Awardee Beasiswa",
    univ: "Universitas Gadjah Mada",
    initial: "R",
    bg: "from-emerald-500 to-teal-500",
  },
  {
    quote: <>Saya menyimpan banyak artikel riset dan catatan proyek. Tampilan <LinkoraText /> yang premium dan rapi membuat saya lebih betah bekerja. Ini lebih dari sekadar bookmark manager biasa.</>,
    author: "Dinda M.",
    role: "Product Designer",
    univ: "Tech Startup",
    initial: "D",
    bg: "from-amber-500 to-orange-500",
  },
]

export function Testimonials() {
  return (
    <section className="py-14 md:py-18 relative overflow-hidden bg-background">
      {/* Background glow */}
      <div className="absolute right-0 top-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground"
          >
            Disukai oleh Pelajar & Profesional
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground"
          >
            Bagaimana <LinkoraText /> membantu ribuan pengguna tetap terorganisir dan produktif.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="glass-panel p-8 rounded-3xl relative hover:border-primary/40 transition-all duration-300 border border-border/60 shadow-lg flex flex-col justify-between"
            >
              <div>
                <Quote className="absolute top-6 right-6 w-10 h-10 text-foreground/5 pointer-events-none" />
                <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-6 relative z-10 font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-border/40">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.bg} flex items-center justify-center font-bold text-white shadow-md text-sm shrink-0`}>
                  {t.initial}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground text-sm truncate">{t.author}</h4>
                  <p className="text-xs text-muted-foreground truncate">{t.role} • {t.univ}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

