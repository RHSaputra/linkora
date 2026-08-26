"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function AIOrb() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center justify-center">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: -16, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="absolute right-full mr-4 glass-panel px-4 py-2 rounded-2xl flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-sm font-medium text-foreground">Inti AI Siap</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          // Dispatch a custom event to open command center
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
        }}
        className="relative flex items-center justify-center w-16 h-16 rounded-full group outline-none"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer Glow Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/30 mix-blend-multiply dark:mix-blend-screen"
          animate={{
            rotate: 360,
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" }
          }}
        />

        {/* Second Ring */}
        <motion.div
          className="absolute inset-2 rounded-full border border-accent/40 mix-blend-multiply dark:mix-blend-screen"
          animate={{
            rotate: -360,
          }}
          transition={{
            rotate: { duration: 12, repeat: Infinity, ease: "linear" }
          }}
        />

        {/* Core Orb with Mascot */}
        <motion.div
          className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.6)] bg-background"
        >
          <img 
            src="/maskot.jpeg" 
            alt="Linkora AI" 
            className="w-full h-full object-cover object-top"
          />
        </motion.div>
      </motion.button>
    </div>
  );
}
