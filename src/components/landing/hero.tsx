"use client"

import React, { useRef, useState, useCallback } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Slide1Knowledge } from "@/components/landing/hero-slides/slide-1-knowledge"
import { Slide2Original } from "@/components/landing/hero-slides/slide-2-original"
import { Slide3Search } from "@/components/landing/hero-slides/slide-3-search"

export function Hero() {
  const { locale } = useTranslation()
  const isEn = locale === "en"
  const containerRef = useRef<HTMLElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const isProgrammaticScroll = useRef(false)

  // Scroll tracking across the pinned track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Synchronize active slide with scroll progress
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (isProgrammaticScroll.current) return

    // 3 segments: [0.0 - 0.32] -> Slide 0, [0.32 - 0.68] -> Slide 1, [0.68 - 1.0] -> Slide 2
    if (progress < 0.32) {
      if (activeSlide !== 0) setActiveSlide(0)
    } else if (progress >= 0.32 && progress < 0.68) {
      if (activeSlide !== 1) setActiveSlide(1)
    } else {
      if (activeSlide !== 2) setActiveSlide(2)
    }
  })

  // Navigate to slide and smoothly scroll the pinned track
  const scrollToSlide = useCallback((index: number) => {
    setActiveSlide(index)
    isProgrammaticScroll.current = true

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const scrollTop = window.scrollY + rect.top
      const maxScroll = containerRef.current.offsetHeight - window.innerHeight
      // Segment centers: index 0 -> 0.1, index 1 -> 0.5, index 2 -> 0.85
      const segmentRatio = index === 0 ? 0.05 : index === 1 ? 0.5 : 0.88
      const targetScroll = scrollTop + segmentRatio * Math.max(0, maxScroll)

      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      })

      setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 700)
    }
  }, [])

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 45) {
      if (diff > 0 && activeSlide < 2) {
        scrollToSlide(activeSlide + 1)
      } else if (diff < 0 && activeSlide > 0) {
        scrollToSlide(activeSlide - 1)
      }
    }
    setTouchStartX(null)
  }

  return (
    <section
      ref={containerRef}
      id="hero-track"
      className="relative w-full h-[320vh] bg-[#030712] text-white"
    >
      {/* Sticky Viewport Stage: Pinned while user scrolls through the 3 slides */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#030712] flex flex-col justify-between pt-16 sm:pt-20 pb-4 sm:pb-6 select-none">
        
        {/* Carousel Viewport Container */}
        <div
          className="relative flex-1 w-full overflow-hidden flex items-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            className="flex w-full h-full items-center"
            animate={{ x: `-${activeSlide * 100}%` }}
            transition={{
              type: "spring",
              damping: 27,
              stiffness: 135,
              mass: 0.85,
            }}
          >
            {/* SLIDE 1: AI-Powered Knowledge Management (User's Gambar 2) */}
            <div className="w-full h-full shrink-0 flex items-center justify-center">
              <Slide1Knowledge locale={locale} />
            </div>

            {/* SLIDE 2: Semua Link Penting, Catatan & Peluang (User's Gambar 1 / Current Hero) */}
            <div className="w-full h-full shrink-0 flex items-center justify-center">
              <Slide2Original locale={locale} />
            </div>

            {/* SLIDE 3: Smart Document & Search (User's Gambar 3) */}
            <div className="w-full h-full shrink-0 flex items-center justify-center">
              <Slide3Search locale={locale} />
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM CAROUSEL INDICATOR: Hanya bulatan dan strip (simpel) */}
        {/* ========================================================================= */}
        <div className="relative z-40 w-full flex items-center justify-center pointer-events-auto pb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/50 border border-white/10 backdrop-blur-md shadow-lg">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => scrollToSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeSlide === idx
                    ? "w-7 h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-md shadow-cyan-400/50"
                    : "w-2 h-2 bg-white/35 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
