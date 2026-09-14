"use client";

import React from "react";
import { SerializedRoadmapNode, SerializedRoadmapEdge } from "@/lib/types";
import {
  Link2,
  CheckSquare,
  StickyNote,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  Circle,
  ArrowDown,
  Globe,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoadmapListViewProps {
  nodes: SerializedRoadmapNode[];
  edges: SerializedRoadmapEdge[];
  onStatusChange: (nodeId: string, status: "TODO" | "IN_PROGRESS" | "COMPLETED") => void;
  onDeleteNode: (nodeId: string) => void;
  onAddEdge: (sourceNodeId: string, targetNodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onOpenAddNode: () => void;
}

export function RoadmapListView({
  nodes,
  edges,
  onStatusChange,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
  onOpenAddNode,
}: RoadmapListViewProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/60 rounded-2xl bg-card/50 my-6 space-y-3">
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h3 className="text-base font-heading font-semibold text-foreground">
          Belum ada langkah dalam roadmap ini
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Tambahkan langkah pertama Anda untuk mulai menyusun alur kerja.
        </p>
        <Button
          onClick={onOpenAddNode}
          className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold gap-2 mt-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Langkah</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto py-4">
      {nodes.map((node, index) => {
        const isCompleted = node.status === "COMPLETED";
        const isInProgress = node.status === "IN_PROGRESS";

        // Find connected target nodes
        const outgoingEdges = edges.filter((e) => e.sourceNodeId === node.id);
        const connectedTargetIds = outgoingEdges.map((e) => e.targetNodeId);
        const targetNodes = nodes.filter((n) => connectedTargetIds.includes(n.id));

        return (
          <React.Fragment key={node.id}>
            <div
              className={cn(
                "p-5 rounded-2xl border transition-all glass-panel bg-card/95 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                isCompleted
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : isInProgress
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-border/60 hover:border-primary/40"
              )}
            >
              <div className="space-y-2 flex-1">
                {/* Header row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-muted-foreground w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-border/50">
                    {index + 1}
                  </span>

                  {node.type === "LINK" && (
                    <Badge variant="outline" className="text-[10px] gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                      <Link2 className="w-3 h-3" /> Link
                    </Badge>
                  )}
                  {node.type === "TASK" && (
                    <Badge variant="outline" className="text-[10px] gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30">
                      <CheckSquare className="w-3 h-3" /> Task
                    </Badge>
                  )}
                  {node.type === "NOTE" && (
                    <Badge variant="outline" className="text-[10px] gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                      <StickyNote className="w-3 h-3" /> Note
                    </Badge>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h4
                    className={cn(
                      "text-base font-semibold text-foreground",
                      isCompleted && "line-through text-muted-foreground"
                    )}
                  >
                    {node.title}
                  </h4>
                  {node.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {node.description}
                    </p>
                  )}
                </div>

                {/* Attached Link chip */}
                {node.type === "LINK" && node.link && (
                  <a
                    href={node.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/20 bg-background/80 hover:bg-muted text-xs transition-colors font-medium text-foreground hover:text-primary mt-2"
                  >
                    {node.link.favicon ? (
                      <img src={node.link.favicon} alt="" className="w-3.5 h-3.5 rounded object-contain shrink-0" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate max-w-xs">{node.link.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </a>
                )}

                {/* Connections summary */}
                {targetNodes.length > 0 && (
                  <div className="pt-2 flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
                    <span className="font-medium">Langkah selanjutnya:</span>
                    {targetNodes.map((target) => (
                      <span
                        key={target.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground border border-border/50"
                      >
                        <ArrowRight className="w-3 h-3 text-primary" /> {target.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                <select
                  value={node.status}
                  onChange={(e) => onStatusChange(node.id, e.target.value as any)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer bg-background",
                    isCompleted
                      ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                      : isInProgress
                      ? "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                      : "border-border text-muted-foreground"
                  )}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">Dalam Proses</option>
                  <option value="COMPLETED">Selesai</option>
                </select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteNode(node.id)}
                  className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Hapus</span>
                </Button>
              </div>
            </div>

            {/* Connecting Step Arrow */}
            {index < nodes.length - 1 && (
              <div className="flex justify-center my-1 text-muted-foreground/40">
                <ArrowDown className="w-4 h-4" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
