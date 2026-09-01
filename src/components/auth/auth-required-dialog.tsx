"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { LinkoraText } from "@/components/ui/linkora-text";
import { useTranslation } from "@/components/providers/i18n-provider";

export function AuthRequiredDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [actionName, setActionName] = useState(locale === "en" ? "this feature" : "Fitur ini");
  const [actionDesc, setActionDesc] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenAuthModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ actionName?: string; actionDesc?: string }>;
      if (customEvent.detail?.actionName) {
        setActionName(customEvent.detail.actionName);
      } else {
        setActionName(locale === "en" ? "this feature" : "Fitur ini");
      }
      if (customEvent.detail?.actionDesc) {
        setActionDesc(customEvent.detail.actionDesc);
      } else {
        setActionDesc(null);
      }
      setOpen(true);
    };

    window.addEventListener("open-auth-modal", handleOpenAuthModal);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuthModal);
  }, [locale]);

  const handleLogin = () => {
    setOpen(false);
    router.push("/login");
  };

  const handleRegister = () => {
    setOpen(false);
    router.push("/register");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[460px] p-6 sm:p-8 rounded-[2.5rem] glass-panel border-primary/30 bg-card/95 shadow-2xl shadow-primary/20 backdrop-blur-2xl">
        <DialogHeader className="text-center sm:text-center pb-2">
          {/* Liko Mascot Avatar with Ambient Rings */}
          <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-cyan-400 to-purple-500 p-[2px] animate-pulse">
              <div className="w-full h-full rounded-full bg-background" />
            </div>
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-background shadow-lg bg-background z-10">
              <img
                src="/maskot.jpeg"
                alt="Liko"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-background">
              <Lock className="w-3 h-3" />
            </div>
          </div>

          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mx-auto mb-2 select-none">
            <span>{t("auth.authRequiredBadge")}</span>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold font-sans text-foreground">
            {t("auth.authRequiredTitle")}
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            {actionDesc || (
              locale === "en" ? (
                <>
                  To access <strong className="text-foreground">{actionName.toLowerCase()}</strong>, please log in to your <LinkoraText /> account or sign up for free.
                </>
              ) : (
                <>
                  Untuk <strong className="text-foreground">{actionName.toLowerCase()}</strong>, silakan masuk ke akun <LinkoraText /> Anda atau daftar akun baru secara gratis.
                </>
              )
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Feature Benefits Mini List */}
        <div className="my-3 p-3.5 rounded-2xl bg-foreground/[0.03] border border-border/60 space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs text-foreground/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{t("auth.authBenefit1")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
            <span>{t("auth.authBenefit2")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
            <span>{t("auth.authBenefit3")}</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-col gap-2 pt-2">
          <Button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm py-3 shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{t("auth.loginSubmitBtn")}</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleRegister}
            className="w-full rounded-xl border-border/80 hover:border-primary/40 font-semibold text-xs py-2.5 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-primary" />
            <span>{t("auth.registerSubmitBtn")}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="w-full rounded-xl text-xs text-muted-foreground hover:text-foreground py-1.5 font-medium cursor-pointer"
          >
            {t("common.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
