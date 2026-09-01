"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  FileText,
  Star,
  Clock,
  Search,
  Plus,
  Pin,
  Trash2,
  Folder as FolderIcon,
  FolderPlus,
  MoreVertical,
  RotateCcw,
  Check,
  Edit2,
  X,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesList, useNoteFolders, invalidateCache, setCachedData } from "@/hooks/use-data";
import { QuickReminderPopover } from "@/components/reminders/quick-reminder-popover";
import { useTranslation } from "@/components/providers/i18n-provider";

const COLOR_OPTIONS = [
  "#6366f1", // Indigo
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#64748b", // Slate
];

type FilterType = "all" | "pinned" | "favorites" | "trash";

export function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requireAuth } = useRequireAuth();
  const { t, locale } = useTranslation();

  // Active filters
  const [activeFilter, setActiveFilter] = useState<FilterType>(
    (searchParams.get("filter") as FilterType) || "all"
  );
  const [activeFolderId, setActiveFolderId] = useState<string | null>(
    searchParams.get("folderId") || null
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [creatingNote, setCreatingNote] = useState(false);

  // Dialogs
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState(COLOR_OPTIONS[0]);
  const [savingFolder, setSavingFolder] = useState(false);

  // Delete confirmations
  const [deleteNoteTarget, setDeleteNoteTarget] = useState<any | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<any | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync state with URL params
  useEffect(() => {
    const filter = searchParams.get("filter") as FilterType;
    if (filter && ["all", "pinned", "favorites", "trash"].includes(filter)) {
      setActiveFilter(filter);
    }
    const folder = searchParams.get("folderId");
    if (folder !== undefined) {
      setActiveFolderId(folder || null);
    }
  }, [searchParams]);

  // Use cached data with instant SWR pattern
  const queryParams = useMemo(() => ({
    q: debouncedSearch,
    filter: activeFilter,
    folderId: activeFolderId,
  }), [debouncedSearch, activeFilter, activeFolderId]);

  const { notes, loading, refresh: fetchNotes, setNotes } = useNotesList(queryParams);
  const { folders, refresh: fetchFolders, setFolders } = useNoteFolders();

  const createNote = async (initialFolderId?: string | null) => {
    if (requireAuth(t("notes.newNoteBtn"), t("auth.authRequiredDesc"))) {
      return;
    }
    setCreatingNote(true);
    try {
      const targetFolder = initialFolderId || activeFolderId || null;
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: locale === "en" ? "New Note" : "Catatan Baru",
          folderId: targetFolder,
        }),
      });
      const data = await res.json();
      if (data.id) {
        // Pre-cache newly created note to avoid delay on note detail screen
        setCachedData(`/api/notes/${data.id}`, data);
        invalidateCache("/api/notes");
        router.push(`/notes/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setCreatingNote(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, note: any) => {
    e.preventDefault();
    e.stopPropagation();
    const nextVal = !note.isFavorite;
    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, isFavorite: nextVal } : n))
    );
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: nextVal }),
      });
      invalidateCache("/api/notes");
    } catch (error) {
      console.error(error);
      fetchNotes(true);
    }
  };

  const togglePin = async (e: React.MouseEvent, note: any) => {
    e.preventDefault();
    e.stopPropagation();
    const nextVal = !note.isPinned;
    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, isPinned: nextVal } : n))
    );
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: nextVal }),
      });
      invalidateCache("/api/notes");
    } catch (error) {
      console.error(error);
      fetchNotes(true);
    }
  };

  const moveNoteToFolder = async (noteId: string, folderId: string | null) => {
    try {
      await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      invalidateCache("/api/notes");
      fetchNotes(true);
      fetchFolders(true);
    } catch (error) {
      console.error(error);
    }
  };

  const restoreNote = async (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      invalidateCache("/api/notes");
      fetchNotes(true);
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDeleteNote = async () => {
    if (!deleteNoteTarget) return;
    try {
      const isPermanent = deleteNoteTarget.status === "TRASH" || activeFilter === "trash";
      await fetch(`/api/notes/${deleteNoteTarget.id}${isPermanent ? "?permanent=true" : ""}`, {
        method: "DELETE",
      });
      setDeleteNoteTarget(null);
      invalidateCache("/api/notes");
      fetchNotes(true);
      fetchFolders(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenFolderDialog = (folder?: any) => {
    if (requireAuth(
      locale === "en" ? "Manage Note Folders" : "Mengelola Folder Catatan",
      locale === "en" ? "Sign in or register for free to create and manage note folders." : "Masuk atau daftar gratis untuk membuat dan mengatur folder catatan Anda."
    )) {
      return;
    }
    if (folder) {
      setEditingFolder(folder);
      setFolderName(folder.name);
      setFolderColor(folder.color || COLOR_OPTIONS[0]);
    } else {
      setEditingFolder(null);
      setFolderName("");
      setFolderColor(COLOR_OPTIONS[0]);
    }
    setFolderDialogOpen(true);
  };

  const handleSaveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setSavingFolder(true);
    try {
      if (editingFolder) {
        await fetch(`/api/notes/folders/${editingFolder.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: folderName.trim(), color: folderColor }),
        });
      } else {
        await fetch("/api/notes/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: folderName.trim(), color: folderColor }),
        });
      }
      setFolderDialogOpen(false);
      invalidateCache("/api/notes/folders");
      fetchFolders(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingFolder(false);
    }
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    try {
      await fetch(`/api/notes/folders/${deleteFolderTarget.id}`, {
        method: "DELETE",
      });
      if (activeFolderId === deleteFolderTarget.id) {
        setActiveFolderId(null);
      }
      setDeleteFolderTarget(null);
      invalidateCache("/api/notes");
      fetchFolders(true);
      fetchNotes(true);
    } catch (error) {
      console.error(error);
    }
  };

  // Helper to extract clean text snippet
  const getCleanSnippet = (content: string | null) => {
    if (!content) return "Catatan kosong";
    const text = content.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
    return text || "Catatan kosong";
  };

  const isTrashView = activeFilter === "trash";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <FileText className="w-7 h-7" />
            </span>
            {t("notes.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("notes.subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("notes.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-8 rounded-xl glass-panel border-border/50 focus-visible:ring-primary/40 text-sm h-11 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            onClick={() => createNote()}
            disabled={creatingNote}
            className="gap-2 rounded-xl shadow-md h-11 px-5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{creatingNote ? t("common.loading") : t("notes.newNoteBtn")}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards (Hidden during search) */}
      {!search && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-5 rounded-2xl glass-panel bg-card/70 hover:bg-card/95 border border-border/60 hover:border-primary/40 flex items-center gap-2.5 sm:gap-4 transition-all duration-200 shadow-2xs">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-3xl font-bold font-sans tracking-tight text-foreground tabular-nums leading-none mb-1">
                {notes.length}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t("notes.allNotes")}</p>
            </div>
          </div>

          <div className="p-3 sm:p-5 rounded-2xl glass-panel bg-card/70 hover:bg-card/95 border border-border/60 hover:border-amber-500/40 flex items-center gap-2.5 sm:gap-4 transition-all duration-200 shadow-2xs">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500/15 text-amber-500" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-3xl font-bold font-sans tracking-tight text-foreground tabular-nums leading-none mb-1">
                {notes.filter((n) => n.isFavorite).length}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t("notes.favorites")}</p>
            </div>
          </div>

          <div className="p-3 sm:p-5 rounded-2xl glass-panel bg-card/70 hover:bg-card/95 border border-border/60 hover:border-blue-500/40 flex items-center gap-2.5 sm:gap-4 transition-all duration-200 shadow-2xs">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
              <Pin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-3xl font-bold font-sans tracking-tight text-foreground tabular-nums leading-none mb-1">
                {notes.filter((n) => n.isPinned).length}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{t("notes.pinned")}</p>
            </div>
          </div>

          <div className="p-3 sm:p-5 rounded-2xl glass-panel bg-card/70 hover:bg-card/95 border border-border/60 hover:border-emerald-500/40 flex items-center gap-2.5 sm:gap-4 transition-all duration-200 shadow-2xs">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-3xl font-bold font-sans tracking-tight text-foreground tabular-nums leading-none mb-1">
                {
                  notes.filter(
                    (n) =>
                      new Date(n.updatedAt).toDateString() === new Date().toDateString()
                  ).length
                }
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{locale === "en" ? "Updated Today" : "Diperbarui Hari Ini"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Folders Row */}
      <div className="space-y-4">
        {/* Main Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: t("notes.allNotes"), icon: Layers },
            { id: "pinned", label: t("notes.pinned"), icon: Pin },
            { id: "favorites", label: t("notes.favorites"), icon: Star },
            { id: "trash", label: t("notes.trash"), icon: Trash2 },
          ].map((tab) => {
            const isActive = activeFilter === tab.id && !activeFolderId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.id as FilterType);
                  setActiveFolderId(null);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 shrink-0 cursor-pointer touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "glass-panel text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-border/40"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="h-6 w-px bg-border/60 mx-1 shrink-0" />

          {/* Folder Chips */}
          {folders.map((folder) => {
            const isFolderActive = activeFolderId === folder.id;
            return (
              <div
                key={folder.id}
                className={cn(
                  "flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-xl text-sm font-medium transition-all shrink-0 group border",
                  isFolderActive
                    ? "bg-foreground/10 text-foreground border-foreground/30 shadow-sm"
                    : "glass-panel text-muted-foreground hover:text-foreground hover:bg-foreground/5 border-border/40"
                )}
              >
                <button
                  onClick={() => {
                    setActiveFolderId(folder.id);
                    setActiveFilter("all");
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span>{folder.name}</span>
                  {folder._count?.notes !== undefined && (
                    <span className="text-xs opacity-60 bg-foreground/10 px-1.5 py-0.2 rounded-full">
                      {folder._count.notes}
                    </span>
                  )}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-foreground/10 rounded-md transition-opacity cursor-pointer">
                      <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 glass-panel">
                    <DropdownMenuItem
                      onClick={() => handleOpenFolderDialog(folder)}
                      className="cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteFolderTarget(folder)}
                      className="text-destructive cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Hapus Folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}

          {/* Add Folder Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenFolderDialog()}
            className="rounded-xl border-dashed border-border/70 hover:border-primary text-xs gap-1.5 shrink-0 h-10 px-3.5"
          >
            <FolderPlus className="w-3.5 h-3.5 text-primary" />
            <span>Folder Baru</span>
          </Button>
        </div>
      </div>

      {/* Trash View Banner */}
      {isTrashView && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm font-medium">
            <Trash2 className="w-5 h-5 shrink-0" />
            <span>
              Catatan di Sampah akan disimpan hingga dihapus permanen atau dipulihkan.
            </span>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div>
        {loading && notes.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl glass-panel animate-pulse border border-border/30 p-5 space-y-3"
              >
                <div className="h-5 bg-foreground/10 rounded w-2/3" />
                <div className="space-y-2">
                  <div className="h-3 bg-foreground/5 rounded w-full" />
                  <div className="h-3 bg-foreground/5 rounded w-4/5" />
                  <div className="h-3 bg-foreground/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="text-center border border-dashed border-border/50 rounded-3xl glass-panel p-12 max-w-md w-full">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <FileText className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-1 text-foreground">
                {search
                  ? (locale === "en" ? "No matching notes" : "Tidak ada catatan yang cocok")
                  : isTrashView
                  ? (locale === "en" ? "Trash is empty" : "Sampah kosong")
                  : (locale === "en" ? "No notes yet" : "Belum ada catatan")}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {search
                  ? (locale === "en" ? `No notes found matching "${search}".` : `Tidak menemukan catatan dengan kata kunci "${search}".`)
                  : isTrashView
                  ? (locale === "en" ? "All deleted notes will appear here." : "Semua catatan yang dihapus akan muncul di sini.")
                  : (locale === "en" ? "Capture ideas, summaries, and tasks in a new note." : "Mulai tuangkan ide, rangkuman, dan tugas Anda dalam catatan baru.")}
              </p>
              {!isTrashView && (
                <Button
                  onClick={() => createNote()}
                  className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
                >
                  <Plus className="w-4 h-4" /> Buat Catatan Pertama
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <Link href={`/notes/${note.id}`} prefetch={true} className="block h-full">
                    <div
                      className={cn(
                        "group p-5 rounded-2xl glass-panel border border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col h-48 relative overflow-hidden",
                        note.isPinned && "border-blue-500/30 bg-blue-500/[0.03]"
                      )}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-foreground font-heading line-clamp-1 flex-1 text-base group-hover:text-primary transition-colors">
                          {note.title || "Catatan Tanpa Judul"}
                        </h3>

                        <div className="flex items-center gap-1 shrink-0 -mr-1">
                          {/* Pin Toggle */}
                          {!isTrashView && (
                            <button
                              type="button"
                              onClick={(e) => togglePin(e, note)}
                              className={cn(
                                "p-1 rounded-lg transition-colors cursor-pointer",
                                note.isPinned
                                  ? "text-blue-500 hover:bg-blue-500/10"
                                  : "text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100"
                              )}
                              title={note.isPinned ? "Lepaskan Pin" : "Sematkan"}
                            >
                              <Pin className={cn("w-3.5 h-3.5", note.isPinned && "fill-blue-500")} />
                            </button>
                          )}

                          {/* Favorite Toggle */}
                          {!isTrashView && (
                            <button
                              type="button"
                              onClick={(e) => toggleFavorite(e, note)}
                              className={cn(
                                "p-1 rounded-lg transition-colors cursor-pointer",
                                note.isFavorite
                                  ? "text-yellow-500 hover:bg-yellow-500/10"
                                  : "text-muted-foreground/40 hover:text-yellow-500 opacity-0 group-hover:opacity-100"
                              )}
                              title={note.isFavorite ? (locale === "en" ? "Remove Favorite" : "Hapus Favorit") : (locale === "en" ? "Add to Favorites" : "Favorit")}
                            >
                              <Star
                                className={cn(
                                  "w-4 h-4",
                                  note.isFavorite && "fill-yellow-500"
                                )}
                              />
                            </button>
                          )}

                          {/* Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="p-1 rounded-lg text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 glass-panel"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {!isTrashView && (
                                <>
                                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    Pindah ke Folder
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => moveNoteToFolder(note.id, null)}
                                    className="cursor-pointer"
                                  >
                                    <FolderIcon className="w-3.5 h-3.5 mr-2" /> Tanpa Folder
                                  </DropdownMenuItem>
                                  {folders.map((f) => (
                                    <DropdownMenuItem
                                      key={f.id}
                                      onClick={() => moveNoteToFolder(note.id, f.id)}
                                      className="cursor-pointer"
                                    >
                                      <div
                                        className="w-2 h-2 rounded-full mr-2"
                                        style={{ backgroundColor: f.color }}
                                      />
                                      <span className="truncate">{f.name}</span>
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                </>
                              )}

                              {isTrashView ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => restoreNote(e, note.id)}
                                    className="cursor-pointer text-primary"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 mr-2" /> Pulihkan Catatan
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteNoteTarget(note)}
                                    className="cursor-pointer text-destructive focus:bg-destructive/10"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Hapus Permanen
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => setDeleteNoteTarget(note)}
                                  className="cursor-pointer text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Pindahkan ke Sampah
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                        {getCleanSnippet(note.content)}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-auto pt-3 border-t border-border/30">
                        <span>
                          {format(new Date(note.updatedAt), "d MMM yyyy", {
                            locale: idLocale,
                          })}
                        </span>
                        {note.folder && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[10px]"
                            style={{
                              backgroundColor: `${note.folder.color}15`,
                              color: note.folder.color,
                            }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: note.folder.color }}
                            />
                            {note.folder.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Note Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteNoteTarget}
        onOpenChange={(open) => !open && setDeleteNoteTarget(null)}
        title={
          deleteNoteTarget?.status === "TRASH" || activeFilter === "trash"
            ? (locale === "en" ? "Permanently Delete Note" : "Hapus Catatan Permanen")
            : (locale === "en" ? "Move to Trash" : "Pindahkan ke Sampah")
        }
        description={
          deleteNoteTarget?.status === "TRASH" || activeFilter === "trash"
            ? (locale === "en" ? "This note will be permanently deleted and cannot be recovered." : "Catatan ini akan dihapus selamanya dan tidak dapat dipulihkan.")
            : (locale === "en" ? "This note will be moved to Trash. You can still restore it anytime." : "Catatan ini akan dipindahkan ke folder Sampah. Anda masih dapat memulihkannya kapan saja.")
        }
        confirmText={
          deleteNoteTarget?.status === "TRASH" || activeFilter === "trash"
            ? (locale === "en" ? "Delete Permanently" : "Hapus Permanen")
            : (locale === "en" ? "Move to Trash" : "Pindahkan ke Sampah")
        }
        cancelText={t("common.cancel")}
        destructive={true}
        onConfirm={confirmDeleteNote}
      />

      {/* Delete Folder Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteFolderTarget}
        onOpenChange={(open) => !open && setDeleteFolderTarget(null)}
        title={locale === "en" ? "Delete Note Folder" : "Hapus Folder Catatan"}
        description={locale === "en" ? "Are you sure you want to delete this folder? Notes inside will not be deleted, but moved to Uncategorized." : "Apakah Anda yakin ingin menghapus folder ini? Catatan di dalamnya tidak akan terhapus, melainkan dipindahkan menjadi Tanpa Folder."}
        confirmText={locale === "en" ? "Delete Folder" : "Hapus Folder"}
        cancelText={t("common.cancel")}
        destructive={true}
        onConfirm={confirmDeleteFolder}
      />

      {/* Create / Edit Folder Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="sm:max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle>
              {editingFolder
                ? (locale === "en" ? "Edit Note Folder" : "Edit Folder Catatan")
                : (locale === "en" ? "Create Note Folder" : "Buat Folder Catatan")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveFolder} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                {locale === "en" ? "Folder Name" : "Nama Folder"}
              </label>
              <Input
                placeholder={locale === "en" ? "e.g., Work, Project Ideas, Personal..." : "Contoh: Pekerjaan, Ide Proyek, Pribadi..."}
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                {locale === "en" ? "Choose Color" : "Pilih Warna"}
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFolderColor(color)}
                    className={cn(
                      "w-7 h-7 rounded-full transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      folderColor === color
                        ? "scale-110 ring-2 ring-foreground shadow-sm"
                        : "hover:scale-110"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Pilih warna ${color}`}
                  >
                    {folderColor === color && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFolderDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={savingFolder || !folderName.trim()}>
                {savingFolder
                  ? (locale === "en" ? "Saving..." : "Menyimpan...")
                  : editingFolder
                  ? (locale === "en" ? "Save Changes" : "Simpan Perubahan")
                  : (locale === "en" ? "Create Folder" : "Buat Folder")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
