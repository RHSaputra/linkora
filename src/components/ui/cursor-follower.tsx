"use client"
import { useEffect, useState } from "react"
import { motion, useSpring, useMotionValue } from "framer-motion"

export function CursorFollower() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Efek spring agar gerakan kursor terlihat mulus tapi sangat responsif dan snappy
  const springConfig = { damping: 25, stiffness: 800, mass: 0.1 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Matikan di perangkat sentuh/HP dan saat user memilih reduced motion
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let hasBeenVisible = false;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16); // Offset ke tengah animasi (lebar 32px / 2)
      cursorY.set(e.clientY - 16);
      if (!hasBeenVisible) {
        hasBeenVisible = true;
        setIsVisible(true);
      }
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest('a, button, input, textarea, select, [role="button"]');
      setIsHovering((prev) => (prev !== isInteractive ? isInteractive : prev));
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[100] pointer-events-none"
      style={{
        x,
        y,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <motion.div 
        animate={{ 
          scale: isHovering ? 0.3 : 1, // Mengecil jika kursor di atas tombol/link
          opacity: isHovering ? 0.5 : 1
        }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="relative flex items-center justify-center w-8 h-8 animate-[spin_4s_linear_infinite]"
      >
        {/* SVG Cincin Mini Linkora yang Menyala */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(var(--primary),0.6)]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-left-cursor" x1="85%" y1="15%" x2="15%" y2="85%">
              <stop offset="0%" stopColor="#c052f8" />
              <stop offset="100%" stopColor="#2a41fa" />
            </linearGradient>
            <linearGradient id="grad-right-cursor" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#815efa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="grad-bottom-cursor" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#1b85f6" />
              <stop offset="100%" stopColor="#00e1ff" />
            </linearGradient>
          </defs>
          <path d="M 30.94 79.35 A 35 35 0 0 1 65.89 18.81" fill="none" stroke="url(#grad-left-cursor)" strokeWidth="22" strokeLinecap="butt" />
          <path d="M 69.06 20.65 A 35 35 0 0 1 81.19 65.89" fill="none" stroke="url(#grad-right-cursor)" strokeWidth="22" strokeLinecap="butt" />
          <path d="M 79.35 69.06 A 35 35 0 0 1 34.11 81.19" fill="none" stroke="url(#grad-bottom-cursor)" strokeWidth="22" strokeLinecap="butt" />
        </svg>
        {/* Efek Glow di belakang cincin */}
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150" />
      </motion.div>
    </motion.div>
  )
}
