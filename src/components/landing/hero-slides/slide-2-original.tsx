"use client"

import React, { useRef } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { LinkoraText } from "@/components/ui/linkora-text"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SlideProps {
  locale: string
}

export function Slide2Original({ locale }: SlideProps) {
  const isEn = locale === "en"
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden py-4 sm:py-6 lg:py-0">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] lg:w-[850px] h-[320px] sm:h-[600px] lg:h-[850px] bg-primary/20 rounded-full blur-[90px] sm:blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-40 sm:w-72 h-40 sm:h-72 bg-cyan-500/15 rounded-full blur-[50px] sm:blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-72 h-40 sm:h-72 bg-purple-500/15 rounded-full blur-[50px] sm:blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl">
        <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-6 sm:gap-8 lg:gap-16 items-center text-center md:text-left">
          
          {/* ========================================================================= */}
          {/* LEFT: 3D Smartphone Mockup with Linkorian Mascot / Video */}
          {/* ========================================================================= */}
          <div className="relative w-full flex justify-center md:justify-start order-2 md:order-1 perspective-[1200px] mt-2 md:mt-0">
            <div className="relative w-full max-w-[200px] xs:max-w-[240px] sm:max-w-[290px] lg:max-w-[310px] flex items-center justify-center mx-auto md:mx-0">
              
              {/* Atmospheric Glow Underneath Phone Body */}
              <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-cyan-500/30 via-primary/40 to-purple-600/30 rounded-[32px] sm:rounded-[54px] blur-xl sm:blur-2xl opacity-90 pointer-events-none" />

              {/* Premium Smartphone Physical Bezel Structure */}
              <div className="relative w-full rounded-[26px] sm:rounded-[42px] p-[6px] sm:p-[9px] bg-gradient-to-b from-neutral-700 via-neutral-900 to-black shadow-2xl ring-1 ring-white/20 border border-neutral-700/60 backdrop-blur-xl">
                
                {/* Side Physical Buttons Accent Simulation */}
                <div className="hidden sm:block absolute -left-[3px] top-16 sm:top-20 w-[3px] h-5 sm:h-7 bg-neutral-600 rounded-l-sm" />
                <div className="hidden sm:block absolute -left-[3px] top-24 sm:top-30 w-[3px] h-5 sm:h-7 bg-neutral-600 rounded-l-sm" />
                <div className="hidden sm:block absolute -right-[3px] top-20 sm:top-24 w-[3px] h-8 sm:h-10 bg-neutral-600 rounded-r-sm" />

                {/* Inner OLED Glass Screen */}
                <div className="relative rounded-[20px] sm:rounded-[34px] overflow-hidden bg-black aspect-[9/18.2] flex flex-col justify-between border border-neutral-800/80 shadow-inner">
                  
                  {/* Top Dynamic Island / Camera Notch */}
                  <div className="absolute top-1.5 sm:top-2 inset-x-0 z-30 flex justify-center pointer-events-none">
                    <div className="h-3.5 sm:h-5 w-16 sm:w-24 bg-neutral-950 rounded-full flex items-center justify-between px-1.5 sm:px-2.5 shadow-md border border-neutral-800/60">
                      <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-neutral-900 ring-1 ring-neutral-700 flex items-center justify-center">
                        <div className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-blue-950 flex items-center justify-center">
                          <div className="w-0.5 h-0.5 rounded-full bg-blue-400/40" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Screen Glare Reflection Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none z-20" />

                  {/* Phone Screen Visual: Video or Fallback to Centered 3D Mascot */}
                  <div className="w-full h-full relative z-10 flex items-center justify-center overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover object-center pointer-events-none select-none scale-105"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      disablePictureInPicture
                      disableRemotePlayback
                      controls={false}
                      tabIndex={-1}
                      aria-hidden="true"
                      onContextMenu={(e) => e.preventDefault()}
                      poster="/maskotbaru.jpeg"
                      src="/hero-video.webm"
                    />
                  </div>

                  {/* Bottom Home Indicator Bar */}
                  <div className="absolute bottom-1 sm:bottom-2 inset-x-0 z-30 flex justify-center pointer-events-none">
                    <div className="w-12 sm:w-20 h-0.5 sm:h-1 bg-white/40 rounded-full shadow-sm" />
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: Text Content & CTAs */}
          {/* ========================================================================= */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 sm:space-y-6 lg:space-y-8 order-1 md:order-2 w-full max-w-xl mx-auto md:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="bg-primary/20 border-primary/40 text-primary-foreground px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md inline-flex items-center gap-1.5 shadow-lg shadow-primary/30"
              >
                <LinkoraText /> {isEn ? "2.0 Is Now Live" : "2.0 Kini Tersedia"}
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.18]"
            >
              {isEn ? (
                <>
                  All Important Links, Notes, & Opportunities{" "}
                  <span className="text-primary">
                    in One Place.
                  </span>
                </>
              ) : (
                <>
                  Semua Link Penting, Catatan, & Peluang{" "}
                  <span className="text-primary">
                    dalam Satu Tempat.
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-xs xs:text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl leading-relaxed"
            >
              {isEn
                ? "Manage internships, scholarships, competitions, tasks, references, and private notes in one smart, organized workspace that is always ready when you need it."
                : "Kelola link magang, beasiswa, lomba, tugas, referensi, dan catatan pribadi dalam satu platform cerdas yang rapi dan mudah ditemukan kembali kapan saja."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="flex flex-col xs:flex-row gap-2.5 sm:gap-4 pt-1 sm:pt-2 w-full xs:w-auto justify-center md:justify-start"
            >
              <Button
                size="lg"
                className="w-full xs:w-auto rounded-full h-11 sm:h-12 lg:h-14 px-6 sm:px-8 text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 font-bold inline-flex items-center justify-center"
                asChild
              >
                <Link href="/dashboard">
                  {isEn ? "Open Free Dashboard" : "Buka Dashboard Gratis"}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full xs:w-auto rounded-full h-11 sm:h-12 lg:h-14 px-6 sm:px-8 text-sm sm:text-base border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 font-medium inline-flex items-center justify-center"
                asChild
              >
                <Link href="#solusi">
                  <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5 fill-white/80 text-white/80" />
                  {isEn ? "How It Works" : "Lihat Cara Kerja"}
                </Link>
              </Button>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}
