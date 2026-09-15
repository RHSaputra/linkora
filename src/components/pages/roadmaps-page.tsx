"use client";

import { useState } from "react";
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
import { useRoadmaps, deleteRoadmap } from "@/hooks/use-data";
import { useTranslation } from "@/components/providers/i18n-provider";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { toast } from "@/components/ui/custom-toast";
import { SerializedRoadmap } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { id as localeId, enUS } from "date-fns/locale";

export function RoadmapsPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { requireAuth } = useRequireAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { roadmaps, loading, refresh, setRoadmaps } = useRoadmaps(searchQuery);

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
    if (requireAuth("Buat Roadmap Baru", "Masuk atau daftar akun untuk membuat alur kerja roadmap Anda sendiri.")) return;
    setTitle("");
    setDescription("");
    setCreateDialogOpen(true);
  };

  const handleOpenAiDialog = () => {
    if (requireAuth("Rancang dengan Liko AI", "Masuk atau daftar gratis untuk menggunakan asisten Liko AI dalam merancang alur kerja visual terstruktur.")) return;
    setAiDialogOpen(true);
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
    const targetId = selectedRoadmap.id;

    // Immediately close modal, optimistically remove card, and show toast
    setDeleteDialogOpen(false);
    setRoadmaps((prev) => prev.filter((item) => item.id !== targetId));
    toast.success("Roadmap berhasil dihapus", "Dihapus");

    try {
      setIsSubmitting(true);
      const res = await deleteRoadmap(targetId);
      if (!res.ok) {
        toast.error("Gagal menghapus roadmap", "Error");
        refresh(true);
      }
    } catch (_err) {
      toast.error("Terjadi kesalahan jaringan", "Error");
      refresh(true);
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
          <div className="relative inline-flex items-center justify-center p-[2px] rounded-full overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:shadow-primary/25 active:scale-95 shrink-0">
            <div className="absolute inset-[-300%] aspect-square m-auto bg-[conic-gradient(from_0deg_at_50%_50%,#2563eb_0%,#38bdf8_25%,#a855f7_50%,#ec4899_75%,#2563eb_100%)] animate-[spin_3s_linear_infinite]" />
            <Button
              onClick={handleOpenAiDialog}
              className="relative z-10 bg-card hover:bg-card/90 active:bg-card text-foreground font-semibold h-10 px-5 rounded-full shadow-xs text-xs sm:text-sm border-0 transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none select-none"
            >
              <span>Rancang dengan Liko AI</span>
            </Button>
          </div>

          <Button
            onClick={handleOpenCreate}
            variant="outline"
            className="font-semibold gap-2 cursor-pointer h-10 px-4"
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
            <div className="relative inline-flex items-center justify-center p-[2px] rounded-full overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:shadow-primary/25 active:scale-95 shrink-0">
              <div className="absolute inset-[-300%] aspect-square m-auto bg-[conic-gradient(from_0deg_at_50%_50%,#2563eb_0%,#38bdf8_25%,#a855f7_50%,#ec4899_75%,#2563eb_100%)] animate-[spin_3s_linear_infinite]" />
              <Button
                onClick={handleOpenAiDialog}
                className="relative z-10 bg-card hover:bg-card/90 active:bg-card text-foreground font-semibold h-10 px-5 rounded-full shadow-xs text-xs sm:text-sm border-0 transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none select-none"
              >
                <span>Rancang dengan Liko AI</span>
              </Button>
            </div>
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
        <DialogContent className="border-primary/25 sm:max-w-md bg-slate-50/98 dark:bg-slate-900/98 sm:bg-white sm:dark:bg-slate-900/98 p-6 shadow-2xl backdrop-blur-2xl rounded-3xl">
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
        <DialogContent className="border-primary/25 sm:max-w-md bg-slate-50/98 dark:bg-slate-900/98 sm:bg-white sm:dark:bg-slate-900/98 p-6 shadow-2xl backdrop-blur-2xl rounded-3xl">
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
