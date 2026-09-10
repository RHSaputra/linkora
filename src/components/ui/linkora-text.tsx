import React from 'react';

export function LinkoraText({ 
  className = "", 
  spin = true, 
  spinDuration = "8s" 
}: { 
  className?: string; 
  spin?: boolean; 
  spinDuration?: string; 
}) {
  // ID gradien dibuat statis (bukan useId) agar stabil antara SSR dan hydrasi,
  // termasuk di dalam boundary next/dynamic. Isi gradien semua instance identik.
  const gradLeftId = "linkora-grad-left";
  const gradRightId = "linkora-grad-right";
  const gradBottomId = "linkora-grad-bottom";

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      Link
      <span className="inline-flex items-center justify-center mx-[0.02em]">
        <svg 
          viewBox="0 0 100 100" 
          className="w-[0.82em] h-[0.82em] drop-shadow-sm will-change-transform" 
          style={spin ? { animation: `spin ${spinDuration} linear infinite`, transformOrigin: '50% 50%', transformBox: 'fill-box' } : undefined}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradLeftId} x1="85%" y1="15%" x2="15%" y2="85%">
              <stop offset="0%" stopColor="#c052f8" />
              <stop offset="100%" stopColor="#2a41fa" />
            </linearGradient>
            <linearGradient id={gradRightId} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#815efa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id={gradBottomId} x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#1b85f6" />
              <stop offset="100%" stopColor="#00e1ff" />
            </linearGradient>
          </defs>
          <path d="M 30.94 79.35 A 35 35 0 0 1 65.89 18.81" fill="none" stroke={`url(#${gradLeftId})`} strokeWidth="22" strokeLinecap="butt" />
          <path d="M 69.06 20.65 A 35 35 0 0 1 81.19 65.89" fill="none" stroke={`url(#${gradRightId})`} strokeWidth="22" strokeLinecap="butt" />
          <path d="M 79.35 69.06 A 35 35 0 0 1 34.11 81.19" fill="none" stroke={`url(#${gradBottomId})`} strokeWidth="22" strokeLinecap="butt" />
        </svg>
      </span>
      ra
    </span>
  );
}
