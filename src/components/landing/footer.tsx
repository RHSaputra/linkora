"use client"

import { motion } from "framer-motion"
import { ArrowRight, Instagram, Mail, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { LinkoraText } from "@/components/ui/linkora-text"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-14 md:py-18 relative overflow-hidden bg-background">
      {/* Dynamic ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-[130px] pointer-events-none" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-8 sm:p-12 md:p-16 rounded-[2.5rem] text-center max-w-5xl mx-auto border border-primary/30 shadow-2xl relative overflow-hidden group"
        >
          {/* Subtle animated gradient mesh inside */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-purple-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Berhenti Kehilangan <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">Peluang & Informasi Penting.</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Mulai bangun sistem arsip dan pengetahuan pribadi yang rapi, cerdas, dan tersinkronisasi bersama <LinkoraText /> hari ini.
            </p>
            
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full h-13 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-10px_rgba(var(--primary),0.8)] transition-all hover:scale-105 cursor-pointer font-bold" asChild>
                <Link href="/register">
                  Daftar Gratis Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-13 px-7 text-base glass-panel hover:bg-foreground/5 transition-all" asChild>
                <Link href="/login">
                  Sudah Punya Akun? Masuk
                </Link>
              </Button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Gratis Digunakan</span>
              <span className="flex items-center gap-1">•</span>
              <span>Tanpa Kartu Kredit</span>
              <span className="flex items-center gap-1">•</span>
              <span>Akses Semua Fitur</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="py-10 border-t border-border/60 bg-background relative z-10 mt-auto">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-10 text-center md:text-left">
          <div className="max-w-md space-y-3">
            <div className="flex items-center justify-center md:justify-start">
              <img src="/Logo.png" alt="Linkora Logo" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Personal Knowledge Hub cerdas untuk mengelola semua tautan, catatan, dan peluang Anda dalam satu ruang kerja digital terpadu.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground flex-wrap justify-center">
            <Link href="#solusi" className="hover:text-primary transition-colors">Solusi</Link>
            <Link href="#cara-kerja" className="hover:text-primary transition-colors">Cara Kerja</Link>
            <Link href="#use-cases" className="hover:text-primary transition-colors">Untuk Siapa</Link>
            <Link href="#demo" className="hover:text-primary transition-colors">Demo</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Masuk</Link>
            <Link href="/register" className="hover:text-primary transition-colors">Daftar</Link>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} <LinkoraText />. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link href="#" className="w-9 h-9 rounded-full bg-foreground/5 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
              <Instagram className="w-4 h-4" />
            </Link>
            <Link href="#" className="w-9 h-9 rounded-full bg-foreground/5 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
              <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

