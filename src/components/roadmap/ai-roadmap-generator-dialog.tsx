"use client";

import { useState, useRef, useEffect } from "react";
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
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isGenerating && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isGenerating]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (requireAuth("Rancang Roadmap dengan AI", "Masuk atau daftar gratis untuk menggunakan asisten Liko AI dalam merancang alur kerja visual terstruktur.")) {
      onOpenChange(false);
      return;
    }

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

      if (res.status === 401) {
        onOpenChange(false);
        requireAuth("Rancang Roadmap dengan AI", "Sesi Anda telah berakhir. Silakan masuk kembali untuk menggunakan asisten Liko AI.");
        return;
      }

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
      <DialogContent className="glass-panel border-primary/30 sm:max-w-2xl bg-card/95 p-6 sm:p-8 space-y-6">
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
                <span>Rancang Alur Kerja dengan Liko AI</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5">
                Liko AI akan merancang urutan langkah visual, alur terstruktur, dan strategi pengerjaan untuk Anda.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Main Large Chat Form Input */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between">
              <span>Topik & Instruksi Alur <span className="text-destructive">*</span></span>
              <span className="text-[11px] font-normal text-muted-foreground">Tulis secara detail & jelas</span>
            </Label>
            <div className="relative">
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Tuliskan topik atau alur yang ingin Anda buat di sini... Contoh: Belajar Docker & Kubernetes dari dasar hingga deployment production web app..."
                required
                disabled={isGenerating}
                rows={5}
                className="bg-background/90 text-sm sm:text-base p-4 rounded-xl border-border/80 min-h-[140px] leading-relaxed resize-y focus-visible:ring-primary/40"
              />
            </div>
          </div>

          {/* Instructional Sentence Guidance Box (Menggantikan Tombol Contoh) */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Info className="w-4 h-4 shrink-0" />
              <span>Instruksi Pengisian:</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tuliskan tujuan belajar, alur pengerjaan proyek, atau langkah kerja yang ingin Anda susun pada kolom di atas. Liko AI akan secara otomatis menganalisis dan menyusunnya menjadi kanvas roadmap visual yang terstruktur, rapi, dan tidak saling menumpuk.
            </p>
          </div>

          {/* AI Generating Indicator Banner with Animated Liko Mascot Video */}
          {isGenerating && (
            <div className="p-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-lg">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-md bg-background shrink-0 aspect-square">
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  poster="/maskot.jpeg"
                  src="/vidio-liko.webm"
                  className="w-full h-full object-cover"
                >
                  <source src="/vidio-liko.webm" type="video/webm" />
                </video>
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm sm:text-base flex items-center justify-center sm:justify-start gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                  <span>Liko AI Sedang Bekerja...</span>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Liko sedang menganalisis topik, menyusun urutan langkah visual, dan merapikan tata letak kanvas terstruktur untuk Anda.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
              className="h-10 px-4 text-xs font-semibold"
            >
              Batal
            </Button>
            
            <div className="relative inline-flex items-center justify-center p-[2px] rounded-xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:shadow-primary/25 active:scale-95 shrink-0">
              <div className="absolute inset-[-200%] aspect-square m-auto bg-[conic-gradient(from_0deg_at_50%_50%,#2563eb_0%,#38bdf8_25%,#a855f7_50%,#38bdf8_75%,#2563eb_100%)] animate-[spin_4s_linear_infinite]" />
              <Button
                type="submit"
                disabled={!topic.trim() || isGenerating}
                className="relative z-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-6 cursor-pointer shadow-xs text-xs sm:text-sm border-0 transition-colors flex items-center justify-center whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Merancang Alur...</span>
                  </>
                ) : (
                  <span>Hasilkan Alur Kerja</span>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
