"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  ArrowRight,
  X,
  ExternalLink,
  Tag,
  Folder,
  Loader2,
  BookOpen,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/custom-toast";
import { dispatchRefresh, useNotes } from "@/hooks/use-data";
import { useTranslation } from "@/components/providers/i18n-provider";
import type { SerializedLink } from "@/lib/types";

interface LikoNoteConverterModalProps {
  isOpen: boolean;
  link: SerializedLink | null;
  onClose: () => void;
  onSuccess?: (createdNoteId: string) => void;
}

type StepState = "preview" | "converting" | "success";

export function LikoNoteConverterModal({
  isOpen,
  link,
  onClose,
  onSuccess,
}: LikoNoteConverterModalProps) {
  const router = useRouter();
  const { notes } = useNotes();
  const { t, locale } = useTranslation();
  const [step, setStep] = useState<StepState>("preview");
  const [noteTitle, setNoteTitle] = useState("");
  const [includeSource, setIncludeSource] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [createdNoteId, setCreatedNoteId] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check if a note already exists for this link
  const existingNote = useMemo(() => {
    if (!notes || !link) return null;
    return notes.find((n: any) => {
      if (n.status === "TRASH") return false;
      return (n.content && n.content.includes(link.url)) || (n.title && n.title.includes(link.title));
    });
  }, [notes, link]);

  // Initialize title when link changes
  useEffect(() => {
    if (link) {
      setNoteTitle(locale === "en" ? `AI Analysis: ${link.title}` : `Analisis AI: ${link.title}`);
      setStep("preview");
      setCreatedNoteId(null);
      setProgressStep(0);
    }
  }, [link, isOpen, locale]);

  // Confetti Particle Effect on Success
  useEffect(() => {
    if (step !== "success" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ["#f59e0b", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6", "#f43f5e"];
    const particles = Array.from({ length: 45 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.8) * 10 - 3,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1,
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.rotation += p.vRot;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [step]);

  if (!link) return null;

  const rawAnalysis = link.notes || link.aiSummary || (locale === "en" ? "Link analysis results from Liko AI." : "Hasil analisis tautan dari AI Liko.");

  const handleConvert = async () => {
    setStep("converting");
    setProgressStep(1);

    try {
      // Step 1 Animation delay
      await new Promise((r) => setTimeout(r, 600));
      setProgressStep(2);

      // Construct formatted rich HTML content for TipTap Document Editor
      let formattedHtml = `<p><strong>${locale === "en" ? "AI Analysis & Executive Summary:" : "Catatan & Hasil Analisis AI:"}</strong></p>`;
      
      const paragraphs = rawAnalysis.split("\n\n").filter(Boolean);
      paragraphs.forEach((p) => {
        formattedHtml += `<p>${p.replace(/\n/g, "<br/>")}</p>`;
      });

      if (includeSource) {
        formattedHtml += `<hr/><p><strong>${locale === "en" ? "Source Link:" : "Tautan Sumber:"}</strong> <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title} (${link.url})</a></p>`;
      }

      if (includeTags && (link.category || (link.tags && link.tags.length > 0))) {
        const tagsStr = link.tags && link.tags.length > 0 ? ` | ${locale === "en" ? "Tags" : "Tag"}: ${link.tags.join(", ")}` : "";
        formattedHtml += `<p><em>${locale === "en" ? "Category" : "Kategori"}: ${link.category}${tagsStr}</em></p>`;
      }

      await new Promise((r) => setTimeout(r, 600));
      setProgressStep(3);

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle.trim() || `${locale === "en" ? "Note" : "Catatan"}: ${link.title}`,
          content: formattedHtml,
          isFavorite: link.isFavorite || false,
        }),
      });

      if (!res.ok) {
        throw new Error(locale === "en" ? "Failed to convert into personal note" : "Gagal mengonversi ke catatan pribadi");
      }

      const newNote = await res.json();
      setCreatedNoteId(newNote.id);
      dispatchRefresh(["notes"]);

      await new Promise((r) => setTimeout(r, 400));
      setStep("success");
      onSuccess?.(newNote.id);
      toast.success(locale === "en" ? "Note created in Personal Notes!" : "Catatan berhasil dibuat di Personal Notes!", "Liko AI");
    } catch (err: any) {
      toast.error(err.message || (locale === "en" ? "An error occurred during conversion" : "Terjadi kesalahan saat mengonversi"));
      setStep("preview");
    }
  };

  const handleOpenCreatedNote = () => {
    if (createdNoteId) {
      onClose();
      router.push(`/notes/${createdNoteId}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl">
        <div className="relative">
          {/* Confetti canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-50 w-full h-full"
          />

          {/* Header Banner with Liko Gradient */}
          <div className="relative p-6 pb-5 bg-gradient-to-br from-amber-500/15 via-primary/10 to-transparent border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-amber-500/40 shadow-lg bg-neutral-950 flex items-center justify-center">
                    <img
                      src="/maskot.jpeg"
                      alt="Liko Mascot"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-neutral-950 shadow-sm">
                    <BookOpen className="w-3 h-3 stroke-[2.5]" />
                  </span>
                </div>
                <div className="pr-10">
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <span>{t("links.saveAsPersonalNote")}</span>
                    <Badge variant="secondary" className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      Liko AI
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {locale === "en"
                      ? "Convert link notes and AI analysis into a rich personal document."
                      : "Ubah catatan & hasil analisis tautan menjadi dokumen catatan lengkap."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Stage Body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* ─── STAGE 1: PREVIEW & VALIDATION ─── */}
              {step === "preview" && (
                <motion.div
                  key="stage-preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* ── VALIDASI: JIKA SUDAH PERNAH DIJADIKAN CATATAN ── */}
                  {existingNote && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <div>
                          <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            {locale === "en" ? "This link has already been saved to Personal Notes!" : "Tautan ini sudah pernah disimpan sebagai Catatan Pribadi!"}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            {locale === "en" ? "Found previous note: " : "Ditemukan catatan sebelumnya: "}
                            <strong className="text-foreground font-semibold">"{existingNote.title}"</strong>. 
                            {locale === "en" ? " Would you like to open the existing note or create a new copy?" : " Apakah Anda ingin membuka catatan yang sudah ada atau tetap membuat salinan catatan baru?"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 px-3 text-xs bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-lg shadow-sm gap-1.5 active:scale-95 cursor-pointer"
                            onClick={() => {
                              onClose();
                              router.push(`/notes/${existingNote.id}`);
                            }}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{locale === "en" ? "Open Existing Note" : "Buka Catatan yang Ada"}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Note Title Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>{locale === "en" ? "New Note Title:" : "Judul Catatan Baru:"}</span>
                    </label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder={locale === "en" ? "Enter note title..." : "Masukkan judul catatan..."}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/80 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground"
                    />
                  </div>

                  {/* Analysis Content Preview Box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span>{locale === "en" ? "Analysis Preview:" : "Pratinjau Hasil Analisis:"}</span>
                      <span className="text-[11px] text-amber-500 font-medium flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {locale === "en" ? "Ready to Format" : "Siap Diformat"}
                      </span>
                    </label>
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 max-h-[140px] overflow-y-auto text-xs text-muted-foreground leading-relaxed">
                      {rawAnalysis}
                    </div>
                  </div>

                  {/* Options Toggles */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={includeSource}
                        onChange={(e) => setIncludeSource(e.target.checked)}
                        className="rounded accent-primary"
                      />
                      <span>{locale === "en" ? "Include source URL link" : "Sertakan link sumber"}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={includeTags}
                        onChange={(e) => setIncludeTags(e.target.checked)}
                        className="rounded accent-primary"
                      />
                      <span>{locale === "en" ? "Include category & tags" : "Sertakan kategori & tag"}</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl text-xs cursor-pointer">
                      {t("common.cancel")}
                    </Button>
                    <Button
                      onClick={handleConvert}
                      className="rounded-xl text-xs gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{existingNote ? (locale === "en" ? "Create Another Copy" : "Tetap Buat Catatan Baru") : (locale === "en" ? "Create Note Now" : "Buat Catatan Sekarang")}</span>
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ─── STAGE 2: HIGH-ENERGY ANIMATED CONVERSION ─── */}
              {step === "converting" && (
                <motion.div
                  key="stage-converting"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-8 flex flex-col items-center justify-center text-center space-y-6"
                >
                  {/* Glowing Mascot Stage */}
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-4 rounded-full bg-gradient-to-tr from-amber-500/30 via-primary/30 to-purple-500/30 blur-md"
                    />
                    <div className="relative w-20 h-20 rounded-3xl overflow-hidden ring-4 ring-amber-500/50 shadow-2xl bg-neutral-950 flex items-center justify-center animate-pulse">
                      <img
                        src="/maskot.jpeg"
                        alt="Liko Working"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>

                  {/* Steps Checklist */}
                  <div className="space-y-2.5 w-full max-w-xs text-left">
                    <div className="flex items-center gap-2.5 text-xs">
                      {progressStep >= 1 ? (
                        <CheckCircle2 className="w-4 h-4 text-amber-500 animate-in zoom-in" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                      )}
                      <span className={progressStep >= 1 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                        {locale === "en" ? "Extracting insights & AI analysis..." : "Mengekstrak wawasan & analisis AI..."}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      {progressStep >= 2 ? (
                        <CheckCircle2 className="w-4 h-4 text-amber-500 animate-in zoom-in" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin opacity-50" />
                      )}
                      <span className={progressStep >= 2 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                        {locale === "en" ? "Structuring rich document formatting..." : "Menyusun lembar dokumen berformat rapi..."}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      {progressStep >= 3 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in zoom-in" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin opacity-50" />
                      )}
                      <span className={progressStep >= 3 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                        {locale === "en" ? "Saving to your Personal Notes..." : "Menyimpan ke Personal Notes kamu..."}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── STAGE 3: FESTIVE SUCCESS SCREEN ─── */}
              {step === "success" && (
                <motion.div
                  key="stage-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-4 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-foreground">
                      {locale === "en" ? "Note Created Successfully! 🎉" : "Catatan Berhasil Dibuat! 🎉"}
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      {locale === "en"
                        ? "The notes and AI analysis from this link are now saved in your Personal Notes and ready to edit anytime."
                        : "Catatan & Hasil Analisis AI dari tautan ini sudah tersimpan di Personal Notes kamu dan siap diedit kapan saja."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="w-full sm:w-1/2 rounded-xl text-xs cursor-pointer"
                    >
                      {locale === "en" ? "Stay Here" : "Tetap di Sini"}
                    </Button>
                    <Button
                      onClick={handleOpenCreatedNote}
                      className="w-full sm:w-1/2 rounded-xl text-xs gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/25 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{locale === "en" ? "Open in Editor" : "Buka di Editor"}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
