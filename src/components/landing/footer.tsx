"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Instagram, Mail, ShieldCheck, MessageSquare } from "lucide-react"
import Link from "next/link"
import { LinkoraText } from "@/components/ui/linkora-text"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/providers/i18n-provider"
import { ContactDialog } from "@/components/contact/contact-dialog"

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
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <footer className="py-10 border-t border-border/60 bg-background relative z-10 mt-auto">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <img src="/logo.png" alt="Linkora Logo" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto md:mx-0">
              {locale === "en"
                ? "Intelligent Personal Knowledge Hub to manage all your links, notes, and opportunities in one unified digital workspace."
                : "Personal Knowledge Hub cerdas untuk mengelola semua tautan, catatan, dan peluang Anda dalam satu ruang kerja digital terpadu."}
            </p>

            {/* Interactive Animated Instagram Follow Button */}
            <div className="pt-1 flex justify-center md:justify-start">
              <motion.a
                href="https://www.instagram.com/linkora_new?stkn=OG1lZ2MwaGpybWxm"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-full border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 text-foreground hover:text-white transition-all duration-300 shadow-xs md:shadow-md shadow-pink-500/10 hover:shadow-xl hover:shadow-pink-500/25 cursor-pointer select-none overflow-hidden"
              >
                {/* Shimmer overlay on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs shrink-0 group-hover:rotate-12 transition-transform duration-300">
                  <Instagram className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </div>
                <span className="text-[11px] md:text-xs font-semibold whitespace-nowrap">
                  {locale === "en" ? "Follow Us on Instagram" : "Ikuti Kami di Instagram"}
                </span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-pink-500/20 group-hover:bg-white/20 text-pink-500 dark:text-pink-300 group-hover:text-white transition-colors leading-none">
                  @linkora_new
                </span>
              </motion.a>
            </div>
          </div>

          {/* Categorized Navigation Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-left">
            {/* Kategori: Produk */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                {t("landing.footerCategoryProduct")}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#solusi" className="hover:text-primary transition-colors block py-0.5">
                    {t("landing.navSolutions")}
                  </Link>
                </li>
                <li>
                  <Link href="#cara-kerja" className="hover:text-primary transition-colors block py-0.5">
                    {t("landing.navHowItWorks")}
                  </Link>
                </li>
                <li>
                  <Link href="#use-cases" className="hover:text-primary transition-colors block py-0.5">
                    {t("landing.navUseCases")}
                  </Link>
                </li>
                <li>
                  <Link href="#demo" className="hover:text-primary transition-colors block py-0.5">
                    {t("landing.navDemo")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kategori: Bantuan & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                {t("landing.footerCategorySupport")}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="hover:text-primary transition-colors text-left flex items-center gap-1.5 py-0.5 cursor-pointer font-medium text-primary"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>{locale === "en" ? "Contact Us" : "Hubungi Kami"}</span>
                  </button>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors block py-0.5">
                    {locale === "en" ? "Privacy Policy" : "Kebijakan Privasi"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kategori: Akun */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                {t("landing.footerCategoryAccount")}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors block py-0.5">
                    {t("nav.login")}
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-primary transition-colors block py-0.5">
                    {t("nav.signUp")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} <LinkoraText />. {t("landing.footerRights")}
            </p>
            <span className="hidden sm:inline text-border">•</span>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline">
              {locale === "en" ? "Privacy Policy" : "Kebijakan Privasi"}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/linkora_new?stkn=OG1lZ2MwaGpybWxm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @linkora_new"
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-foreground/5 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:border-transparent active:scale-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-xs"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              aria-label="Hubungi Kami via Email"
              title="Hubungi Kami (supportlinkorian@gmail.com)"
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-foreground/5 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Contact Us Modal Dialog */}
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </footer>
  )
}
