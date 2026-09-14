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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Loader2, Lightbulb } from "lucide-react";
import { toast } from "@/components/ui/custom-toast";

interface AIRoadmapGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRoadmapId?: string;
  onGenerated?: () => void;
}

const QUICK_SUGGESTIONS = [
  "Deploy Next.js 15 ke Vercel & Supabase",
  "Alur Belajar Fullstack Web Developer",
  "Persiapan Launching Produk / Startup",
  "Rencana Belajar UI/UX Design System",
];

export function AIRoadmapGeneratorDialog({
  open,
  onOpenChange,
  existingRoadmapId,
  onGenerated,
}: AIRoadmapGeneratorDialogProps) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      setIsGenerating(true);
      const res = await fetch("/api/ai/roadmap-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          existingRoadmapId,
        }),
      });

      if (res.ok) {
        const roadmapData = await res.json();
        toast.success("Liko AI berhasil merancang alur roadmap Anda!", "Liko AI");
        onOpenChange(false);
        setTopic("");
        if (onGenerated) {
          onGenerated();
        } else {
          router.push(`/roadmaps/${roadmapData.id}`);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal membuat alur dengan Liko AI", "Error");
      }
    } catch (_err) {
      toast.error("Terjadi kesalahan jaringan", "Error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-primary/30 sm:max-w-lg bg-card/95 p-6 space-y-4">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-heading font-bold text-foreground">
              Rancang Alur dengan Liko AI
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Ketik topik atau tujuan Anda. Liko AI akan secara cerdas menyusun langkah-langkah visual, petunjuk, dan koneksi alur kerja untuk Anda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Topik / Tujuan Alur <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Belajar Docker & Kubernetes dari Nol, Deploy Web App..."
                required
                disabled={isGenerating}
                className="bg-background/80 text-sm pr-10"
              />
              <Bot className="w-4 h-4 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" /> Contoh Topik Populer:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(sug)}
                  disabled={isGenerating}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-border/60 hover:border-primary/40 bg-muted/50 hover:bg-muted text-foreground transition-all cursor-pointer truncate max-w-full text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* AI Generating Indicator Banner */}
          {isGenerating && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/10 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Liko AI sedang merancang alur Anda...</p>
                <p className="text-muted-foreground text-[11px]">Menyusun langkah-langkah, alur koneksi, dan layout kanvas.</p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!topic.trim() || isGenerating}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold gap-2 cursor-pointer shadow-md"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Merancang...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  <span>Hasilkan Alur</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
