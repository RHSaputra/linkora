"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AiKnowledgeNetwork } from "./ai-knowledge-network"

interface SlideProps {
  locale: string
  isActive?: boolean
}

export function Slide1Knowledge({ locale, isActive = true }: SlideProps) {
  const isEn = locale === "en"

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* BACKGROUND: Pure Animated & Responsive AI Knowledge Network */}
      {/* ========================================================================= */}
      <AiKnowledgeNetwork isActive={isActive} />

      {/* ========================================================================= */}
      {/* FOREGROUND: Text & Call-To-Action (Non-blocking, Pointer Events Pass-Through) */}
      {/* ========================================================================= */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl pointer-events-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Headline & Action Content */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-6 pointer-events-auto">

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-xl"
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
                className="rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 inline-flex items-center justify-center cursor-pointer"
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
                className="rounded-full h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 inline-flex items-center justify-center font-medium cursor-pointer"
                asChild
              >
                <Link href="#cara-kerja">
                  <Play className="mr-2 w-4 h-4 fill-white/80 text-white/80" />
                  {isEn ? "Learn More" : "Pelajari Lebih Lanjut"}
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* RIGHT: Transparent Spacer column allowing interaction with background network */}
          <div className="hidden lg:block lg:col-span-7 h-full min-h-[460px] lg:min-h-[520px] pointer-events-none" />

        </div>
      </div>
    </div>
  )
}
