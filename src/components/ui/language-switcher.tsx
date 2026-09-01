"use client";

import React from "react";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/i18n-provider";
import { SupportedLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "icon" | "pill" | "select";
  className?: string;
}

export function LanguageSwitcher({
  variant = "icon",
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, supportedLocales, t } = useTranslation();

  const currentLocaleInfo = supportedLocales.find((l) => l.code === locale);

  const handleSelect = (code: SupportedLocale) => {
    setLocale(code);
  };

  if (variant === "select") {
    return (
      <div className={cn("space-y-1.5", className)}>
        <label className="text-xs font-semibold text-foreground">
          {t("profile.languageSetting")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {supportedLocales.map((loc) => {
            const isSelected = locale === loc.code;
            return (
              <button
                key={loc.code}
                type="button"
                onClick={() => handleSelect(loc.code)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground font-bold shadow-xs ring-1 ring-primary/30"
                    : "border-border/60 bg-background/60 hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{loc.flag}</span>
                  <span className="text-xs font-medium">{loc.nativeName}</span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "pill" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2.5 rounded-full text-xs font-medium gap-1.5 border border-border/50 hover:border-primary/40 bg-foreground/[0.03] hover:bg-primary/5 transition-all cursor-pointer",
              className
            )}
            title="Pilih Bahasa / Change Language"
          >
            <span className="text-sm leading-none">{currentLocaleInfo?.flag || "🌐"}</span>
            <span className="uppercase text-[11px] font-bold tracking-wider text-foreground/80">
              {locale}
            </span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all cursor-pointer",
              className
            )}
            title={`Bahasa: ${currentLocaleInfo?.nativeName || locale}`}
          >
            <Globe className="h-4 w-4 text-primary" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-48 p-1.5 rounded-2xl glass-panel border border-primary/20 bg-card/95 shadow-xl backdrop-blur-xl z-[70]"
      >
        <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
          Bahasa / Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-border/40" />

        {supportedLocales.map((loc) => {
          const isSelected = locale === loc.code;
          return (
            <DropdownMenuItem
              key={loc.code}
              onClick={() => handleSelect(loc.code)}
              className={cn(
                "flex items-center justify-between rounded-xl px-2.5 py-2 text-xs cursor-pointer font-medium transition-colors",
                isSelected
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-foreground hover:bg-foreground/5"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{loc.flag}</span>
                <span>{loc.nativeName}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
