"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Info } from "lucide-react";
import { toast } from "@/components/ui/custom-toast";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTranslation } from "@/components/providers/i18n-provider";
import { LikoRoadmapModal } from "@/components/ui/liko-ai-modal";

interface AIRoadmapGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRoadmapId?: string;
  onGenerated?: () => void;
}

export function AIRoadmapGeneratorDialog({
  open,
  onOpenChange,
  existingRoadmapId,
  onGenerated,
}: AIRoadmapGeneratorDialogProps) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const { t, locale } = useTranslation();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapStepIndex, setRoadmapStepIndex] = useState(0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (requireAuth(
        locale === "en" ? "Design Workflow with Liko AI" : "Rancang Roadmap dengan AI",
        locale === "en"
          ? "Sign in or register for free to use Liko AI in designing structured visual workflows."
          : "Masuk atau daftar gratis untuk menggunakan asisten Liko AI dalam merancang alur kerja visual terstruktur."
      )) {
      onOpenChange(false);
      return;
    }

    setIsGenerating(true);
    setRoadmapStepIndex(0);
    const stepInterval = setInterval(() => {
      setRoadmapStepIndex((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/ai/roadmap-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          existingRoadmapId,
          locale,
        }),
      });

      if (res.status === 401) {
        clearInterval(stepInterval);
        setIsGenerating(false);
        onOpenChange(false);
        requireAuth(
          locale === "en" ? "Design Workflow with Liko AI" : "Rancang Roadmap dengan AI",
          locale === "en" ? "Your session has expired. Please sign in again." : "Sesi Anda telah berakhir. Silakan masuk kembali untuk menggunakan asisten Liko AI."
        );
        return;
      }

      if (res.ok) {
        const roadmapData = await res.json();
        setRoadmapStepIndex(3);
        toast.success(
          locale === "en" ? "Liko AI successfully generated your roadmap workflow!" : "Liko AI berhasil merancang alur roadmap Anda!",
          "Liko AI"
        );
        onOpenChange(false);
        setTopic("");
        if (onGenerated) {
          onGenerated();
        } else {
          router.push(`/roadmaps/${roadmapData.id}`);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || (locale === "en" ? "Failed to generate workflow with Liko AI" : "Gagal membuat alur dengan Liko AI"), "Error");
      }
    } catch (_err) {
      toast.error(locale === "en" ? "Network error occurred" : "Terjadi kesalahan jaringan", "Error");
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border-primary/20 sm:max-w-2xl md:max-w-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl rounded-3xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-md bg-background shrink-0">
                <img
                  src="/maskot.jpeg"
                  alt="Liko AI"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                  <span>{t("ai.designRoadmapTitle")}</span>
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5">
                  {t("ai.designRoadmapDesc")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Main Large Chat Form Input */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between">
                <span>{t("ai.topicInstructionLabel")} <span className="text-destructive">*</span></span>
                <span className="text-[11px] font-normal text-muted-foreground">{t("ai.detailHint")}</span>
              </Label>
              <div className="relative">
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t("ai.topicPlaceholder")}
                  required
                  disabled={isGenerating}
                  rows={5}
                  className="bg-background/90 text-sm sm:text-base p-4 rounded-xl border-border/80 min-h-[140px] leading-relaxed resize-y focus-visible:ring-primary/40"
                />
              </div>
            </div>

            {/* Instructional Sentence Guidance Box */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Info className="w-4 h-4 shrink-0" />
                <span>{t("ai.guideTitle")}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("ai.guideDesc")}
              </p>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
                className="h-8.5 sm:h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              
              <button
                type="submit"
                disabled={!topic.trim() || isGenerating}
                className="p-[2px] rounded-full bg-gradient-to-r from-[#00d8ff] via-[#6366f1] via-[#9333ea] to-[#f43f5e] inline-flex items-center justify-center shrink-0 active:scale-95 transition-transform duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none group shadow-xs"
              >
                <span className="bg-card hover:bg-card/90 active:bg-card text-foreground font-semibold h-8.5 sm:h-10 px-4 sm:px-6 rounded-full text-xs sm:text-sm transition-colors flex items-center justify-center whitespace-nowrap select-none">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-1.5" />
                      <span>{locale === "en" ? "Designing Workflow..." : "Merancang Alur..."}</span>
                    </>
                  ) : (
                    <span>{locale === "en" ? "Generate Workflow" : "Hasilkan Alur Kerja"}</span>
                  )}
                </span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dedicated Liko AI Roadmap Building & Connecting Modal Overlay */}
      <LikoRoadmapModal
        open={isGenerating}
        topic={topic}
        stepIndex={roadmapStepIndex}
      />
    </>
  );
}
