"use client"

import dynamic from "next/dynamic"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"

// Efek kursor: hanya desktop, tidak esensial -> tanpa SSR
const CursorFollower = dynamic(
  () => import("@/components/ui/cursor-follower").then((m) => m.CursorFollower),
  { ssr: false }
)

// Seksi bawah-fold di-split agar JS awal lebih ringan (tetap dirender di server)
const PainPoints = dynamic(() => import("@/components/landing/pain-points").then((m) => m.PainPoints))
const Solution = dynamic(() => import("@/components/landing/solution").then((m) => m.Solution))
const HowItWorks = dynamic(() => import("@/components/landing/how-it-works").then((m) => m.HowItWorks))
const UseCases = dynamic(() => import("@/components/landing/use-cases").then((m) => m.UseCases))
const SmartSearchDemo = dynamic(() => import("@/components/landing/smart-search").then((m) => m.SmartSearchDemo))
const Comparison = dynamic(() => import("@/components/landing/comparison").then((m) => m.Comparison))
const Testimonials = dynamic(() => import("@/components/landing/testimonials").then((m) => m.Testimonials))
const CTA = dynamic(() => import("@/components/landing/footer").then((m) => m.CTA))
const Footer = dynamic(() => import("@/components/landing/footer").then((m) => m.Footer))

const BackToTop = dynamic(
  () => import("@/components/ui/back-to-top").then((m) => m.BackToTop),
  { ssr: false }
)

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
      <CursorFollower />
      <Navbar />

      <main className="relative flex flex-col">
        <Hero />
        <PainPoints />
        <Solution />
        <HowItWorks />
        <UseCases />
        <SmartSearchDemo />
        <Comparison />
        <Testimonials />
        <CTA />
        <Footer />
      </main>

      <BackToTop />
    </div>
  )
}
