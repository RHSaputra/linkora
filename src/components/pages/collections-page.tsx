"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Plus,
  Trash2,
  Link2,
  FileText,
  Edit2,
  Pin,
  Star,
  Clock,
  ChevronRight,
  FolderPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LinkCard } from "@/components/links/link-card";
import {
  useCollections,
  deleteCollection,
  useNoteFolders,
  deleteNoteFolder,
  invalidateAndRefresh,
  updateGlobalCacheCollections,
  dispatchRefresh,
} from "@/hooks/use-data";
import { SerializedLink } from "@/lib/types";
import { useRequireAuth } from "@/hooks/use-require-auth";

import { AddLinksToCollectionDialog } from "@/components/links/add-links-to-collection-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslation } from "@/components/providers/i18n-provider";
import { useViewMode } from "@/hooks/use-view-mode";
import { ViewModeSwitcher } from "@/components/ui/view-mode-switcher";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/custom-toast";

interface CollectionsPageProps {
  refreshKey: number;
  triggerRefresh: () => void;
  openEditLink: (link: SerializedLink) => void;
}

const COLOR_PRESETS = [
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#f43f5e", name: "Rose" },
  { hex: "#a855f7", name: "Purple" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#2563eb", name: "Blue" },
];

export function CollectionsPage({
  refreshKey,
  triggerRefresh,
  openEditLink,
}: CollectionsPageProps) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const { t, locale } = useTranslation();
  const [viewMode, setViewMode] = useViewMode();

  // Active Main Category Tab: "links" or "notes"
  const [activeTab, setActiveTab] = useState<"links" | "notes">("links");

  // ── LINK COLLECTIONS STATE ──
  const { collections, loading: loadingCollections, refresh: refreshCollections } = useCollections();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collectionLinks, setCollectionLinks] = useState<SerializedLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  // Link Collection Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [manageLinksOpen, setManageLinksOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ── NOTE COLLECTIONS (NOTE FOLDERS) STATE ──
  const { folders: noteFolders, loading: loadingNoteFolders, refresh: refreshNoteFolders } = useNoteFolders();
  const [selectedNoteFolderId, setSelectedNoteFolderId] = useState<string | null>(null);
  const [folderNotes, setFolderNotes] = useState<any[]>([]);
  const [loadingFolderNotes, setLoadingFolderNotes] = useState(false);
  const [creatingNoteInFolder, setCreatingNoteInFolder] = useState(false);

  // Note Folder Dialogs
  const [noteFolderDialogOpen, setNoteFolderDialogOpen] = useState(false);
  const [editingNoteFolder, setEditingNoteFolder] = useState<any | null>(null);
  const [noteFolderName, setNoteFolderName] = useState("");
  const [noteFolderColor, setNoteFolderColor] = useState("#6366f1");
  const [savingNoteFolder, setSavingNoteFolder] = useState(false);
  const [deleteNoteFolderDialogOpen, setDeleteNoteFolderDialogOpen] = useState(false);

  // Auto Select first item when loaded
  useEffect(() => {
    if (collections.length > 0 && !selectedId) {
      setSelectedId(collections[0].id);
    }
  }, [collections, selectedId]);

  useEffect(() => {
    if (noteFolders.length > 0 && !selectedNoteFolderId) {
      setSelectedNoteFolderId(noteFolders[0].id);
    }
  }, [noteFolders, selectedNoteFolderId]);

  useEffect(() => {
    if (refreshKey > 0) {
      refreshCollections(true);
      refreshNoteFolders(true);
    }
  }, [refreshKey, refreshCollections, refreshNoteFolders]);

  // Fetch Links for selected Link Collection
  useEffect(() => {
    if (selectedId) {
      setLoadingLinks(true);
      fetch(`/api/collections/${selectedId}`)
        .then((r) => r.json())
        .then((data) => setCollectionLinks(data.links || []))
        .finally(() => setLoadingLinks(false));
    }
  }, [selectedId, refreshKey]);

  // Fetch Notes for selected Note Folder
  useEffect(() => {
    if (selectedNoteFolderId) {
      setLoadingFolderNotes(true);
      fetch(`/api/notes?folderId=${selectedNoteFolderId}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setFolderNotes(data);
        })
        .finally(() => setLoadingFolderNotes(false));
    }
  }, [selectedNoteFolderId, refreshKey]);

  // Link Collection Actions
  const createCollection = async (name: string, color: string, icon = "folder") => {
    const tempId = `temp-${Date.now()}`;
    const tempCol = {
      id: tempId,
      name,
      color,
      icon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "",
      _count: { links: 0 },
    };

    updateGlobalCacheCollections((prev) => [...prev, tempCol as any]);
    dispatchRefresh(["collections", "dashboard"], false);

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon }),
      });
      if (res.ok) {
        const realCol = await res.json();
        updateGlobalCacheCollections((prev) =>
          prev.map((c) => (c.id === tempId ? realCol : c))
        );
        setSelectedId(realCol.id);
        dispatchRefresh(["collections", "dashboard"], false);
      } else {
        updateGlobalCacheCollections((prev) => prev.filter((c) => c.id !== tempId));
        dispatchRefresh(["collections"], false);
      }
    } catch {
      updateGlobalCacheCollections((prev) => prev.filter((c) => c.id !== tempId));
      dispatchRefresh(["collections"], false);
    }
  };

  const handleOpenCreateLinkCollection = () => {
    if (requireAuth(
      locale === "en" ? "Create New Collection" : "Membuat Koleksi Baru",
      locale === "en" ? "Sign in or register for free to group and organize links into collections." : "Masuk atau daftar gratis untuk mengelompokkan dan mengorganisir tautan ke dalam folder koleksi."
    )) {
      return;
    }
    setCreateOpen(true);
  };

  const handleCreateLinkCollection = async () => {
    if (!newName.trim()) return;
    await createCollection(newName.trim(), newColor);
    setNewName("");
    setCreateOpen(false);
  };

  const executeDeleteCollection = async () => {
    if (!selectedId) return;
    const deletingId = selectedId;
    setSelectedId(null);
    await deleteCollection(deletingId);
  };

  const handleDeleteCollection = () => {
    if (requireAuth(
      locale === "en" ? "Manage Collections" : "Mengelola Koleksi",
      locale === "en" ? "Sign in or register to edit or delete collection folders." : "Masuk atau daftar untuk mengubah atau menghapus folder koleksi."
    )) {
      return;
    }
    setDeleteDialogOpen(true);
  };

  // Note Folder Actions
  const handleOpenNoteFolderModal = (folder?: any) => {
    if (requireAuth(
      locale === "en" ? "Create Note Collection" : "Membuat Koleksi Catatan",
      locale === "en" ? "Sign in or register to organize notes into folders." : "Masuk atau daftar untuk mengelompokkan catatan Anda ke dalam folder terstruktur."
    )) {
      return;
    }
    if (folder) {
      setEditingNoteFolder(folder);
      setNoteFolderName(folder.name);
      setNoteFolderColor(folder.color || "#6366f1");
    } else {
      setEditingNoteFolder(null);
      setNoteFolderName("");
      setNoteFolderColor("#6366f1");
    }
    setNoteFolderDialogOpen(true);
  };

  const handleSaveNoteFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteFolderName.trim()) return;
    setSavingNoteFolder(true);
    try {
      if (editingNoteFolder) {
        await fetch(`/api/notes/folders/${editingNoteFolder.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: noteFolderName.trim(), color: noteFolderColor }),
        });
        toast.success(
          locale === "en" ? "Note collection updated" : "Koleksi catatan diperbarui",
          locale === "en" ? "Saved" : "Tersimpan"
        );
      } else {
        const res = await fetch("/api/notes/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: noteFolderName.trim(), color: noteFolderColor }),
        });
        const newFolder = await res.json();
        if (newFolder?.id) {
          setSelectedNoteFolderId(newFolder.id);
        }
        toast.success(
          locale === "en" ? "Note collection created" : "Koleksi catatan baru dibuat",
          locale === "en" ? "Created" : "Berhasil"
        );
      }
      setNoteFolderDialogOpen(false);
      dispatchRefresh(["noteFolders", "notes"], false);
    } catch (err) {
      console.error(err);
      toast.error(locale === "en" ? "Failed to save collection" : "Gagal menyimpan koleksi", "Error");
    } finally {
      setSavingNoteFolder(false);
    }
  };

  const executeDeleteNoteFolder = async () => {
    if (!selectedNoteFolderId) return;
    const idToDelete = selectedNoteFolderId;
    setSelectedNoteFolderId(null);
    try {
      await deleteNoteFolder(idToDelete);
      toast.success(
        locale === "en" ? "Note collection deleted" : "Koleksi catatan dihapus",
        locale === "en" ? "Deleted" : "Dihapus"
      );
    } catch (err) {
      console.error(err);
      toast.error(locale === "en" ? "Failed to delete collection" : "Gagal menghapus koleksi", "Error");
    }
  };

  const handleCreateNoteInFolder = async () => {
    if (!selectedNoteFolderId) return;
    setCreatingNoteInFolder(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: locale === "en" ? "New Note" : "Catatan Baru",
          folderId: selectedNoteFolderId,
        }),
      });
      const data = await res.json();
      if (data.id) {
        dispatchRefresh(["notes", "noteFolders"], false);
        router.push(`/notes/${data.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(locale === "en" ? "Failed to create note" : "Gagal membuat catatan", "Error");
    } finally {
      setCreatingNoteInFolder(false);
    }
  };

  // Helper for clean note snippet
  const getCleanSnippet = (content: string | null) => {
    if (!content) return locale === "en" ? "Empty note" : "Catatan kosong";
    const text = content.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
    return text || (locale === "en" ? "Empty note" : "Catatan kosong");
  };

  const selectedLinkCollection = collections.find((c) => c.id === selectedId);
  const selectedNoteFolder = noteFolders.find((f) => f.id === selectedNoteFolderId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* ── HEADER & CATEGORY SWITCHER TABS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">{t("collections.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("collections.subtitle")}</p>
        </motion.div>

        {/* Create Button (Dynamic per Active Tab) */}
        {activeTab === "links" ? (
          <Button
            onClick={handleOpenCreateLinkCollection}
            className="self-start sm:self-auto gap-2 rounded-xl text-xs font-semibold cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4"
          >
            <Plus className="h-4 w-4" />
            <span>{t("collections.createBtn")}</span>
          </Button>
        ) : (
          <Button
            onClick={() => handleOpenNoteFolderModal()}
            className="self-start sm:self-auto gap-2 rounded-xl text-xs font-semibold cursor-pointer shadow-md bg-cyan-500 hover:bg-cyan-600 text-white h-10 px-4"
          >
            <FolderPlus className="h-4 w-4" />
            <span>{t("collections.createNoteCollectionBtn")}</span>
          </Button>
        )}
      </div>

      {/* ── CATEGORY TAB TRACK (LINK COLLECTIONS vs NOTE COLLECTIONS) ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel bg-card/80 border border-border/60 max-w-md shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("links")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer touch-manipulation select-none",
            activeTab === "links"
              ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
              : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
          )}
        >
          <Link2 className="w-4 h-4 shrink-0" />
          <span>{t("collections.tabLinkCollections")}</span>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold",
            activeTab === "links" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
          )}>
            {collections.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer touch-manipulation select-none",
            activeTab === "notes"
              ? "bg-cyan-500 text-white shadow-md scale-[1.02]"
              : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
          )}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>{t("collections.tabNoteCollections")}</span>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold",
            activeTab === "notes" ? "bg-white/20 text-white" : "bg-cyan-500/10 text-cyan-500"
          )}>
            {noteFolders.length}
          </span>
        </button>
      </div>

      {/* ── TAB 1: KOLEKSI TAUTAN (LINK COLLECTIONS) ── */}
      {activeTab === "links" && (
        <div className="space-y-6">
          {/* Mobile Collections Chip Selector */}
          {collections.length > 0 && (
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
              {collections.map((col) => {
                const isSelected = selectedId === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedId(col.id)}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shrink-0 transition-all active:scale-95 cursor-pointer touch-manipulation",
                      isSelected
                        ? "shadow-md font-bold"
                        : "border-border/70 bg-card text-foreground hover:bg-muted/40"
                    )}
                    style={
                      isSelected
                        ? {
                            borderColor: `${col.color}80`,
                            backgroundColor: `${col.color}18`,
                            color: col.color,
                            boxShadow: `0 2px 12px ${col.color}25`,
                          }
                        : {}
                    }
                  >
                    <span>{col.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">({col.linkCount})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State for Link Collections */}
          {collections.length === 0 && !loadingCollections && (
            <Card className="border border-border/80 bg-card/70 rounded-3xl shadow-xs glass-panel">
              <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-2xl">
                  <h2 className="text-base font-bold text-foreground font-heading">{t("collections.emptyTitle")}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("collections.emptyDesc")}
                  </p>
                </div>
                <Button onClick={handleOpenCreateLinkCollection} className="gap-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-sm">
                  <Plus className="h-4 w-4" />
                  <span>{t("collections.createNewBtn")}</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Grid Layout (Sidebar + Links View) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Desktop Sidebar List */}
            <div className="hidden lg:block space-y-2.5">
              {loadingCollections ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-muted/60 rounded-2xl animate-pulse" />
                ))
              ) : (
                collections.map((col, i) => {
                  const isSelected = selectedId === col.id;
                  return (
                    <motion.button
                      key={col.id}
                      type="button"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedId(col.id)}
                      className={`flex items-center gap-3.5 w-full p-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.98] cursor-pointer text-left touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group ${
                        isSelected
                          ? "shadow-md"
                          : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: `${col.color}80`,
                            }
                          : {}
                      }
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-xs transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: `${col.color}20`,
                          borderColor: `${col.color}40`,
                          color: col.color,
                          boxShadow: isSelected ? `0 0 14px ${col.color}35` : undefined,
                        }}
                      >
                        <FolderOpen className="h-4.5 w-4.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-bold text-sm truncate transition-colors text-foreground",
                            isSelected ? "font-extrabold" : "group-hover:text-primary"
                          )}
                          style={isSelected ? { color: col.color } : {}}
                        >
                          {col.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {t("collections.linkCount", { count: col.linkCount })}
                        </p>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Selected Link Collection Detail View */}
            <div className="lg:col-span-2">
              {selectedLinkCollection ? (
                <div className="space-y-4">
                  {/* Selected Collection Banner */}
                  <div
                    className="relative flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-3xl border transition-all overflow-hidden bg-card shadow-sm gap-4"
                    style={{
                      borderColor: `${selectedLinkCollection.color}80`,
                    }}
                  >
                    <div className="relative z-10 flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${selectedLinkCollection.color}15`,
                          borderColor: `${selectedLinkCollection.color}60`,
                          color: selectedLinkCollection.color,
                        }}
                      >
                        <FolderOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <h2
                          className="font-black text-lg sm:text-2xl tracking-tight flex items-center gap-2 font-heading"
                          style={{ color: selectedLinkCollection.color }}
                        >
                          {selectedLinkCollection.name}
                        </h2>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                          {t("collections.savedLinksCount", { count: collectionLinks.length })}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 self-end sm:self-auto">
                      <ViewModeSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
                      <Button variant="outline" size="sm" onClick={() => setManageLinksOpen(true)}>
                        {t("collections.manageLinks")}
                      </Button>
                      <Button variant="destructive-ghost" size="icon-sm" onClick={handleDeleteCollection} title={t("common.delete")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {loadingLinks ? (
                    <div className={viewMode === "compact" ? "flex flex-col gap-2.5 w-full" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className={viewMode === "compact" ? "h-14 bg-muted rounded-2xl animate-pulse" : "h-48 bg-muted rounded-2xl animate-pulse"} />
                      ))}
                    </div>
                  ) : collectionLinks.length === 0 ? (
                    <Card className="border-dashed rounded-3xl min-h-[220px] flex items-center justify-center bg-card/50">
                      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <p className="text-xs font-medium text-muted-foreground">{t("collections.emptyInCollection")}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 gap-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                          onClick={() => setManageLinksOpen(true)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{t("common.add")}</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <motion.div
                      layout
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className={viewMode === "compact" ? "flex flex-col gap-2.5 w-full" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8"}
                    >
                      {collectionLinks.map((link, i) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          index={i}
                          viewMode={viewMode}
                          collectionId={selectedLinkCollection.id}
                          onUpdate={() => {
                            triggerRefresh();
                            refreshCollections();
                          }}
                          onDelete={(deletedId) => {
                            setCollectionLinks((prev) => prev.filter((l) => l.id !== deletedId));
                          }}
                          onEdit={openEditLink}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              ) : (
                <Card className="border-dashed rounded-3xl h-full min-h-[260px] flex items-center justify-center bg-card/30">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <p className="text-xs font-medium">{t("collections.selectCollectionHint")}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: KOLEKSI CATATAN (NOTE COLLECTIONS / NOTE FOLDERS) ── */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          {/* Mobile Note Collections Chip Selector */}
          {noteFolders.length > 0 && (
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
              {noteFolders.map((folder) => {
                const isSelected = selectedNoteFolderId === folder.id;
                const count = folder._count?.notes ?? 0;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setSelectedNoteFolderId(folder.id)}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shrink-0 transition-all active:scale-95 cursor-pointer touch-manipulation",
                      isSelected
                        ? "shadow-md font-bold"
                        : "border-border/70 bg-card text-foreground hover:bg-muted/40"
                    )}
                    style={
                      isSelected
                        ? {
                            borderColor: `${folder.color || "#06b6d4"}80`,
                            backgroundColor: `${folder.color || "#06b6d4"}18`,
                            color: folder.color || "#06b6d4",
                            boxShadow: `0 2px 12px ${folder.color || "#06b6d4"}25`,
                          }
                        : {}
                    }
                  >
                    <span>{folder.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State for Note Collections */}
          {noteFolders.length === 0 && !loadingNoteFolders && (
            <Card className="border border-border/80 bg-card/70 rounded-3xl shadow-xs glass-panel">
              <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-2xl">
                  <h2 className="text-base font-bold text-foreground font-heading">{t("collections.emptyNoteCollectionsTitle")}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("collections.emptyNoteCollectionsDesc")}
                  </p>
                </div>
                <Button onClick={() => handleOpenNoteFolderModal()} className="gap-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-sm bg-cyan-500 hover:bg-cyan-600 text-white">
                  <FolderPlus className="h-4 w-4" />
                  <span>{t("collections.createNoteCollectionBtn")}</span>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Grid Layout (Sidebar + Notes View) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Desktop Sidebar List */}
            <div className="hidden lg:block space-y-2.5">
              {loadingNoteFolders ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-muted/60 rounded-2xl animate-pulse" />
                ))
              ) : (
                noteFolders.map((folder, i) => {
                  const isSelected = selectedNoteFolderId === folder.id;
                  const folderColor = folder.color || "#06b6d4";
                  const count = folder._count?.notes ?? 0;

                  return (
                    <motion.button
                      key={folder.id}
                      type="button"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedNoteFolderId(folder.id)}
                      className={`flex items-center gap-3.5 w-full p-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.98] cursor-pointer text-left touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group ${
                        isSelected
                          ? "shadow-md"
                          : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: `${folderColor}80`,
                            }
                          : {}
                      }
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-xs transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundColor: `${folderColor}20`,
                          borderColor: `${folderColor}40`,
                          color: folderColor,
                          boxShadow: isSelected ? `0 0 14px ${folderColor}35` : undefined,
                        }}
                      >
                        <FileText className="h-4.5 w-4.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-bold text-sm truncate transition-colors text-foreground",
                            isSelected ? "font-extrabold" : "group-hover:text-cyan-500"
                          )}
                          style={isSelected ? { color: folderColor } : {}}
                        >
                          {folder.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {t("collections.savedNotesCount", { count })}
                        </p>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Selected Note Folder Detail View */}
            <div className="lg:col-span-2">
              {selectedNoteFolder ? (
                <div className="space-y-4">
                  {/* Selected Note Folder Banner */}
                  <div
                    className="relative flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-3xl border transition-all overflow-hidden bg-card shadow-sm gap-4"
                    style={{
                      borderColor: `${selectedNoteFolder.color || "#06b6d4"}80`,
                    }}
                  >
                    <div className="relative z-10 flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${selectedNoteFolder.color || "#06b6d4"}15`,
                          borderColor: `${selectedNoteFolder.color || "#06b6d4"}60`,
                          color: selectedNoteFolder.color || "#06b6d4",
                        }}
                      >
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h2
                          className="font-black text-lg sm:text-2xl tracking-tight flex items-center gap-2 font-heading"
                          style={{ color: selectedNoteFolder.color || "#06b6d4" }}
                        >
                          {selectedNoteFolder.name}
                        </h2>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                          {t("collections.savedNotesCount", { count: folderNotes.length })}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        onClick={handleCreateNoteInFolder}
                        disabled={creatingNoteInFolder}
                        size="sm"
                        className="rounded-xl text-xs font-semibold gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer shadow-xs h-8 px-3"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{creatingNoteInFolder ? t("common.loading") : t("notes.newNoteBtn")}</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenNoteFolderModal(selectedNoteFolder)}
                        className="rounded-xl text-xs h-8 cursor-pointer shadow-xs gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteNoteFolderDialogOpen(true)}
                        className="text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Notes List Grid */}
                  {loadingFolderNotes ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-40 bg-muted/60 rounded-3xl animate-pulse" />
                      ))}
                    </div>
                  ) : folderNotes.length === 0 ? (
                    <Card className="border-dashed rounded-3xl min-h-[220px] flex items-center justify-center bg-card/50">
                      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <p className="text-xs font-medium text-muted-foreground">{t("collections.emptyInNoteCollection")}</p>
                        <Button
                          size="sm"
                          className="mt-3 gap-1.5 rounded-xl text-xs font-semibold cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-white"
                          onClick={handleCreateNoteInFolder}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{t("collections.createFirstNoteInCollection")}</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {folderNotes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => router.push(`/notes/${note.id}`)}
                          className="group p-5 rounded-3xl glass-panel border border-border/60 hover:border-cyan-500/40 transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between h-44 relative overflow-hidden bg-card/70"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-foreground font-heading line-clamp-1 text-base group-hover:text-cyan-500 transition-colors">
                                {note.title || t("notes.untitledNote")}
                              </h3>
                              <div className="flex items-center gap-1 shrink-0">
                                {note.isPinned && <Pin className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />}
                                {note.isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                              {getCleanSnippet(note.content)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 opacity-70" />
                              {new Date(note.updatedAt).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1 text-cyan-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Buka</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Card className="border-dashed rounded-3xl h-full min-h-[260px] flex items-center justify-center bg-card/30">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <p className="text-xs font-medium">{t("collections.selectNoteCollectionHint")}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DIALOG: BUAT/EDIT KOLEKSI TAUTAN ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-primary/20 shadow-2xl backdrop-blur-2xl space-y-5">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground">{t("collections.modalCreateTitle")}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">{t("collections.modalCreateDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="col-name" className="text-sm font-bold text-foreground">{t("collections.nameLabel")}</Label>
              <Input
                id="col-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("collections.namePlaceholder")}
                className="rounded-xl text-sm sm:text-base h-11 sm:h-12 px-4 bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 focus-visible:ring-primary/50"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-foreground">{t("collections.colorLabel")}</Label>
              <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-2xl bg-foreground/[0.03] border border-border/50">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = newColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setNewColor(preset.hex)}
                      title={preset.name}
                      className={cn(
                        "w-8 h-8 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center relative touch-manipulation select-none",
                        isSelected
                          ? "scale-110 shadow-lg ring-2 ring-foreground/40 ring-offset-2 ring-offset-background"
                          : "hover:scale-105 opacity-80 hover:opacity-100"
                      )}
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md animate-pulse" />}
                    </button>
                  );
                })}

                <div className="relative group flex items-center justify-center">
                  <input
                    id="col-color"
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-8 h-8 rounded-xl p-0 border-0 cursor-pointer opacity-0 absolute inset-0 z-10"
                    title={locale === "en" ? "Custom color picker" : "Pilih warna kustom"}
                  />
                  <div
                    className="w-8 h-8 rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-extrabold transition-all pointer-events-none shadow-xs"
                    style={{ backgroundColor: `${newColor}30`, borderColor: newColor, color: newColor }}
                  >
                    +
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                {locale === "en" ? "Live Folder Preview" : "Pratinjau Tampilan Koleksi"}
              </span>
              <div
                className="p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 relative overflow-hidden shadow-md"
                style={{
                  borderColor: `${newColor}60`,
                  backgroundColor: `${newColor}12`,
                  boxShadow: `0 6px 24px ${newColor}20`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-all"
                  style={{
                    backgroundColor: `${newColor}25`,
                    borderColor: `${newColor}50`,
                    color: newColor,
                    boxShadow: `0 0 16px ${newColor}30`,
                  }}
                >
                  <FolderOpen className="h-5.5 w-5.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-sm truncate text-foreground">
                    {newName.trim() || (locale === "en" ? "New Collection" : "Nama Koleksi Baru")}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    {locale === "en" ? "0 Saved Links" : "0 Tautan Tersimpan"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="rounded-xl text-xs cursor-pointer">
                {t("common.cancel")}
              </Button>
              <Button size="sm" onClick={handleCreateLinkCollection} className="rounded-xl text-xs font-bold cursor-pointer shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                {t("collections.createBtn")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG: BUAT/EDIT KOLEKSI CATATAN ── */}
      <Dialog open={noteFolderDialogOpen} onOpenChange={setNoteFolderDialogOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl space-y-5">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground">
              {editingNoteFolder ? t("collections.modalEditNoteFolderTitle") : t("collections.modalCreateNoteFolderTitle")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t("collections.modalCreateNoteFolderDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNoteFolder} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="note-folder-name" className="text-sm font-bold text-foreground">{t("collections.nameLabel")}</Label>
              <Input
                id="note-folder-name"
                value={noteFolderName}
                onChange={(e) => setNoteFolderName(e.target.value)}
                placeholder={t("collections.namePlaceholder")}
                className="rounded-xl text-sm sm:text-base h-11 sm:h-12 px-4 bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 focus-visible:ring-cyan-500/50"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-foreground">{t("collections.colorLabel")}</Label>
              <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-2xl bg-foreground/[0.03] border border-border/50">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = noteFolderColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setNoteFolderColor(preset.hex)}
                      title={preset.name}
                      className={cn(
                        "w-8 h-8 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center relative touch-manipulation select-none",
                        isSelected
                          ? "scale-110 shadow-lg ring-2 ring-foreground/40 ring-offset-2 ring-offset-background"
                          : "hover:scale-105 opacity-80 hover:opacity-100"
                      )}
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md animate-pulse" />}
                    </button>
                  );
                })}

                <div className="relative group flex items-center justify-center">
                  <input
                    id="note-folder-color"
                    type="color"
                    value={noteFolderColor}
                    onChange={(e) => setNoteFolderColor(e.target.value)}
                    className="w-8 h-8 rounded-xl p-0 border-0 cursor-pointer opacity-0 absolute inset-0 z-10"
                    title={locale === "en" ? "Custom color picker" : "Pilih warna kustom"}
                  />
                  <div
                    className="w-8 h-8 rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-extrabold transition-all pointer-events-none shadow-xs"
                    style={{ backgroundColor: `${noteFolderColor}30`, borderColor: noteFolderColor, color: noteFolderColor }}
                  >
                    +
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                {locale === "en" ? "Live Folder Preview" : "Pratinjau Tampilan Koleksi"}
              </span>
              <div
                className="p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 relative overflow-hidden shadow-md"
                style={{
                  borderColor: `${noteFolderColor}60`,
                  backgroundColor: `${noteFolderColor}12`,
                  boxShadow: `0 6px 24px ${noteFolderColor}20`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-all"
                  style={{
                    backgroundColor: `${noteFolderColor}25`,
                    borderColor: `${noteFolderColor}50`,
                    color: noteFolderColor,
                    boxShadow: `0 0 16px ${noteFolderColor}30`,
                  }}
                >
                  <FileText className="h-5.5 w-5.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-sm truncate text-foreground">
                    {noteFolderName.trim() || (locale === "en" ? "New Note Collection" : "Koleksi Catatan Baru")}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    {locale === "en" ? "0 Saved Notes" : "0 Catatan Tersimpan"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button type="button" variant="outline" size="sm" onClick={() => setNoteFolderDialogOpen(false)} className="rounded-xl text-xs cursor-pointer">
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={savingNoteFolder} size="sm" className="rounded-xl text-xs font-bold cursor-pointer shadow-sm bg-cyan-500 hover:bg-cyan-600 text-white">
                {savingNoteFolder ? t("common.loading") : t("common.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MANAGE LINKS IN LINK COLLECTION DIALOG ── */}
      {selectedLinkCollection && (
        <AddLinksToCollectionDialog
          collection={selectedLinkCollection}
          open={manageLinksOpen}
          onOpenChange={setManageLinksOpen}
          existingLinks={collectionLinks}
          onUpdate={triggerRefresh}
        />
      )}

      {/* ── CONFIRM DELETE LINK COLLECTION DIALOG ── */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("collections.deleteConfirmTitle")}
        description={t("collections.deleteConfirmDesc")}
        onConfirm={executeDeleteCollection}
      />

      {/* ── CONFIRM DELETE NOTE COLLECTION DIALOG ── */}
      <ConfirmDialog
        open={deleteNoteFolderDialogOpen}
        onOpenChange={setDeleteNoteFolderDialogOpen}
        title={t("collections.deleteNoteFolderConfirmTitle")}
        description={t("collections.deleteNoteFolderConfirmDesc")}
        onConfirm={executeDeleteNoteFolder}
      />
    </div>
  );
}
