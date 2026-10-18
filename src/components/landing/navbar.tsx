"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslation } from "@/components/providers/i18n-provider"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [isOverDarkHero, setIsOverDarkHero] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()
  const { t, locale } = useTranslation()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      const isPastThreshold = window.scrollY > 50
      setScrolled((prev) => (prev !== isPastThreshold ? isPastThreshold : prev))

      const heroTrack = document.getElementById("hero-track")
      if (heroTrack) {
        const rect = heroTrack.getBoundingClientRect()
        // If bottom of hero track is still covering the viewport top (> 70px)
        setIsOverDarkHero(rect.bottom > 70)
      } else {
        setIsOverDarkHero(window.location.pathname === "/" && window.scrollY < 200)
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Intersection Observer untuk deteksi section aktif
    const sections = ["solusi", "cara-kerja", "use-cases"]
    const currentSections = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentSections.add(entry.target.id)
            changed = true
          } else {
            if (currentSections.has(entry.target.id)) {
              currentSections.delete(entry.target.id)
              changed = true
            }
          }
        })

        if (changed) {
          if (currentSections.size > 0) {
            const active = sections.find((id) => currentSections.has(id))
            if (active) setActiveSection(active)
          } else {
            setActiveSection("")
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [])

  const navLinks = [
    { id: "solusi", label: t("landing.navSolutions") },
    { id: "cara-kerja", label: t("landing.navHowItWorks") },
    { id: "use-cases", label: t("landing.navUseCases") },
  ]

  const isDarkTheme = mounted ? resolvedTheme === "dark" : false
  // Navbar is dark if theme is dark OR user is currently over the dark hero slides
  const isNavbarDark = isDarkTheme || isOverDarkHero

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 py-2.5 sm:py-3.5 ${
        isNavbarDark
          ? "bg-slate-950/75 backdrop-blur-xl border-b border-white/10 shadow-lg"
          : "bg-[#dde3ea]/95 backdrop-blur-xl border-b border-slate-300/80 shadow-sm"
      }`}
    >
      <div className="container mx-auto px-3.5 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/linkorian.jpeg"
            alt="Linkorian Logo"
            className="h-8.5 sm:h-12 w-auto object-contain rounded-lg sm:rounded-xl drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex relative p-[1.5px] rounded-full overflow-hidden shadow-lg shadow-primary/20">
          <div className="absolute inset-[-1000%] z-0 pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="w-full h-full opacity-100"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, transparent 60%, var(--primary) 80%, var(--accent) 100%)",
              }}
            />
          </div>
          <div
            className={`relative z-10 flex items-center gap-8 backdrop-blur-xl px-6 py-2.5 rounded-full transition-colors duration-300 ${
              isNavbarDark
                ? "bg-slate-950/85 border border-white/10 shadow-md"
                : "bg-white border border-slate-200/90 shadow-xs"
            }`}
          >
            {navLinks.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`relative text-sm font-semibold transition-colors ${
                  activeSection === item.id
                    ? "text-primary font-bold"
                    : isNavbarDark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1.5 left-0 right-0 h-[3px] bg-primary rounded-full"
                    style={{ boxShadow: "0 0 12px var(--primary)" }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher
            variant="pill"
            className={
              isNavbarDark
                ? "bg-slate-900/80 border-white/15 text-slate-200 hover:bg-slate-800 hover:text-white"
                : "bg-white/90 border-slate-300 text-slate-800 hover:bg-white"
            }
          />
          <div className={isNavbarDark ? "text-slate-200 hover:text-white" : "text-slate-700 hover:text-slate-950"}>
            <ThemeToggle />
          </div>
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
            >
              {t("landing.openDashboard")}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-semibold active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring px-3 py-1.5 rounded-lg touch-manipulation select-none ${
                  isNavbarDark
                    ? "text-slate-200 hover:text-white hover:bg-white/10"
                    : "text-slate-700 hover:text-slate-950 hover:bg-black/5"
                }`}
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
              >
                {t("landing.openDashboard")} <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher
            variant="pill"
            className={
              isNavbarDark
                ? "bg-slate-900/80 border-white/15 text-slate-200 hover:bg-slate-800 hover:text-white"
                : "bg-white/90 border-slate-300 text-slate-800 hover:bg-white"
            }
          />
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
            className={`p-1.5 sm:p-2 rounded-xl active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation ${
              isNavbarDark
                ? "text-slate-200 hover:text-white hover:bg-white/10"
                : "text-slate-800 hover:text-slate-950 hover:bg-black/5"
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`md:hidden border-b px-6 py-6 space-y-4 backdrop-blur-2xl shadow-xl transition-colors duration-300 ${
            isNavbarDark
              ? "border-white/10 bg-slate-950/95 text-slate-200"
              : "border-slate-300/80 bg-[#dde3ea]/98 text-slate-800"
          }`}
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                onClick={() => {
                  setActiveSection(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`text-base font-semibold py-2 transition-colors ${
                  activeSection === item.id
                    ? "text-primary font-bold"
                    : isNavbarDark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className={`pt-4 border-t flex flex-col gap-3 ${isNavbarDark ? "border-white/10" : "border-slate-300/60"}`}>
            <div className="flex items-center justify-between py-1">
              <span className={`text-sm font-semibold ${isNavbarDark ? "text-slate-300" : "text-slate-700"}`}>
                {locale === "en" ? "Appearance Theme" : "Tema Tampilan"}
              </span>
              <div className={isNavbarDark ? "text-slate-200" : "text-slate-700"}>
                <ThemeToggle />
              </div>
            </div>
            {session ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-xs sm:text-sm shadow-md shadow-primary/20"
              >
                {t("landing.openDashboard")}
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-center py-2 rounded-full border font-semibold text-xs sm:text-sm transition-colors ${
                    isNavbarDark
                      ? "border-white/20 bg-slate-900/80 text-white hover:bg-slate-800"
                      : "border-slate-300 bg-white/80 text-slate-800 hover:bg-white"
                  }`}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-xs sm:text-sm shadow-md shadow-primary/20"
                >
                  {t("landing.openDashboard")}
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
