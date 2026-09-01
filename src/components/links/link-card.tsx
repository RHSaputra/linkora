"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Star,
  MoreHorizontal,
  Link2,
  BookOpen,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { SerializedLink } from "@/lib/types";
import { CATEGORY_COLORS, cn, formatRelativeTime, getFaviconUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { openLink, toggleFavorite, deleteLink, useNotes } from "@/hooks/use-data";
import { ViewLinkDialog } from "@/components/links/view-link-dialog";
import { ManageCollectionsDialog } from "@/components/links/manage-collections-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { QuickReminderPopover } from "@/components/reminders/quick-reminder-popover";
import { LikoNoteConverterModal } from "@/components/links/liko-note-converter-modal";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTranslation } from "@/components/providers/i18n-provider";

interface LinkCardProps {
  link: SerializedLink;
  onUpdate?: () => void;
  onEdit?: (link: SerializedLink) => void;
  index?: number;
  collectionId?: string;
}

export function LinkCard({ link, onUpdate, onEdit, index = 0, collectionId }: LinkCardProps) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const { notes } = useNotes();
  const { t, locale } = useTranslation();
  const favicon = link.favicon || getFaviconUrl(link.url);
  const categoryColor = CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Custom;

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
    setIsViewOpen(true);
  };

  const handleExternalOpen = async () => {
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
    try {
      await deleteLink(link.id);
      onUpdate?.();
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

  const executeRemoveFromCollection = async () => {
    if (!collectionId) return;
    try {
      await fetch(`/api/collections/${collectionId}/link/${link.id}`, { method: "DELETE" });
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group relative"
    >
      <div
        onClick={handleCardClick}
        className="glass-panel rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/40 border border-border/80 bg-card/90"
      >
        {/* ── CARD TOP BANNER / THUMBNAIL AREA ── */}
        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b border-border/50">
          {/* Background Image / Thumbnail */}
          {link.thumbnail ? (
            <div className="absolute inset-0">
              <Image
                src={link.thumbnail}
                alt={link.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/85 via-card/30 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60" />
              {/* Central Translucent Icon Box */}
              <div className="p-3 bg-background/50 rounded-2xl backdrop-blur-md border border-primary/20 shadow-sm group-hover:scale-110 transition-transform duration-500 z-0">
                <ExternalLink className="h-6 w-6 text-primary/70" />
              </div>
            </div>
          )}

          {/* ── TOP-LEFT: CATEGORY BADGE ── */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-background/90 dark:bg-background/95 text-foreground/90 backdrop-blur-md border border-border/70 shadow-xs inline-flex items-center select-none"
              style={{ color: categoryColor }}
            >
              {link.category}
            </span>
          </div>

          {/* ── TOP-RIGHT: QUICK REMINDER BUTTON / PILL ── */}
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
        </div>

        {/* ── CARD BODY (CLEAN & UNCLUTTERED) ── */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            {/* Favicon Icon */}
            <div className="relative h-9 w-9 shrink-0 rounded-xl bg-muted/80 flex items-center justify-center overflow-hidden ring-1 ring-border/80">
              {favicon ? (
                <Image src={favicon} alt="" width={20} height={20} loading="lazy" decoding="async" unoptimized />
              ) : (
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Title & Quick Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1.5">
                <h3 className="font-bold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <div className="flex items-center gap-0.5 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={handleFavorite}>
                    <Star className={cn("h-3.5 w-3.5", link.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
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
                      
                      {/* ── OPTION: JIKA SUDAH PERNAH DIJADIKAN CATATAN ── */}
                      {existingNote ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => router.push(`/notes/${existingNote.id}`)}
                            className="text-emerald-600 dark:text-emerald-400 font-semibold gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="flex-1">{t("links.openSavedNote")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (requireAuth(t("links.createAnotherNote"), t("auth.authRequiredDesc"))) return;
                              setIsNoteConverterOpen(true);
                            }}
                            className="text-muted-foreground text-xs gap-2"
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
                          className="text-amber-600 dark:text-amber-400 font-medium gap-2"
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

              {/* Description / AI Summary */}
              {link.description ? (
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {link.description}
                </p>
              ) : link.aiSummary ? (
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {link.aiSummary}
                </p>
              ) : null}
            </div>
          </div>

          {/* Tags */}
          {link.tags && link.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
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

          {/* ── CARD FOOTER METADATA: DOMAIN, CATATAN STATUS, & RELATIVE TIME ── */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 font-medium pt-2 border-t border-border/40 uppercase tracking-wider">
            <div className="flex items-center gap-2 truncate max-w-[170px]">
              <span className="truncate font-semibold text-foreground/70">
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
            <span>
              {formatRelativeTime(link.createdAt || link.lastOpenedAt)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Button 
              type="button"
              variant="secondary" 
              size="sm" 
              className="flex-1 text-[11px] h-8 px-2 rounded-xl transition-all active:scale-95 font-medium"
              onClick={handleCardClick}
            >
              {t("links.overviewBtn")}
            </Button>
            <Button 
              type="button"
              size="sm" 
              className="flex-1 text-[11px] h-8 px-2 rounded-xl transition-all active:scale-95 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                handleExternalOpen();
              }}
            >
              {t("links.openLinkBtn")} <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
            </Button>
          </div>
        </div>
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

      {/* Liko Note Converter Modal */}
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
