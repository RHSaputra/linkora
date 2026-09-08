"use client"

import { motion } from "framer-motion"
import { ArrowRight, Instagram, Mail, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { LinkoraText } from "@/components/ui/linkora-text"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/providers/i18n-provider"

export function CTA() {
  const { t, locale } = useTranslation()

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
          className="glass-panel p-6 sm:p-12 md:p-16 rounded-2xl sm:rounded-[2.5rem] text-center max-w-5xl mx-auto border border-primary/30 shadow-2xl relative overflow-hidden group"
        >
          {/* Subtle animated gradient mesh inside */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-purple-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative z-10 space-y-5 sm:space-y-6 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              {locale === "en" ? "Stop Losing " : "Berhenti Kehilangan "}<br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-400">
                {locale === "en" ? "Opportunities & Key Information." : "Peluang & Informasi Penting."}
              </span>
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {locale === "en"
                ? "Start building your clean, intelligent, synchronized knowledge and link repository with Linkora today."
                : "Mulai bangun sistem arsip dan pengetahuan pribadi yang rapi, cerdas, dan tersinkronisasi bersama Linkora hari ini."}
            </p>
            
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
              <Button size="lg" className="w-full sm:w-auto rounded-full h-12 sm:h-13 px-8 text-sm sm:text-base bg-primary hover:bg-primary-hover text-primary-foreground shadow-2xl shadow-primary/30 active:scale-95 transition-all duration-150 hover:scale-105 cursor-pointer font-bold touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" asChild>
                <Link href="/dashboard">
                  {t("landing.openDashboard")} <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-12 sm:h-13 px-7 text-sm sm:text-base glass-panel hover:bg-foreground/5 active:scale-95 transition-all duration-150 touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" asChild>
                <Link href="/login">
                  {locale === "en" ? "Already have an account? Sign In" : "Sudah Punya Akun? Masuk"}
                </Link>
              </Button>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {locale === "en" ? "Free to Use" : "Gratis Digunakan"}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{locale === "en" ? "No Credit Card Required" : "Tanpa Kartu Kredit"}</span>
              <span className="hidden sm:inline">•</span>
              <span>{locale === "en" ? "Access All Core Features" : "Akses Semua Fitur"}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function Footer() {
  const { t, locale } = useTranslation()

  return (
    <footer className="py-10 border-t border-border/60 bg-background relative z-10 mt-auto">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-10 text-center md:text-left">
          <div className="max-w-md space-y-3">
            <div className="flex items-center justify-center md:justify-start">
              <img src="/logo.png" alt="Linkora Logo" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {locale === "en"
                ? "Intelligent Personal Knowledge Hub to manage all your links, notes, and opportunities in one unified digital workspace."
                : "Personal Knowledge Hub cerdas untuk mengelola semua tautan, catatan, dan peluang Anda dalam satu ruang kerja digital terpadu."}
            </p>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground flex-wrap justify-center">
            <Link href="#solusi" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1.5 sm:px-1.5 sm:py-0.5">{t("landing.navSolutions")}</Link>
            <Link href="#cara-kerja" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1.5 sm:px-1.5 sm:py-0.5">{t("landing.navHowItWorks")}</Link>
            <Link href="#use-cases" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1.5 sm:px-1.5 sm:py-0.5">{t("landing.navUseCases")}</Link>
            <Link href="#demo" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1.5 sm:px-1.5 sm:py-0.5">{t("landing.navDemo")}</Link>
            <Link href="/login" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1.5 sm:px-1.5 sm:py-0.5">{t("nav.login")}</Link>
            <Link href="/register" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1.5 sm:px-1.5 sm:py-0.5">{t("nav.signUp")}</Link>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} <LinkoraText />. {t("landing.footerRights")}
          </p>
          <div className="flex items-center gap-3">
            <Link href="#" aria-label="Instagram" className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-foreground/5 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Instagram className="w-4 h-4" />
            </Link>
            <Link href="#" aria-label="Email" className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-foreground/5 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
