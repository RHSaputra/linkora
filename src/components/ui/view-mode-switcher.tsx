"use client";

import React from "react";
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
        "inline-flex items-center p-1 rounded-xl bg-background/80 border border-border/80 shadow-inner backdrop-blur-md shrink-0 select-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onViewModeChange("detail")}
        title={isEn ? "Detail Card View" : "Tampilan Detail Card"}
        className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          viewMode === "detail"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
        <span>{isEn ? "Detail" : "Detail"}</span>
      </button>

      <button
        type="button"
        onClick={() => onViewModeChange("compact")}
        title={isEn ? "Compact List View" : "Tampilan Ringkas List"}
        className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          viewMode === "compact"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
        )}
      >
        <List className="h-3.5 w-3.5 shrink-0" />
        <span>{isEn ? "Compact" : "Ringkas"}</span>
      </button>
    </div>
  );
}
