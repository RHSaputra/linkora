"use client"
import { motion } from "framer-motion"
import { FileText, Brain, Search, LayoutDashboard, Cloud, ShieldCheck, Upload, BarChart } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"

const features = [
  {
    icon: FileText,
    title: "Ringkasan AI",
    description: "Hasilkan ringkasan ringkas dari artikel, video, atau konten berdurasi panjang secara instan menggunakan AI canggih."
  },
  {
    icon: Brain,
    title: "Wawasan Cerdas",
    description: "Ekstrak poin-poin utama dan wawasan yang dapat ditindaklanjuti secara otomatis untuk menghemat waktu membaca."
  },
  {
    icon: Search,
    title: "Penemu Peluang",
    description: "Temukan peluang tersembunyi di dalam tautan tersimpan Anda dengan mesin pencari semantik kami yang mendalam."
  },
  {
    icon: ShieldCheck,
    title: "Asisten AI",
    description: "Berbincang dengan basis pengetahuan Anda. Ajukan pertanyaan dan dapatkan jawaban langsung dari tautan Anda."
  },
  {
    icon: LayoutDashboard,
    title: "Dasbor Analitik",
    description: "Lacak kebiasaan membaca, kategori tautan, dan pertumbuhan wawasan Anda dengan bagan interaktif yang indah."
  },
  {
    icon: Cloud,
    title: "Sinkronisasi Cloud",
    description: "Akses seluruh basis pengetahuan Anda di semua perangkat, tersinkronisasi secara real-time dan sempurna."
  }
]

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-foreground"
          >
            Fitur canggih untuk <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">pekerja berpengetahuan modern</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            <LinkoraText /> bukan sekadar pengelola markah buku. Ini adalah asisten riset AI pribadi Anda, dirancang untuk membantu Anda mengonsumsi, memahami, dan mengatur informasi dengan lebih cepat.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl bg-foreground/[0.02] border border-foreground/5 hover:bg-foreground/[0.04] hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const steps = [
  {
    icon: Upload,
    title: "Simpan Tautan Apa Pun",
    description: <>Rekatkan URL dari situs web, artikel, atau video mana pun ke dalam <LinkoraText />.</>
  },
  {
    icon: Brain,
    title: "AI Menganalisis Konten",
    description: "AI kami secara otomatis membaca, memberi tag, dan mengekstrak wawasan utama dari konten Anda."
  },
  {
    icon: BarChart,
    title: "Manfaatkan Wawasan",
    description: "Gunakan ringkasan yang dihasilkan untuk belajar lebih cepat dan mengambil keputusan yang lebih baik."
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              className="text-3xl md:text-5xl font-bold mb-6 text-foreground"
            >
              Bagaimana <LinkoraText /> <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">bekerja secara ajaib</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg mb-12"
            >
              Ubah kekacauan menjadi kejelasan hanya dalam tiga langkah sederhana. Berhenti kehilangan jejak informasi penting dan mulailah membangun otak kedua Anda.
            </motion.p>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center relative">
                    <step.icon className="w-5 h-5 text-foreground" />
                    {i !== steps.length - 1 && (
                      <div className="absolute top-12 bottom-[-2rem] left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-foreground/20 to-transparent" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-[2.5rem] blur-2xl" />
            <div className="relative rounded-[2.5rem] bg-card border border-foreground/10 p-2 shadow-2xl overflow-hidden">
              <div className="rounded-[2rem] overflow-hidden bg-black/50 aspect-[4/5] relative">
                 <img 
                    src="/icon.jpg"
                    alt="AI Summary Feature"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex flex-col justify-end p-8">
                    <div className="bg-foreground/10 backdrop-blur-md border border-foreground/20 p-4 rounded-2xl">
                      <div className="mb-3">
                        <span className="font-medium text-sm text-foreground">Ringkasan AI</span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        <LinkoraText /> secara otomatis mengekstrak poin utama dari artikel mana pun, menghemat waktu membaca Anda hingga 80%.
                      </p>
                    </div>
                  </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
