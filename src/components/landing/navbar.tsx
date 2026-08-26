"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const { data: session } = useSession()

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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-foreground/10 shadow-lg py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/Logo.png" alt="Linkora Logo" className="h-12 w-auto object-contain" />
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
            {[
              { id: "solusi", label: "Solusi" },
              { id: "cara-kerja", label: "Cara Kerja" },
              { id: "use-cases", label: "Untuk Siapa" },
              { id: "demo", label: "Coba Demo" }
            ].map((item) => (
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

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:bg-primary/90 transition-all hover:scale-105">
              Buka Dasbor
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Masuk</Link>
              <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-foreground/90 transition-all hover:scale-105">
                Mulai Sekarang <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border p-6 shadow-2xl flex flex-col gap-4"
        >
          {[
            { id: "solusi", label: "Solusi" },
            { id: "cara-kerja", label: "Cara Kerja" },
            { id: "use-cases", label: "Untuk Siapa" },
            { id: "demo", label: "Coba Demo" }
          ].map((item) => (
            <Link 
              key={item.id}
              href={`#${item.id}`} 
              className={`px-4 py-2 text-base font-medium ${activeSection === item.id ? "text-primary" : ""}`}
              onClick={() => {
                setActiveSection(item.id)
                setMobileMenuOpen(false)
              }}
            >
              {item.label}
            </Link>
          ))}
          <hr className="border-border/50 my-2" />
          {session ? (
            <Link href="/dashboard" className="w-full text-center rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg" onClick={() => setMobileMenuOpen(false)}>
              Buka Dasbor
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" className="w-full text-center rounded-full border border-border px-4 py-3 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Masuk</Link>
              <Link href="/register" className="w-full text-center rounded-full bg-foreground text-background px-4 py-3 text-sm font-medium shadow-lg" onClick={() => setMobileMenuOpen(false)}>Mulai Sekarang</Link>
            </div>
          )}
        </motion.div>
      )}
    </motion.nav>
  )
}
