"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
              className="h-10 px-4 text-xs font-semibold cursor-pointer"
            >
              Batal
            </Button>
            
            <div className="relative inline-flex items-center justify-center p-[2px] rounded-full overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:shadow-primary/25 active:scale-95 shrink-0">
              <div className="absolute inset-[-300%] aspect-square m-auto bg-[conic-gradient(from_0deg_at_50%_50%,#2563eb_0%,#38bdf8_25%,#a855f7_50%,#ec4899_75%,#2563eb_100%)] animate-[spin_3s_linear_infinite]" />
              <Button
                type="submit"
                disabled={!topic.trim() || isGenerating}
                className="relative z-10 bg-card hover:bg-card/90 active:bg-card text-foreground font-semibold h-10 px-6 rounded-full cursor-pointer shadow-xs text-xs sm:text-sm border-0 transition-colors flex items-center justify-center whitespace-nowrap focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none select-none"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Merancang Alur...</span>
                  </>
                ) : (
                  <span>Hasilkan Alur Kerja</span>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>

        {/* AI Generating Mascot Overlay Popup */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="relative w-full max-w-sm rounded-3xl p-6 sm:p-8 bg-card/95 border border-primary/30 shadow-2xl shadow-primary/25 flex flex-col items-center text-center overflow-hidden"
              >
                {/* Ambient background blur circles */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/25 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/25 blur-3xl rounded-full pointer-events-none" />

                {/* Animated Liko Mascot Video Stage */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-primary/40 shadow-xl bg-background shrink-0 aspect-square mb-5 z-10">
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

                {/* Status and Text */}
                <div className="space-y-2 relative z-10">
                  <p className="font-bold text-foreground text-base sm:text-lg flex items-center justify-center gap-2 font-heading">
                    <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                    <span>Liko AI Sedang Bekerja...</span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px]">
                    Liko sedang menganalisis topik, menyusun urutan langkah visual, dan merapikan tata letak kanvas terstruktur untuk Anda.
                  </p>
                </div>

                {/* Indeterminate Progress Bar */}
                <div className="w-full bg-muted/60 rounded-full h-1.5 mt-6 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full transform-gpu"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: "50%" }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
