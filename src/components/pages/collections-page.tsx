"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Plus, Briefcase, GraduationCap, Code, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { COLLECTION_PRESETS } from "@/lib/utils";
import { SerializedLink } from "@/lib/types";

import { AddLinksToCollectionDialog } from "@/components/links/add-links-to-collection-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  code: Code,
  folder: FolderOpen,
};

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

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createCollection(newName.trim(), newColor);
    setNewName("");
    setCreateOpen(false);
  };

  const handlePreset = async (preset: (typeof COLLECTION_PRESETS)[0]) => {
    await createCollection(preset.name, preset.color, preset.icon);
  };

  const executeDeleteCollection = async () => {
    if (!selectedId) return;
    await deleteCollection(selectedId);
    setSelectedId(null);
    refresh();
    triggerRefresh();
  };

  const handleDeleteCollection = () => {
    setDeleteDialogOpen(true);
  };

  const selected = collections.find((c) => c.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground mt-1">Organisasi link dalam folder</p>
        </motion.div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Buat Koleksi
        </Button>
      </div>

      {collections.length === 0 && !loading && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Buat koleksi preset atau buat sendiri
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COLLECTION_PRESETS.map((preset) => {
                const Icon = iconMap[preset.icon] || FolderOpen;
                return (
                  <button
                    key={preset.name}
                    onClick={() => handlePreset(preset)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-accent/50 transition-all cursor-pointer text-left"
                  >
                    <div
                      className="p-2.5 rounded-lg"
                      style={{ backgroundColor: `${preset.color}20`, color: preset.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-sm">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))
          ) : (
            collections.map((col, i) => {
              const Icon = iconMap[col.icon] || FolderOpen;
              return (
                <motion.button
                  key={col.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedId(col.id)}
                  className={`flex items-center gap-3 w-full p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    selectedId === col.id
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:border-primary/20 hover:bg-accent/30"
                  }`}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${col.color}20`, color: col.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{col.name}</p>
                    <p className="text-xs text-muted-foreground">{col.linkCount} links</p>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selected.name}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setManageLinksOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Atur Isi Koleksi
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeleteCollection}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {loadingLinks ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-36 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : collectionLinks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {collectionLinks.map((link, i) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      index={i}
                      collectionId={selectedId ?? undefined}
                      onUpdate={() => {
                        triggerRefresh();
                      }}
                      onEdit={openEditLink}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <Card className="glass border-dashed max-w-sm w-full">
                    <CardContent className="py-12 text-center">
                      <FolderOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Koleksi ini masih kosong.
                      </p>
                      <Button onClick={() => setManageLinksOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Tautan
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Card className="glass border-dashed h-full min-h-[300px]">
              <CardContent className="flex flex-col items-center justify-center h-full py-16">
                <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-sm">Pilih koleksi untuk melihat isinya</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Koleksi Baru</DialogTitle>
            <DialogDescription>Organisasi link dalam folder kustom</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="col-name">Nama Koleksi</Label>
              <Input
                id="col-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Magang 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="col-color">Warna</Label>
              <Input
                id="col-color"
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-10 w-full cursor-pointer"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreate}>Buat</Button>
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
        title="Hapus Koleksi"
        description="Hapus koleksi ini secara permanen? Semua tautan di dalamnya tidak akan terhapus, hanya koleksinya saja yang hilang."
        onConfirm={executeDeleteCollection}
      />
    </div>
  );
}
