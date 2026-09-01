"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SerializedLink } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Tag, Folder, BookOpen, Clock, FileText, CheckCircle2 } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/utils";
import { LikoNoteConverterModal } from "./liko-note-converter-modal";
import { useNotes } from "@/hooks/use-data";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTranslation } from "@/components/providers/i18n-provider";

export function ViewLinkDialog({
  link,
  open,
  onOpenChange,
  onOpenExternal,
}: {
  link: SerializedLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenExternal: () => void;
}) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const { notes } = useNotes();
  const { t, locale } = useTranslation();
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  // Check if this link already has a note
  const existingNote = useMemo(() => {
    if (!notes || !link) return null;
    return notes.find((n: any) => {
      if (n.status === "TRASH") return false;
      return (n.content && n.content.includes(link.url)) || (n.title && n.title.includes(link.title));
    });
  }, [notes, link]);

  const handleOpenLink = () => {
    onOpenExternal();
    onOpenChange(false);
  };

  const hasAnalysisContent = Boolean(link.notes || link.aiSummary);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl leading-tight pr-8">{link.title}</DialogTitle>
            {link.description && <DialogDescription className="mt-2">{link.description}</DialogDescription>}
          </DialogHeader>

          <div className="space-y-6 mt-2">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="outline" style={{ borderColor: `${CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Custom}40`, color: CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Custom }}>
                <Folder className="w-3 h-3 mr-1" /> {link.category}
              </Badge>
              {link.tags?.map(tag => (
                 <Badge key={tag} variant="secondary" className="px-2 font-normal"><Tag className="w-3 h-3 mr-1" /> {tag}</Badge>
              ))}
              {link.reminderAt && (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 font-normal">
                  <Calendar className="w-3 h-3 mr-1" /> {new Date(link.reminderAt).toLocaleString(locale === "id" ? "id-ID" : "en-US")}
                </Badge>
              )}
              {existingNote && (
                <Badge 
                  variant="outline" 
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/notes/${existingNote.id}`);
                  }}
                  className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-medium cursor-pointer hover:bg-emerald-500/20 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> {t("links.alreadyInNotes")}
                </Badge>
              )}
            </div>

            {/* Catatan & Hasil Analisis AI Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-foreground">{t("links.notesAndAiSection")}</span>
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">Liko AI</Badge>
                </div>

                {hasAnalysisContent && (
                  <div className="flex items-center gap-2">
                    {existingNote ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onOpenChange(false);
                            router.push(`/notes/${existingNote.id}`);
                          }}
                          className="h-8 text-xs gap-1.5 rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-all active:scale-95 shadow-xs font-semibold cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{t("links.openSavedNote")}</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsConverterOpen(true)}
                          className="h-8 text-xs gap-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t("links.createAnotherNote")}</span>
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsConverterOpen(true)}
                        className="h-8 text-xs gap-1.5 rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 hover:text-amber-800 dark:hover:text-amber-200 transition-all active:scale-95 shadow-xs cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t("links.saveAsPersonalNote")}</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-card whitespace-pre-wrap text-sm leading-relaxed text-foreground border border-border/80 shadow-inner relative group">
                {link.notes || link.aiSummary || t("links.noNotesOrAi")}

                {hasAnalysisContent && (
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {existingNote
                          ? t("links.noteSavedPrompt", { title: existingNote.title })
                          : t("links.noteEditPrompt")}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (requireAuth(t("links.convertToNoteAction"), t("auth.authRequiredDesc"))) {
                          return;
                        }
                        if (existingNote) {
                          onOpenChange(false);
                          router.push(`/notes/${existingNote.id}`);
                        } else {
                          setIsConverterOpen(true);
                        }
                      }}
                      className="text-primary hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>{existingNote ? t("links.openNoteNow") : t("links.convertToNoteAction")}</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                {link.url}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl text-xs cursor-pointer">
                  {t("common.close")}
                </Button>
                <Button onClick={handleOpenLink} className="gap-2 rounded-xl text-xs transition-all active:scale-95 cursor-pointer">
                  {t("links.openExternal")} <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Liko Note Converter Modal */}
      <LikoNoteConverterModal
        isOpen={isConverterOpen}
        link={link}
        onClose={() => setIsConverterOpen(false)}
        onSuccess={() => {
          setIsConverterOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
