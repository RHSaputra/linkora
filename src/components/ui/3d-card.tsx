"use client";

import React from "react";

export function Card3D({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`group/card3d relative transition-all duration-300 ease-out hover:-translate-y-1.5 transform-gpu ${className || ""}`}
      style={{ perspective: "1000px" }}
    >
      <div className="w-full h-full relative transition-transform duration-300 ease-out">
        {children}
      </div>
    </div>
  );
}

