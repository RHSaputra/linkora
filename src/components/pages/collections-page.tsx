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

interface CollectionsPageProps {
  refreshKey: number;
  triggerRefresh: () => void;
  openEditLink: (link: SerializedLink) => void;
}

export function CollectionsPage({
  refreshKey,
  triggerRefresh,
  openEditLink,
}: CollectionsPageProps) {
  const { requireAuth } = useRequireAuth();
  const { t, locale } = useTranslation();
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
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("collections.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("collections.subtitle")}</p>
        </motion.div>
        <Button onClick={handleOpenCreate} className="gap-1.5 rounded-xl text-xs font-semibold cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>{t("collections.createBtn")}</span>
        </Button>
      </div>

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
        <div className="space-y-2.5">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-muted/60 rounded-xl animate-pulse" />
            ))
          ) : (
            collections.map((col, i) => {
              return (
                <motion.button
                  key={col.id}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedId(col.id)}
                  className={`flex items-center gap-3 w-full p-3.5 rounded-xl border transition-all duration-150 active:scale-[0.98] cursor-pointer text-left touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    selectedId === col.id
                      ? "border-primary/50 bg-primary/5 shadow-xs"
                      : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground">{col.name}</p>
                    <p className="text-xs text-muted-foreground">{t("collections.linkCount", { count: col.linkCount })}</p>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/80">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: selected.color }}
                  />
                  <div>
                    <h2 className="font-bold text-base text-foreground">{selected.name}</h2>
                    <p className="text-xs text-muted-foreground">{t("collections.savedLinksCount", { count: collectionLinks.length })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setManageLinksOpen(true)} className="rounded-lg text-xs h-8">
                    {t("collections.manageLinks")}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDeleteCollection} className="text-destructive hover:bg-destructive/10 rounded-lg h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {loadingLinks ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collectionLinks.map((link, i) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      index={i}
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{t("collections.modalCreateTitle")}</DialogTitle>
            <DialogDescription className="text-xs">{t("collections.modalCreateDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="col-name" className="text-xs font-semibold">{t("collections.nameLabel")}</Label>
              <Input
                id="col-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("collections.namePlaceholder")}
                className="rounded-xl text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="col-color" className="text-xs font-semibold">{t("collections.colorLabel")}</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="col-color"
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="h-8 w-16 p-0.5 rounded-lg cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">{t("collections.colorDesc")}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="rounded-xl text-xs">
                {t("common.cancel")}
              </Button>
              <Button size="sm" onClick={handleCreate} className="rounded-xl text-xs font-medium">
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
