"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCollections } from "@/hooks/use-data";
import { SerializedLink } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";
import { useTranslation } from "@/components/providers/i18n-provider";

interface ManageCollectionsDialogProps {
  link: SerializedLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ManageCollectionsDialog({
  link,
  open,
  onOpenChange,
  onUpdate,
}: ManageCollectionsDialogProps) {
  const { collections, loading } = useCollections();
  const [isSaving, setIsSaving] = useState(false);
  const { t, locale } = useTranslation();

  // Original state to track changes
  const originalCollections = new Set(link.collections?.map((c: any) => c.collectionId) || []);

  const [localCollections, setLocalCollections] = useState<Set<string>>(
    new Set(originalCollections)
  );

  const toggleCollection = (collectionId: string, checked: boolean) => {
    const newSet = new Set(localCollections);
    if (checked) newSet.add(collectionId);
    else newSet.delete(collectionId);
    setLocalCollections(newSet);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const toAdd = [...localCollections].filter(id => !originalCollections.has(id));
    const toRemove = [...originalCollections].filter(id => !localCollections.has(id));

    try {
      const promises = [];

      for (const id of toAdd) {
        promises.push(
          fetch(`/api/collections/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ linkId: link.id }),
          })
        );
      }

      for (const id of toRemove) {
        promises.push(
          fetch(`/api/collections/${id}/link/${link.id}`, {
            method: "DELETE",
          })
        );
      }

      await Promise.all(promises);
      onUpdate();
      onOpenChange(false);
    } catch (err) {
      console.error("Gagal mengupdate koleksi", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl bg-white dark:bg-slate-900 border border-primary/20 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl rounded-3xl space-y-5">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground">{t("links.manageCollection")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {locale === "en" ? "Select which collections should include this link." : "Pilih koleksi mana saja yang menyimpan tautan ini."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("collections.emptyTitle")}</p>
              <p className="text-xs mt-1">{locale === "en" ? "Create a new collection on the Collections page." : "Buat koleksi baru di halaman Collections."}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {collections.map((col) => {
                const isChecked = localCollections.has(col.id);

                return (
                  <div
                    key={col.id}
                    className="flex items-center space-x-3 p-3 rounded-xl border border-border/50 hover:bg-foreground/5 transition-colors"
                  >
                    <Checkbox
                      id={`col-${col.id}`}
                      checked={isChecked}
                      disabled={isSaving}
                      onCheckedChange={(checked) =>
                        toggleCollection(col.id, checked as boolean)
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`col-${col.id}`}
                      className="flex-1 cursor-pointer font-medium leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-3 min-w-0"
                    >
                      <div
                        className="p-1.5 rounded-md shrink-0"
                        style={{ backgroundColor: `${col.color}20`, color: col.color }}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </div>
                      <span className="break-words font-medium text-xs sm:text-sm">{col.name}</span>
                    </Label>
                  </div>
                );
              })}
            </div>
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
