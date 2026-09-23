"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Plus, Minus } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Gratis",
    price: "Rp 0",
    description: "Sempurna untuk pembaca kasual dan mahasiswa.",
    features: [
      "Simpan hingga 500 tautan",
      "Pencarian dasar",
      "Tag dan folder",
      "Sinkronisasi antar perangkat"
    ]
  },
  {
    name: "Pro",
    price: "Rp 99rb",
    period: "/bln",
    description: "Untuk pekerja ahli yang membutuhkan kekuatan AI.",
    isPopular: true,
    features: [
      "Simpan tautan tanpa batas",
      "Ringkasan AI (Tanpa Batas)",
      "Pencarian Semantik",
      "Obrolan Asisten AI",
      "Analisis Mendalam",
      "Dukungan Prioritas"
    ]
  },
  {
    name: "Tim",
    price: "Rp 299rb",
    period: "/bln",
    description: "Riset kolaboratif untuk tim profesional.",
    features: [
      "Semua fitur Pro",
      "Ruang kerja bersama",
      "Anotasi tim",
      "Dasbor admin",
      "Integrasi kustom"
    ]
  }
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-foreground"
          >
            Harga yang sederhana dan transparan
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            Mulai secara gratis, tingkatkan paket saat Anda membutuhkan kekuatan penuh.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 ${
                plan.isPopular 
                ? "bg-gradient-to-b from-primary/10 to-background border-primary/30 border shadow-xl shadow-primary/15" 
                : "bg-foreground/[0.02] border border-foreground/5"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg">
                  Paling Populer
                </div>
              )}
              
              <h3 className="text-xl font-medium text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">{plan.description}</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              
              <Link 
                href="/register" 
                className={`w-full flex items-center justify-center rounded-full py-3 px-6 text-sm font-semibold transition-all duration-150 mb-8 active:scale-95 touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  plan.isPopular 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:scale-105" 
                  : "bg-foreground/5 text-foreground hover:bg-foreground/10"
                }`}
              >
                Mulai Sekarang
              </Link>
              
              <div className="space-y-4">
                {plan.features.map((f, fi) => (
                  <div key={fi} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const faqs = [
  {
    question: "Bagaimana cara kerja Ringkasan AI?",
    answer: "Model bahasa canggih kami memindai konten dari URL yang Anda simpan, mengekstrak argumen inti, fakta kunci, dan kesimpulan utamanya secara instan. Ini meringkas artikel panjang menjadi paragraf yang mudah dicerna."
  },
  {
    question: "Apakah data saya pribadi dan aman?",
    answer: "Tentu saja. Data Anda dienkripsi baik saat istirahat maupun dalam perjalanan. Kami tidak pernah menjual data Anda atau menggunakan tautan pribadi Anda untuk melatih model AI publik mana pun."
  },
  {
    question: "Bisakah saya mengimpor markah buku saya yang sudah ada?",
    answer: "Ya! Anda dapat dengan mudah mengimpor markah buku dari Chrome, Safari, Pocket, Raindrop, dan layanan lainnya menggunakan alat pengimpor HTML atau CSV standar kami."
  },
  {
    question: "Apa yang terjadi jika saya membatalkan langganan Pro?",
    answer: "Jika Anda membatalkan, Anda akan diturunkan ke paket Gratis. Anda akan tetap menyimpan semua tautan yang ada, namun Anda akan kehilangan akses ke fitur premium seperti ringkasan AI dan pencarian semantik."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 relative bg-foreground/[0.02] border-t border-foreground/5">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">Pertanyaan yang Sering Diajukan</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="border border-foreground/10 rounded-2xl bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                {openIndex === i ? <Minus className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
