"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Plus, AlertTriangle, ExternalLink, Sparkles } from "lucide-react";
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
import { DEFAULT_CATEGORIES, getFaviconUrl } from "@/lib/utils";
import { fetchMetadata, updateGlobalCacheLinks, updateGlobalCacheDashboard, dispatchRefresh } from "@/hooks/use-data";
import { SerializedLink } from "@/lib/types";
import { toast } from "@/components/ui/custom-toast";
import { 
  scheduleCapacitorLocalNotification, 
  requestWebNotificationPermission 
} from "@/lib/notification-service";
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  // Duplicate detection state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateData, setDuplicateData] = useState<{
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
    setDuplicateData(null);
    setShowDuplicateModal(false);
    setShowExitConfirm(false);
  }, []);

  // Auto-expand notes textarea height according to text content
  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = "auto";
      const newHeight = Math.max(160, notesRef.current.scrollHeight);
      notesRef.current.style.height = `${newHeight}px`;
    }
  }, [notes]);

  useEffect(() => {
    if (editLink) {
      setUrl(editLink.url || "");
      setTitle(editLink.title || "");
      setDescription(editLink.description || "");
      setCategory(editLink.category || "Custom");
      if (Array.isArray(editLink.tags)) {
        setTags(editLink.tags);
      } else if (typeof editLink.tags === "string") {
        try {
          const parsed = JSON.parse(editLink.tags);
          setTags(Array.isArray(parsed) ? parsed : []);
        } catch {
          setTags([]);
        }
      } else {
        setTags([]);
      }
      setNotes(editLink.notes || "");
      setFavicon(editLink.favicon || "");
      setThumbnail(editLink.thumbnail || "");
      setIsFavorite(Boolean(editLink.isFavorite));
      const toLocalISO = (dateStr: Date | string) => {
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return "";
          return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        } catch {
          return "";
        }
      };
      setReminderAt(editLink.reminderAt ? toLocalISO(editLink.reminderAt) : "");
    } else if (!open) {
      resetForm();
    }
  }, [editLink, open, resetForm]);

  const checkHasUnsavedChanges = useCallback(() => {
    if (saving) return false;
    if (editLink) {
      return (
        url !== (editLink.url || "") ||
        title !== (editLink.title || "") ||
        description !== (editLink.description || "") ||
        notes !== (editLink.notes || "")
      );
    }
    return Boolean(url.trim() || title.trim() || notes.trim() || description.trim());
  }, [editLink, saving, url, title, description, notes]);

  const handleAttemptClose = useCallback(() => {
    if (checkHasUnsavedChanges()) {
      setShowExitConfirm(true);
    } else {
      resetForm();
      onOpenChange(false);
    }
  }, [checkHasUnsavedChanges, onOpenChange, resetForm]);

  const handleOpenChangeRequest = (newOpen: boolean) => {
    if (!newOpen) {
      handleAttemptClose();
    } else {
      onOpenChange(true);
    }
  };

  const handleUrlPaste = async (value: string) => {
    setUrl(value);
    setDuplicateData(null);
    setShowDuplicateModal(false);
    if (!editLink && value.startsWith("http")) {
      setFetchingMeta(true);
      try {
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

          if (dupRes?.type === "none" && meta.title) {
            try {
              const titleCheck = await fetch("/api/ai/check-duplicate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: value, title: meta.title }),
              }).then((r) => (r.ok ? r.json() : null));
              if (titleCheck && titleCheck.type !== "none") {
                setDuplicateData(titleCheck);
                setShowDuplicateModal(true);
              }
            } catch {}
          }
        }

        if (dupRes && dupRes.type !== "none") {
          setDuplicateData(dupRes);
          setShowDuplicateModal(true);
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
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAnalyze = async () => {
    if (!url) return;
    if (duplicateData && duplicateData.type !== "none") {
      setShowDuplicateModal(true);
      return;
    }
    if (requireAuth(
      locale === "en" ? "Automatic AI Analysis" : "Analisis AI Otomatis",
      locale === "en" ? "Sign in or register for free to analyze links automatically using AI." : "Masuk atau daftar gratis untuk menganalisis link secara otomatis menggunakan AI."
    )) {
      return;
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
      setUrl(targetUrl);
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
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
        if (data.previewImage?.url || data.thumbnail) {
          setThumbnail(data.previewImage?.url || data.thumbnail);
        }
        if (data.favicon) {
          setFavicon(data.favicon);
        }
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
        toast.success(
          locale === "en" ? "AI successfully analyzed the link!" : "AI berhasil menganalisis link!",
          locale === "en" ? "Analysis Complete" : "Analisis Selesai"
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        let msg = locale === "en" ? "Failed to analyze link automatically." : "Gagal menganalisis link secara otomatis.";
        if (errorData?.error) {
          msg = errorData.error;
        }
        
        toast.error(msg, locale === "en" ? "AI Analysis Failed" : "Gagal Analisis AI");
      }
    } catch (error: any) {
      console.error("Failed to analyze URL", error);
      toast.error(
        locale === "en" ? "Could not connect to analysis server. Please check internet connection." : "Gagal menghubungkan ke server analisis. Pastikan koneksi internet aktif.",
        locale === "en" ? "Analysis Error" : "Error Analisis"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireAuth(t("links.saveLink"), t("auth.authRequiredDesc"))) {
      return;
    }

    // Block duplicate URL creation if duplicate is already confirmed
    if (!editLink && url) {
      if (duplicateData && duplicateData.type !== "none") {
        setShowDuplicateModal(true);
        return; // Prevent saving duplicate link
      }
    }

    let targetUrl = url.trim();
    if (targetUrl && !targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
      setUrl(targetUrl);
    }

    const payload = {
      url: targetUrl,
      title: title || targetUrl,
      description: description || undefined,
      category: category || "Custom",
      tags: Array.isArray(tags) ? tags : [],
      notes: notes || undefined,
      favicon: favicon || getFaviconUrl(targetUrl),
      thumbnail: thumbnail || undefined,
      isFavorite,
      reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
    };

    const endpoint = editLink ? `/api/links/${editLink.id}` : "/api/links";

    if (!editLink) {
      const tempId = "temp-" + Date.now();
      const tempLink: SerializedLink = {
        id: tempId,
        userId: "user-temp",
        url: targetUrl,
        title: payload.title,
        description: payload.description || null,
        category: payload.category,
        tags: payload.tags,
        notes: payload.notes || null,
        favicon: payload.favicon || null,
        thumbnail: payload.thumbnail || null,
        isFavorite: payload.isFavorite,
        reminderAt: payload.reminderAt,
        openCount: 0,
        lastOpenedAt: null,
        aiSummary: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Instantly update Global Cache Links (prepending to all /api/links queries)
      updateGlobalCacheLinks((items) => [tempLink, ...(items || [])]);

      // 2. Instantly update Dashboard Cache
      updateGlobalCacheDashboard((stats) => {
        if (!stats) return stats;
        const newCatStats = [...(stats.categoryStats || [])];
        const existingCat = newCatStats.find((c) => c.category === tempLink.category);
        if (existingCat) {
          existingCat.count += 1;
        } else {
          newCatStats.push({ category: tempLink.category, count: 1 });
        }
        return {
          ...stats,
          totalLinks: (stats.totalLinks || 0) + 1,
          favoriteCount: tempLink.isFavorite ? (stats.favoriteCount || 0) + 1 : (stats.favoriteCount || 0),
          recentLinks: [tempLink, ...(stats.recentLinks || [])],
          favoriteLinks: tempLink.isFavorite ? [tempLink, ...(stats.favoriteLinks || [])] : (stats.favoriteLinks || []),
          upcomingReminders: tempLink.reminderAt ? [tempLink, ...(stats.upcomingReminders || [])] : (stats.upcomingReminders || []),
          categoryStats: newCatStats,
        };
      });

      // 3. Dispatch refresh event so any active page components re-render immediately (0ms delay)
      dispatchRefresh(["links", "dashboard", "tags"], false);

      // 4. Instantly close modal and reset form!
      resetForm();
      onOpenChange(false);
      onSuccess(tempLink);
      toast.success("Link baru berhasil ditambahkan!", "Sukses");

      // 5. Perform server fetch in background
      (async () => {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const savedData: SerializedLink = await res.json().catch(() => null);
            if (savedData) {
              // Replace tempLink with savedData in cache
              updateGlobalCacheLinks((items) =>
                (items || []).map((item) => (item.id === tempId ? savedData : item))
              );
              updateGlobalCacheDashboard((stats) => {
                if (!stats) return stats;
                return {
                  ...stats,
                  recentLinks: (stats.recentLinks || []).map((l) => (l.id === tempId ? savedData : l)),
                  favoriteLinks: (stats.favoriteLinks || []).map((l) => (l.id === tempId ? savedData : l)),
                  upcomingReminders: (stats.upcomingReminders || []).map((l) => (l.id === tempId ? savedData : l)),
                };
              });
              dispatchRefresh(["links", "dashboard", "tags"], false);
              window.dispatchEvent(new CustomEvent("liko-link-added", { detail: { link: savedData } }));

              if (savedData.reminderAt && new Date(savedData.reminderAt) > new Date()) {
                requestWebNotificationPermission().catch(() => {});
                scheduleCapacitorLocalNotification({
                  id: Math.abs(savedData.id.split("").reduce((a: number, b: string) => ((a << 5) - a) + b.charCodeAt(0), 0)),
                  title: `⏰ Pengingat: ${savedData.title || "Tautan Linkorian"}`,
                  body: `Waktunya meninjau tautan: ${savedData.url}`,
                  scheduleDate: new Date(savedData.reminderAt),
                  url: savedData.url,
                  targetId: savedData.id,
                }).catch(() => {});
              }
            }
          } else {
            // Server error: revert optimistic item
            const errorData = await res.json().catch(() => ({}));
            updateGlobalCacheLinks((items) => (items || []).filter((item) => item.id !== tempId));
            updateGlobalCacheDashboard((stats) => {
              if (!stats) return stats;
              return {
                ...stats,
                totalLinks: Math.max(0, (stats.totalLinks || 0) - 1),
                favoriteCount: tempLink.isFavorite ? Math.max(0, (stats.favoriteCount || 0) - 1) : (stats.favoriteCount || 0),
                recentLinks: (stats.recentLinks || []).filter((l) => l.id !== tempId),
                favoriteLinks: (stats.favoriteLinks || []).filter((l) => l.id !== tempId),
                upcomingReminders: (stats.upcomingReminders || []).filter((l) => l.id !== tempId),
              };
            });
            dispatchRefresh(["links", "dashboard", "tags"], false);
            toast.error(errorData.error || "Gagal menyimpan link ke server.", "Gagal");
          }
        } catch (err: any) {
          // Network error: revert optimistic item
          updateGlobalCacheLinks((items) => (items || []).filter((item) => item.id !== tempId));
          updateGlobalCacheDashboard((stats) => {
            if (!stats) return stats;
            return {
              ...stats,
              totalLinks: Math.max(0, (stats.totalLinks || 0) - 1),
              favoriteCount: tempLink.isFavorite ? Math.max(0, (stats.favoriteCount || 0) - 1) : (stats.favoriteCount || 0),
              recentLinks: (stats.recentLinks || []).filter((l) => l.id !== tempId),
              favoriteLinks: (stats.favoriteLinks || []).filter((l) => l.id !== tempId),
              upcomingReminders: (stats.upcomingReminders || []).filter((l) => l.id !== tempId),
            };
          });
          dispatchRefresh(["links", "dashboard", "tags"], false);
          toast.error(err?.message || "Terjadi kesalahan saat menyimpan link.", "Error");
        }
      })();
    } else {
      // EDIT MODE
      setSaving(true);
      try {
        const res = await fetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editLink.id }),
        });
        if (res.ok) {
          const savedData = await res.json().catch(() => null);
          if (savedData) {
            updateGlobalCacheLinks((items) =>
              (items || []).map((item) => (item.id === editLink.id ? savedData : item))
            );
            updateGlobalCacheDashboard((stats) => {
              if (!stats) return stats;
              return {
                ...stats,
                recentLinks: (stats.recentLinks || []).map((l) => (l.id === editLink.id ? savedData : l)),
                favoriteLinks: (stats.favoriteLinks || []).map((l) => (l.id === editLink.id ? savedData : l)),
                upcomingReminders: (stats.upcomingReminders || []).map((l) => (l.id === editLink.id ? savedData : l)),
              };
            });
            dispatchRefresh(["links", "dashboard", "tags"], false);
          }
          resetForm();
          onOpenChange(false);
          toast.success("Link berhasil diperbarui!", "Sukses");
          onSuccess(savedData);
        } else {
          const errorData = await res.json().catch(() => ({}));
          toast.error(errorData.error || "Gagal memperbarui link.", "Gagal");
        }
      } catch (err: any) {
        toast.error(err?.message || "Terjadi kesalahan saat memperbarui link.", "Error");
      } finally {
        setSaving(false);
      }
    }
  };

  const isDuplicate = Boolean(duplicateData && duplicateData.type !== "none");

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeRequest}>
      <DialogContent className="sm:max-w-[760px] bg-white dark:bg-slate-900 border border-primary/20 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl rounded-3xl space-y-5">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground">{editLink ? t("links.modalEditTitle") : t("links.modalAddTitle")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("links.modalAddDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 flex-1 overflow-y-auto px-1.5 pt-1.5 pb-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="url">{t("links.urlLabel")}</Label>
                {url && (
                  <AnimatePresence mode="wait">
                    {isDuplicate ? (
                      <motion.span
                        key="duplicate-status"
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                        {locale === "en" ? "Duplicate Link (Cannot Be Analyzed)" : "Tautan Duplikat (Tidak Bisa Dianalisis)"}
                      </motion.span>
                    ) : fetchingMeta ? (
                      <motion.span
                        key="fetching-status"
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                        {locale === "en" ? "Fetching Preview & Info..." : "Mengambil Preview & Informasi..."}
                      </motion.span>
                    ) : isAnalyzing ? (
                      <motion.span
                        key="analyzing-status"
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                        </span>
                        {locale === "en" ? "Liko AI Is Analyzing..." : "Liko AI Sedang Menganalisis..."}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="ready-status"
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        {locale === "en" ? "Ready for AI Analysis" : "Siap Dianalisis AI"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Input
                    id="url"
                    type="url"
                    placeholder={t("links.urlPlaceholder")}
                    value={url}
                    onChange={(e) => handleUrlPaste(e.target.value)}
                    required
                    className="h-10 sm:h-9 text-base sm:text-sm font-mono"
                  />
                  {fetchingMeta && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    </div>
                  )}
                </div>
                <div className="relative shrink-0">
                  <Button
                    type="button"
                    disabled={!url || isAnalyzing || fetchingMeta || isDuplicate}
                    onClick={handleAnalyze}
                    className={`w-full sm:w-auto h-10 sm:h-9 relative font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                      url && !isAnalyzing && !fetchingMeta && !isDuplicate
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:scale-95"
                        : "bg-secondary text-secondary-foreground opacity-60"
                    }`}
                  >
                    {isAnalyzing && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <span>{t("links.analyzeBtn")}</span>
                  </Button>
                </div>
              </div>

              {/* Dynamic Guide Hint Box */}
              {url && (
                <AnimatePresence mode="wait">
                  {isDuplicate ? (
                    <motion.div
                      key="hint-duplicate"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2 mt-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <p className="text-xs text-red-600 dark:text-red-400 leading-tight font-medium">
                        Tautan ini sudah tersimpan di koleksimu. Analisis AI dan penambahan link diblokir.
                      </p>
                    </motion.div>
                  ) : fetchingMeta ? (
                    <motion.div
                      key="hint-fetching"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2 mt-1.5"
                    >
                      <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-400 leading-tight font-medium">
                        Sedang mengambil favicon, judul, dan preview gambar dari situs web...
                      </p>
                    </motion.div>
                  ) : !isAnalyzing && (
                    <motion.div
                      key="hint-ready"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 rounded-xl px-3 py-2 mt-1.5"
                    >
                      <p className="text-xs text-foreground/90 leading-tight">
                        Tautan siap dianalisis. Klik tombol <span className="font-bold text-blue-600 dark:text-blue-400">Analisis AI</span> untuk mengisi kategori, deskripsi, dan tag secara otomatis.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {(favicon || thumbnail) && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {favicon && (
                  <Image src={favicon} alt="" width={32} height={32} className="rounded shrink-0" unoptimized />
                )}
                {thumbnail && (
                  <Image
                    src={thumbnail}
                    alt="Preview"
                    width={80}
                    height={45}
                    className="rounded object-cover shrink-0"
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
                className="text-base sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("links.descLabel")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("links.descPlaceholder")}
                rows={3}
                className="text-base sm:text-sm leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>{t("links.categoryLabel")}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
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
                  className="w-full text-base sm:text-sm"
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
                  className="text-base sm:text-sm"
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
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1 break-words">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes" className="font-medium">{t("links.notesLabel")}</Label>
                {notes && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {notes.length} {locale === "en" ? "characters" : "karakter"}
                  </span>
                )}
              </div>
              <Textarea
                ref={notesRef}
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("links.notesPlaceholder")}
                rows={6}
                className="text-base sm:text-sm leading-relaxed p-3.5 bg-muted/20 hover:bg-muted/30 focus:bg-background transition-colors min-h-[160px] sm:min-h-[180px]"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="favorite" className="cursor-pointer">{t("links.favoriteLabel")}</Label>
                <p className="text-xs text-muted-foreground">{t("links.favoriteDesc")}</p>
              </div>
              <Switch id="favorite" checked={isFavorite} onCheckedChange={setIsFavorite} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60 shrink-0">
            <Button type="button" variant="outline" onClick={handleAttemptClose} className="rounded-xl text-xs cursor-pointer">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={saving} className="rounded-xl text-xs font-bold bg-primary text-primary-foreground cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
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

                  <motion.div
                    className="absolute -inset-1 rounded-full border border-dashed border-primary/30 pointer-events-none transform-gpu"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  />

                  <motion.div
                    className="absolute inset-0 rounded-full transform-gpu"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="relative w-full h-full rounded-full p-[3px] bg-[conic-gradient(from_0deg,transparent_0_140deg,#06b6d4_240deg,#8b5cf6_300deg,#3b82f6_360deg)] shadow-[0_0_24px_rgba(59,130,246,0.6)]">
                      <div className="w-full h-full rounded-full bg-background" />
                    </div>
                  </motion.div>

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
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold select-none">
                    {locale === "en" ? "Liko AI Assistant" : "Asisten AI Liko"}
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-heading">
                    {locale === "en" ? "Liko AI Is Analyzing..." : "Liko Sedang Menganalisis..."}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px]">
                    {locale === "en"
                      ? "Reading link content, extracting title, summary, smart category, and relevant tags for you."
                      : "Membaca konten link, mengekstrak judul, deskripsi, kategori cerdas, dan tag relevan untukmu."}
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

        {/* Duplicate Link Detected Dialog Overlay */}
        <AnimatePresence>
          {showDuplicateModal && duplicateData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 16 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 bg-card border border-amber-500/30 shadow-2xl shadow-amber-500/10 flex flex-col gap-5 overflow-hidden text-left"
              >
                {/* Ambient Glows */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

                {/* Header Icon + Text */}
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                      {locale === "en" ? "Duplicate URL Detected" : "Tautan Sudah Ada"}
                    </div>
                    <h3 className="text-lg font-bold text-foreground font-heading leading-tight">
                      {locale === "en" ? "Cannot Add Duplicate Link" : "Tautan Tidak Dapat Ditambahkan"}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {duplicateData.message || (locale === "en" 
                        ? "This link is already in your collection. Duplicate links cannot be added."
                        : "Tautan ini sudah tersimpan dalam koleksimu dan tidak dapat ditambahkan lagi.")}
                    </p>
                  </div>
                </div>

                {/* Existing Link Details */}
                {duplicateData.duplicates && duplicateData.duplicates.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/80 space-y-1.5 relative z-10">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {locale === "en" ? "Existing Link in Collection" : "Tautan yang Sudah Tersimpan"}
                    </p>
                    {duplicateData.duplicates.slice(0, 1).map((dup) => (
                      <div key={dup.id} className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {dup.title || dup.url}
                        </p>
                        <p className="text-xs text-primary font-mono truncate">
                          {dup.url}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t border-border/50 relative z-10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDuplicateModal(false)}
                    className="w-full sm:w-auto rounded-xl text-xs font-medium cursor-pointer"
                  >
                    {locale === "en" ? "Close" : "Tutup"}
                  </Button>
                  {duplicateData.duplicates && duplicateData.duplicates.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => {
                        const targetUrl = duplicateData.duplicates[0]?.url || url;
                        if (targetUrl) {
                          window.open(targetUrl, "_blank", "noopener,noreferrer");
                        }
                        setShowDuplicateModal(false);
                        resetForm();
                        onOpenChange(false);
                      }}
                      className="w-full sm:w-auto rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{locale === "en" ? "Go to Existing Link" : "Buka Tautan Yang Sudah Ada"}</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exit Confirmation Dialog Overlay */}
        <AnimatePresence>
          {showExitConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 12 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="w-full max-w-md rounded-2xl sm:rounded-3xl p-6 bg-card border border-amber-500/30 shadow-2xl flex flex-col gap-4 text-left"
              >
                <div className="flex items-start gap-3.5 text-amber-600 dark:text-amber-400">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shrink-0 mt-0.5">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      {locale === "en" ? "Exit without saving?" : "Yakin ingin keluar?"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {locale === "en"
                        ? "The link details you entered haven't been saved yet."
                        : "Tautan yang sudah kamu masukkan belum disimpan ke daftar."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowExitConfirm(false);
                      resetForm();
                      onOpenChange(false);
                    }}
                    className="w-full sm:w-auto rounded-xl text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
                  >
                    {locale === "en" ? "Discard & Exit" : "Ya, Keluar & Hapus"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="w-full sm:w-auto rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    {locale === "en" ? "Continue Adding Link" : "Lanjutkan Tambah Tautan"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
