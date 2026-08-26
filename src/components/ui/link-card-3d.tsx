"use client";

import { SerializedLink } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { MoreVertical, ExternalLink, Star, Copy, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteLink, toggleFavorite, openLink } from "@/hooks/use-data";
import { Card3D } from "./3d-card";
import { motion } from "framer-motion";
import { CATEGORY_COLORS } from "@/lib/utils";

import { useState } from "react";
import { ViewLinkDialog } from "@/components/links/view-link-dialog";
import { ManageCollectionsDialog } from "@/components/links/manage-collections-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface LinkCard3DProps {
  link: SerializedLink;
  index: number;
  onUpdate: () => void;
  onEdit: (link: SerializedLink) => void;
}

export function LinkCard3D({ link, index, onUpdate, onEdit }: LinkCard3DProps) {
  const catColor = CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Custom;
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    setIsDeleteDialogOpen(true);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(link);
      onUpdate();
    } catch (err) {
      console.error("Gagal mengupdate status favorit", err);
    }
  };

  const handleExternalOpen = async () => {
    await openLink(link);
    onUpdate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card3D className="h-full">
        <div 
          onClick={() => setIsViewOpen(true)}
          className="group h-full flex flex-col glass-panel rounded-2xl overflow-hidden cursor-pointer relative"
          style={{ transform: "translateZ(30px)" }} // pop out slightly from the 3D card wrapper
        >
          {/* Holographic Border Top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative aspect-[2/1] w-full overflow-hidden bg-foreground/5 border-b border-foreground/5">
            {link.thumbnail ? (
              <img
                src={link.thumbnail}
                alt={link.title}
                className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/5 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
                <div className="p-3 bg-background/40 rounded-2xl backdrop-blur-md border border-primary/20 shadow-sm group-hover:scale-110 transition-transform duration-500 z-10">
                  <ExternalLink className="h-6 w-6 text-primary/60" />
                </div>
              </div>
            )}

            {/* Floating Tags (Z-Translated) */}
            <div className="absolute inset-0 p-3 flex flex-col justify-between z-10" style={{ transform: "translateZ(50px)" }}>
              <div className="flex justify-between items-start">
                <span 
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-background/90 border border-foreground/10 shadow-sm"
                  style={{ color: catColor }}
                >
                  {link.category}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col z-20" style={{ transform: "translateZ(40px)" }}>
            <div className="flex items-start gap-3 mb-2">
              {link.favicon ? (
                <img src={link.favicon} alt="" className="h-5 w-5 rounded bg-background p-0.5 mt-0.5 shadow-sm border border-border" />
              ) : (
                <div className="h-5 w-5 rounded bg-background flex items-center justify-center mt-0.5 shadow-sm border border-border">
                  <ExternalLink className="h-3 w-3 text-foreground/50" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleFavorite}
                      className="p-1 rounded-md hover:bg-foreground/5 text-muted-foreground transition-colors"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${link.isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
                      />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 rounded-md hover:bg-foreground/5 text-muted-foreground transition-colors">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={handleCopy}>
                          <Copy className="h-4 w-4 mr-2" /> Salin URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(link)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsManageOpen(true)}>
                          Atur Koleksi
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                          <Trash className="h-4 w-4 mr-2" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            {link.aiSummary ? (
              <p className="mt-2 mb-3 text-xs text-muted-foreground line-clamp-2 pl-8">
                {link.aiSummary}
              </p>
            ) : link.description ? (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 pl-8">
                {link.description}
              </p>
            ) : null}

            <div className="mt-auto pt-4 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <span className="truncate max-w-[150px]">{new URL(link.url).hostname.replace('www.', '')}</span>
              <span>{formatDistanceToNow(new Date(link.createdAt), { addSuffix: true, locale: id })}</span>
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
          title="Hapus Tautan"
          description="Apakah Anda yakin ingin menghapus tautan ini secara permanen? Tindakan ini tidak dapat dibatalkan."
          onConfirm={executeDelete}
        />
      )}
    </motion.div>
  );
}
