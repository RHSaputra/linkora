"use client"

import { motion } from "framer-motion"
import { Laptop, Smartphone, Bookmark, Search, Layers, FileText, CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"

export function Showcase() {
  return (
    <section className="py-14 md:py-18 relative overflow-hidden bg-background">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground"
          >
            Satu Dashboard untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Semua Kebutuhan</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground"
          >
            Desain antarmuka yang bersih, responsif, dan mudah digunakan di desktop maupun smartphone Anda.
          </motion.p>
        </div>

        {/* Side-by-side layout for Desktop and Mobile */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 max-w-6xl mx-auto">
          
          {/* Desktop Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="flex-1 w-full max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-3 text-muted-foreground justify-center lg:justify-start text-xs font-semibold uppercase tracking-wider">
              <Laptop className="w-4 h-4 text-primary"/> 
              <span>Tampilan Desktop</span>
            </div>
            
            {/* Laptop Frame */}
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-900 border-[8px] rounded-t-2xl aspect-[16/10] overflow-hidden shadow-2xl">
              {/* Realistic Mockup Content */}
              <div className="p-4 bg-gray-950 text-gray-200 h-full overflow-hidden flex gap-3 text-left font-sans">
                {/* Mini Sidebar */}
                <div className="w-32 bg-gray-900/60 rounded-xl p-2.5 border border-white/5 flex flex-col justify-between shrink-0 hidden sm:flex">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Bookmark className="w-3.5 h-3.5" /> Linkora
                    </div>
                    <div className="space-y-1 pt-2">
                      <div className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary font-medium flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Semua Link
                      </div>
                      <div className="text-[10px] px-2 py-1 rounded hover:bg-white/5 text-gray-400 font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Catatan
                      </div>
                      <div className="text-[10px] px-2 py-1 rounded hover:bg-white/5 text-gray-400 font-medium flex items-center gap-1">
                        <Bookmark className="w-3 h-3" /> AI Summary
                      </div>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-500 border-t border-white/5 pt-2 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Pro Plan
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Top search */}
                  <div className="flex items-center justify-between gap-2 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <Search className="w-3 h-3 text-primary" />
                      <span>Cari tautan, beasiswa, catatan...</span>
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-gray-900/60 border border-white/5">
                      <div className="text-[9px] text-gray-400">Total Tautan</div>
                      <div className="text-sm font-bold text-foreground mt-0.5">148</div>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-900/60 border border-white/5">
                      <div className="text-[9px] text-gray-400">Catatan AI</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">36</div>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-900/60 border border-white/5">
                      <div className="text-[9px] text-gray-400">Peluang Aktif</div>
                      <div className="text-sm font-bold text-purple-400 mt-0.5">12</div>
                    </div>
                  </div>

                  {/* Mini Cards Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-gray-900/80 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">Magang</span>
                        <ArrowUpRight className="w-3 h-3 text-gray-500" />
                      </div>
                      <div className="text-[11px] font-semibold truncate">Software Engineer Intern — GoTo</div>
                      <div className="text-[9px] text-gray-400 line-clamp-1">Deadline: 28 Feb • Hybrid Jakarta</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-900/80 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">Beasiswa</span>
                        <ArrowUpRight className="w-3 h-3 text-gray-500" />
                      </div>
                      <div className="text-[11px] font-semibold truncate">Beasiswa Unggulan Kemendikbud</div>
                      <div className="text-[9px] text-gray-400 line-clamp-1">Dokumen: Esai, LOA, Toefl 550</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Laptop Bottom Base */}
            <div className="relative mx-auto bg-gray-900 rounded-b-xl h-[20px] w-[105%] -ml-[2.5%] shadow-2xl flex items-center justify-center border-t border-white/5">
              <div className="w-24 h-1.5 bg-gray-800 rounded-b-md absolute top-0"></div>
            </div>
          </motion.div>

          {/* Mobile Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-[240px] sm:max-w-[260px] flex-shrink-0"
          >
            <div className="flex items-center gap-2 mb-3 text-muted-foreground justify-center text-xs font-semibold uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-accent"/> 
              <span>Tampilan Mobile</span>
            </div>

            {/* Mobile Phone Frame */}
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-950 border-[10px] rounded-[2.5rem] aspect-[9/18.5] shadow-2xl overflow-hidden text-left p-3 pt-6 flex flex-col justify-between">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2 inset-x-0 h-4 bg-gray-800 rounded-full w-24 mx-auto z-20" />
              
              {/* Mobile Content */}
              <div className="space-y-2.5 pt-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-primary flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5" /> Linkora
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                    U
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-gray-900 border border-white/5 text-[10px] text-gray-400 flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-primary" />
                  <span>Cari link...</span>
                </div>

                <div className="space-y-1.5">
                  <div className="p-2 rounded-xl bg-gray-900 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Catatan</span>
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    </div>
                    <div className="text-[10px] font-semibold text-gray-200 truncate">Ringkasan Riset Skripsi</div>
                    <div className="text-[8px] text-gray-400">3 Poin Inti AI siap diulas</div>
                  </div>

                  <div className="p-2 rounded-xl bg-gray-900 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">Magang</span>
                      <span className="text-[8px] text-gray-500">2h lalu</span>
                    </div>
                    <div className="text-[10px] font-semibold text-gray-200 truncate">UI Designer — Tokopedia</div>
                  </div>
                </div>
              </div>

              {/* Bottom Nav Bar */}
              <div className="h-9 rounded-xl bg-gray-900/90 border border-white/5 flex items-center justify-around px-2 text-gray-400">
                <div className="text-primary"><Layers className="w-3.5 h-3.5" /></div>
                <div><FileText className="w-3.5 h-3.5" /></div>
                <div><Bookmark className="w-3.5 h-3.5" /></div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

