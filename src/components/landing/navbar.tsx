"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslation } from "@/components/providers/i18n-provider"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const { data: session } = useSession()
  const { t, locale } = useTranslation()

  useEffect(() => {
    const handleScroll = () => {
      const isPastThreshold = window.scrollY > 50;
      setScrolled((prev) => (prev !== isPastThreshold ? isPastThreshold : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Intersection Observer untuk deteksi section aktif
    const sections = ["solusi", "cara-kerja", "use-cases", "demo"];
    const currentSections = new Set<string>();
    
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentSections.add(entry.target.id);
            changed = true;
          } else {
            if (currentSections.has(entry.target.id)) {
              currentSections.delete(entry.target.id);
              changed = true;
            }
          }
        });

        if (changed) {
          if (currentSections.size > 0) {
            // Prioritaskan section yang lebih atas jika ada beberapa yang muncul bersamaan
            const active = sections.find(id => currentSections.has(id));
            if (active) setActiveSection(active);
          } else {
            setActiveSection(""); // Hilangkan garis navigasi jika di luar semua section
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" } // Deteksi di area atas layar
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const navLinks = [
    { id: "solusi", label: t("landing.navSolutions") },
    { id: "cara-kerja", label: t("landing.navHowItWorks") },
    { id: "use-cases", label: t("landing.navUseCases") },
    { id: "demo", label: t("landing.navDemo") },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-xl border-b border-foreground/10 shadow-lg py-3 sm:py-4" : "bg-transparent py-3.5 sm:py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Linkora Logo" className="h-8 sm:h-12 w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex relative p-[1.5px] rounded-full overflow-hidden shadow-lg shadow-primary/20">
          <div className="absolute inset-[-1000%] z-0 pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="w-full h-full opacity-100"
              style={{
                background: "conic-gradient(from 0deg, transparent 0%, transparent 60%, var(--primary) 80%, var(--accent) 100%)",
              }}
            />
          </div>
          <div className="relative z-10 flex items-center gap-8 bg-background/95 backdrop-blur-xl px-6 py-2.5 rounded-full border border-foreground/5">
            {navLinks.map((item) => (
              <Link 
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`relative text-sm font-medium transition-colors ${activeSection === item.id ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
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
          <LanguageSwitcher variant="pill" />
          <ThemeToggle />
          {session ? (
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none">
              {t("landing.openDashboard")}
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring px-3 py-1.5 rounded-lg touch-manipulation select-none">{t("nav.login")}</Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none">
                {t("landing.openDashboard")} <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher variant="pill" />
          <button 
            type="button"
            aria-label={mobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground active:scale-90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden glass-panel border-b border-foreground/10 px-6 py-6 space-y-4 bg-background/95 backdrop-blur-2xl"
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
                className={`text-base font-medium py-2 transition-colors ${activeSection === item.id ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-muted-foreground">
                {locale === "en" ? "Appearance Theme" : "Tema Tampilan"}
              </span>
              <ThemeToggle />
            </div>
            {session ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                {t("landing.openDashboard")}
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-full border border-border text-foreground font-semibold">
                  {t("nav.login")}
                </Link>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20">
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
