"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkViewMode } from "@/hooks/use-view-mode";
import { useTranslation } from "@/components/providers/i18n-provider";

interface ViewModeSwitcherProps {
  viewMode: LinkViewMode;
  onViewModeChange: (mode: LinkViewMode) => void;
  className?: string;
}

export function ViewModeSwitcher({
  viewMode,
  onViewModeChange,
  className,
}: ViewModeSwitcherProps) {
  const { locale } = useTranslation();
  const isEn = locale === "en";

  return (
    <div
      className={cn(
        "relative inline-flex items-center p-1 rounded-xl bg-background/80 border border-border/80 shadow-inner backdrop-blur-md shrink-0 select-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onViewModeChange("detail")}
        title={isEn ? "Detail Card View" : "Tampilan Detail Card"}
        className={cn(
          "relative px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors duration-150 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring z-10",
          viewMode === "detail"
            ? "text-primary-foreground font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {viewMode === "detail" && (
          <motion.div
            layoutId="viewModeActivePill"
            className="absolute inset-0 bg-primary rounded-lg shadow-sm z-[-1]"
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
          />
        )}
        <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
        <span>{isEn ? "Detail" : "Detail"}</span>
      </button>

      <button
        type="button"
        onClick={() => onViewModeChange("compact")}
        title={isEn ? "Compact List View" : "Tampilan Ringkas List"}
        className={cn(
          "relative px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors duration-150 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring z-10",
          viewMode === "compact"
            ? "text-primary-foreground font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {viewMode === "compact" && (
          <motion.div
            layoutId="viewModeActivePill"
            className="absolute inset-0 bg-primary rounded-lg shadow-sm z-[-1]"
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
          />
        )}
        <List className="h-3.5 w-3.5 shrink-0" />
        <span>{isEn ? "Compact" : "Ringkas"}</span>
      </button>
    </div>
  );
}
