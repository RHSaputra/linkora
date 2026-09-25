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
  const video1OpacityDesktop = useTransform(scrollYProgress, [0, 0.12, 0.22], [1, 0.8, 0])
  const video1ScaleDesktop = useTransform(scrollYProgress, [0, 0.22], [1, 0])
  const video1YDesktop = useTransform(scrollYProgress, [0, 0.22], [0, -20])

  const video1Opacity = isDesktop ? video1OpacityDesktop : 0
  const video1Scale = isDesktop ? video1ScaleDesktop : 1
  const video1Y = isDesktop ? video1YDesktop : 0

  // Video 2 (3D Phone Frame) Entrance
  const phoneXDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], ["-140%", "0%", "0%"])
  const phoneXMobile = useTransform(scrollYProgress, [0.05, 0.5, 1], ["-40%", "0%", "0%"])
  const phoneX = isDesktop ? phoneXDesktop : 0

  const phoneYDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], ["20px", "0px", "0px"])
  const phoneY = isDesktop ? phoneYDesktop : 0

  const phoneRotateYDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], [30, 0, 0])
  const phoneRotateY = isDesktop ? phoneRotateYDesktop : 0

  const phoneRotateXDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], [8, 0, 0])
  const phoneRotateX = isDesktop ? phoneRotateXDesktop : 0

  const phoneRotateZDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], [-5, 0, 0])
  const phoneRotateZ = isDesktop ? phoneRotateZDesktop : 0

  const phoneScaleDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], [0.85, 1, 1])
  const phoneScale = isDesktop ? phoneScaleDesktop : 1

  const phoneOpacityDesktop = useTransform(scrollYProgress, [0.05, 0.3, 1], [0, 1, 1])
  const phoneOpacity = isDesktop ? phoneOpacityDesktop : 1

  const phoneShadowOpacityDesktop = useTransform(scrollYProgress, [0.05, 0.5, 1], [0, 0.65, 0.65])
  const phoneShadowOpacity = isDesktop ? phoneShadowOpacityDesktop : 0.65

  // Parallax background glows
  const glowY = useTransform(scrollYProgress, [0, 1], ["-5%", "35%"])
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.15, 1])

  useEffect(() => {
    if (!isDesktop) setShowPhoneVideo(true)
  }, [isDesktop])

  return (
    <section
      ref={containerRef}
      className="relative h-auto md:h-[230vh] w-full bg-background py-8 sm:py-12 md:py-0"
    >
      {/* Viewport Stage - Sticky on Desktop, Natural Flow on Mobile */}
      <div className="relative md:sticky md:top-0 h-auto md:h-screen min-h-0 sm:min-h-[560px] max-h-none md:max-h-screen w-full flex items-center justify-center overflow-x-clip overflow-y-visible md:overflow-y-hidden py-4 sm:py-8 md:py-0">

        {/* Background Ambient Glows */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] xs:w-[340px] sm:w-[600px] md:w-[850px] h-[280px] xs:h-[340px] sm:h-[600px] md:h-[850px] bg-primary/20 rounded-full blur-[45px] sm:blur-[70px] md:blur-[140px] pointer-events-none z-0"
          style={{ y: glowY, scale: glowScale }}
        />
        <div className="absolute top-1/4 left-1/4 w-36 xs:w-48 sm:w-72 h-36 xs:h-48 sm:h-72 bg-cyan-500/15 rounded-full blur-[35px] sm:blur-[50px] md:blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-36 xs:w-48 sm:w-72 h-36 xs:h-48 sm:h-72 bg-purple-500/15 rounded-full blur-[35px] sm:blur-[50px] md:blur-[100px] pointer-events-none z-0" />

        {/* Content Container */}
        <div className="container mx-auto px-4 sm:px-6 relative z-10 w-full pt-4 sm:pt-0">
          <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr] gap-6 sm:gap-8 lg:gap-16 items-center max-w-6xl mx-auto text-center md:text-left">

            {/* Visual Media Showcase Area (Smartphone Mockup) */}
            <div className="relative w-full flex justify-center md:justify-start order-2 md:order-1 perspective-[1200px] mt-4 md:mt-0">
              <div className="relative w-full max-w-[200px] xs:max-w-[240px] sm:max-w-[320px] lg:max-w-[390px] h-[340px] xs:h-[400px] sm:h-[480px] lg:h-[540px] flex items-center justify-center mx-auto">

                {/* ========================================================================= */}
                {/* STATE 1: PURE VIDEO 1 (Liko AI Mascot) - Desktop Only Exit Animation */}
                {/* ========================================================================= */}
                {isDesktop && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none select-none"
                    style={{
                      opacity: video1Opacity,
                      scale: video1Scale,
                      y: video1Y,
                      willChange: "transform, opacity",
                    }}
                  >
                    <div className="relative flex flex-col items-center justify-center">
                      <div className="absolute -inset-3 sm:-inset-6 rounded-full bg-gradient-to-tr from-cyan-400/35 via-primary/35 to-purple-500/35 blur-xl sm:blur-3xl pointer-events-none" />

                      <div
                        className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-[360px] lg:h-[360px] rounded-full overflow-hidden border-2 border-primary/40 shadow-2xl shadow-primary/30 bg-black/90 flex items-center justify-center pointer-events-none select-none backdrop-blur-2xl ring-1 ring-white/20"
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
                )}

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
                    className="absolute -inset-4 sm:-inset-10 bg-primary/20 rounded-full blur-xl sm:blur-3xl pointer-events-none"
                    style={{ opacity: phoneShadowOpacity }}
                  />

                  {/* Phone Outer Housing Container */}
                  <div className="relative mx-auto w-full max-w-[190px] xs:max-w-[230px] sm:max-w-[280px] lg:max-w-[285px]">
                    {/* Atmospheric Glow Underneath Phone Body */}
                    <div className="absolute -inset-2.5 sm:-inset-4 bg-gradient-to-r from-cyan-500/25 via-primary/30 to-purple-600/25 rounded-[24px] sm:rounded-[48px] blur-lg sm:blur-2xl opacity-80" />

                    {/* Premium Smartphone Physical Bezel Structure */}
                    <div className="relative rounded-[24px] sm:rounded-[42px] p-[5px] sm:p-[8px] bg-gradient-to-b from-neutral-700 via-neutral-900 to-black shadow-2xl ring-1 ring-white/20 border border-neutral-700/60 backdrop-blur-xl">

                      {/* Side Physical Buttons Accent Simulation */}
                      <div className="hidden sm:block absolute -left-[3px] top-16 sm:top-20 w-[3px] h-5 sm:h-7 bg-neutral-600 rounded-l-sm" />
                      <div className="hidden sm:block absolute -left-[3px] top-24 sm:top-30 w-[3px] h-5 sm:h-7 bg-neutral-600 rounded-l-sm" />
                      <div className="hidden sm:block absolute -right-[3px] top-20 sm:top-24 w-[3px] h-8 sm:h-10 bg-neutral-600 rounded-r-sm" />

                      {/* Inner OLED Glass Screen */}
                      <div className="relative rounded-[20px] sm:rounded-[34px] overflow-hidden bg-black aspect-[9/18.2] flex flex-col justify-between border border-neutral-800/80 shadow-inner">

                        {/* Top Dynamic Island / Camera Notch */}
                        <div className="absolute top-1.5 sm:top-2 inset-x-0 z-30 flex justify-center pointer-events-none">
                          <div className="h-3.5 sm:h-5 w-16 sm:w-24 bg-neutral-950 rounded-full flex items-center justify-between px-1.5 sm:px-2.5 shadow-md border border-neutral-800/60">
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
                          <div className="w-12 sm:w-20 h-0.5 sm:h-1 bg-white/40 rounded-full shadow-sm" />
                        </div>

                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 sm:space-y-6 lg:space-y-8 order-1 md:order-2 drop-shadow-md w-full max-w-xl mx-auto md:max-w-none">
              <div>
                <Badge variant="outline" className="glass-panel text-primary border-primary/30 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                  <LinkoraText /> {locale === "en" ? "2.0 Is Now Live" : "2.0 Kini Tersedia"}
                </Badge>
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.2] sm:leading-[1.18]">
                {t("landing.heroTitle")}{" "}
                <span className="text-primary">
                  {t("landing.heroTitleAccent")}
                </span>
              </h1>

              <p className="text-xs xs:text-sm sm:text-base lg:text-xl text-muted-foreground max-w-xl leading-relaxed sm:leading-relaxed text-center md:text-left line-clamp-none">
                {t("landing.heroDesc")}
              </p>

              <div className="flex flex-col xs:flex-row gap-2.5 sm:gap-4 pt-1 sm:pt-2 w-full xs:w-auto justify-center md:justify-start">
                <Button size="lg" className="w-full xs:w-auto rounded-full h-11 sm:h-12 lg:h-14 px-6 sm:px-8 text-xs xs:text-sm sm:text-base bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 cursor-pointer font-bold shrink-0 inline-flex items-center justify-center" asChild>
                  <Link href="/dashboard">
                    {t("landing.heroCta")} <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full xs:w-auto rounded-full h-11 sm:h-12 lg:h-14 px-6 sm:px-8 text-xs xs:text-sm sm:text-base glass-panel hover:bg-white/5 transition-all cursor-pointer font-medium shrink-0 inline-flex items-center justify-center" asChild>
                  <Link href="#demo">
                    <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> {t("landing.heroDemo")}
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

