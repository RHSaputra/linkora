"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, ArrowRight } from "lucide-react";
import { LinkoraText } from "@/components/ui/linkora-text";

interface LikoWelcomeDialogProps {
  onOpenEditProfile: () => void;
}

export function LikoWelcomeDialog({ onOpenEditProfile }: LikoWelcomeDialogProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show if user is authenticated
    if (status !== "authenticated" || !session?.user) return;

    // Check if user has already been greeted THIS session
    // Uses sessionStorage so greeting appears fresh every login
    const hasSeenThisSession = sessionStorage.getItem("linkora_session_greeted");
    if (!hasSeenThisSession) {
      // Delay slightly for smooth entrance after page load
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, session]);

  useEffect(() => {
    // Listen for manual trigger (e.g. from help or Command Center)
    const handleTrigger = () => setOpen(true);
    window.addEventListener("open-liko-welcome", handleTrigger);
    return () => window.removeEventListener("open-liko-welcome", handleTrigger);
  }, []);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [open]);

  const handleDismiss = () => {
    // Mark as greeted for this session only — will appear again on next login
    sessionStorage.setItem("linkora_session_greeted", "true");
    setOpen(false);
  };

  const handleStartProfile = () => {
    handleDismiss();
    onOpenEditProfile();
  };

  const userName = session?.user?.name || "Komandan";

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleDismiss();
      else setOpen(true);
    }}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden rounded-[2.5rem] glass-panel border-primary/30 bg-card/95 shadow-[0_25px_70px_rgba(var(--primary),0.3)]">
        {/* Main Stage with Large Dominant Liko Mascot */}
        <div className="relative w-full pt-10 pb-6 px-6 sm:px-8 text-center bg-gradient-to-b from-primary/20 via-primary/5 to-transparent overflow-hidden">
          {/* Ambient Glow Bubbles */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-400/25 blur-3xl pointer-events-none" />
          <div className="absolute top-12 right-6 w-36 h-36 bg-purple-500/25 blur-3xl pointer-events-none" />

          {/* Liko Mascot - Large Dominant Hero Character Stage (Optimized for 60fps Smooth Playback) */}
          <div className="relative mx-auto flex flex-col items-center justify-center my-2">
            <div className="relative flex items-center justify-center">
              {/* Lightweight Hardware-Accelerated Static Neon Glow Ring */}
              <div className="absolute -inset-2 rounded-full p-[2.5px] bg-gradient-to-tr from-cyan-400 via-primary to-purple-500 shadow-[0_0_35px_rgba(var(--primary),0.45)] pointer-events-none" />

              {/* Dominant Video Container with Isolated Hardware Layer */}
              <div 
                className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden border-2 border-background shadow-2xl bg-primary/10 z-10 flex items-center justify-center pointer-events-none select-none"
                style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)", backfaceVisibility: "hidden", pointerEvents: "none" }}
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover object-center scale-105 pointer-events-none select-none"
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
                  poster="/maskot.jpeg"
                  src="/vidio-liko.webm"
                  style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)", willChange: "transform", pointerEvents: "none", userSelect: "none" }}
                >
                  <source src="/vidio-liko.webm" type="video/webm" />
                  <source src="/vidio%20liko.webm" type="video/webm" />
                  <source src="/liko-animation.webm" type="video/webm" />
                </video>
              </div>

              {/* Active Assistant Live Badge */}
              <div className="absolute -bottom-3 z-20 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-background/95 border border-primary/40 backdrop-blur-md shadow-lg text-primary text-xs font-bold font-heading select-none">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>Asisten AI Liko</span>
              </div>
            </div>
          </div>

          {/* Liko Speaking Speech / Dialogue Bubble */}
          <div className="relative mt-7 max-w-md mx-auto">
            {/* Speech Bubble Arrow Pointer */}
            <div className="w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-foreground/[0.04] mx-auto -mb-[1px] relative z-10" />

            <div className="relative p-5 sm:p-6 rounded-2xl bg-foreground/[0.03] border border-primary/25 backdrop-blur-sm shadow-sm text-center">
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground font-sans tracking-tight leading-snug">
                Hai, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-400">{userName}</span>!
              </h2>

              <p className="text-muted-foreground text-xs sm:text-sm mt-2.5 leading-relaxed">
                Selamat datang di <strong className="text-foreground font-heading"><LinkoraText /></strong>! Aku <strong className="text-primary font-bold">Liko</strong>, asisten cerdas pribadimu yang siap membantumu menyimpan, menganalisis, dan merapikan aset digitalmu.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 sm:p-8 pt-4 border-t border-border/50 flex flex-col sm:flex-row gap-3 bg-card">
          <Button
            onClick={handleStartProfile}
            variant="outline"
            className="flex-1 rounded-xl text-xs font-semibold py-3 flex items-center justify-center gap-2 border-border/60 hover:border-primary/40 active:scale-95"
          >
            <User className="h-4 w-4 text-primary" />
            Atur Profil Saya
          </Button>

          <Button
            onClick={handleDismiss}
            className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-3 shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Mulai Jelajahi <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
