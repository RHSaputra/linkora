"use client"

import { useRef, useState, useEffect } from "react"
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
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

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

  // Video 2 (3D Phone Frame) Entrance
  // Desktop: -140% entrance with full 30deg 3D tilt
  // Mobile: -40% entrance with subtle 10deg tilt for max GPU smoothness
  const phoneXDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], ["-140%", "0%", "0%"])
  const phoneXMobile = useTransform(scrollYProgress, [0.05, 0.5, 1], ["-40%", "0%", "0%"])
  const phoneX = isDesktop ? phoneXDesktop : phoneXMobile

  const phoneY = useTransform(scrollYProgress, [0.05, 0.5, 1], ["20px", "0px", "0px"])

  const phoneRotateYDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], [30, 0, 0])
  const phoneRotateYMobile = useTransform(scrollYProgress, [0.05, 0.5, 1], [10, 0, 0])
  const phoneRotateY = isDesktop ? phoneRotateYDesktop : phoneRotateYMobile

  const phoneRotateXDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], [8, 0, 0])
  const phoneRotateXMobile = useTransform(scrollYProgress, [0.05, 0.5, 1], [3, 0, 0])
  const phoneRotateX = isDesktop ? phoneRotateXDesktop : phoneRotateXMobile

  const phoneRotateZDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], [-5, 0, 0])
  const phoneRotateZMobile = useTransform(scrollYProgress, [0.05, 0.5, 1], [-1, 0, 0])
  const phoneRotateZ = isDesktop ? phoneRotateZDesktop : phoneRotateZMobile

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
      {/* Sticky Viewport Stage - 100dvh safe for mobile browsers */}
      <div className="sticky top-0 h-[100dvh] md:h-screen min-h-0 sm:min-h-[560px] max-h-screen w-full flex items-center justify-center overflow-x-clip overflow-y-hidden">

        {/* Background Ambient Glows with Parallax - Optimized blurs for mobile */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] md:w-[850px] h-[340px] sm:h-[600px] md:h-[850px] bg-primary/20 rounded-full blur-[70px] md:blur-[140px] pointer-events-none z-0"
          style={{ y: glowY, scale: glowScale }}
        />
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-500/15 rounded-full blur-[50px] md:blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/15 rounded-full blur-[50px] md:blur-[100px] pointer-events-none z-0" />

        {/* Content Container */}
        <div className="container mx-auto px-3 sm:px-6 relative z-10 w-full pt-14 sm:pt-0">
          <div className="grid grid-cols-[115px_1fr] sm:grid-cols-[220px_1fr] md:grid-cols-[280px_1fr] lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr] gap-2.5 sm:gap-8 lg:gap-16 items-center max-w-6xl mx-auto">

            {/* Visual Media Showcase Area (Left) */}
            <div className="relative w-full flex justify-center lg:justify-start order-1 perspective-[1200px]">
              <div className="relative w-full max-w-[120px] sm:max-w-[320px] lg:max-w-[390px] h-[230px] sm:h-[420px] lg:h-[540px] flex items-center justify-center">

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
                    <div className="absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr from-cyan-400/35 via-primary/35 to-purple-500/35 blur-2xl sm:blur-3xl pointer-events-none" />

                    {/* Pure Video Circular Glass Frame - Responsive Size */}
                    <div
                      className="relative w-24 h-24 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-[360px] lg:h-[360px] rounded-full overflow-hidden border-2 border-primary/40 shadow-2xl shadow-primary/30 bg-black/90 flex items-center justify-center pointer-events-none select-none backdrop-blur-2xl ring-1 ring-white/20"
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

                  </div>
                </motion.div>

                {/* ========================================================================= */}
                {/* STATE 2: SMARTPHONE MOCKUP WITH VIDEO 2 */}
                {/* ========================================================================= */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none select-none"
                  style={{
                    x: phoneX,
                    y: phoneY,
                    opacity: phoneOpacity,
                    scale: phoneScale,
                    rotateY: phoneRotateY,
                    rotateX: phoneRotateX,
                    rotateZ: phoneRotateZ,
                    willChange: "transform, opacity",
                  }}
                >
                  <motion.div
                    className="absolute -inset-6 sm:-inset-10 bg-primary/20 rounded-full blur-2xl sm:blur-3xl pointer-events-none"
                    style={{ opacity: phoneShadowOpacity }}
                  />

                  {/* Phone Outer Housing Container */}
                  <div className="relative mx-auto w-full max-w-[105px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[285px]">
                    {/* Atmospheric Glow Underneath Phone Body */}
                    <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-cyan-500/25 via-primary/30 to-purple-600/25 rounded-[30px] sm:rounded-[48px] blur-xl sm:blur-2xl opacity-80" />

                    {/* Premium Smartphone Physical Bezel Structure */}
                    <div className="relative rounded-[20px] sm:rounded-[42px] p-[3.5px] sm:p-[8px] bg-gradient-to-b from-neutral-700 via-neutral-900 to-black shadow-2xl ring-1 ring-white/20 border border-neutral-700/60 backdrop-blur-xl">

                      {/* Side Physical Buttons Accent Simulation */}
                      <div className="hidden sm:block absolute -left-[3px] top-16 sm:top-20 w-[3px] h-5 sm:h-7 bg-neutral-600 rounded-l-sm" />
                      <div className="hidden sm:block absolute -left-[3px] top-24 sm:top-30 w-[3px] h-5 sm:h-7 bg-neutral-600 rounded-l-sm" />
                      <div className="hidden sm:block absolute -right-[3px] top-20 sm:top-24 w-[3px] h-8 sm:h-10 bg-neutral-600 rounded-r-sm" />

                      {/* Inner OLED Glass Screen */}
                      <div className="relative rounded-[16px] sm:rounded-[34px] overflow-hidden bg-black aspect-[9/18.2] flex flex-col justify-between border border-neutral-800/80 shadow-inner">

                        {/* Top Dynamic Island / Camera Notch */}
                        <div className="absolute top-1.5 sm:top-2 inset-x-0 z-30 flex justify-center pointer-events-none">
                          <div className="h-3 sm:h-5 w-12 sm:w-24 bg-neutral-950 rounded-full flex items-center justify-between px-1.5 sm:px-2.5 shadow-md border border-neutral-800/60">
                            {/* Camera Lens Flare */}
                            <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-neutral-900 ring-1 ring-neutral-700 flex items-center justify-center">
                              <div className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-blue-950 flex items-center justify-center">
                                <div className="w-0.5 h-0.5 rounded-full bg-blue-400/40" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Screen Glare Reflection Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-20" />

                        {/* Video 2 Content */}
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
                        <div className="absolute bottom-1 sm:bottom-2 inset-x-0 z-30 flex justify-center pointer-events-none">
                          <div className="w-10 sm:w-20 h-0.5 bg-white/40 rounded-full shadow-sm" />
                        </div>

                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Text Content (Right) */}
            <div className="flex flex-col items-start text-left space-y-2 sm:space-y-6 lg:space-y-8 order-2 drop-shadow-md">
              <div>
                <Badge variant="outline" className="glass-panel text-primary border-primary/30 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium">
                  <LinkoraText /> {locale === "en" ? "2.0 Is Now Live" : "2.0 Kini Tersedia"}
                </Badge>
              </div>

              <h1 className="text-sm sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground leading-[1.2] sm:leading-[1.18]">
                {t("landing.heroTitle")}{" "}
                <span className="text-primary">
                  {t("landing.heroTitleAccent")}
                </span>
              </h1>

              <p className="text-[10px] sm:text-base lg:text-xl text-muted-foreground max-w-xl leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                {t("landing.heroDesc")}
              </p>

              <div className="flex flex-row flex-wrap sm:flex-nowrap gap-1.5 sm:gap-4 pt-0.5 sm:pt-1 w-full justify-start">
                <Button size="sm" className="rounded-full h-7 sm:h-12 lg:h-14 px-2.5 sm:px-8 text-[10px] sm:text-base bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 cursor-pointer font-bold shrink-0" asChild>
                  <Link href="/dashboard">
                    {t("landing.heroCta")} <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="rounded-full h-7 sm:h-12 lg:h-14 px-2 sm:px-8 text-[10px] sm:text-base glass-panel hover:bg-white/5 transition-all cursor-pointer font-medium shrink-0" asChild>
                  <Link href="#demo">
                    <Play className="mr-1 sm:mr-2 w-2.5 h-2.5 sm:w-5 sm:h-5" /> {t("landing.heroDemo")}
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

