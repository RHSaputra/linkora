"use client"

import { motion } from "framer-motion"
import { Check, X, Minus } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"

const features = [
  { name: "Simpan & Arsip Multi-Platform Links", bookmark: "Yes", notes: "Limited", linkora: "Yes" },
  { name: "Editor Catatan Lengkap (Word-Style Tools)", bookmark: "No", notes: "Yes", linkora: "Yes" },
  { name: "Opportunity Tracker (Magang, Beasiswa, Lomba)", bookmark: "No", notes: "No", linkora: "Yes" },
  { name: "AI Ringkasan Intisari Otomatis", bookmark: "No", notes: "No", linkora: "Yes" },
  { name: "Smart Semantic Search Instan", bookmark: "Limited", notes: "Limited", linkora: "Yes" },
  { name: "Deadline Tracker & Status Berkas", bookmark: "No", notes: "No", linkora: "Yes" },
  { name: "All-in-One Ruang Kerja Terpadu", bookmark: "No", notes: "No", linkora: "Yes" },
]

export function Comparison() {
  const renderIcon = (status: string, isLinkora: boolean = false) => {
    if (status === "Yes") {
      return (
        <div className={`mx-auto w-6 h-6 rounded-full flex items-center justify-center ${isLinkora ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(var(--primary),0.6)] font-bold' : 'bg-foreground/10 text-foreground'}`}>
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )
    }
    if (status === "No") {
      return <X className="mx-auto w-4 h-4 text-muted-foreground/40" />
    }
    if (status === "Limited") {
      return <Minus className="mx-auto w-4 h-4 text-amber-400" />
    }
    return null
  }

  return (
    <section className="py-14 md:py-18 relative overflow-hidden bg-background">
      {/* Glow Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground"
          >
            Mengapa Memilih <LinkoraText />?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground"
          >
            Satu sistem terintegrasi yang jauh lebih cerdas, produktif, dan rapi dibandingkan kumpulan aplikasi terpisah.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-panel rounded-3xl overflow-hidden border border-border/70 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/60 bg-foreground/[0.02]">
                    <th className="p-5 sm:p-6 font-bold text-foreground text-sm uppercase tracking-wider w-1/3">Fitur Utama</th>
                    <th className="p-5 sm:p-6 font-semibold text-center text-muted-foreground text-xs uppercase tracking-wider w-1/5">Bookmark<br /><span className="text-[11px] font-normal lowercase">browser</span></th>
                    <th className="p-5 sm:p-6 font-semibold text-center text-muted-foreground text-xs uppercase tracking-wider w-1/5">Aplikasi<br /><span className="text-[11px] font-normal lowercase">catatan biasa</span></th>
                    <th className="p-5 sm:p-6 font-bold text-center text-primary text-base w-1/4 bg-primary/10 border-l border-primary/20">
                      <LinkoraText />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {features.map((feature, idx) => (
                    <tr key={idx} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-foreground/90">{feature.name}</td>
                      <td className="p-4 sm:p-5 text-center">{renderIcon(feature.bookmark)}</td>
                      <td className="p-4 sm:p-5 text-center">{renderIcon(feature.notes)}</td>
                      <td className="p-4 sm:p-5 text-center bg-primary/[0.04] border-l border-primary/20">{renderIcon(feature.linkora, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

