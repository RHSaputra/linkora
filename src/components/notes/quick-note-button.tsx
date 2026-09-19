"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  PenBox,
  Loader2,
  X,
  Maximize2,
  Check,
  FolderOpen,
  Folder,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/custom-toast";
import { setCachedData, invalidateAndRefresh, useNoteFolders } from "@/hooks/use-data";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTranslation } from "@/components/providers/i18n-provider";

export function QuickNoteButton() {
  const { requireAuth } = useRequireAuth();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const { folders } = useNoteFolders();

  useEffect(() => {
    if (open) {
      // Prefetch notes routes in background so transition is instant (< 300ms)
      router.prefetch("/notes");
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    } else {
      setTitle("");
      setContent("");
      setSelectedFolderId(null);
      setSaving(false);
      setNavigating(false);
    }
  }, [open, router]);

  // Quick Save: Save note in background and stay on current page
  const handleQuickSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const noteTitle = title.trim() || (locale === "en" ? "Quick Note" : "Catatan Cepat");
    const noteContent = content.trim() ? `<p>${content.trim().replace(/\n/g, "<br/>")}</p>` : "";
    const folderId = selectedFolderId || undefined;

    // Instant UI close
    setOpen(false);
    setSaving(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          folderId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.id) {
        // Pre-cache and refresh
        setCachedData(`/api/notes/${data.id}`, data);
        invalidateAndRefresh(["notes", "noteFolders"]);

        toast.success(
          locale === "en" ? `"${noteTitle}" saved successfully!` : `"${noteTitle}" berhasil disimpan!`,
          locale === "en" ? "Quick Note Saved" : "Catatan Cepat Tersimpan"
        );
      } else {
        toast.error(data.error || (locale === "en" ? "Failed to save note" : "Gagal menyimpan catatan"), "Error");
      }
    } catch (error) {
      console.error(error);
      toast.error(locale === "en" ? "Failed to save quick note" : "Gagal menyimpan catatan cepat", "Error");
    } finally {
      setSaving(false);
    }
  };

  // Open in Full Editor: Instant close + parallel create + immediate 0ms transition
  const handleOpenFullEditor = async () => {
    const noteTitle = title.trim() || (locale === "en" ? "Quick Note" : "Catatan Cepat");
    const noteContent = content.trim() ? `<p>${content.trim().replace(/\n/g, "<br/>")}</p>` : "";
    const folderId = selectedFolderId || undefined;

    // Close modal immediately to eliminate perceived lag
    setOpen(false);
    setNavigating(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          folderId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.id) {
        // Pre-cache for 0ms loading in the full editor
        setCachedData(`/api/notes/${data.id}`, data);
        invalidateAndRefresh(["notes", "noteFolders"]);

        router.push(`/notes/${data.id}`);
      } else {
        toast.error(data.error || (locale === "en" ? "Failed to create note" : "Gagal membuat catatan"), "Error");
      }
    } catch (error) {
      console.error(error);
      toast.error(locale === "en" ? "Failed to open note editor" : "Gagal membuka editor catatan", "Error");
    } finally {
      setNavigating(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-36 right-4 sm:bottom-28 sm:right-8 z-40">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-full glass-panel bg-card/90 hover:bg-card text-foreground shadow-xl border border-primary/40 transition-all cursor-pointer backdrop-blur-2xl"
                onClick={() => {
                  if (requireAuth(
                    locale === "en" ? "Create Quick Note" : "Membuat Catatan Cepat",
                    locale === "en" ? "Sign in or register for free to write instant memos and ideas from anywhere." : "Masuk atau daftar gratis untuk menulis memo dan ide cepat langsung dari mana saja."
                  )) {
                    return;
                  }
                  setOpen(true);
                }}
              >
                <PenBox className="h-5 w-5 text-primary" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs font-semibold py-1.5 px-3">
            <p>{t("quickNote.title")}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Instant Quick Note Floating Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl p-6 sm:p-8 rounded-3xl border border-primary/20 bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-2xl max-h-[85vh] overflow-y-auto space-y-5">
          <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <PenBox className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold font-heading text-foreground">
                    {t("quickNote.title")}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("quickNote.subtitle")}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleOpenFullEditor}
                disabled={navigating}
                className="text-xs font-semibold text-primary hover:bg-primary/10 gap-1.5 rounded-xl h-9 px-3 shrink-0"
                title={t("quickNote.openFullEditorTooltip")}
              >
                {navigating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    <span>{t("quickNote.fullEditorBtn")}</span>
                  </>
                )}
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleQuickSave} className="space-y-4 pt-2">
            {/* Title Input */}
            <div className="space-y-1">
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("quickNote.titlePlaceholder")}
                className="h-11 sm:h-12 px-4 text-base sm:text-sm font-bold rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 focus:border-primary placeholder:text-muted-foreground/60 shadow-2xs"
              />
            </div>

            {/* Content Textarea */}
            <div className="space-y-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("quickNote.contentPlaceholder")}
                rows={7}
                className="p-4 text-sm leading-relaxed resize-none rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 focus:border-primary placeholder:text-muted-foreground/60 shadow-2xs"
              />
            </div>

            {/* Folder Selection (if available) */}
            {folders && folders.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-[11px] uppercase font-bold text-muted-foreground shrink-0 flex items-center gap-1.5 mr-1 font-mono">
                  <FolderOpen className="h-3.5 w-3.5 text-primary" /> {t("quickNote.folderLabel")}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFolderId(null)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                    selectedFolderId === null
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {t("quickNote.folderGeneral")}
                </button>
                {folders.map((f: any) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      selectedFolderId === f.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Folder
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: selectedFolderId === f.id ? "currentColor" : (f.color || "#6366f1") }}
                    />
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800 gap-2.5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="rounded-xl h-10 px-4 text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={saving || navigating}
                className="rounded-xl h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 shadow-xs active:scale-95 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {t("quickNote.saveNoteBtn")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
