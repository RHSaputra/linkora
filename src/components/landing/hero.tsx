"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { LinkoraText } from "@/components/ui/linkora-text"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/components/providers/i18n-provider"

export function Hero() {
  const { t, locale } = useTranslation()
  const containerRef = useRef<HTMLElement>(null)
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)

  // Scroll tracking across the pinned track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Video 2 (phone screen) hanya dimuat saat user mulai scroll
  const [showPhoneVideo, setShowPhoneVideo] = useState(false)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!showPhoneVideo && v > 0.03) setShowPhoneVideo(true)
  })

  // Video 1 (Pure Video - Liko Mascot) Transitions
  // Crisp vanishing exit (scales down to 0 & disappears promptly)
  const video1Opacity = useTransform(scrollYProgress, [0, 0.12, 0.22], [1, 0.8, 0])
  const video1Scale = useTransform(scrollYProgress, [0, 0.22], [1, 0])
  const video1Y = useTransform(scrollYProgress, [0, 0.22], [0, -20])

  // Video 2 (3D Phone Frame) Entrance from Left
  // Starts offscreen left (-140%), angled with 3D perspective, scales in & aligns smoothly
  // Stays permanently visible once entered (0.5 to 1.0+)
  const phoneX = useTransform(scrollYProgress, [0.05, 0.5, 1], ["-140%", "0%", "0%"])
  const phoneY = useTransform(scrollYProgress, [0.05, 0.5, 1], ["20px", "0px", "0px"])
  const phoneRotateY = useTransform(scrollYProgress, [0.05, 0.5, 1], [30, 0, 0])
  const phoneRotateX = useTransform(scrollYProgress, [0.05, 0.5, 1], [8, 0, 0])
  const phoneRotateZ = useTransform(scrollYProgress, [0.05, 0.5, 1], [-5, 0, 0])
  const phoneScale = useTransform(scrollYProgress, [0.05, 0.5, 1], [0.85, 1, 1])
  const phoneOpacity = useTransform(scrollYProgress, [0.05, 0.3, 1], [0, 1, 1])
  const phoneShadowOpacity = useTransform(scrollYProgress, [0.05, 0.5, 1], [0, 0.65, 0.65])

  // Parallax background glows
  const glowY = useTransform(scrollYProgress, [0, 1], ["-5%", "35%"])
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.15, 1])

  return (
    <section
      ref={containerRef}
      className="relative h-[210vh] md:h-[230vh] w-full bg-background"
    >
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen min-h-[640px] max-h-screen w-full flex items-center justify-center overflow-x-clip overflow-y-hidden">

        {/* Background Ambient Glows with Parallax */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[850px] h-[600px] md:h-[850px] bg-primary/20 rounded-full blur-[140px] pointer-events-none z-0"
          style={{ y: glowY, scale: glowScale }}
        />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-[100px] pointer-events-none z-0" />

        {/* Content Container */}
        <div className="container px-4 md:px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr] gap-8 lg:gap-16 items-center max-w-6xl mx-auto">

            {/* Visual Media Showcase Area (Left) */}
            <div className="relative w-full flex justify-center lg:justify-start order-2 lg:order-1 perspective-[1200px]">
              <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[390px] h-[480px] sm:h-[540px] flex items-center justify-center">

                {/* ========================================================================= */}
                {/* STATE 1: PURE VIDEO 1 (Liko AI Mascot) - No Phone Frame, Pure Stage */}
                {/* ========================================================================= */}
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none select-none"
                  style={{
                    opacity: video1Opacity,
                    scale: video1Scale,
                    y: video1Y,
                    willChange: "transform, opacity",
                  }}
                >
                  {/* Glowing Ambient Aura for Pure Video */}
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-cyan-400/35 via-primary/35 to-purple-500/35 blur-3xl pointer-events-none" />

                    {/* Pure Video Circular Glass Frame - Large & Crisp */}
                    <div
                      className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-92 md:h-92 lg:w-[360px] lg:h-[360px] rounded-full overflow-hidden border-2 border-primary/40 shadow-2xl shadow-primary/30 bg-black/90 flex items-center justify-center pointer-events-none select-none backdrop-blur-2xl ring-1 ring-white/20"
                      style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)", backfaceVisibility: "hidden" }}
                    >
                      <video
                        ref={video1Ref}
                        className="w-full h-full object-cover object-center scale-105 pointer-events-none select-none"
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
                        poster="/maskot.jpeg"
                        src="/vidio-liko.webm"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      />
                    </div>

                    {/* Pure Video Live Badge */}
                    <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/90 border border-primary/40 backdrop-blur-md shadow-xl text-primary text-xs font-bold font-heading select-none">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      <span>{locale === "en" ? "Liko AI Assistant" : "Asisten AI Liko"}</span>
                    </div>
                  </div>
                </motion.div>

                {/* ========================================================================= */}
                {/* STATE 2: 3D PHONE FRAME + VIDEO 2 - Cinematic Entrance from Left */}
                {/* ========================================================================= */}
                <motion.div
                  className="w-full relative z-20 pointer-events-none select-none"
                  style={{
                    x: phoneX,
                    y: phoneY,
                    rotateY: phoneRotateY,
                    rotateX: phoneRotateX,
                    rotateZ: phoneRotateZ,
                    scale: phoneScale,
                    opacity: phoneOpacity,
                    transformPerspective: 1200,
                    transformStyle: "preserve-3d",
                    willChange: "transform, opacity",
                  }}
                >
                  {/* Dynamic Floor / Drop Shadow under Phone */}
                  <motion.div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-black/60 blur-xl rounded-full pointer-events-none -z-10"
                    style={{ opacity: phoneShadowOpacity }}
                  />

                  {/* Phone Outer Housing Container - Restored to exact original sleek proportions */}
                  <div className="relative mx-auto w-full max-w-[275px] sm:max-w-[285px]">
                    {/* Atmospheric Glow Underneath Phone Body */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/25 via-primary/30 to-purple-600/25 rounded-[48px] blur-2xl opacity-80" />

                    {/* Premium Smartphone Physical Bezel Structure */}
                    <div className="relative rounded-[42px] p-[8px] bg-gradient-to-b from-neutral-700 via-neutral-900 to-black shadow-2xl ring-1 ring-white/20 border border-neutral-700/60 backdrop-blur-xl">

                      {/* Side Physical Buttons Accent Simulation */}
                      <div className="absolute -left-[3px] top-20 w-[3px] h-7 bg-neutral-600 rounded-l-sm" />
                      <div className="absolute -left-[3px] top-30 w-[3px] h-7 bg-neutral-600 rounded-l-sm" />
                      <div className="absolute -right-[3px] top-24 w-[3px] h-10 bg-neutral-600 rounded-r-sm" />

                      {/* Inner OLED Glass Screen */}
                      <div className="relative rounded-[34px] overflow-hidden bg-black aspect-[9/18.2] flex flex-col justify-between border border-neutral-800/80 shadow-inner">

                        {/* Top Dynamic Island / Camera Notch */}
                        <div className="absolute top-2.5 inset-x-0 z-30 flex justify-center pointer-events-none">
                          <div className="h-5 w-24 bg-neutral-950 rounded-full flex items-center justify-between px-2.5 shadow-md border border-neutral-800/60">
                            {/* Camera Lens Flare */}
                            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 ring-1 ring-neutral-700 flex items-center justify-center">
                              <div className="w-1 h-1 rounded-full bg-blue-950 flex items-center justify-center">
                                <div className="w-0.5 h-0.5 rounded-full bg-blue-400/40" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Screen Glare Reflection Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-20" />

                        {/* Video 2 Content (Hero Demo Video Inside Phone Screen) - lazy: dimuat saat scroll */}
                        {showPhoneVideo && (
                          <video
                            ref={video2Ref}
                            className="w-full h-full object-cover relative z-10 pointer-events-none select-none"
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
                            style={{ pointerEvents: "none", userSelect: "none" }}
                          >
                            <source src="/hero-video.webm" type="video/webm" />
                          </video>
                        )}

                        {/* Bottom Home Indicator Bar */}
                        <div className="absolute bottom-2 inset-x-0 z-30 flex justify-center pointer-events-none">
                          <div className="w-20 h-0.5 bg-white/40 rounded-full shadow-sm" />
                        </div>

                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Text Content (Right) - Perfectly balanced typography that adapts to layout */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-6 sm:space-y-8 order-1 lg:order-2 drop-shadow-md">
              <div>
                <Badge variant="outline" className="glass-panel text-primary border-primary/30 px-4 py-1.5 rounded-full text-sm mb-4 lg:mb-0">
                  <LinkoraText /> {locale === "en" ? "2.0 Is Now Live" : "2.0 Kini Tersedia"}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground leading-[1.14]">
                {t("landing.heroTitle")} <br className="hidden sm:inline" />
                <span className="text-primary">
                  {t("landing.heroTitleAccent")}
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
                {t("landing.heroDesc")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full lg:w-auto">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:scale-105" asChild>
                  <Link href="/dashboard">
                    {t("landing.heroCta")} <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg glass-panel hover:bg-white/5 transition-all" asChild>
                  <Link href="#demo">
                    <Play className="mr-2 w-5 h-5" /> {t("landing.heroDemo")}
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

