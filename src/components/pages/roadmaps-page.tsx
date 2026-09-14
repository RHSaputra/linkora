"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GitFork,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AIRoadmapGeneratorDialog } from "@/components/roadmap/ai-roadmap-generator-dialog";
import { Bot } from "lucide-react";
import { useRoadmaps, deleteRoadmap } from "@/hooks/use-data";
import { useTranslation } from "@/components/providers/i18n-provider";
import { toast } from "@/components/ui/custom-toast";
import { SerializedRoadmap } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { id as localeId, enUS } from "date-fns/locale";

export function RoadmapsPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { roadmaps, loading, refresh } = useRoadmaps(searchQuery);

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const [selectedRoadmap, setSelectedRoadmap] = useState<SerializedRoadmap | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setTitle("");
    setDescription("");
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (res.ok) {
        const newRoadmap = await res.json();
        toast.success("Roadmap berhasil dibuat!", "Roadmap");
        setCreateDialogOpen(false);
        refresh(true);
        router.push(`/roadmaps/${newRoadmap.id}`);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Gagal membuat roadmap", "Error");
      }
    } catch (_err) {
      toast.error("Terjadi kesalahan jaringan", "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (roadmap: SerializedRoadmap) => {
    setSelectedRoadmap(roadmap);
    setTitle(roadmap.title);
    setDescription(roadmap.description || "");
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoadmap || !title.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/roadmaps/${selectedRoadmap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Roadmap berhasil diperbarui", "Sukses");
        setEditDialogOpen(false);
        refresh(true);
      } else {
        toast.error("Gagal memperbarui roadmap", "Error");
      }
    } catch (_err) {
      toast.error("Terjadi kesalahan jaringan", "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (roadmap: SerializedRoadmap) => {
    setSelectedRoadmap(roadmap);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRoadmap) return;
    try {
      setIsSubmitting(true);
      const res = await deleteRoadmap(selectedRoadmap.id);
      if (res.ok) {
        toast.success("Roadmap berhasil dihapus", "Dihapus");
        setDeleteDialogOpen(false);
        refresh(true);
      } else {
        toast.error("Gagal menghapus roadmap", "Error");
      }
    } catch (_err) {
      toast.error("Terjadi kesalahan jaringan", "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateLocale = locale === "id" ? localeId : enUS;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Search Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <GitFork className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {t("roadmaps.title")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("roadmaps.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            onClick={() => setAiDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold gap-2 shadow-sm cursor-pointer text-xs sm:text-sm"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/40 shrink-0">
              <img src="/maskot.jpeg" alt="Liko AI" className="w-full h-full object-cover object-top" />
            </div>
            <span>Rancang dengan Liko AI</span>
          </Button>

          <Button
            onClick={handleOpenCreate}
            variant="outline"
            className="font-semibold gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("roadmaps.createButton")}</span>
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("roadmaps.searchPlaceholder")}
          className="pl-9 bg-card/80 border-border/80 text-sm"
        />
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl border border-border/40 bg-card/40 animate-pulse"
            />
          ))}
        </div>
      ) : roadmaps.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/60 rounded-2xl glass-panel bg-card/40 my-8 space-y-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <GitFork className="w-10 h-10" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-heading font-bold text-foreground">
              {t("roadmaps.emptyTitle")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("roadmaps.emptyDesc")}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={() => setAiDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold gap-2 cursor-pointer shadow-md text-xs sm:text-sm"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/40 shrink-0">
                <img src="/maskot.jpeg" alt="Liko AI" className="w-full h-full object-cover object-top" />
              </div>
              <span>Rancang dengan Liko AI</span>
            </Button>
            <Button
              onClick={handleOpenCreate}
              variant="outline"
              className="font-semibold gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t("roadmaps.createButton")}</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Roadmaps Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((roadmap) => {
            const isFinished = roadmap.totalNodes > 0 && roadmap.progressPercent === 100;
            const updatedDateStr = roadmap.updatedAt
              ? formatDistanceToNow(new Date(roadmap.updatedAt), {
                  addSuffix: true,
                  locale: dateLocale,
                })
              : "";

            return (
              <div
                key={roadmap.id}
                onClick={() => router.push(`/roadmaps/${roadmap.id}`)}
                className="group relative p-6 rounded-2xl border border-border/60 hover:border-primary/50 transition-all duration-200 glass-panel bg-card/95 hover:shadow-md flex flex-col justify-between gap-4 cursor-pointer"
              >
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-base font-heading font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {roadmap.title}
                    </h3>
                    {roadmap.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {roadmap.description}
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(roadmap);
                        }}
                        className="gap-2 text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Roadmap</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDelete(roadmap);
                        }}
                        className="gap-2 text-xs text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Roadmap</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Steps summary & Progress bar */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      {roadmap.totalNodes} langkah • {roadmap.completedNodes} selesai
                    </span>
                    <span
                      className={`font-bold ${
                        isFinished ? "text-emerald-500" : "text-primary"
                      }`}
                    >
                      {roadmap.progressPercent}%
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFinished
                          ? "bg-emerald-500"
                          : "bg-gradient-to-r from-primary to-accent"
                      }`}
                      style={{ width: `${roadmap.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer: Updated time & Open link indicator */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {updatedDateStr}
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    Buka <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Roadmap Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-md bg-card/95 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-heading font-bold text-foreground">
              {t("roadmaps.createTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("roadmaps.createDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Judul Roadmap <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Deploy Website ke Production, Belajar Next.js"
                required
                className="bg-background/80 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Deskripsi (Opsional)
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan tujuan atau gambaran singkat dari alur kerja ini..."
                rows={3}
                className="bg-background/80 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold"
              >
                {isSubmitting ? t("common.saving") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Roadmap Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass-panel border-primary/20 sm:max-w-md bg-card/95 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-heading font-bold text-foreground">
              Edit Roadmap
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Judul Roadmap <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-background/80 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Deskripsi
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-background/80 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold"
              >
                {isSubmitting ? t("common.saving") : t("common.saveChanges")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Roadmap Generator Dialog */}
      <AIRoadmapGeneratorDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onGenerated={() => refresh(true)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("roadmaps.deleteTitle")}
        description={t("roadmaps.deleteConfirm")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        destructive={true}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
