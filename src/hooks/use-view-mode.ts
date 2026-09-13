"use client";

import { useState, useEffect } from "react";

export type LinkViewMode = "detail" | "compact";

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<LinkViewMode>("detail");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("linkora_link_view_mode");
      if (saved === "compact" || saved === "detail") {
        setViewModeState(saved);
      }
    }
  }, []);

  const setViewMode = (mode: LinkViewMode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("linkora_link_view_mode", mode);
    }
  };

  return [viewMode, setViewMode] as const;
}
