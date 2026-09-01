"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Plus, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_CATEGORIES } from "@/lib/utils";
import { fetchMetadata } from "@/hooks/use-data";
import { SerializedLink } from "@/lib/types";
import { toast } from "@/components/ui/custom-toast";
import { 
  scheduleCapacitorLocalNotification, 
  requestWebNotificationPermission 
} from "@/lib/notification-service";
import { useTags } from "@/hooks/use-data";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTranslation } from "@/components/providers/i18n-provider";

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (savedLink?: SerializedLink) => void;
  editLink?: SerializedLink | null;
}

export function AddLinkDialog({
  open,
  onOpenChange,
  onSuccess,
  editLink,
}: AddLinkDialogProps) {
  const { requireAuth } = useRequireAuth();
  const { t, locale } = useTranslation();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Custom");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [favicon, setFavicon] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [reminderAt, setReminderAt] = useState("");
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Duplicate detection state
  const [duplicateWarning, setDuplicateWarning] = useState<{
    type: "exact" | "similar_url" | "similar_title" | "none";
    message: string | null;
    duplicates: { id: string; title: string; url: string }[];
  } | null>(null);

  const resetForm = useCallback(() => {
    setUrl("");
    setTitle("");
    setDescription("");
    setCategory("Custom");
    setTags([]);
    setTagInput("");
    setNotes("");
    setFavicon("");
    setThumbnail("");
    setIsFavorite(false);
    setReminderAt("");
  }, []);

  useEffect(() => {
    if (editLink) {
      setUrl(editLink.url);
      setTitle(editLink.title);
      setDescription(editLink.description || "");
      setCategory(editLink.category);
      setTags(editLink.tags);
      setNotes(editLink.notes || "");
      setFavicon(editLink.favicon || "");
      setThumbnail(editLink.thumbnail || "");
      setIsFavorite(editLink.isFavorite);
      const toLocalISO = (dateStr: Date | string) => {
        const date = new Date(dateStr);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      };
      setReminderAt(editLink.reminderAt ? toLocalISO(editLink.reminderAt) : "");
    } else if (!open) {
      resetForm();
    }
  }, [editLink, open, resetForm]);

  const handleUrlPaste = async (value: string) => {
    setUrl(value);
    setDuplicateWarning(null);
    if (!editLink && value.startsWith("http")) {
      setFetchingMeta(true);
      try {
        // Run metadata fetch and duplicate check in parallel
        const [meta, dupRes] = await Promise.all([
          fetchMetadata(value),
          fetch("/api/ai/check-duplicate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: value }),
          }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);

        if (meta) {
          if (meta.title) setTitle(meta.title);
          if (meta.description) setDescription(meta.description);
          if (meta.favicon) setFavicon(meta.favicon);
          if (meta.thumbnail) setThumbnail(meta.thumbnail);

          // If we have a title now but no dup from URL, do a title-based check
          if (dupRes?.type === "none" && meta.title) {
            try {
              const titleCheck = await fetch("/api/ai/check-duplicate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: value, title: meta.title }),
              }).then((r) => (r.ok ? r.json() : null));
              if (titleCheck && titleCheck.type !== "none") {
                setDuplicateWarning(titleCheck);
              }
            } catch {}
          }
        }

        if (dupRes && dupRes.type !== "none") {
          setDuplicateWarning(dupRes);
        }
      } finally {
        setFetchingMeta(false);
      }
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.map(t => t.toLowerCase()).includes(tag)) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    } else if (tag) {
      // Clear input even if it's duplicate
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAnalyze = async () => {
    if (!url) return;
    if (requireAuth(
      locale === "en" ? "Automatic AI Analysis" : "Analisis AI Otomatis",
      locale === "en" ? "Sign in or register for free to analyze links automatically using AI." : "Masuk atau daftar gratis untuk menganalisis link secara otomatis menggunakan AI."
    )) {
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.category && DEFAULT_CATEGORIES.includes(data.category)) {
          setCategory(data.category);
        } else if (data.category) {
          setCategory("Custom");
        }
        if (data.tags && Array.isArray(data.tags)) {
          setTags((prev) => {
            const existingLower = prev.map(t => t.toLowerCase());
            const newTags = data.tags.filter((t: string) => !existingLower.includes(t.toLowerCase()));
            return [...prev, ...newTags];
          });
        }
        if (data.notes) setNotes(data.notes);
        if (data.deadline) {
          const date = new Date(data.deadline);
          if (!isNaN(date.getTime())) {
            setReminderAt(date.toISOString().slice(0, 16));
          }
        }
        if (data.priority) {
          setTags((prev) => {
            const priorityTag = `priority:${data.priority.toLowerCase()}`;
            if (prev.map(t => t.toLowerCase()).includes(priorityTag.toLowerCase())) return prev;
            return [...prev, priorityTag];
          });
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        let msg = errorData.error || "Gagal menganalisis link saat ini.";
        try {
          if (typeof msg === "string" && (msg.startsWith("{") || msg.includes("error"))) {
            const parsed = JSON.parse(msg);
            if (parsed?.error?.message) msg = parsed.error.message;
          }
        } catch {}
        
        if (typeof msg === "string" && (msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE") || msg.includes("not found"))) {
          msg = "Server AI sedang sibuk karena antrean tinggi. Silakan coba klik Analisis AI kembali beberapa saat lagi.";
        }
        
        toast.error(msg, "Gagal Analisis AI");
      }
    } catch (error: any) {
      console.error("Failed to analyze URL", error);
      toast.error("Gagal menghubungkan ke server analisis. Pastikan koneksi internet aktif.", "Error Analisis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireAuth(t("links.saveLink"), t("auth.authRequiredDesc"))) {
      return;
    }
    setSaving(true);

    try {
      const payload = {
        url,
        title,
        description: description || undefined,
        category,
        tags,
        notes: notes || undefined,
        favicon: favicon || undefined,
        thumbnail: thumbnail || undefined,
        isFavorite,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
      };

      const endpoint = editLink ? `/api/links/${editLink.id}` : "/api/links";
      const method = editLink ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editLink ? { ...payload, id: editLink.id } : payload),
      });

      if (res.ok) {
        const savedData = await res.json().catch(() => null);
        resetForm();
        onOpenChange(false);
        toast.success(editLink ? "Link berhasil diperbarui!" : "Link baru berhasil ditambahkan!", "Sukses");
        onSuccess();

        // If newly created link (not edit), notify Liko assistant to check if categorization is needed
        if (!editLink && savedData) {
          window.dispatchEvent(new CustomEvent("liko-link-added", { detail: { link: savedData } }));
        }

        // Schedule Mobile & Web notifications if reminder is set in the future
        if (savedData?.reminderAt && new Date(savedData.reminderAt) > new Date()) {
          requestWebNotificationPermission().catch(() => {});
          scheduleCapacitorLocalNotification({
            id: Math.abs(savedData.id.split("").reduce((a: number, b: string) => ((a << 5) - a) + b.charCodeAt(0), 0)),
            title: `⏰ Pengingat: ${savedData.title || "Tautan Linkora"}`,
            body: `Waktunya meninjau tautan: ${savedData.url}`,
            scheduleDate: new Date(savedData.reminderAt),
            url: savedData.url,
            targetId: savedData.id,
          }).catch(() => {});
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Gagal menyimpan link.", "Gagal");
      }
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan saat menyimpan link.", "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editLink ? t("links.modalEditTitle") : t("links.modalAddTitle")}</DialogTitle>
          <DialogDescription>
            {t("links.modalAddDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="url">{t("links.urlLabel")}</Label>
              {url && !isAnalyzing && (
                <span className="text-xs text-primary font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> {t("links.readyToAnalyze")}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="url"
                  type="url"
                  placeholder={t("links.urlPlaceholder")}
                  value={url}
                  onChange={(e) => handleUrlPaste(e.target.value)}
                  required
                />
                {fetchingMeta && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="relative shrink-0">
                <Button
                  type="button"
                  disabled={!url || isAnalyzing || fetchingMeta}
                  onClick={handleAnalyze}
                  className={`relative font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                    url && !isAnalyzing
                      ? "bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow-md active:scale-95"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {isAnalyzing && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span>{t("links.analyzeBtn")}</span>
                </Button>
              </div>
            </div>
            
            {/* Duplicate warning banner */}
            <AnimatePresence>
              {duplicateWarning && duplicateWarning.type !== "none" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 mt-1.5 border ${
                    duplicateWarning.type === "exact"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                      : "bg-orange-500/8 border-orange-500/20 text-orange-700 dark:text-orange-400"
                  }`}>
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">{duplicateWarning.message}</p>
                      {duplicateWarning.duplicates.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {duplicateWarning.duplicates.slice(0, 2).map((dup) => (
                            <p key={dup.id} className="text-[11px] opacity-80 truncate">
                              {dup.title || dup.url}
                            </p>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setDuplicateWarning(null)}
                        className="text-[11px] underline opacity-60 hover:opacity-100 mt-1 cursor-pointer"
                      >
                        Tutup peringatan
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guide hint when URL is pasted */}
            {url && !isAnalyzing && !duplicateWarning && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent border border-primary/20 rounded-xl px-3 py-2 mt-1.5"
              >
                <p className="text-xs text-foreground/90 leading-tight">
                  Tautan siap dianalisis. Fitur <span className="font-bold text-primary">Analisis AI</span> akan mengisi kategori, deskripsi, dan tag secara otomatis.
                </p>
              </motion.div>
            )}

            {(fetchingMeta || isAnalyzing) && (
              <p className="text-xs text-muted-foreground">
                {isAnalyzing ? "Menganalisis link dengan AI..." : "Mengambil favicon, judul, dan preview..."}
              </p>
            )}
          </div>

          {(favicon || thumbnail) && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {favicon && (
                <Image src={favicon} alt="" width={32} height={32} className="rounded" unoptimized />
              )}
              {thumbnail && (
                <Image
                  src={thumbnail}
                  alt="Preview"
                  width={80}
                  height={45}
                  className="rounded object-cover"
                  unoptimized
                />
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">{t("links.titleLabel")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("links.titlePlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("links.descLabel")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("links.descPlaceholder")}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("links.categoryLabel")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder">{t("links.reminderLabel")}</Label>
              <Input
                id="reminder"
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("links.tagsLabel")}</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder={t("links.tagsPlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("links.notesLabel")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("links.notesPlaceholder")}
              rows={8}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="favorite" className="cursor-pointer">{t("links.favoriteLabel")}</Label>
              <p className="text-xs text-muted-foreground">{t("links.favoriteDesc")}</p>
            </div>
            <Switch id="favorite" checked={isFavorite} onCheckedChange={setIsFavorite} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editLink ? t("common.save") : t("links.modalAddTitle")}
            </Button>
          </div>
        </form>

        {/* AI Analyzing Mascot Overlay Popup */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="relative w-full max-w-sm rounded-3xl p-8 bg-card/95 border border-primary/30 shadow-2xl shadow-primary/25 flex flex-col items-center text-center overflow-hidden"
              >
                {/* Background ambient glow */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/25 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/25 blur-3xl rounded-full pointer-events-none" />

                {/* Mascot Avatar with Silky-Smooth AI Glow */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-6">
                  {/* Smooth Ambient Glow Halo */}
                  <motion.div
                    className="absolute -inset-2 rounded-full bg-gradient-to-tr from-cyan-500/30 via-primary/30 to-purple-500/30 blur-lg pointer-events-none transform-gpu"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.85, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Smooth Outer Subtle Dashed Ring */}
                  <motion.div
                    className="absolute -inset-1 rounded-full border border-dashed border-primary/30 pointer-events-none transform-gpu"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Silky-Smooth Spinning Conic Laser Ring with Orbiting Orb */}
                  <motion.div
                    className="absolute inset-0 rounded-full transform-gpu"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="relative w-full h-full rounded-full p-[3px] bg-[conic-gradient(from_0deg,transparent_0_140deg,#06b6d4_240deg,#8b5cf6_300deg,#3b82f6_360deg)] shadow-[0_0_24px_rgba(59,130,246,0.6)]">
                      <div className="w-full h-full rounded-full bg-background" />
                      {/* Orbiting Glowing Laser Orb */}
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#38bdf8,0_0_18px_#818cf8]" />
                    </div>
                  </motion.div>

                  {/* Stable Sharp Mascot Image Container with Gentle Floating */}
                  <motion.div
                    className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-background shadow-xl bg-background z-10 transform-gpu"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img
                      src="/maskot.jpeg"
                      alt="Liko Asisten AI"
                      className="w-full h-full object-cover object-top"
                    />
                  </motion.div>
                </div>

                {/* Status and Text */}
                <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    AI Insight Engine
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-heading">
                    Liko Sedang Menganalisis...
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px]">
                    Membaca konten link, mengekstrak judul, deskripsi, kategori cerdas, dan tag relevan untukmu.
                  </p>
                </div>

                {/* Silky-Smooth Indeterminate Progress Line */}
                <div className="w-full bg-muted/60 rounded-full h-1.5 mt-6 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full transform-gpu"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: "50%" }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
