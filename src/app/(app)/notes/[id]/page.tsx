"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import {
  type DocumentSettings,
  DEFAULT_DOCUMENT_SETTINGS,
  deserializeDocumentSettings,
  serializeDocumentSettings,
} from "@/lib/document-settings";
import { useRouter } from "next/navigation";
import { NoteEditor } from "@/components/notes/note-editor";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Star,
  Trash2,
  Folder as FolderIcon,
  MoreVertical,
  Loader2,
  Pin,
  Check,
  Calendar,
  FolderPlus,
  RotateCcw,
  AlertTriangle,
  WifiOff,
  RefreshCw,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  saveDraft,
  clearDraft,
  getNewerDraft,
  type NoteDraft,
} from "@/hooks/use-note-draft";
import { getCachedData, setCachedData, invalidateCache } from "@/hooks/use-data";

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

type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline" | "conflict";

export default function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // In-memory cache initialization for instant transition
  const cached = getCachedData<any>(`/api/notes/${id}`);

  // Core state
  const [note, setNote] = useState<any>(cached || null);
  const [title, setTitle] = useState(cached?.title || "");
  const [loading, setLoading] = useState(!cached);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [folders, setFolders] = useState<any[]>(() => {
    return getCachedData<any[]>("/api/notes/folders") || [];
  });

  // Version tracking for optimistic concurrency
  const versionRef = useRef<number>(cached?.version || 1);

  // Pending save data — using refs to avoid stale closures
  const pendingTitleRef = useRef<string | null>(null);
  const pendingContentRef = useRef<string | null>(null);
  const isDirtyRef = useRef(false);
  const isSavingRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scheduleSaveRef = useRef<() => void>(() => {});

  // Draft recovery
  const [draftRecovery, setDraftRecovery] = useState<NoteDraft | null>(null);

  // Track initial content for editor (only set once on load)
  const [initialContent, setInitialContent] = useState<string | null>(cached?.content ?? null);
  const contentLoadedRef = useRef(!!cached);

  // Document settings (page size, orientation, margins, default font)
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>(() => {
    return cached?.documentSettings
      ? deserializeDocumentSettings(cached.documentSettings)
      : DEFAULT_DOCUMENT_SETTINGS;
  });

  // Dialogs
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(COLOR_OPTIONS[0]);
  const [creatingFolder, setCreatingFolder] = useState(false);

  // ─── FETCH NOTE ────────────────────────────────────────────
  useEffect(() => {
    fetchNote();
    fetchFolders();

    return () => {
      // Flush pending save on unmount
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (isDirtyRef.current) {
        flushSave();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchNote = async () => {
    try {
      const res = await fetch(`/api/notes/${id}`);
      if (!res.ok) {
        if (res.status === 404) router.push("/notes");
        return;
      }
      const data = await res.json();
      setCachedData(`/api/notes/${id}`, data);
      setNote(data);
      setTitle(data.title || "");
      versionRef.current = data.version || 1;

      // Load document settings from database
      setDocumentSettings(deserializeDocumentSettings(data.documentSettings));

      // Check for local draft recovery
      const newerDraft = getNewerDraft(id, data.updatedAt, data.version || 1);
      if (newerDraft) {
        setDraftRecovery(newerDraft);
        // Don't load DB content yet — show recovery dialog
        setInitialContent(data.content || "");
        contentLoadedRef.current = true;
      } else {
        setInitialContent(data.content || "");
        contentLoadedRef.current = true;
        clearDraft(id); // Clean up stale draft
      }
    } catch (error) {
      console.error("Failed to fetch note:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/notes/folders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCachedData("/api/notes/folders", data);
        setFolders(data);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

  // ─── SAVE LOGIC ────────────────────────────────────────────

  /**
   * Core save function. Uses refs for latest data to avoid stale closures.
   * Implements: abort previous request, version tracking, local draft fallback.
   */
  const persistNote = useCallback(async (updates: Record<string, unknown>) => {
    // Abort any in-flight save
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    isSavingRef.current = true;
    setSaveStatus("saving");

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updates,
          expectedVersion: versionRef.current,
        }),
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      if (res.status === 409) {
        // Conflict — version mismatch
        setSaveStatus("conflict");
        isSavingRef.current = false;

        // Save to local draft so data isn't lost
        saveDraft(id, {
          title: pendingTitleRef.current ?? title,
          content: pendingContentRef.current ?? "",
          version: versionRef.current,
        });
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const updated = await res.json();
      setCachedData(`/api/notes/${id}`, updated);
      versionRef.current = updated.version || versionRef.current + 1;
      setNote((prev: any) => ({ ...prev, ...updated }));
      setLastSavedAt(new Date());
      setSaveStatus("saved");
      isDirtyRef.current = false;
      pendingTitleRef.current = null;
      pendingContentRef.current = null;

      // Clear local draft since server is synced
      clearDraft(id);
      invalidateCache("/api/notes");
    } catch (error: any) {
      if (error?.name === "AbortError") return; // Expected when debouncing

      console.error("Auto-save failed:", error);

      // Check if offline
      if (!navigator.onLine) {
        setSaveStatus("offline");
      } else {
        setSaveStatus("error");
      }

      // Save to localStorage so work is not lost
      saveDraft(id, {
        title: pendingTitleRef.current ?? title,
        content: pendingContentRef.current ?? "",
        version: versionRef.current,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [id, title]);

  /**
   * Schedule auto-save with debounce (750ms).
   */
  const scheduleSave = useCallback(() => {
    isDirtyRef.current = true;
    setSaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const updates: Record<string, unknown> = {};
      if (pendingTitleRef.current !== null) {
        updates.title = pendingTitleRef.current;
      }
      if (pendingContentRef.current !== null) {
        updates.content = pendingContentRef.current;
      }
      if (Object.keys(updates).length > 0) {
        persistNote(updates);
      }
    }, 750);
  }, [persistNote]);

  // Keep scheduleSaveRef in sync
  useEffect(() => {
    scheduleSaveRef.current = scheduleSave;
  }, [scheduleSave]);

  /**
   * Force save immediately (e.g. before navigating away).
   */
  const flushSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (isDirtyRef.current) {
      const updates: Record<string, unknown> = {};
      if (pendingTitleRef.current !== null) updates.title = pendingTitleRef.current;
      if (pendingContentRef.current !== null) updates.content = pendingContentRef.current;
      if (Object.keys(updates).length > 0) {
        persistNote(updates);
      }
    }
  }, [persistNote]);

  // ─── EVENT HANDLERS ────────────────────────────────────────

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    pendingTitleRef.current = val;
    scheduleSave();
  };

  const handleContentChange = useCallback((html: string) => {
    pendingContentRef.current = html;
    scheduleSaveRef.current();
  }, []);

  const persistNoteAction = useCallback(async (updates: Record<string, unknown>) => {
    // Optimistic UI update
    setNote((prev: any) => (prev ? { ...prev, ...updates } : prev));
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setCachedData(`/api/notes/${id}`, updated);
        setNote(updated);
        invalidateCache("/api/notes");
      }
    } catch (error) {
      console.error(error);
      fetchNote();
    }
  }, [id]);

  const toggleFavorite = () => {
    if (!note) return;
    persistNoteAction({ isFavorite: !note.isFavorite });
  };

  const togglePin = () => {
    if (!note) return;
    persistNoteAction({ isPinned: !note.isPinned });
  };

  const setFolder = (folderId: string | null) => {
    persistNoteAction({ folderId });
  };

  const handleDelete = async () => {
    try {
      const isPermanent = note?.status === "TRASH";
      await fetch(`/api/notes/${id}${isPermanent ? "?permanent=true" : ""}`, {
        method: "DELETE",
      });
      clearDraft(id);
      invalidateCache("/api/notes");
      router.push("/notes");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestore = async () => {
    await persistNoteAction({ status: "ACTIVE" });
    router.push("/notes");
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const res = await fetch("/api/notes/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim(), color: newFolderColor }),
      });
      if (res.ok) {
        const newFolder = await res.json();
        setFolders((prev) => [...prev, newFolder]);
        setFolder(newFolder.id);
        setNewFolderOpen(false);
        setNewFolderName("");
        invalidateCache("/api/notes/folders");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingFolder(false);
    }
  };

  // Draft recovery handlers
  const handleRecoverDraft = () => {
    if (!draftRecovery) return;
    setTitle(draftRecovery.title);
    setInitialContent(draftRecovery.content);
    pendingTitleRef.current = draftRecovery.title;
    pendingContentRef.current = draftRecovery.content;
    setDraftRecovery(null);
    scheduleSave();
  };

  const handleDiscardDraft = () => {
    clearDraft(id);
    setDraftRecovery(null);
  };

  // ─── SAVE STATUS INDICATOR ─────────────────────────────────

  const renderSaveStatus = () => {
    if (loading) {
      return (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Memuat...</span>
        </span>
      );
    }

    switch (saveStatus) {
      case "saving":
        return (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>Menyimpan...</span>
          </span>
        );
      case "saved":
        return (
          <span className="flex items-center gap-1.5 text-emerald-500">
            <Check className="w-3.5 h-3.5" />
            <span>Tersimpan {lastSavedAt ? format(lastSavedAt, "HH:mm") : ""}</span>
          </span>
        );
      case "offline":
        return (
          <span className="flex items-center gap-1.5 text-amber-500" title="Tersimpan lokal di browser">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Mode Offline (Disimpan Lokal)</span>
          </span>
        );
      case "conflict":
        return (
          <button
            onClick={() => fetchNote()}
            className="flex items-center gap-1.5 text-amber-500 hover:text-amber-400 cursor-pointer"
            title="Catatan telah diubah di sesi lain. Klik untuk menyegarkan."
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Ada versi baru — Segarkan</span>
          </button>
        );
      case "error":
        return (
          <button
            onClick={flushSave}
            className="flex items-center gap-1.5 text-destructive hover:underline cursor-pointer"
            title="Gagal menyimpan ke server. Klik untuk coba lagi."
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Gagal simpan — Coba lagi</span>
          </button>
        );
      default:
        return (
          <span className="text-muted-foreground/60">
            {note?.updatedAt
              ? `Tersimpan ${format(new Date(note.updatedAt), "d MMM, HH:mm", { locale: idLocale })}`
              : "Semua perubahan tersimpan"}
          </span>
        );
    }
  };

  const isTrash = note?.status === "TRASH";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20 max-w-5xl mx-auto">
      {/* Draft Recovery Alert */}
      {draftRecovery && (
        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Ditemukan draft lokal yang belum tersimpan dari sesi sebelumnya ({format(new Date(draftRecovery.savedAt), "d MMM, HH:mm", { locale: idLocale })}).</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDiscardDraft}
              className="gap-1.5 bg-background text-xs"
            >
              <X className="w-3.5 h-3.5" /> Abaikan
            </Button>
            <Button
              size="sm"
              onClick={handleRecoverDraft}
              className="gap-1.5 text-xs bg-yellow-500 hover:bg-yellow-500/90 text-black"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Pulihkan Draft
            </Button>
          </div>
        </div>
      )}

      {/* Trash Alert Banner */}
      {isTrash && (
        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Catatan ini berada di folder Sampah.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleRestore} className="gap-1.5 bg-background">
              <RotateCcw className="w-3.5 h-3.5" /> Pulihkan Catatan
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
              Hapus Permanen
            </Button>
          </div>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl glass-panel border-border/50 mb-6 sticky top-4 z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isDirtyRef.current) {
                flushSave();
              }
              router.push("/notes");
            }}
            className="text-muted-foreground hover:text-foreground shrink-0 rounded-xl"
            title="Kembali ke Catatan"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
            {renderSaveStatus()}
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Folder Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs font-medium rounded-xl border-border/60 bg-background/50 hidden sm:inline-flex"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: note?.folder?.color || "var(--primary)" }}
                />
                <span className="truncate max-w-[100px]">
                  {note?.folder?.name || "Tanpa Folder"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-panel">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Pilih Folder</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFolder(null)} className="cursor-pointer">
                <FolderIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Tanpa Folder</span>
                {!note?.folderId && <Check className="ml-auto w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {folders.map((f) => (
                <DropdownMenuItem key={f.id} onClick={() => setFolder(f.id)} className="cursor-pointer">
                  <div
                    className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
                    style={{ backgroundColor: f.color }}
                  />
                  <span className="truncate flex-1">{f.name}</span>
                  {note?.folderId === f.id && <Check className="ml-auto w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setNewFolderOpen(true)}
                className="text-primary font-medium cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                <span>Folder Baru...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Pin Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePin}
            className={cn(
              "rounded-xl transition-colors",
              note?.isPinned ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20" : "text-muted-foreground hover:text-foreground"
            )}
            title={note?.isPinned ? "Lepaskan Sematan" : "Sematkan Catatan"}
          >
            <Pin className={cn("w-4 h-4", note?.isPinned && "fill-blue-500")} />
          </Button>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={cn(
              "rounded-xl transition-colors",
              note?.isFavorite ? "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20" : "text-muted-foreground hover:text-foreground"
            )}
            title={note?.isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"}
          >
            <Star className={cn("w-4 h-4", note?.isFavorite && "fill-yellow-500")} />
          </Button>

          {/* More Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-panel">
              <DropdownMenuItem onClick={() => setNewFolderOpen(true)} className="sm:hidden cursor-pointer">
                <FolderPlus className="w-4 h-4 mr-2" /> Folder Baru...
              </DropdownMenuItem>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isTrash ? "Hapus Permanen" : "Pindahkan ke Sampah"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="rounded-3xl glass-panel p-6 sm:p-10 shadow-xl border-border/50 relative">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Catatan Tanpa Judul"
          className="w-full text-3xl sm:text-4xl md:text-5xl font-heading font-bold bg-transparent border-none outline-none mb-4 placeholder:text-muted-foreground/30 focus:ring-0 text-foreground"
        />

        {/* Date & Folder Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pb-6 mb-6 border-b border-border/40 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {note?.updatedAt
                ? `Diperbarui ${format(new Date(note.updatedAt), "d MMMM yyyy, HH:mm", { locale: idLocale })}`
                : "Baru saja"}
            </span>
          </div>

          {note?.folder && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground/5 font-medium">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: note.folder.color }} />
              <span style={{ color: note.folder.color }}>{note.folder.name}</span>
            </div>
          )}
        </div>

        {/* Note Editor */}
        {contentLoadedRef.current ? (
          <NoteEditor
            initialContent={initialContent}
            onUpdate={handleContentChange}
            editable={!isTrash}
            documentSettings={documentSettings}
            onDocumentSettingsChange={(newSettings) => {
              setDocumentSettings(newSettings);
              persistNoteAction({
                documentSettings: serializeDocumentSettings(newSettings),
              });
            }}
            noteTitle={title || "Catatan"}
          />
        ) : (
          <div className="space-y-4 py-8 animate-pulse">
            <div className="h-10 bg-foreground/5 rounded-xl w-full" />
            <div className="h-4 bg-foreground/5 rounded w-3/4" />
            <div className="h-4 bg-foreground/5 rounded w-1/2" />
            <div className="h-32 bg-foreground/5 rounded-2xl w-full" />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={isTrash ? "Hapus Catatan Permanen?" : "Pindahkan ke Sampah?"}
        description={
          isTrash
            ? "Catatan ini akan dihapus secara permanen dari brankas Anda dan tidak dapat dipulihkan."
            : "Catatan ini akan dipindahkan ke folder Sampah. Anda masih dapat memulihkannya nanti jika diperlukan."
        }
        confirmText={isTrash ? "Hapus Permanen" : "Pindahkan ke Sampah"}
        cancelText="Batal"
        destructive={true}
        onConfirm={handleDelete}
      />

      {/* Create Folder Dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="sm:max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle>Buat Folder Catatan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Nama Folder
              </label>
              <Input
                placeholder="Contoh: Pekerjaan, Ide Proyek, Pribadi..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Pilih Warna
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewFolderColor(color)}
                    className={cn(
                      "w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center",
                      newFolderColor === color ? "scale-125 ring-2 ring-foreground" : "hover:scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {newFolderColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setNewFolderOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={creatingFolder || !newFolderName.trim()}>
                {creatingFolder ? "Membuat..." : "Buat Folder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
