"use client";

import React, { useState } from "react";
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
  Check,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const [nodeToDelete, setNodeToDelete] = useState<SerializedRoadmapNode | null>(null);

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
    <div className="max-w-3xl mx-auto py-6 px-2 sm:px-4">
      {/* Connected Vertical Timeline Spine */}
      <div className="relative border-l-2 border-dashed border-primary/20 dark:border-primary/30 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
        {nodes.map((node, index) => {
          const isCompleted = node.status === "COMPLETED";
          const isInProgress = node.status === "IN_PROGRESS";
          const formattedIndex = String(index + 1).padStart(2, "0");

          // Find connected target nodes
          const outgoingEdges = edges.filter((e) => e.sourceNodeId === node.id);
          const connectedTargetIds = outgoingEdges.map((e) => e.targetNodeId);
          const targetNodes = nodes.filter((n) => connectedTargetIds.includes(n.id));

          return (
            <div key={node.id} className="relative group/timeline-item">
              {/* Timeline Spine Anchor Badge */}
              <div
                className={cn(
                  "absolute -left-[calc(1.5rem+17px)] sm:-left-[calc(2rem+17px)] top-4 w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 z-10 shadow-md",
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-emerald-500/30 ring-4 ring-emerald-500/20 animate-checkmark-pop"
                    : isInProgress
                    ? "bg-amber-500 text-white shadow-amber-500/30 ring-4 ring-amber-500/20 animate-pulse"
                    : "bg-card border-2 border-primary/50 text-primary shadow-primary/10 group-hover/timeline-item:border-primary group-hover/timeline-item:scale-110"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <span>{formattedIndex}</span>
                )}
              </div>

              {/* Main Step Glass Card */}
              <div
                className={cn(
                  "p-5 rounded-2xl border transition-all duration-300 glass-panel bg-card/95 shadow-xs hover:shadow-xl relative overflow-hidden flex flex-col justify-between gap-4",
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10 shadow-emerald-500/5"
                    : isInProgress
                    ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/10 shadow-amber-500/5"
                    : "border-border/80 hover:border-primary/50"
                )}
              >
                {/* Top Status Accent Ribbon Bar */}
                <div
                  className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    isCompleted
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                      : isInProgress
                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                      : "bg-gradient-to-r from-primary/30 to-accent/30"
                  )}
                />

                <div className="space-y-3 flex-1 pt-1">
                  {/* Header Row: Type Badge & Status Selector */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {node.type === "LINK" && (
                        <Badge variant="outline" className="text-[10px] gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 px-2.5 py-0.5 font-semibold">
                          <Link2 className="w-3 h-3" /> Link
                        </Badge>
                      )}
                      {node.type === "TASK" && (
                        <Badge variant="outline" className="text-[10px] gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 px-2.5 py-0.5 font-semibold">
                          <CheckSquare className="w-3 h-3" /> Task
                        </Badge>
                      )}
                      {node.type === "NOTE" && (
                        <Badge variant="outline" className="text-[10px] gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 px-2.5 py-0.5 font-semibold">
                          <StickyNote className="w-3 h-3" /> Note
                        </Badge>
                      )}
                    </div>

                    {/* Integrated Status Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border transition-all cursor-pointer outline-none shadow-xs group active:scale-95",
                            isCompleted
                              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                              : isInProgress
                              ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25"
                              : "border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full animate-pulse",
                              isCompleted ? "bg-emerald-500" : isInProgress ? "bg-amber-500" : "bg-slate-400"
                            )}
                          />
                          <span>
                            {isCompleted ? "Selesai" : isInProgress ? "Dalam Proses" : "To Do"}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180 ml-0.5" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl border-border/80 bg-card/95 backdrop-blur-2xl shadow-xl space-y-1 z-50">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 px-2.5 py-1 font-mono">
                          Status Langkah
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-1 bg-border/40" />

                        <DropdownMenuItem
                          onClick={() => onStatusChange(node.id, "TODO")}
                          className={cn(
                            "flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors",
                            node.status === "TODO" ? "bg-muted font-semibold text-foreground" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-500 shrink-0">
                              <Circle className="w-3.5 h-3.5" />
                            </div>
                            <span>To Do</span>
                          </div>
                          {node.status === "TODO" && <Check className="w-4 h-4 text-primary stroke-[2.5]" />}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onStatusChange(node.id, "IN_PROGRESS")}
                          className={cn(
                            "flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors",
                            node.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold" : "hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
                              <Clock className="w-3.5 h-3.5" />
                            </div>
                            <span>Dalam Proses</span>
                          </div>
                          {node.status === "IN_PROGRESS" && <Check className="w-4 h-4 text-amber-500 stroke-[2.5]" />}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onStatusChange(node.id, "COMPLETED")}
                          className={cn(
                            "flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors",
                            node.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" : "hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                            <span>Selesai</span>
                          </div>
                          {node.status === "COMPLETED" && <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4
                      className={cn(
                        "text-base font-semibold text-foreground tracking-tight",
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

                  {/* Attached Link Chip */}
                  {node.type === "LINK" && node.link && (
                    <a
                      href={node.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary/20 bg-background/80 hover:bg-muted text-xs transition-colors font-medium text-foreground hover:text-primary mt-1"
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

                  {/* Connections Summary / Next Steps */}
                  {targetNodes.length > 0 && (
                    <div className="pt-2 flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
                      <span className="font-medium">Langkah selanjutnya:</span>
                      {targetNodes.map((target) => (
                        <span
                          key={target.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-xs font-semibold text-foreground border border-primary/20 shadow-2xs hover:bg-primary/20 transition-all group/next"
                        >
                          <ArrowRight className="w-4 h-4 text-primary stroke-[2.5] animate-roadmap-slide-right shrink-0" />
                          <span>{target.title}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Toolbar: Delete Button */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNodeToDelete(node)}
                    className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 rounded-lg h-8 px-2.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Langkah</span>
                  </Button>
                </div>
              </div>

              {/* Flow Connector Arrow Pill between timeline items */}
              {index < nodes.length - 1 && (
                <div className="absolute -left-[calc(1.5rem+13px)] sm:-left-[calc(2rem+13px)] -bottom-6 w-7 h-7 rounded-full bg-card border-2 border-primary/40 text-primary flex items-center justify-center z-10 shadow-xs">
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3] text-emerald-500 animate-checkmark-pop" />
                  ) : (
                    <ArrowDown className="w-4 h-4 stroke-[2.5] text-primary animate-roadmap-bounce" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!nodeToDelete}
        onOpenChange={(open) => !open && setNodeToDelete(null)}
        title="Hapus Langkah Roadmap"
        description={
          nodeToDelete
            ? `Apakah Anda yakin ingin menghapus langkah "${nodeToDelete.title}"? Seluruh alur yang terhubung dengan langkah ini akan disesuaikan.`
            : "Apakah Anda yakin ingin menghapus langkah ini?"
        }
        confirmText="Hapus"
        cancelText="Batal"
        destructive={true}
        onConfirm={() => {
          if (nodeToDelete) {
            onDeleteNode(nodeToDelete.id);
            setNodeToDelete(null);
          }
        }}
      />
    </div>
  );
}

