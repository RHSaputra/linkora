"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Star,
  MoreHorizontal,
  BookOpen,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { SerializedLink } from "@/lib/types";
import { getCategoryColor, cn, formatRelativeTime, getFaviconUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { openLink, toggleFavorite, deleteLink, useNotes, dispatchRefresh } from "@/hooks/use-data";
import { ViewLinkDialog } from "@/components/links/view-link-dialog";
import { ManageCollectionsDialog } from "@/components/links/manage-collections-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { QuickReminderPopover } from "@/components/reminders/quick-reminder-popover";
import { LikoNoteConverterModal } from "@/components/links/liko-note-converter-modal";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTranslation } from "@/components/providers/i18n-provider";
import { saveCurrentScrollPosition } from "@/hooks/use-page-state-restoration";

import { LinkViewMode } from "@/hooks/use-view-mode";
import { LinkoraCardThumbnail } from "@/components/ui/linkora-card-thumbnail";

interface LinkCardProps {
  link: SerializedLink;
  onUpdate?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (link: SerializedLink) => void;
  index?: number;
  collectionId?: string;
  viewMode?: LinkViewMode;
}

export function LinkCard({
  link,
  onUpdate,
  onDelete,
  onEdit,
  index = 0,
  collectionId,
  viewMode = "detail",
}: LinkCardProps) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const { notes } = useNotes();
  const { t, locale } = useTranslation();
  const favicon = link.favicon || getFaviconUrl(link.url);
  const categoryColor = getCategoryColor(link.category);

  // Check if link is already converted to a note
  const existingNote = useMemo(() => {
    if (!notes || !link) return null;
    return notes.find((n: any) => {
      if (n.status === "TRASH") return false;
      return (n.content && n.content.includes(link.url)) || (n.title && n.title.includes(link.title));
    });
  }, [notes, link]);

  const domain = useMemo(() => {
    try {
      return new URL(link.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }, [link.url]);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveFromCollectionOpen, setIsRemoveFromCollectionOpen] = useState(false);
  const [isNoteConverterOpen, setIsNoteConverterOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveCurrentScrollPosition("links");
    setIsViewOpen(true);
  };

  const handleExternalOpen = async () => {
    saveCurrentScrollPosition("links");
    await openLink(link);
    onUpdate?.();
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (requireAuth(
      locale === "en" ? "Favorite Link" : "Menyukai Tautan",
      locale === "en" ? "Sign in or register for free to bookmark your favorite links." : "Masuk atau daftar gratis untuk menandai tautan favorit Anda."
    )) {
      return;
    }
    await toggleFavorite(link);
    onUpdate?.();
  };

  const executeDelete = async () => {
    onDelete?.(link.id);
    try {
      await deleteLink(link.id);
    } catch (err) {
      console.error("Gagal menghapus link", err);
      onUpdate?.();
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

  const executeRemoveFromCollection = async () => {
    if (!collectionId) return;
    try {
      await fetch(`/api/collections/${collectionId}/link/${link.id}`, { method: "DELETE" });
      dispatchRefresh(["collections", "links", "dashboard"], false);
      onUpdate?.();
    } catch (err) {
      console.error("Gagal mengeluarkan dari koleksi", err);
    }
  };

  const handleRemoveFromCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoveFromCollectionOpen(true);
  };

  const hasActiveReminder = Boolean(link.reminderAt && new Date(link.reminderAt) > new Date());

  const isCompact = viewMode === "compact";

  return (
    <motion.div
      layout
      layoutId={`card-container-${link.id}`}
      transition={{
        layout: { type: "spring", stiffness: 340, damping: 30, mass: 0.8 },
        opacity: { duration: 0.2 },
      }}
      className="group relative w-full h-full flex flex-col transform-gpu"
    >
      <div
        onClick={handleCardClick}
        className={cn(
          "glass-panel rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border border-border/80 bg-card/90 flex flex-col justify-between w-full relative",
          isCompact
            ? "p-2.5 sm:p-3 rounded-xl hover:shadow-md hover:border-border"
            : "h-full hover:shadow-lg hover:-translate-y-1 hover:border-border"
        )}
      >
        {/* Subtle glass shimmer sweep animation on view mode change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0.7, x: "-100%" }}
            animate={{ opacity: 0, x: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-primary/20 to-transparent z-40 rounded-2xl"
          />
        </AnimatePresence>

        {/* ── CARD TOP BANNER / THUMBNAIL AREA (DETAIL MODE ONLY) ── */}
        <AnimatePresence initial={false}>
          {!isCompact && (
            <motion.div
              key="thumbnail-area"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full shrink-0 overflow-hidden"
            >
              <LinkoraCardThumbnail
                url={link.url}
                title={link.title}
                category={link.category}
                thumbnail={link.thumbnail}
                favicon={link.favicon}
                linkId={link.id}
                onUpdate={onUpdate}
              />

              {/* TOP-LEFT: CATEGORY BADGE */}
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-background/90 dark:bg-background/95 text-foreground/90 backdrop-blur-md border border-border/70 shadow-xs inline-flex items-center select-none"
                  style={{ color: categoryColor }}
                >
                  {link.category}
                </span>
              </div>

              {/* TOP-RIGHT: QUICK REMINDER BUTTON */}
              <div
                className="absolute top-3 right-3 z-10 flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <QuickReminderPopover
                  targetId={link.id}
                  type="link"
                  title={link.title}
                  url={link.url}
                  currentReminderAt={link.reminderAt}
                  onReminderChange={() => onUpdate?.()}
                  showLabel={hasActiveReminder}
                  className={cn(
                    "h-7 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border shadow-xs transition-all cursor-pointer select-none",
                    hasActiveReminder
                      ? "bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-amber-500/25 ring-2 ring-background hover:bg-amber-400"
                      : "bg-background/85 dark:bg-background/90 text-muted-foreground hover:text-amber-500 hover:bg-background border-border/70 opacity-90 group-hover:opacity-100"
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── COMPACT MODE LAYOUT ── */}
        {isCompact ? (
          <div className="flex items-center justify-between gap-3 w-full">
            {/* Left: Favicon / Details */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <motion.div
                layoutId={`favicon-box-${link.id}`}
                className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg bg-muted/80 flex items-center justify-center overflow-hidden ring-1 ring-border/80"
              >
                {favicon ? (
                  <Image src={favicon} alt="" width={18} height={18} loading="lazy" decoding="async" unoptimized />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 max-w-full">
                  <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {link.title}
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-background/90 dark:bg-background/95 text-foreground/90 backdrop-blur-md border border-border/70 shadow-xs shrink-0 hidden xs:inline-flex"
                    style={{ color: categoryColor }}
                  >
                    {link.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                  <span className="truncate font-mono font-medium text-foreground/70">
                    {domain || link.category}
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

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <QuickReminderPopover
                targetId={link.id}
                type="link"
                title={link.title}
                url={link.url}
                currentReminderAt={link.reminderAt}
                onReminderChange={() => onUpdate?.()}
                showLabel={hasActiveReminder}
                className={cn(
                  "h-7 px-1.5 sm:px-2 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border shadow-xs transition-all cursor-pointer select-none shrink-0",
                  hasActiveReminder
                    ? "bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-amber-500/25 ring-2 ring-background hover:bg-amber-400"
                    : "bg-background/85 dark:bg-background/90 text-muted-foreground hover:text-amber-500 hover:bg-background border-border/70 opacity-90 group-hover:opacity-100"
                )}
              />

              <Button variant="ghost" size="icon-xs" onClick={handleFavorite} aria-label={link.isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}>
                <Star className={cn("h-3.5 w-3.5", link.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
              </Button>

              <Button
                variant="ghost"
                size="icon-xs"
                className="text-primary hover:text-primary hidden sm:inline-flex"
                onClick={handleExternalOpen}
                title={t("links.openLinkBtn")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-xs" aria-label="Menu opsi tautan">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => {
                    if (requireAuth(t("links.modalEditTitle"), t("auth.authRequiredDesc"))) return;
                    onEdit?.(link);
                  }}>{t("common.edit")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (requireAuth(t("links.manageCollection"), t("auth.authRequiredDesc"))) return;
                    setIsManageOpen(true);
                  }}>{t("links.manageCollection")}</DropdownMenuItem>
                  
                  {existingNote ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push(`/notes/${existingNote.id}`)}
                        className="text-emerald-600 dark:text-emerald-400 font-semibold gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="flex-1">{t("links.openSavedNote")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (requireAuth(t("links.createAnotherNote"), t("auth.authRequiredDesc"))) return;
                          setIsNoteConverterOpen(true);
                        }}
                        className="text-muted-foreground text-xs gap-2 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
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
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{t("links.saveAsPersonalNote")}</span>
                    </DropdownMenuItem>
                  ) : null}

                  {collectionId && (
                    <DropdownMenuItem onClick={handleRemoveFromCollection}>
                      {t("links.removeFromCollection")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">{t("common.delete")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          /* ── DETAIL MODE LAYOUT ── */
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3 z-20">
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <motion.div
                  layoutId={`favicon-box-${link.id}`}
                  className="relative h-9 w-9 shrink-0 rounded-xl bg-muted/80 flex items-center justify-center overflow-hidden ring-1 ring-border/80 mt-0.5"
                >
                  {favicon ? (
                    <Image src={favicon} alt="" width={20} height={20} loading="lazy" decoding="async" unoptimized />
                  ) : (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem] flex items-center text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-sm" onClick={handleFavorite} aria-label={link.isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}>
                        <Star className={cn("h-4 w-4 sm:h-4 sm:w-4", link.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon-sm" aria-label="Menu opsi tautan">
                            <MoreHorizontal className="h-4 w-4 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => {
                            if (requireAuth(t("links.modalEditTitle"), t("auth.authRequiredDesc"))) return;
                            onEdit?.(link);
                          }}>{t("common.edit")}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            if (requireAuth(t("links.manageCollection"), t("auth.authRequiredDesc"))) return;
                            setIsManageOpen(true);
                          }}>{t("links.manageCollection")}</DropdownMenuItem>
                          
                          {existingNote ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => router.push(`/notes/${existingNote.id}`)}
                                className="text-emerald-600 dark:text-emerald-400 font-semibold gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="flex-1">{t("links.openSavedNote")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  if (requireAuth(t("links.createAnotherNote"), t("auth.authRequiredDesc"))) return;
                                  setIsNoteConverterOpen(true);
                                }}
                                className="text-muted-foreground text-xs gap-2 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
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
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{t("links.saveAsPersonalNote")}</span>
                            </DropdownMenuItem>
                          ) : null}

                          {collectionId && (
                            <DropdownMenuItem onClick={handleRemoveFromCollection}>
                              {t("links.removeFromCollection")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleDelete} className="text-destructive">{t("common.delete")}</DropdownMenuItem>
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
                    {domain ? `Tautan dari ${domain}` : "Informasi tautan tersimpan"}
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

            {/* CARD FOOTER & ACTIONS ANCHORED AT BOTTOM */}
            <div className="mt-auto space-y-2 pt-2.5 border-t border-border/40">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground/80 font-medium tracking-normal gap-1">
                <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate pr-1">
                  <span className="truncate font-mono font-medium text-foreground/70">
                    {domain || link.category}
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
                <span className="shrink-0 text-right">
                  {formatRelativeTime(link.createdAt || link.lastOpenedAt)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 min-w-0">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    className="w-full text-[10px] sm:text-[11px] h-8 px-1.5 sm:px-2 rounded-xl border border-border bg-slate-100 dark:bg-slate-800/80 hover:bg-muted text-foreground font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center truncate"
                    onClick={handleCardClick}
                  >
                    {t("links.overviewBtn")}
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <Button 
                    type="button"
                    size="sm" 
                    className="w-full text-[10px] sm:text-[11px] h-8 px-1.5 sm:px-2 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-cyan-600 hover:from-primary/90 hover:to-cyan-500 text-white font-semibold shadow-sm border border-transparent transition-colors cursor-pointer flex items-center justify-center gap-1 truncate"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExternalOpen();
                    }}
                  >
                    <span className="truncate">{t("links.openLinkBtn")}</span>
                    <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/90 shrink-0" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
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
          onUpdate={onUpdate || (() => {})}
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
      
      {isRemoveFromCollectionOpen && (
        <ConfirmDialog
          open={isRemoveFromCollectionOpen}
          onOpenChange={setIsRemoveFromCollectionOpen}
          title={t("links.removeFromCollectionTitle")}
          description={t("links.removeFromCollectionDesc")}
          onConfirm={executeRemoveFromCollection}
        />
      )}

      <LikoNoteConverterModal
        isOpen={isNoteConverterOpen}
        link={link}
        onClose={() => setIsNoteConverterOpen(false)}
        onSuccess={() => {
          setIsNoteConverterOpen(false);
          onUpdate?.();
        }}
      />
    </motion.div>
  );
}
