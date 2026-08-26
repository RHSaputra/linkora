"use client"

import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { PainPoints } from "@/components/landing/pain-points"
import { Solution } from "@/components/landing/solution"
import { HowItWorks } from "@/components/landing/how-it-works"
import { UseCases } from "@/components/landing/use-cases"
import { SmartSearchDemo } from "@/components/landing/smart-search"
import { Comparison } from "@/components/landing/comparison"
import { Testimonials } from "@/components/landing/testimonials"
import { CTA, Footer } from "@/components/landing/footer"
import { CursorFollower } from "@/components/ui/cursor-follower"

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
    </div>
  )
}
