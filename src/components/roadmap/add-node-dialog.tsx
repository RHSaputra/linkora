"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link2, CheckSquare, StickyNote, Search, Globe } from "lucide-react";
import { useTranslation } from "@/components/providers/i18n-provider";
import { SerializedLink } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (nodeData: {
    type: "LINK" | "TASK" | "NOTE";
    title: string;
    description?: string;
    linkId?: string;
  }) => Promise<void>;
}

export function AddNodeDialog({ open, onOpenChange, onSubmit }: AddNodeDialogProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<"LINK" | "TASK" | "NOTE">("TASK");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLink, setSelectedLink] = useState<SerializedLink | null>(null);
  
  // Link selector state
  const [links, setLinks] = useState<SerializedLink[]>([]);
  const [searchLinkQuery, setSearchLinkQuery] = useState("");
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && type === "LINK") {
      fetchUserLinks();
    }
  }, [open, type]);

  const fetchUserLinks = async (q = "") => {
    try {
      setLoadingLinks(true);
      const url = q ? `/api/links?q=${encodeURIComponent(q)}` : "/api/links";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLinks(data.items || []);
      }
    } catch (_err) {
      console.error("Gagal mengambil tautan:", _err);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleSearchLinks = (val: string) => {
    setSearchLinkQuery(val);
    fetchUserLinks(val);
  };

  const handleSelectLink = (link: SerializedLink) => {
    setSelectedLink(link);
    if (!title.trim()) {
      setTitle(link.title);
    }
    if (!description.trim() && link.description) {
      setDescription(link.description);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        linkId: type === "LINK" ? selectedLink?.id : undefined,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedLink(null);
      setType("TASK");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-primary/25 sm:max-w-lg bg-slate-50/98 dark:bg-slate-900/98 sm:bg-white sm:dark:bg-slate-900/98 p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold text-foreground">
            {t("roadmaps.addNode")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Pilih jenis langkah dan lengkapi rinciannya.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Node Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("roadmaps.nodeType")}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("LINK")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium gap-1.5 cursor-pointer",
                  type === "LINK"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <Link2 className="w-5 h-5" />
                <span>{t("roadmaps.typeLink")}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("TASK")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium gap-1.5 cursor-pointer",
                  type === "TASK"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <CheckSquare className="w-5 h-5" />
                <span>{t("roadmaps.typeTask")}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("NOTE")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium gap-1.5 cursor-pointer",
                  type === "NOTE"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <StickyNote className="w-5 h-5" />
                <span>{t("roadmaps.typeNote")}</span>
              </button>
            </div>
          </div>

          {/* Link Picker if type LINK */}
          {type === "LINK" && (
            <div className="space-y-2 p-3 rounded-xl border border-primary/20 bg-primary/5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{t("roadmaps.selectLink")}</span>
                {selectedLink && (
                  <span className="text-[10px] text-primary font-normal">Tautan Terpilih</span>
                )}
              </Label>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  value={searchLinkQuery}
                  onChange={(e) => handleSearchLinks(e.target.value)}
                  placeholder={t("roadmaps.searchLinkPlaceholder")}
                  className="pl-9 h-9 text-xs bg-background/80"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1">
                {loadingLinks ? (
                  <p className="text-xs text-center py-4 text-muted-foreground">Memuat tautan Anda...</p>
                ) : links.length === 0 ? (
                  <p className="text-xs text-center py-4 text-muted-foreground">Tidak ada tautan ditemukan.</p>
                ) : (
                  links.map((link) => {
                    const isSelected = selectedLink?.id === link.id;
                    return (
                      <div
                        key={link.id}
                        onClick={() => handleSelectLink(link)}
                        className={cn(
                          "p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-2",
                          isSelected
                            ? "border-primary bg-primary/15 font-semibold text-primary"
                            : "border-border/50 hover:bg-muted/60 text-foreground"
                        )}
                      >
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="font-medium text-xs leading-snug break-words">{link.title}</p>
                          <p className="text-[11px] text-muted-foreground break-all leading-normal">{link.url}</p>
                        </div>
                        {link.favicon ? (
                          <img src={link.favicon} alt="" className="w-4 h-4 rounded shrink-0 object-contain mt-0.5" />
                        ) : (
                          <Globe className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {t("roadmaps.nodeTitle")} <span className="text-destructive">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: GitHub Repository, Deploy Supabase, dsb."
              required
              className="bg-background/80"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {t("roadmaps.nodeContent")}
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan penjelasan, instruksi, atau petunjuk tambahan..."
              rows={3}
              className="bg-background/80 text-xs"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold"
            >
              {isSubmitting ? t("common.saving") : t("common.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
