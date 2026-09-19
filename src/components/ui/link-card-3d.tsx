"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SerializedLink } from "@/lib/types";
import { MoreVertical, ExternalLink, Star, Copy, Edit, Trash, BookOpen, CheckCircle2, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteLink, toggleFavorite, openLink, useNotes } from "@/hooks/use-data";
import { Card3D } from "./3d-card";
import { motion } from "framer-motion";
import { CATEGORY_COLORS, getCategoryColor, cn, formatRelativeTime } from "@/lib/utils";

import { ViewLinkDialog } from "@/components/links/view-link-dialog";
import { ManageCollectionsDialog } from "@/components/links/manage-collections-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { QuickReminderPopover } from "@/components/reminders/quick-reminder-popover";
import { LikoNoteConverterModal } from "@/components/links/liko-note-converter-modal";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTranslation } from "@/components/providers/i18n-provider";
import { saveCurrentScrollPosition } from "@/hooks/use-page-state-restoration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { LinkViewMode } from "@/hooks/use-view-mode";

interface LinkCard3DProps {
  link: SerializedLink;
  index: number;
  onUpdate: () => void;
  onEdit: (link: SerializedLink) => void;
  viewMode?: LinkViewMode;
}

export function LinkCard3D({ link, index, onUpdate, onEdit, viewMode = "detail" }: LinkCard3DProps) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const { notes } = useNotes();
  const { t, locale } = useTranslation();
  const catColor = getCategoryColor(link.category);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNoteConverterOpen, setIsNoteConverterOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(link.thumbnail || null);
  const [imgError, setImgError] = useState(false);

  const fallbackScreenshot = useMemo(() => {
    try {
      return `https://s0.wp.com/mshots/v1/${encodeURIComponent(link.url)}?w=800&h=450`;
    } catch {
      return null;
    }
  }, [link.url]);

  // Check if link already has a note
  const existingNote = useMemo(() => {
    if (!notes || !link) return null;
    return notes.find((n: any) => {
      if (n.status === "TRASH") return false;
      return (n.content && n.content.includes(link.url)) || (n.title && n.title.includes(link.title));
    });
  }, [notes, link]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(link.url);
  };

  const executeDelete = async () => {
    try {
      await deleteLink(link.id);
      onUpdate();
    } catch (err) {
      console.error("Gagal menghapus link", err);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (requireAuth(
      locale === "en" ? "Delete Link" : "Menghapus Tautan",
      locale === "en" ? "Sign in or register for free to manage and delete links." : "Masuk atau daftar gratis untuk mengelola dan menghapus tautan."
    )) {
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (requireAuth(
      locale === "en" ? "Favorite Link" : "Menyukai Tautan",
      locale === "en" ? "Sign in or register for free to bookmark your favorite links." : "Masuk atau daftar gratis untuk menandai tautan favorit Anda."
    )) {
      return;
    }
    try {
      await toggleFavorite(link);
      onUpdate();
    } catch (err) {
      console.error("Gagal mengupdate status favorit", err);
    }
  };

  const handleExternalOpen = async () => {
    saveCurrentScrollPosition("links");
    await openLink(link);
    onUpdate();
  };

  const hasActiveReminder = Boolean(link.reminderAt && new Date(link.reminderAt) > new Date());

  if (viewMode === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.03 }}
        className="group relative w-full"
      >
        <div
          onClick={() => {
            saveCurrentScrollPosition("links");
            setIsViewOpen(true);
          }}
          className="glass-panel rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/40 border border-border/80 bg-card/90 p-2.5 sm:p-3 flex items-center justify-between gap-3 w-full"
        >
          {/* Left: Favicon / Icon + Details */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg bg-muted/80 flex items-center justify-center overflow-hidden ring-1 ring-border/80">
              {link.favicon ? (
                <img src={link.favicon} alt="" className="h-4 w-4 rounded object-contain" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 max-w-full">
                <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {link.title}
                </h3>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-background/90 dark:bg-background/95 text-foreground/90 backdrop-blur-md border border-border/70 shadow-xs shrink-0 hidden xs:inline-flex"
                  style={{ color: catColor }}
                >
                  {link.category}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                <span className="truncate font-mono font-medium text-foreground/70">
                  {new URL(link.url).hostname.replace('www.', '') || link.category}
                </span>
                <span>•</span>
                <span className="shrink-0">{formatRelativeTime(link.createdAt || link.lastOpenedAt)}</span>
                {existingNote && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/notes/${existingNote.id}`);
                      }}
                      className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded cursor-pointer hover:bg-emerald-500/20 transition-all shrink-0"
                    >
                      <BookOpen className="w-2.5 h-2.5" /> Catatan
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <QuickReminderPopover
              targetId={link.id}
              type="link"
              title={link.title}
              url={link.url}
              currentReminderAt={link.reminderAt}
              onReminderChange={() => onUpdate()}
              showLabel={hasActiveReminder}
              className={cn(
                "h-7 px-2 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border shadow-xs transition-all cursor-pointer select-none",
                hasActiveReminder
                  ? "bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-amber-500/25 ring-2 ring-background hover:bg-amber-400"
                  : "bg-background/85 dark:bg-background/90 text-muted-foreground hover:text-amber-500 hover:bg-background border-border/70 opacity-90 group-hover:opacity-100"
              )}
            />

            <button
              type="button"
              onClick={handleFavorite}
              aria-label={link.isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
              className="p-1.5 rounded-lg hover:bg-foreground/10 active:scale-95 text-muted-foreground transition-all cursor-pointer touch-manipulation select-none"
            >
              <Star className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${link.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button"
                  aria-label="Menu opsi tautan"
                  className="p-1.5 rounded-lg hover:bg-foreground/10 active:scale-95 text-muted-foreground transition-all cursor-pointer touch-manipulation select-none"
                >
                  <MoreVertical className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" /> {t("links.copyUrl")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  if (requireAuth(t("links.modalEditTitle"), t("auth.authRequiredDesc"))) return;
                  onEdit(link);
                }}>
                  <Edit className="h-4 w-4 mr-2" /> {t("common.edit")}
                </DropdownMenuItem>

                {existingNote ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push(`/notes/${existingNote.id}`)}
                      className="text-emerald-600 dark:text-emerald-400 font-semibold gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                      <span className="flex-1">{t("links.openSavedNote")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (requireAuth(t("links.createAnotherNote"), t("auth.authRequiredDesc"))) return;
                        setIsNoteConverterOpen(true);
                      }}
                      className="text-muted-foreground text-xs gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 mr-2" />
                      <span>{t("links.createAnotherNote")}</span>
                    </DropdownMenuItem>
                  </>
                ) : (link.notes || link.aiSummary) ? (
                  <DropdownMenuItem
                    onClick={() => {
                      if (requireAuth(t("links.saveAsPersonalNote"), t("auth.authRequiredDesc"))) return;
                      setIsNoteConverterOpen(true);
                    }}
                    className="text-amber-600 dark:text-amber-400 font-medium gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{t("links.saveAsPersonalNote")}</span>
                  </DropdownMenuItem>
                ) : null}

                <DropdownMenuItem onClick={() => {
                  if (requireAuth(t("links.manageCollection"), t("auth.authRequiredDesc"))) return;
                  setIsManageOpen(true);
                }}>
                  {t("links.manageCollection")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash className="h-4 w-4 mr-2" /> {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isViewOpen && (
          <ViewLinkDialog
            link={link}
            open={isViewOpen}
            onOpenChange={setIsViewOpen}
            onOpenExternal={handleExternalOpen}
          />
        )}
        
        {isManageOpen && (
          <ManageCollectionsDialog
            link={link}
            open={isManageOpen}
            onOpenChange={setIsManageOpen}
            onUpdate={onUpdate}
          />
        )}
        
        {isDeleteDialogOpen && (
          <ConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title={t("links.deleteConfirmTitle")}
            description={t("links.deleteConfirmDesc")}
            onConfirm={executeDelete}
          />
        )}

        <LikoNoteConverterModal
          isOpen={isNoteConverterOpen}
          link={link}
          onClose={() => setIsNoteConverterOpen(false)}
          onSuccess={() => {
            setIsNoteConverterOpen(false);
            onUpdate();
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full flex flex-col"
    >
      <Card3D className="h-full flex flex-col">
        <div 
          onClick={() => setIsViewOpen(true)}
          className="group h-full flex flex-col justify-between glass-panel rounded-2xl overflow-hidden cursor-pointer relative border border-border/80 bg-card/90"
          style={{ transform: "translateZ(30px)" }}
        >
          {/* Holographic Border Top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b border-border/50 shrink-0">
            {(imgSrc || fallbackScreenshot) && !imgError ? (
              <img
                src={imgSrc || fallbackScreenshot || ""}
                alt={link.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                onError={() => {
                  if (imgSrc && imgSrc !== fallbackScreenshot && fallbackScreenshot) {
                    setImgSrc(fallbackScreenshot);
                  } else {
                    setImgError(true);
                  }
                }}
              />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/5 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
                <div className="p-3 bg-background/40 rounded-2xl backdrop-blur-md border border-primary/20 shadow-sm group-hover:scale-110 transition-transform duration-500 z-0">
                  <ExternalLink className="h-6 w-6 text-primary/60" />
                </div>
              </div>
            )}

            {/* ── TOP-LEFT: CATEGORY BADGE ── */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none" style={{ transform: "translateZ(50px)" }}>
              <span 
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-background/90 dark:bg-background/95 text-foreground/90 backdrop-blur-md border border-border/70 shadow-xs inline-flex items-center select-none"
                style={{ color: catColor }}
              >
                {link.category}
              </span>
            </div>

            {/* ── TOP-RIGHT: QUICK REMINDER BUTTON / PILL ── */}
            <div
              className="absolute top-3 right-3 z-10 flex items-center gap-1"
              style={{ transform: "translateZ(50px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <QuickReminderPopover
                targetId={link.id}
                type="link"
                title={link.title}
                url={link.url}
                currentReminderAt={link.reminderAt}
                onReminderChange={() => onUpdate()}
                showLabel={hasActiveReminder}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border shadow-xs transition-all cursor-pointer select-none",
                  hasActiveReminder
                    ? "bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-amber-500/25 ring-2 ring-background hover:bg-amber-400"
                    : "bg-background/85 dark:bg-background/90 text-muted-foreground hover:text-amber-500 hover:bg-background border-border/70 opacity-90 group-hover:opacity-100"
                )}
              />
            </div>
          </div>

          {/* ── CARD BODY (UNIFORM EQUAL HEIGHT FLEX LAYOUT) ── */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3 z-20" style={{ transform: "translateZ(40px)" }}>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                {/* Favicon Box */}
                <div className="relative h-9 w-9 shrink-0 rounded-xl bg-muted/80 flex items-center justify-center overflow-hidden ring-1 ring-border/80 mt-0.5">
                  {link.favicon ? (
                    <img src={link.favicon} alt="" className="h-5 w-5 object-contain" />
                  ) : (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem] flex items-center text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={handleFavorite}
                        aria-label={link.isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
                        className="p-1.5 sm:p-1 rounded-lg hover:bg-foreground/10 active:scale-95 text-muted-foreground transition-all cursor-pointer touch-manipulation select-none"
                      >
                        <Star
                          className={`h-4 w-4 sm:h-4 sm:w-4 ${link.isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
                        />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button"
                            aria-label="Menu opsi tautan"
                            className="p-1.5 sm:p-1 rounded-lg hover:bg-foreground/10 active:scale-95 text-muted-foreground transition-all cursor-pointer touch-manipulation select-none"
                          >
                            <MoreVertical className="h-4 w-4 sm:h-4 sm:w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={handleCopy}>
                            <Copy className="h-4 w-4 mr-2" /> {t("links.copyUrl")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            if (requireAuth(t("links.modalEditTitle"), t("auth.authRequiredDesc"))) return;
                            onEdit(link);
                          }}>
                            <Edit className="h-4 w-4 mr-2" /> {t("common.edit")}
                          </DropdownMenuItem>

                          {/* ── OPTION: JIKA SUDAH PERNAH DIJADIKAN CATATAN ── */}
                          {existingNote ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => router.push(`/notes/${existingNote.id}`)}
                                className="text-emerald-600 dark:text-emerald-400 font-semibold gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2" />
                                <span className="flex-1">{t("links.openSavedNote")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  if (requireAuth(t("links.createAnotherNote"), t("auth.authRequiredDesc"))) return;
                                  setIsNoteConverterOpen(true);
                                }}
                                className="text-muted-foreground text-xs gap-2 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 mr-2" />
                                <span>{t("links.createAnotherNote")}</span>
                              </DropdownMenuItem>
                            </>
                          ) : (link.notes || link.aiSummary) ? (
                            <DropdownMenuItem
                              onClick={() => {
                                if (requireAuth(t("links.saveAsPersonalNote"), t("auth.authRequiredDesc"))) return;
                                setIsNoteConverterOpen(true);
                              }}
                              className="text-amber-600 dark:text-amber-400 font-medium gap-2 cursor-pointer"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              <span>{t("links.saveAsPersonalNote")}</span>
                            </DropdownMenuItem>
                          ) : null}

                          <DropdownMenuItem onClick={() => {
                            if (requireAuth(t("links.manageCollection"), t("auth.authRequiredDesc"))) return;
                            setIsManageOpen(true);
                          }}>
                            {t("links.manageCollection")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" /> {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description / AI Summary Reserved Area */}
              <div className="min-h-[2.25rem] flex items-center pt-0.5">
                {link.description ? (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                    {link.description}
                  </p>
                ) : link.aiSummary ? (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                    {link.aiSummary}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/50 line-clamp-1 italic">
                    {new URL(link.url).hostname.replace('www.', '') ? `Tautan dari ${new URL(link.url).hostname.replace('www.', '')}` : "Informasi tautan tersimpan"}
                  </p>
                )}
              </div>

              {/* Tags */}
              {link.tags && link.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 min-h-[1.5rem]">
                  {link.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal rounded-md">
                      #{tag}
                    </Badge>
                  ))}
                  {link.tags.length > 3 && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      +{link.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── CARD FOOTER & ACTIONS ANCHORED AT BOTTOM ── */}
            <div className="mt-auto space-y-2 pt-2.5 border-t border-border/40">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 font-medium tracking-normal">
                <div className="flex items-center gap-2 truncate max-w-[170px]">
                  <span className="truncate font-mono font-medium text-foreground/70">
                    {new URL(link.url).hostname.replace('www.', '') || link.category}
                  </span>
                  {existingNote && (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/notes/${existingNote.id}`);
                      }}
                      className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded cursor-pointer hover:bg-emerald-500/20 transition-all shrink-0" 
                      title={`Catatan Terkait: "${existingNote.title}"`}
                    >
                      <BookOpen className="w-2.5 h-2.5" /> Catatan
                    </span>
                  )}
                </div>
                <span>
                  {formatRelativeTime(link.createdAt || link.lastOpenedAt)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.92, rotate: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex-1"
                >
                  <Button 
                    type="button"
                    variant="secondary" 
                    size="sm" 
                    className="w-full text-[11px] h-8 px-2 rounded-xl transition-all font-medium cursor-pointer shadow-xs active:shadow-inner"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsViewOpen(true);
                    }}
                  >
                    {t("links.overviewBtn")}
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.92, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="flex-1"
                >
                  <Button 
                    type="button"
                    size="sm" 
                    className="w-full text-[11px] h-8 px-2 rounded-xl transition-all font-medium cursor-pointer shadow-xs active:shadow-inner"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExternalOpen();
                    }}
                  >
                    <span>{t("links.openLinkBtn")}</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Card3D>
      
      {isViewOpen && (
        <ViewLinkDialog
          link={link}
          open={isViewOpen}
          onOpenChange={setIsViewOpen}
          onOpenExternal={handleExternalOpen}
        />
      )}
      
      {isManageOpen && (
        <ManageCollectionsDialog
          link={link}
          open={isManageOpen}
          onOpenChange={setIsManageOpen}
          onUpdate={onUpdate}
        />
      )}
      
      {isDeleteDialogOpen && (
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={t("links.deleteConfirmTitle")}
          description={t("links.deleteConfirmDesc")}
          onConfirm={executeDelete}
        />
      )}

      {/* Liko Note Converter Modal */}
      <LikoNoteConverterModal
        isOpen={isNoteConverterOpen}
        link={link}
        onClose={() => setIsNoteConverterOpen(false)}
        onSuccess={() => {
          setIsNoteConverterOpen(false);
          onUpdate();
        }}
      />
    </motion.div>
  );
}
