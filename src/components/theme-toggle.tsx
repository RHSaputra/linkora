"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle({ className }: { className?: string } = {}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="opacity-0" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
          className={className}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? "Light mode" : "Dark mode"}</TooltipContent>
    </Tooltip>
  );
}
