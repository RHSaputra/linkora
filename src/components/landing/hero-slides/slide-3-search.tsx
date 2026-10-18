"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Play,
  Sparkles,
  Search,
  FileText,
  Globe,
  Copy,
  Check,
  Folder,
  History,
  Star,
  Home,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface SlideProps {
  locale: string
}

export function Slide3Search({ locale }: SlideProps) {
  const isEn = locale === "en"
  const [copied, setCopied] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden py-4 sm:py-6 lg:py-0">
      {/* Background Video (Left Corner Behind Text - Flawless Zero-Seam Alpha Mask) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
        <div
          className="absolute top-0 left-0 w-full lg:w-[60%] xl:w-[54%] h-full pointer-events-none select-none [mask-image:linear-gradient(to_bottom,black_45%,transparent_90%)] lg:[mask-image:linear-gradient(to_right,black_45%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_45%,transparent_90%)] lg:[-webkit-mask-image:linear-gradient(to_right,black_45%,transparent_100%)]"
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            controls={false}
            tabIndex={-1}
            aria-hidden="true"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-cover object-center lg:object-[45%_center] opacity-65 sm:opacity-75"
            style={{
              pointerEvents: "none",
              userSelect: "none",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          >
            <source src="/ketikanbaruvidio.webm" type="video/webm" />
            <source src="/ketikanjarividio.webm" type="video/webm" />
          </video>

          {/* Smooth contrast tint that fades to transparent alongside the mask */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/60 via-[#030712]/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/50 via-transparent to-[#030712]/70 pointer-events-none" />
        </div>
      </div>

      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[550px] lg:w-[750px] h-[300px] sm:h-[550px] lg:h-[750px] bg-cyan-600/20 rounded-full blur-[80px] sm:blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-blue-600/20 rounded-full blur-[70px] sm:blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-indigo-600/20 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT: Text & Action Content */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-6">

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] drop-shadow-md"
            >
              {isEn ? (
                <>
                  Find Answers <br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                    in Seconds
                  </span>
                </>
              ) : (
                <>
                  Temukan Jawaban <br />
                  dalam{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                    Sekejap
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl font-normal leading-relaxed drop-shadow-sm"
            >
              {isEn
                ? "Linkorian helps you discover the exact information you need across documents, websites, and verified sources with speed and pinpoint accuracy using AI."
                : "Linkorian membantu kamu menemukan informasi yang kamu butuhkan dari berbagai dokumen, website, dan sumber terpercaya dengan cepat dan akurat, menggunakan teknologi AI."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="flex flex-col xs:flex-row gap-3 pt-2 w-full xs:w-auto justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 inline-flex items-center justify-center"
                asChild
              >
                <Link href="/dashboard">
                  {isEn ? "Get Started" : "Mulai Sekarang"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 inline-flex items-center justify-center font-medium"
                asChild
              >
                <Link href="#solusi">
                  <Play className="mr-2 w-4 h-4 fill-white/80 text-white/80" />
                  {isEn ? "How It Works" : "Lihat Cara Kerja"}
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: Pure Coded 3D Laptop Mockup + Floating Glass Cards */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 relative flex items-center justify-center w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]">
            
            {/* FLOATING GLASS ELEMENT 1: Top-Left Document Format Pill */}
            <motion.div
              animate={{ y: [-6, 6, -6], rotate: [-1, 2, -1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 left-2 sm:left-8 z-30 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-900/85 border border-cyan-400/40 backdrop-blur-xl shadow-xl shadow-cyan-950/50 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
              <span className="text-[10px] sm:text-xs font-bold text-slate-200 tracking-wider">
                PDF • DOC • TXT
              </span>
            </motion.div>

            {/* FLOATING GLASS ELEMENT 2: Mid-Left Floating Search Pill */}
            <motion.div
              animate={{ y: [6, -6, 6], x: [-3, 3, -3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-1/2 -left-2 sm:left-2 z-30 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-slate-900/90 border border-blue-500/40 backdrop-blur-xl shadow-xl shadow-blue-950/60 flex items-center gap-2"
            >
              <span className="text-[9px] sm:text-xs font-medium text-slate-300">
                Cari informasi...
              </span>
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Search className="w-3 h-3" />
              </div>
            </motion.div>

            {/* FLOATING GLASS ELEMENT 3: Top-Right Verified Sources Card */}
            <motion.div
              animate={{ y: [7, -5, 7], rotate: [1, -2, 1] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute -top-2 right-2 sm:right-6 z-30 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-900/85 border border-indigo-400/40 backdrop-blur-xl shadow-xl shadow-indigo-950/50 flex items-center gap-2.5"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <Globe className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="text-left">
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-200 leading-tight">
                  Website
                </p>
                <p className="text-[7.5px] sm:text-[9px] text-slate-400">
                  &amp; Sumber Terpercaya
                </p>
              </div>
            </motion.div>

            {/* FLOATING GLASS ELEMENT 4: Bottom-Right Liko Mascot Chip */}
            <motion.div
              animate={{ y: [-5, 6, -5], scale: [1, 1.05, 1] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute bottom-6 right-2 sm:right-8 z-30 p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-cyan-400/40 backdrop-blur-xl shadow-xl shadow-cyan-950/50 flex flex-col items-center justify-center group"
            >
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-cyan-400/50 shadow-md shadow-cyan-400/30">
                <Image
                  src="/maskotbaru.jpeg"
                  alt="Maskot Liko"
                  fill
                  sizes="32px"
                  className="object-cover object-center"
                />
              </div>
              <span className="text-[8px] sm:text-[9px] font-extrabold text-cyan-200 mt-1">
                AI
              </span>
            </motion.div>

            {/* =================================================================== */}
            {/* PURE CODED MODERN 3D LAPTOP MOCKUP */}
            {/* =================================================================== */}
            <div className="relative w-full max-w-[340px] xs:max-w-[420px] sm:max-w-[520px] md:max-w-[580px] lg:max-w-[620px]">
              
              {/* Backlight Ambient Glow */}
              <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-blue-600/30 via-cyan-500/35 to-indigo-600/30 rounded-3xl blur-2xl opacity-80 pointer-events-none" />

              {/* Laptop Display Lid & Bezel */}
              <div className="relative rounded-t-2xl sm:rounded-t-3xl p-2 sm:p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border border-slate-600/70 shadow-2xl backdrop-blur-xl">
                
                {/* Webcam Notch Dot */}
                <div className="absolute top-1 sm:top-1.5 inset-x-0 flex justify-center z-30">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-950 ring-1 ring-slate-800 flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-blue-400" />
                  </div>
                </div>

                {/* Inner Screen Display */}
                <div className="relative rounded-t-lg sm:rounded-t-xl bg-slate-950 overflow-hidden aspect-[16/10.5] border border-slate-800 flex flex-col text-white select-none">
                  
                  {/* Browser Bar */}
                  <div className="h-6 sm:h-7 bg-slate-900/95 border-b border-slate-800 px-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500/80" />
                      <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="px-3 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[8px] sm:text-[9px] text-slate-400 flex items-center gap-1.5 w-1/2 max-w-[200px] justify-center">
                      <span className="text-cyan-400">🔒</span> linkorian.app/search
                    </div>
                    <div className="w-8" />
                  </div>

                  {/* App Screen Layout (Sidebar + Search Results + Floating AI Summary) */}
                  <div className="flex-1 flex overflow-hidden relative">
                    
                    {/* Left Mini Sidebar */}
                    <div className="w-16 sm:w-28 bg-slate-900/70 border-r border-slate-800/80 p-2 sm:p-2.5 flex flex-col justify-between shrink-0">
                      <div>
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[9px] font-bold">
                            L
                          </div>
                          <span className="hidden sm:inline text-[10px] font-extrabold tracking-tight">
                            Linkorian
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="px-2 py-1 rounded-md text-[8px] sm:text-[9px] text-slate-400 flex items-center gap-1.5 hover:bg-slate-800/50">
                            <Home className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Beranda</span>
                          </div>
                          <div className="px-2 py-1 rounded-md text-[8px] sm:text-[9px] text-slate-400 flex items-center gap-1.5 hover:bg-slate-800/50">
                            <Folder className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Dokumen</span>
                          </div>
                          <div className="px-2 py-1 rounded-md text-[8px] sm:text-[9px] text-white bg-blue-600/30 border border-blue-500/40 font-semibold flex items-center gap-1.5">
                            <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
                            <span className="hidden sm:inline">Pencarian</span>
                          </div>
                          <div className="px-2 py-1 rounded-md text-[8px] sm:text-[9px] text-slate-400 flex items-center gap-1.5 hover:bg-slate-800/50">
                            <History className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Riwayat</span>
                          </div>
                          <div className="px-2 py-1 rounded-md text-[8px] sm:text-[9px] text-slate-400 flex items-center gap-1.5 hover:bg-slate-800/50">
                            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Favorit</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Search Results Area */}
                    <div className="flex-1 p-2 sm:p-3 overflow-hidden text-left pr-28 sm:pr-48">
                      {/* Search Header Input */}
                      <div className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[8px] sm:text-[10px] text-white shadow-inner">
                        <span className="font-medium truncate">
                          Ringkasan laporan penelitian AI
                        </span>
                        <div className="flex items-center gap-1 text-slate-400 shrink-0">
                          <span className="text-[8px]">✕</span>
                          <Search className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex items-center gap-1.5 mt-2 overflow-x-hidden text-[7px] sm:text-[8px]">
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                          Semua
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          Dokumen
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          Website
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          PDF
                        </span>
                      </div>

                      {/* Results List */}
                      <div className="mt-2.5 space-y-1.5">
                        {/* Result 1 */}
                        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[7px] sm:text-[8.5px]">
                          <div className="flex items-center gap-1 text-blue-400 font-semibold truncate">
                            <FileText className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">Laporan Penelitian AI 2025.pdf</span>
                          </div>
                          <p className="text-[6px] sm:text-[7px] text-slate-400 mt-0.5">
                            Dokumen • 24 halaman • 2.4 MB
                          </p>
                          <p className="text-[6.5px] sm:text-[7.5px] text-slate-300 mt-1 line-clamp-1">
                            Laporan ini membahas perkembangan teknologi AI dan adopsi otomatisasi di industri modern...
                          </p>
                        </div>

                        {/* Result 2 */}
                        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[7px] sm:text-[8.5px]">
                          <div className="flex items-center gap-1 text-cyan-400 font-semibold truncate">
                            <Globe className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">Tinjauan Teknologi AI di Indonesia</span>
                          </div>
                          <p className="text-[6px] sm:text-[7px] text-slate-400 mt-0.5">
                            Website • kompas.com
                          </p>
                          <p className="text-[6.5px] sm:text-[7.5px] text-slate-300 mt-1 line-clamp-1">
                            Perkembangan adopsi AI di berbagai sektor industri, pendidikan, dan regulasi pemerintah...
                          </p>
                        </div>

                        {/* Result 3 */}
                        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[7px] sm:text-[8.5px]">
                          <div className="flex items-center gap-1 text-purple-400 font-semibold truncate">
                            <FileText className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">Ringkasan Eksekutif - AI Report</span>
                          </div>
                          <p className="text-[6px] sm:text-[7px] text-slate-400 mt-0.5">
                            PDF • 12 halaman • 1.1 MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* =================================================================== */}
                    {/* FLOATING AI SUMMARY CARD OVERLAY (Inside right side of screen) */}
                    {/* =================================================================== */}
                    <div className="absolute top-8 right-2 sm:right-3 w-28 xs:w-36 sm:w-48 bg-slate-900/95 border border-cyan-400/50 rounded-xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-xl z-20 text-left">
                      <div className="flex items-center gap-1.5 text-[8px] sm:text-[10px] font-extrabold text-cyan-300 mb-1">
                        <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden border border-cyan-400/50 shrink-0">
                          <Image
                            src="/maskotbaru.jpeg"
                            alt="Maskot Liko"
                            fill
                            sizes="14px"
                            className="object-cover object-center"
                          />
                        </div>
                        <span>Ringkasan AI</span>
                      </div>
                      <p className="text-[6.5px] sm:text-[8px] text-slate-300 leading-relaxed">
                        Teknologi AI terus berkembang pesat dan memberikan dampak signifikan di berbagai sektor, terutama dalam pendidikan, bisnis, dan kesehatan. Di Indonesia, adopsi AI diprediksi akan meningkat seiring dengan dukungan infrastruktur dan regulasi yang lebih baik.
                      </p>
                      <button
                        onClick={handleCopy}
                        className="mt-2 w-full py-1 px-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[6.5px] sm:text-[8px] font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        {copied ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-white" />
                            Tersalin!
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            Salin Ringkasan
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Laptop Physical Base & Hinge */}
              <div className="relative h-3.5 sm:h-5 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 rounded-b-xl sm:rounded-b-2xl border-t border-slate-500 flex items-center justify-center shadow-2xl">
                {/* Thumb Open Notch */}
                <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-slate-900 rounded-b-sm border-t border-slate-700" />
              </div>

              {/* Desk Surface Reflection / Shadow */}
              <div className="w-[90%] mx-auto h-2 sm:h-3 bg-black/60 rounded-full blur-md" />

            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
