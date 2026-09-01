"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLinks } from "@/hooks/use-data";
import { SerializedLink, SerializedCollection } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { getFaviconUrl } from "@/lib/utils";
import { useTranslation } from "@/components/providers/i18n-provider";

interface AddLinksToCollectionDialogProps {
  collection: SerializedCollection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  existingLinks: SerializedLink[];
}

export function AddLinksToCollectionDialog({
  collection,
  open,
  onOpenChange,
  onUpdate,
  existingLinks,
}: AddLinksToCollectionDialogProps) {
  const { links, loading } = useLinks();
  const [isSaving, setIsSaving] = useState(false);
  const { t, locale } = useTranslation();

  const [localLinks, setLocalLinks] = useState<Set<string>>(new Set(existingLinks.map(l => l.id)));

  // Sync state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalLinks(new Set(existingLinks.map(l => l.id)));
    }
  }, [open, existingLinks]);

  const toggleLink = (linkId: string, checked: boolean) => {
    const newSet = new Set(localLinks);
    if (checked) newSet.add(linkId);
    else newSet.delete(linkId);
    setLocalLinks(newSet);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const existingIds = new Set(existingLinks.map(l => l.id));
    const toAdd = [...localLinks].filter(id => !existingIds.has(id));
    const toRemove = [...existingIds].filter(id => !localLinks.has(id));

    try {
      const promises = [];
      
      for (const id of toAdd) {
        promises.push(
          fetch(`/api/collections/${collection.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ linkId: id }),
          })
        );
      }
      
      for (const id of toRemove) {
        promises.push(
          fetch(`/api/collections/${collection.id}/link/${id}`, {
            method: "DELETE",
          })
        );
      }
      
      await Promise.all(promises);
      onUpdate();
      onOpenChange(false);
    } catch (err) {
      console.error("Gagal mengupdate link dalam koleksi", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{locale === "en" ? "Manage Collection Links" : "Tambah / Hapus Tautan"}</DialogTitle>
          <DialogDescription>
            {locale === "en" ? `Organize links included in the collection ` : `Atur tautan yang masuk ke dalam koleksi `}
            <strong>{collection.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{locale === "en" ? "No links saved yet." : "Belum ada tautan tersimpan."}</p>
              <p className="text-xs mt-1">{locale === "en" ? "Add new links from the sidebar first." : "Tambahkan tautan baru dari sidebar terlebih dahulu."}</p>
            </div>
          ) : (
            <ScrollArea className="h-[50vh] pr-4">
              <div className="space-y-3">
                {links.map((link) => {
                  const isChecked = localLinks.has(link.id);
                  const favicon = link.favicon || getFaviconUrl(link.url);
                  
                  return (
                    <div
                      key={link.id}
                      className="flex items-center space-x-3 p-3 rounded-xl border border-border/50 hover:bg-foreground/5 transition-colors"
                    >
                      <Checkbox
                        id={`link-${link.id}`}
                        checked={isChecked}
                        disabled={isSaving}
                        onCheckedChange={(checked) => 
                          toggleLink(link.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`link-${link.id}`}
                        className="flex-1 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3"
                      >
                        <div className="relative h-8 w-8 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden ring-1 ring-border">
                          {favicon ? (
                            <Image src={favicon} alt="" width={16} height={16} unoptimized />
                          ) : (
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{link.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {(() => {
                              try {
                                return new URL(link.url).hostname;
                              } catch {
                                return link.url;
                              }
                            })()}
                          </p>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
        
        <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="cursor-pointer"
          >
            {t("common.cancel")}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || loading}
            className="cursor-pointer"
          >
            {isSaving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
