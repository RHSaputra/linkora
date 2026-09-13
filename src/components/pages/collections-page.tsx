"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Plus, Trash2 } from "lucide-react";
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
import { useCollections, deleteCollection } from "@/hooks/use-data";
import { SerializedLink } from "@/lib/types";
import { useRequireAuth } from "@/hooks/use-require-auth";

import { AddLinksToCollectionDialog } from "@/components/links/add-links-to-collection-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslation } from "@/components/providers/i18n-provider";
import { useViewMode } from "@/hooks/use-view-mode";
import { ViewModeSwitcher } from "@/components/ui/view-mode-switcher";
import { cn } from "@/lib/utils";

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
  const { requireAuth } = useRequireAuth();
  const { t, locale } = useTranslation();
  const [viewMode, setViewMode] = useViewMode();
  const { collections, loading, refresh } = useCollections();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collectionLinks, setCollectionLinks] = useState<SerializedLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [manageLinksOpen, setManageLinksOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (refreshKey > 0) refresh(true);
  }, [refreshKey, refresh]);

  useEffect(() => {
    if (selectedId) {
      setLoadingLinks(true);
      fetch(`/api/collections/${selectedId}`)
        .then((r) => r.json())
        .then((data) => setCollectionLinks(data.links || []))
        .finally(() => setLoadingLinks(false));
    }
  }, [selectedId, refreshKey]);

  const createCollection = async (name: string, color: string, icon = "folder") => {
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, icon }),
    });
    if (res.ok) {
      refresh();
      triggerRefresh();
    }
  };

  const handleOpenCreate = () => {
    if (requireAuth(
      locale === "en" ? "Create New Collection" : "Membuat Koleksi Baru",
      locale === "en" ? "Sign in or register for free to group and organize links into collections." : "Masuk atau daftar gratis untuk mengelompokkan dan mengorganisir tautan ke dalam folder koleksi."
    )) {
      return;
    }
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createCollection(newName.trim(), newColor);
    setNewName("");
    setCreateOpen(false);
  };

  const executeDeleteCollection = async () => {
    if (!selectedId) return;
    await deleteCollection(selectedId);
    setSelectedId(null);
    refresh();
    triggerRefresh();
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

  const selected = collections.find((c) => c.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("collections.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("collections.subtitle")}</p>
        </motion.div>
        <Button onClick={handleOpenCreate} className="self-start sm:self-auto gap-1.5 rounded-xl text-xs font-semibold cursor-pointer shadow-sm">
          <Plus className="h-4 w-4" />
          <span>{t("collections.createBtn")}</span>
        </Button>
      </div>

      {/* ── MOBILE COLLECTIONS CHIP SELECTOR (Horizontal Pill Track) ── */}
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

      {/* ── CLEAN & PROFESSIONAL EMPTY STATE ── */}
      {collections.length === 0 && !loading && (
        <Card className="border border-border/80 bg-card rounded-2xl shadow-xs">
          <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="text-base font-semibold text-foreground">{t("collections.emptyTitle")}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("collections.emptyDesc")}
              </p>
            </div>
            <Button onClick={handleOpenCreate} className="gap-2 rounded-xl text-xs font-medium shrink-0 cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>{t("collections.createNewBtn")}</span>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desktop Sidebar List */}
        <div className="hidden lg:block space-y-2.5">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-muted/60 rounded-xl animate-pulse" />
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
                          borderColor: `${col.color}60`,
                          backgroundColor: `${col.color}0F`,
                          boxShadow: `0 4px 16px ${col.color}20`,
                        }
                      : {}
                  }
                >
                  {/* Vibrant Glowing Folder Icon Badge */}
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

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              {/* Selected Collection Glowing Banner */}
              <div
                className="relative flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 rounded-2xl border transition-all overflow-hidden shadow-lg backdrop-blur-md gap-4"
                style={{
                  borderColor: `${selected.color}50`,
                  background: `linear-gradient(135deg, ${selected.color}15 0%, var(--card) 65%)`,
                  boxShadow: `0 8px 30px ${selected.color}18`,
                }}
              >
                {/* Ambient Glowing Radial Orb */}
                <div
                  className="absolute -right-10 -top-10 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-35"
                  style={{ backgroundColor: selected.color }}
                />

                <div className="relative z-10 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-md"
                    style={{
                      backgroundColor: `${selected.color}25`,
                      borderColor: `${selected.color}60`,
                      color: selected.color,
                      boxShadow: `0 0 20px ${selected.color}35`,
                    }}
                  >
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h2
                      className="font-black text-lg sm:text-2xl tracking-tight flex items-center gap-2"
                      style={{ color: selected.color }}
                    >
                      {selected.name}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {t("collections.savedLinksCount", { count: collectionLinks.length })}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 self-end sm:self-auto">
                  <ViewModeSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
                  <Button variant="outline" size="sm" onClick={() => setManageLinksOpen(true)} className="rounded-xl text-xs h-8 cursor-pointer shadow-xs">
                    {t("collections.manageLinks")}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDeleteCollection} className="text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8 cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {loadingLinks ? (
                <div className={viewMode === "compact" ? "flex flex-col gap-2.5 w-full" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className={viewMode === "compact" ? "h-14 bg-muted rounded-xl animate-pulse" : "h-48 bg-muted rounded-xl animate-pulse"} />
                  ))}
                </div>
              ) : collectionLinks.length === 0 ? (
                <Card className="border-dashed rounded-xl min-h-[220px] flex items-center justify-center bg-card/50">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-xs font-medium text-muted-foreground">{t("collections.emptyInCollection")}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 gap-1.5 rounded-lg text-xs"
                      onClick={() => setManageLinksOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{t("common.add")}</span>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === "compact" ? "flex flex-col gap-2.5 w-full" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                  {collectionLinks.map((link, i) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      index={i}
                      viewMode={viewMode}
                      collectionId={selected.id}
                      onUpdate={() => {
                        triggerRefresh();
                        refresh();
                      }}
                      onEdit={openEditLink}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card className="border-dashed rounded-xl h-full min-h-[260px] flex items-center justify-center bg-card/30">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p className="text-xs font-medium">{t("collections.selectCollectionHint")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── DIALOG: BUAT KOLEKSI BARU DENGAN COLOR PALETTE & LIVE PREVIEW ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl p-6 glass-panel border border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-heading text-foreground">{t("collections.modalCreateTitle")}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">{t("collections.modalCreateDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Input Nama Koleksi */}
            <div className="space-y-1.5">
              <Label htmlFor="col-name" className="text-xs font-bold text-foreground">{t("collections.nameLabel")}</Label>
              <Input
                id="col-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("collections.namePlaceholder")}
                className="rounded-xl text-xs h-10 bg-background/80 focus-visible:ring-primary/50"
              />
            </div>

            {/* Selection Palette Label Warna */}
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

                {/* Custom Color Input Trigger Button */}
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

            {/* Live Dynamic Folder Card Preview */}
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
              <Button size="sm" onClick={handleCreate} className="rounded-xl text-xs font-bold cursor-pointer shadow-sm">
                {t("collections.createBtn")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selected && (
        <AddLinksToCollectionDialog
          collection={selected}
          open={manageLinksOpen}
          onOpenChange={setManageLinksOpen}
          existingLinks={collectionLinks}
          onUpdate={triggerRefresh}
        />
      )}
      
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("collections.deleteConfirmTitle")}
        description={t("collections.deleteConfirmDesc")}
        onConfirm={executeDeleteCollection}
      />
    </div>
  );
}
