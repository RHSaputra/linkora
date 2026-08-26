"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Star,
  MoreHorizontal,
  Clock,
  Bell,
  Link2,
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
import { openLink, toggleFavorite, deleteLink } from "@/hooks/use-data";
import { ViewLinkDialog } from "@/components/links/view-link-dialog";
import { ManageCollectionsDialog } from "@/components/links/manage-collections-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { QuickReminderPopover } from "@/components/reminders/quick-reminder-popover";

interface LinkCardProps {
  link: SerializedLink;
  onUpdate?: () => void;
  onEdit?: (link: SerializedLink) => void;
  index?: number;
  collectionId?: string;
}

export function LinkCard({ link, onUpdate, onEdit, index = 0, collectionId }: LinkCardProps) {
  const favicon = link.favicon || getFaviconUrl(link.url);
  const categoryColor = CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Custom;

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveFromCollectionOpen, setIsRemoveFromCollectionOpen] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group relative"
    >
      <div
        onClick={handleCardClick}
        className="glass-panel rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/30"
      >
        {link.thumbnail ? (
          <div className="relative h-32 w-full overflow-hidden bg-muted flex items-center justify-center">
            <Image
              src={link.thumbnail}
              alt={link.title}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center border-b border-border/50">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
            <div className="p-3 bg-background/40 rounded-2xl backdrop-blur-md border border-primary/20 shadow-sm group-hover:scale-110 transition-transform duration-500 z-10">
              <Link2 className="h-6 w-6 text-primary/60" />
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative h-10 w-10 shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden ring-1 ring-border">
              {favicon ? (
                <Image src={favicon} alt="" width={24} height={24} unoptimized />
              ) : (
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <div className={cn(
                  "flex items-center gap-0.5 transition-opacity shrink-0",
                  link.reminderAt && new Date(link.reminderAt) > new Date()
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                )}>
                  <QuickReminderPopover
                    targetId={link.id}
                    type="link"
                    title={link.title}
                    url={link.url}
                    currentReminderAt={link.reminderAt}
                    onReminderChange={() => onUpdate?.()}
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFavorite}>
                    <Star className={cn("h-3.5 w-3.5", link.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => onEdit?.(link)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsManageOpen(true)}>Atur Koleksi</DropdownMenuItem>
                      {collectionId && (
                        <DropdownMenuItem onClick={handleRemoveFromCollection}>
                          Hapus dari Koleksi
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {link.aiSummary ? (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 pl-8">
                  {link.aiSummary}
                </p>
              ) : link.description ? (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 pl-8">
                  {link.description}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                  style={{ borderColor: `${categoryColor}40`, color: categoryColor }}
                >
                  {link.category}
                </Badge>
                {link.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
                {link.tags.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{link.tags.length - 2}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2.5 text-[10px] text-muted-foreground">
                {link.lastOpenedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(link.lastOpenedAt)}
                  </span>
                )}
                {link.reminderAt && new Date(link.reminderAt) > new Date() && (
                  <div className="inline-flex items-center">
                    <QuickReminderPopover
                      targetId={link.id}
                      type="link"
                      title={link.title}
                      url={link.url}
                      currentReminderAt={link.reminderAt}
                      onReminderChange={() => onUpdate?.()}
                      className="px-2 py-0.5 rounded-md text-[10px] gap-1 font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 inline-flex hover:bg-amber-500/20"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/40">
                <Button 
                  type="button"
                  variant="secondary" 
                  size="sm" 
                  className="flex-1 text-[11px] h-8 px-2 transition-all active:scale-95"
                  onClick={handleCardClick}
                >
                  Ringkasan
                </Button>
                <Button 
                  type="button"
                  size="sm" 
                  className="flex-1 text-[11px] h-8 px-2 transition-all active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExternalOpen();
                  }}
                >
                  Tautan <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
                </Button>
              </div>
            </div>
          </div>
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
          onUpdate={onUpdate || (() => {})}
        />
      )}
      {isDeleteDialogOpen && (
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Hapus Tautan"
          description="Apakah Anda yakin ingin menghapus tautan ini secara permanen? Tindakan ini tidak dapat dibatalkan."
          onConfirm={executeDelete}
        />
      )}
      
      {isRemoveFromCollectionOpen && (
        <ConfirmDialog
          open={isRemoveFromCollectionOpen}
          onOpenChange={setIsRemoveFromCollectionOpen}
          title="Keluarkan dari Koleksi"
          description="Keluarkan link ini dari koleksi? (Link tetap ada di All Links)"
          onConfirm={executeRemoveFromCollection}
        />
      )}
    </motion.div>
  );
}
