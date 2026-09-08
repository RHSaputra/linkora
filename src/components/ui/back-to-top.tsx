"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  // Smooth spring physics for the circular progress ring
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      // Tampilkan tombol saat pengguna telah scroll lebih dari 350px
      if (latest > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    });

    return () => unsubscribe();
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 15 }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 24,
            mass: 0.8,
          }}
          className="fixed bottom-5 right-4 sm:bottom-7 sm:right-7 z-50 pointer-events-auto"
        >
          {/* Ambient Glow Aura */}
          <div className="absolute inset-0 rounded-full bg-primary/25 blur-md -z-10 group-hover:bg-primary/40 transition-colors duration-300 pointer-events-none" />

          <motion.button
            type="button"
            onClick={scrollToTop}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Kembali ke atas / Back to top"
            className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-background/85 hover:bg-background backdrop-blur-xl border border-primary/30 hover:border-primary/60 shadow-xl shadow-primary/20 text-foreground transition-colors cursor-pointer select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {/* SVG Circular Scroll Progress Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 48 48"
            >
              {/* Background Track */}
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-primary/15 dark:stroke-primary/20"
                strokeWidth="2.8"
                fill="none"
              />
              {/* Animated Progress Indicator */}
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-primary"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
                style={{ pathLength }}
              />
            </svg>

            {/* Arrow Icon with subtle bounce on hover */}
            <ArrowUp className="w-5 h-5 text-primary group-hover:text-primary transition-transform duration-200 group-hover:-translate-y-0.5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
