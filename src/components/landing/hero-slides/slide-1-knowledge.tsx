"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Play,
  Sparkles,
  Search,
  FileText,
  Zap,
  Star,
  CheckCircle2,
  Cpu,
  MessageSquare,
  Home,
  Folder,
  User,
  Send,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface SlideProps {
  locale: string
}

export function Slide1Knowledge({ locale }: SlideProps) {
  const isEn = locale === "en"

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden py-4 sm:py-6 lg:py-0">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[550px] lg:w-[700px] h-[300px] sm:h-[550px] lg:h-[700px] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-purple-600/20 rounded-full blur-[70px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/3 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-cyan-500/15 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none" />

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
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]"
            >
              {isEn ? (
                <>
                  All Information <br />
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                    in One Place
                  </span>
                </>
              ) : (
                <>
                  Semua Informasi <br />
                  dalam{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                    Satu Tempat
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl font-normal leading-relaxed"
            >
              {isEn
                ? "Linkorian combines intelligent search, document management, and an AI assistant to help you discover critical information faster and easier."
                : "Linkorian menggabungkan pencarian cerdas, manajemen dokumen, dan asisten AI untuk membantu kamu menemukan informasi penting dengan lebih cepat dan mudah."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="flex flex-col xs:flex-row gap-3 pt-2 w-full xs:w-auto justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 inline-flex items-center justify-center"
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
                <Link href="#cara-kerja">
                  <Play className="mr-2 w-4 h-4 fill-white/80 text-white/80" />
                  {isEn ? "Learn More" : "Pelajari Lebih Lanjut"}
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: Pure Coded 3D Dual Smartphones + Floating Glass Badges */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 relative flex items-center justify-center w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]">
            
            {/* FLOATING GLASS ELEMENT 1: Top-Left Document Card */}
            <motion.div
              animate={{ y: [-6, 6, -6], rotate: [-2, 1, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-3 left-4 sm:left-12 z-30 p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/40 backdrop-blur-xl shadow-xl shadow-cyan-950/40 flex items-center justify-center"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
              </div>
            </motion.div>

            {/* FLOATING GLASS ELEMENT 2: Mid-Left Chat Snippet Pill */}
            <motion.div
              animate={{ y: [6, -6, 6], x: [-3, 3, -3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-1/3 left-0 sm:left-4 z-30 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-900/85 border border-blue-500/30 backdrop-blur-xl shadow-xl shadow-blue-950/50 flex flex-col gap-1.5"
            >
              <div className="w-16 sm:w-20 h-1.5 bg-blue-400/80 rounded-full" />
              <div className="w-10 sm:w-14 h-1.5 bg-blue-300/40 rounded-full" />
            </motion.div>

            {/* FLOATING GLASS ELEMENT 3: Bottom-Left Search Magnifier */}
            <motion.div
              animate={{ y: [-5, 7, -5], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-6 left-6 sm:left-16 z-30 p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/85 border border-indigo-500/40 backdrop-blur-xl shadow-xl shadow-indigo-950/50"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />
              </div>
            </motion.div>

            {/* FLOATING GLASS ELEMENT 4: Top-Right Verified Doc Card */}
            <motion.div
              animate={{ y: [7, -5, 7], rotate: [1, -2, 1] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute top-4 right-2 sm:right-10 z-30 p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 border border-purple-500/40 backdrop-blur-xl shadow-xl shadow-purple-950/40 flex items-center justify-center"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
              </div>
            </motion.div>

            {/* FLOATING GLASS ELEMENT 5: Bottom-Right AI Chip Card */}
            <motion.div
              animate={{ y: [-6, 6, -6], scale: [1, 1.04, 1] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute bottom-8 right-4 sm:right-12 z-30 p-2.5 sm:p-3 rounded-2xl bg-slate-900/85 border border-cyan-400/40 backdrop-blur-xl shadow-xl shadow-cyan-950/50 flex items-center justify-center"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
              </div>
            </motion.div>

            {/* DUAL PHONES CONTAINER */}
            <div className="relative flex items-center justify-center w-full max-w-[500px] sm:max-w-[560px]">

              {/* =================================================================== */}
              {/* PHONE 1 (FRONT/LEFT): Linkorian App Dashboard */}
              {/* =================================================================== */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-20 w-[185px] xs:w-[210px] sm:w-[245px] lg:w-[260px] shrink-0 -mr-8 sm:-mr-12"
              >
                {/* Glow behind Phone 1 */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-cyan-500/30 via-blue-600/30 to-purple-600/30 rounded-[38px] blur-xl opacity-70 pointer-events-none" />

                {/* Smartphone Titanium Physical Frame */}
                <div className="relative rounded-[32px] sm:rounded-[38px] p-2 sm:p-2.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border border-slate-600/60 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl">
                  
                  {/* Inner Screen */}
                  <div className="relative rounded-[26px] sm:rounded-[32px] bg-slate-950 overflow-hidden aspect-[9/18.5] flex flex-col justify-between border border-slate-800/80 p-2.5 sm:p-3 text-white select-none">
                    
                    {/* Top Status Bar & Dynamic Island */}
                    <div>
                      <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-slate-400 font-medium px-1">
                        <span>9:41</span>
                        <div className="w-14 sm:w-18 h-3.5 sm:h-4 bg-black rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-slate-700" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[7px]">5G</span>
                          <div className="w-3.5 h-2 rounded-[2px] border border-slate-400 p-[1px]">
                            <div className="w-full h-full bg-slate-400 rounded-[1px]" />
                          </div>
                        </div>
                      </div>

                      {/* App Header */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-b border-slate-800/60 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold">
                            L
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-extrabold tracking-tight">
                            Linkorian
                          </span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px]">
                          🔔
                        </div>
                      </div>

                      {/* Greeting Card */}
                      <div className="mt-2 text-left">
                        <div className="text-[10px] sm:text-xs font-bold text-white flex items-center gap-1">
                          Halo, Putra 👋
                        </div>
                        <p className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5 leading-tight">
                          Ada yang bisa saya bantu hari ini?
                        </p>
                      </div>

                      {/* Search Bar Input */}
                      <div className="mt-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-[8px] sm:text-[9px] text-slate-400 shadow-inner">
                        <Search className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">Cari dokumen, artikel...</span>
                      </div>

                      {/* 4 Category Quick Action Pills */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2.5 text-center">
                        <div className="p-1 rounded-lg bg-blue-950/60 border border-blue-500/20 flex flex-col items-center">
                          <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                          <span className="text-[6.5px] sm:text-[7.5px] mt-0.5 text-slate-300 font-medium">Cari</span>
                        </div>
                        <div className="p-1 rounded-lg bg-indigo-950/60 border border-indigo-500/20 flex flex-col items-center">
                          <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400" />
                          <span className="text-[6.5px] sm:text-[7.5px] mt-0.5 text-slate-300 font-medium">Asisten</span>
                        </div>
                        <div className="p-1 rounded-lg bg-purple-950/60 border border-purple-500/20 flex flex-col items-center">
                          <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
                          <span className="text-[6.5px] sm:text-[7.5px] mt-0.5 text-slate-300 font-medium">Ringkas</span>
                        </div>
                        <div className="p-1 rounded-lg bg-amber-950/60 border border-amber-500/20 flex flex-col items-center">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                          <span className="text-[6.5px] sm:text-[7.5px] mt-0.5 text-slate-300 font-medium">Favorit</span>
                        </div>
                      </div>

                      {/* Dokumen Terbaru List */}
                      <div className="mt-2.5 text-left">
                        <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-slate-300 mb-1.5">
                          <span>Dokumen Terbaru</span>
                          <span className="text-[7px] text-blue-400 font-normal">Lihat Semua &gt;</span>
                        </div>

                        <div className="space-y-1.5">
                          {/* Item 1 */}
                          <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <div className="w-5 h-5 rounded bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[8px] shrink-0 font-bold text-red-400">
                                📄
                              </div>
                              <div className="truncate">
                                <p className="text-[8px] sm:text-[8.5px] font-semibold text-slate-200 truncate">
                                  Sistem Informasi - Bab 3
                                </p>
                                <p className="text-[6.5px] text-slate-400">12 Nov 2025 • PDF</p>
                              </div>
                            </div>
                            <span className="text-[8px] text-slate-500">···</span>
                          </div>

                          {/* Item 2 */}
                          <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[8px] shrink-0 font-bold text-blue-400">
                                📊
                              </div>
                              <div className="truncate">
                                <p className="text-[8px] sm:text-[8.5px] font-semibold text-slate-200 truncate">
                                  Laporan PKM 2026
                                </p>
                                <p className="text-[6.5px] text-slate-400">10 Nov 2025 • PDF</p>
                              </div>
                            </div>
                            <span className="text-[8px] text-slate-500">···</span>
                          </div>

                          {/* Item 3 */}
                          <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[8px] shrink-0 font-bold text-emerald-400">
                                📑
                              </div>
                              <div className="truncate">
                                <p className="text-[8px] sm:text-[8.5px] font-semibold text-slate-200 truncate">
                                  Referensi Jurnal AI
                                </p>
                                <p className="text-[6.5px] text-slate-400">8 Nov 2025 • DOCX</p>
                              </div>
                            </div>
                            <span className="text-[8px] text-slate-500">···</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Dock Navigation */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-around text-slate-400">
                      <div className="flex flex-col items-center text-cyan-400">
                        <Home className="w-3 h-3" />
                        <span className="text-[6px] mt-0.5 font-bold">Beranda</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Folder className="w-3 h-3" />
                        <span className="text-[6px] mt-0.5">Dokumen</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-cyan-400/40">
                          <Image
                            src="/maskotbaru.jpeg"
                            alt="Liko"
                            fill
                            sizes="14px"
                            className="object-cover object-center"
                          />
                        </div>
                        <span className="text-[6px] mt-0.5">AI</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <User className="w-3 h-3" />
                        <span className="text-[6px] mt-0.5">Profil</span>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>

              {/* =================================================================== */}
              {/* PHONE 2 (BACK/RIGHT): AI Assistant Conversation Screen */}
              {/* =================================================================== */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative z-10 w-[180px] xs:w-[200px] sm:w-[235px] lg:w-[250px] shrink-0"
              >
                {/* Glow behind Phone 2 */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 rounded-[38px] blur-xl opacity-60 pointer-events-none" />

                {/* Smartphone Titanium Physical Frame */}
                <div className="relative rounded-[32px] sm:rounded-[38px] p-2 sm:p-2.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border border-slate-600/60 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl">
                  
                  {/* Inner Screen */}
                  <div className="relative rounded-[26px] sm:rounded-[32px] bg-slate-950 overflow-hidden aspect-[9/18.5] flex flex-col justify-between border border-slate-800/80 p-2.5 sm:p-3 text-white select-none">
                    
                    {/* Top Status Bar & Notch */}
                    <div>
                      <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-slate-400 font-medium px-1">
                        <span>9:41</span>
                        <div className="w-14 sm:w-18 h-3.5 sm:h-4 bg-black rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-slate-700" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3.5 h-2 rounded-[2px] border border-slate-400 p-[1px]">
                            <div className="w-full h-full bg-slate-400 rounded-[1px]" />
                          </div>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-b border-slate-800/60 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-purple-400/50 shadow-sm">
                            <Image
                              src="/maskotbaru.jpeg"
                              alt="Liko"
                              fill
                              sizes="16px"
                              className="object-cover object-center"
                            />
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-bold">Asisten AI</span>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium border border-purple-500/30">
                          Online
                        </span>
                      </div>

                      {/* Chat Messages */}
                      <div className="mt-2.5 space-y-2 text-left">
                        {/* Assistant Intro Bubble */}
                        <div className="p-2 rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 text-[7.5px] sm:text-[8.5px] text-slate-300 leading-snug">
                          Tanya apa saja, dapatkan jawaban relevan instan dari dokumenmu.
                        </div>

                        {/* User Bubble */}
                        <div className="p-2 rounded-2xl rounded-tr-sm bg-blue-600/30 border border-blue-500/40 text-[7.5px] sm:text-[8.5px] text-white ml-auto max-w-[88%] leading-snug">
                          Apa saja poin penting dari artikel ini?
                        </div>

                        {/* AI Response Card */}
                        <div className="p-2 sm:p-2.5 rounded-2xl rounded-tl-sm bg-slate-900/90 border border-purple-500/30 text-[7px] sm:text-[8px] text-slate-200 leading-relaxed shadow-lg">
                          <p className="font-semibold text-purple-300 mb-1 flex items-center gap-1">
                            <div className="relative w-3 h-3 rounded-full overflow-hidden shrink-0 border border-purple-400/40">
                              <Image
                                src="/maskotbaru.jpeg"
                                alt="Liko"
                                fill
                                sizes="12px"
                                className="object-cover object-center"
                              />
                            </div>
                            Berikut poin penting dari artikel:
                          </p>
                          <ol className="space-y-0.5 text-slate-300 pl-1 list-none">
                            <li>1. Latar belakang masalah riset</li>
                            <li>2. Tujuan penelitian & metodologi</li>
                            <li>3. Metode yang digunakan</li>
                            <li>4. Hasil dan pembahasan data</li>
                            <li>5. Kesimpulan & rekomendasi</li>
                          </ol>

                          <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                            <button className="px-2 py-0.5 rounded-md bg-purple-600/30 border border-purple-400/40 text-purple-200 text-[6.5px] sm:text-[7.5px] font-semibold flex items-center gap-1 hover:bg-purple-600/50">
                              <FileText className="w-2 h-2" />
                              Lihat Dokumen
                            </button>
                            <span className="text-[6px] text-slate-500">12:34</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Chat Input */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1.5 flex items-center justify-between text-[7.5px] sm:text-[8.5px] text-slate-400">
                        <span>Tulis pertanyaan...</span>
                        <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          <Send className="w-2 h-2" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>

            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
