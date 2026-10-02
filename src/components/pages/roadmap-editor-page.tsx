"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  LayoutGrid,
  List,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoadmapCanvas } from "@/components/roadmap/roadmap-canvas";
import { RoadmapListView } from "@/components/roadmap/roadmap-list-view";
import { AddNodeDialog } from "@/components/roadmap/add-node-dialog";
import { AIRoadmapGeneratorDialog } from "@/components/roadmap/ai-roadmap-generator-dialog";
import { toast } from "@/components/ui/custom-toast";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SerializedRoadmap, SerializedRoadmapNode } from "@/lib/types";
import { useTranslation } from "@/components/providers/i18n-provider";
import { deleteRoadmap } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

interface RoadmapEditorPageProps {
  roadmapId: string;
}

export function RoadmapEditorPage({ roadmapId }: RoadmapEditorPageProps) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { requireAuth } = useRequireAuth();

  const [roadmap, setRoadmap] = useState<SerializedRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"CANVAS" | "LIST">("CANVAS");
  const [addNodeDialogOpen, setAddNodeDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch Roadmap Details
  const fetchRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/roadmaps/${roadmapId}`);
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data);
      } else {
        toast.error(locale === "en" ? "Roadmap not found" : "Roadmap tidak ditemukan", locale === "en" ? "Error" : "Error");
        router.push("/roadmaps");
      }
    } catch (_err) {
      toast.error(locale === "en" ? "Failed to load roadmap details" : "Gagal memuat detail roadmap", locale === "en" ? "Error" : "Error");
    } finally {
      setLoading(false);
    }
  }, [roadmapId, router, locale]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  // Handle Node Addition
  const handleAddNode = async (nodeData: {
    type: "LINK" | "TASK" | "NOTE";
    title: string;
    description?: string;
    linkId?: string;
  }) => {
    if (!roadmap) return;
    try {
      // Offset initial position slightly
      const count = roadmap.nodes.length;
      const positionX = 80 + (count % 3) * 300;
      const positionY = 80 + Math.floor(count / 3) * 180;

      const res = await fetch(`/api/roadmaps/${roadmapId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nodeData,
          positionX,
          positionY,
        }),
      });

      if (res.ok) {
        toast.success(locale === "en" ? "New step added successfully" : "Langkah baru berhasil ditambahkan", locale === "en" ? "Success" : "Berhasil");
        fetchRoadmap();
      } else {
        const err = await res.json();
        toast.error(err.error || (locale === "en" ? "Failed to add node" : "Gagal menambah node"), locale === "en" ? "Error" : "Error");
      }
    } catch (_err) {
      toast.error(locale === "en" ? "Network error occurred" : "Terjadi kesalahan jaringan", locale === "en" ? "Error" : "Error");
    }
  };

  // Handle Batch Position Update
  const handleNodePositionChange = async (
    positions: { id: string; positionX: number; positionY: number }[]
  ) => {
    if (!roadmap) return;
    try {
      await fetch(`/api/roadmaps/${roadmapId}/nodes/batch-position`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions }),
      });
    } catch (err) {
      console.error("Gagal menyimpan posisi node:", err);
    }
  };

  // Handle Status Update (Optimistic UI)
  const handleStatusChange = async (
    nodeId: string,
    status: "TODO" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    if (!roadmap) return;

    // Optimistic state update
    const updatedNodes = roadmap.nodes.map((n: SerializedRoadmapNode) =>
      n.id === nodeId ? { ...n, status } : n
    );
    const totalNodes = updatedNodes.length;
    const completedNodes = updatedNodes.filter((n: SerializedRoadmapNode) => n.status === "COMPLETED").length;
    const progressPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    setRoadmap({
      ...roadmap,
      nodes: updatedNodes,
      completedNodes,
      progressPercent,
    });

    try {
      const res = await fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        fetchRoadmap(); // Rollback if server rejects
      }
    } catch (_err) {
      fetchRoadmap();
    }
  };

  // Handle Node Deletion
  const handleDeleteNode = async (nodeId: string) => {
    if (!roadmap) return;
    try {
      const res = await fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(locale === "en" ? "Step deleted successfully" : "Langkah berhasil dihapus", locale === "en" ? "Deleted" : "Dihapus");
        fetchRoadmap();
      } else {
        toast.error(locale === "en" ? "Failed to delete step" : "Gagal menghapus langkah", locale === "en" ? "Error" : "Error");
      }
    } catch (_err) {
      toast.error(locale === "en" ? "Network error occurred" : "Terjadi kesalahan jaringan", locale === "en" ? "Error" : "Error");
    }
  };

  // Handle Edge Addition
  const handleAddEdge = async (sourceNodeId: string, targetNodeId: string) => {
    if (!roadmap) return;
    try {
      const res = await fetch(`/api/roadmaps/${roadmapId}/edges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceNodeId, targetNodeId }),
      });
      if (res.ok) {
        toast.success(locale === "en" ? "Connection created successfully" : "Koneksi berhasil dibuat", locale === "en" ? "Connected" : "Terhubung");
        fetchRoadmap();
      } else {
        const errData = await res.json();
        toast.error(errData.error || (locale === "en" ? "Failed to connect nodes" : "Gagal menghubungkan node"), locale === "en" ? "Error" : "Error");
      }
    } catch (_err) {
      toast.error(locale === "en" ? "Network error occurred" : "Terjadi kesalahan jaringan", locale === "en" ? "Error" : "Error");
    }
  };

  // Handle Edge Deletion
  const handleDeleteEdge = async (edgeId: string) => {
    if (!roadmap) return;
    try {
      const res = await fetch(`/api/roadmaps/${roadmapId}/edges/${edgeId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(locale === "en" ? "Connection removed" : "Koneksi terputus", locale === "en" ? "Success" : "Berhasil");
        fetchRoadmap();
      } else {
        toast.error(locale === "en" ? "Failed to delete connection" : "Gagal menghapus koneksi", locale === "en" ? "Error" : "Error");
      }
    } catch (_err) {
      toast.error(locale === "en" ? "Network error occurred" : "Terjadi kesalahan jaringan", locale === "en" ? "Error" : "Error");
    }
  };

  // Handle Roadmap Deletion
  const handleDeleteRoadmapConfirm = async () => {
    try {
      const res = await deleteRoadmap(roadmapId);
      if (res.ok) {
        toast.success(locale === "en" ? "Roadmap deleted successfully" : "Roadmap berhasil dihapus", locale === "en" ? "Deleted" : "Dihapus");
        router.push("/roadmaps");
      }
    } catch (_err) {
      toast.error(locale === "en" ? "Failed to delete roadmap" : "Gagal menghapus roadmap", locale === "en" ? "Error" : "Error");
    }
  };

  if (loading || !roadmap) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">
          {locale === "en" ? "Loading your roadmap..." : "Memuat roadmap Anda..."}
        </p>
      </div>
    );
  }

  const isCompletedAll = roadmap.totalNodes > 0 && roadmap.progressPercent === 100;

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl border border-border/60 glass-panel bg-card/95 shadow-xs">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/roadmaps")}
              className="h-8 gap-1 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("common.back")}</span>
            </Button>

            <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground truncate">
              {roadmap.title}
            </h1>
          </div>

          {roadmap.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {roadmap.description}
            </p>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 pt-1 text-xs">
            <span className="font-semibold text-foreground">
              {roadmap.completedNodes} {locale === "en" ? "of" : "dari"} {roadmap.totalNodes} {locale === "en" ? "Steps Completed" : "Langkah Selesai"} ({roadmap.progressPercent}%)
            </span>
            <div className="h-2 w-36 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isCompletedAll
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-primary to-accent"
                )}
                style={{ width: `${roadmap.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* View Mode Toggle Button */}
          <div className="flex items-center p-1 rounded-xl bg-muted border border-border/50 text-xs">
            <button
              onClick={() => setViewMode("CANVAS")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
                viewMode === "CANVAS"
                  ? "bg-background text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === "en" ? "Canvas" : "Kanvas"}</span>
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer",
                viewMode === "LIST"
                  ? "bg-background text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === "en" ? "List" : "Daftar"}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (requireAuth(locale === "en" ? "AI Step Suggestions" : "Saran Langkah AI", locale === "en" ? "Sign in or sign up for free to use Liko AI assistant in designing structured workflows." : "Masuk atau daftar gratis untuk menggunakan asisten Liko AI dalam merancang alur kerja terstruktur.")) return;
              setAiDialogOpen(true);
            }}
            className="p-[2px] rounded-full bg-gradient-to-r from-[#00d8ff] via-[#6366f1] via-[#9333ea] to-[#f43f5e] inline-flex items-center justify-center shrink-0 active:scale-95 transition-transform duration-150 cursor-pointer focus:outline-none group shadow-xs"
          >
            <span className="bg-card hover:bg-card/90 active:bg-card text-foreground font-semibold h-9 px-4 rounded-full text-xs transition-colors flex items-center justify-center whitespace-nowrap select-none">
              {locale === "en" ? "AI Step Suggestions" : "Saran Langkah AI"}
            </span>
          </button>

          <Button
            onClick={() => setAddNodeDialogOpen(true)}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold gap-1.5 text-xs h-9 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === "en" ? "Add Step" : "Tambah Langkah"}</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
            title={locale === "en" ? "Delete Roadmap" : "Hapus Roadmap"}
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas View Mode vs List View Mode */}
      {viewMode === "CANVAS" ? (
        <RoadmapCanvas
          roadmapId={roadmapId}
          nodes={roadmap.nodes}
          edges={roadmap.edges}
          onNodePositionChange={handleNodePositionChange}
          onStatusChange={handleStatusChange}
          onDeleteNode={handleDeleteNode}
          onAddEdge={handleAddEdge}
          onDeleteEdge={handleDeleteEdge}
          onOpenAddNode={() => setAddNodeDialogOpen(true)}
        />
      ) : (
        <RoadmapListView
          nodes={roadmap.nodes}
          edges={roadmap.edges}
          onStatusChange={handleStatusChange}
          onDeleteNode={handleDeleteNode}
          onAddEdge={handleAddEdge}
          onDeleteEdge={handleDeleteEdge}
          onOpenAddNode={() => setAddNodeDialogOpen(true)}
        />
      )}

      {/* AI Roadmap Generator Dialog */}
      <AIRoadmapGeneratorDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        existingRoadmapId={roadmapId}
        onGenerated={fetchRoadmap}
      />

      {/* Add Node Dialog */}
      <AddNodeDialog
        open={addNodeDialogOpen}
        onOpenChange={setAddNodeDialogOpen}
        onSubmit={handleAddNode}
      />

      {/* Delete Roadmap Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("roadmaps.deleteTitle")}
        description={t("roadmaps.deleteConfirm")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        destructive={true}
        onConfirm={handleDeleteRoadmapConfirm}
      />
    </div>
  );
}
