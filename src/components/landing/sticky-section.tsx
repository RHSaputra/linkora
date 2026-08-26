"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface StickySectionProps {
  children: React.ReactNode
  index: number
  total: number
  className?: string
  disableSticky?: boolean
}

export function StickySection({ children, index, total, className = "", disableSticky = false }: StickySectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Gentle, organic fade & scale without harsh boundaries
  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0.96])
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0.35])
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "8%"])

  if (disableSticky) {
    return (
      <div ref={ref} className={`relative ${className}`} style={{ zIndex: index + 1 }}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        zIndex: index + 1,
      }}
    >
      <motion.div
        className={`sticky top-0 ${className}`}
        style={{
          scale,
          opacity,
          y,
          transformOrigin: "center top",
          willChange: "transform, opacity",
        }}
      >
        {/* Soft top gradient blend for sections after hero (index > 0) to ensure zero hard cut lines */}
        {index > 0 && (
          <div className="absolute -top-12 inset-x-0 h-24 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none z-30" />
        )}
        {children}
      </motion.div>
    </div>
  )
}
