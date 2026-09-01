"use client";

import { useEffect, useState } from "react";

export function BackgroundEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-background z-0" />;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep Space / Pure White Background */}
      <div className="absolute inset-0 bg-background" />

      {/* GPU-accelerated ambient glowing gradients (Pure CSS, zero JS thread overhead) */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-35 dark:opacity-20 blur-[90px] mix-blend-multiply dark:mix-blend-screen transform-gpu"
        style={{
          background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute top-[25%] -right-[15%] w-[60%] h-[60%] rounded-full opacity-25 dark:opacity-15 blur-[90px] mix-blend-multiply dark:mix-blend-screen transform-gpu"
        style={{
          background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute -bottom-[15%] left-[25%] w-[50%] h-[50%] rounded-full opacity-15 dark:opacity-10 blur-[90px] mix-blend-multiply dark:mix-blend-screen transform-gpu"
        style={{
          background: "radial-gradient(circle, var(--destructive) 0%, transparent 70%)",
        }}
      />

      {/* Volumetric Subtle Light Gradient */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: "linear-gradient(to bottom, transparent, color-mix(in oklch, var(--foreground) 2%, transparent) 50%, transparent)",
        }}
      />

      {/* Noise Texture Overlay for Premium Cinematic Texture */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

