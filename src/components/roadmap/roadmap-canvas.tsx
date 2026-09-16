"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { SerializedRoadmapNode, SerializedRoadmapEdge } from "@/lib/types";
import { calculateAutoLayout } from "@/lib/roadmap-layout";
import {
  Link2,
  CheckSquare,
  StickyNote,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  Circle,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Unlink,
  Link as ConnectIcon,
  Globe,
  MoreVertical,
  LayoutGrid,
  ChevronDown,
  Check,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NodeDetailDialog } from "./node-detail-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface RoadmapCanvasProps {
  roadmapId: string;
  nodes: SerializedRoadmapNode[];
  edges: SerializedRoadmapEdge[];
  onNodePositionChange: (positions: { id: string; positionX: number; positionY: number }[]) => void;
  onStatusChange: (nodeId: string, status: "TODO" | "IN_PROGRESS" | "COMPLETED") => void;
  onDeleteNode: (nodeId: string) => void;
  onAddEdge: (sourceNodeId: string, targetNodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onOpenAddNode: () => void;
}

const NODE_WIDTH = 260;
const NODE_HEIGHT = 140;

export function RoadmapCanvas({
  roadmapId,
  nodes,
  edges,
  onNodePositionChange,
  onStatusChange,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
  onOpenAddNode,
}: RoadmapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Canvas viewport state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartPosRef = useRef({ pointerX: 0, pointerY: 0, nodeX: 0, nodeY: 0 });
  const hasDraggedRef = useRef(false);
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Node Detail Dialog State
  const [selectedNodeForDetail, setSelectedNodeForDetail] = useState<SerializedRoadmapNode | null>(null);

  // Connecting mode state
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Deletion confirmation state
  const [nodeToDelete, setNodeToDelete] = useState<SerializedRoadmapNode | null>(null);
  const [edgeToDeleteId, setEdgeToDeleteId] = useState<string | null>(null);

  // Sync positions when props change (unless dragging)
  useEffect(() => {
    const map: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      map[n.id] = { x: n.positionX || 0, y: n.positionY || 0 };
    });
    setLocalPositions(map);
  }, [nodes]);

  // Debounced position autosave
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queuePositionSave = useCallback(
    (nodeId: string, newX: number, newY: number) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onNodePositionChange([{ id: nodeId, positionX: newX, positionY: newY }]);
      }, 500);
    },
    [onNodePositionChange]
  );

  // Handle Zoom & Pan
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.15, 2.0));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.15, 0.4));
  const handleResetView = () => {
    setScale(1);
    setPan({ x: 40, y: 40 });
  };

  // Handle Auto Layout
  const handleAutoLayout = () => {
    const layouted = calculateAutoLayout(nodes, edges);
    const map: Record<string, { x: number; y: number }> = {};
    const updates: { id: string; positionX: number; positionY: number }[] = [];

    layouted.forEach((n) => {
      map[n.id] = { x: n.positionX, y: n.positionY };
      updates.push({ id: n.id, positionX: n.positionX, positionY: n.positionY });
    });

    setLocalPositions(map);
    onNodePositionChange(updates);
  };

  // Wheel zoom / pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setScale((s) => Math.min(Math.max(s * zoomFactor, 0.4), 2.0));
    } else {
      setPan((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const rafRef = useRef<number | null>(null);

  // Pan Canvas Mouse Handlers
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).id === "canvas-bg") {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (isPanning) {
        setPan({
          x: clientX - panStartRef.current.x,
          y: clientY - panStartRef.current.y,
        });
        return;
      }

      if (draggingNodeId) {
        const dx = (clientX - dragStartPosRef.current.pointerX) / scale;
        const dy = (clientY - dragStartPosRef.current.pointerY) / scale;

        if (Math.hypot(dx, dy) > 4) {
          hasDraggedRef.current = true;
        }

        const newX = Math.round(dragStartPosRef.current.nodeX + dx);
        const newY = Math.round(dragStartPosRef.current.nodeY + dy);

        setLocalPositions((prev) => ({
          ...prev,
          [draggingNodeId]: { x: newX, y: newY },
        }));

        queuePositionSave(draggingNodeId, newX, newY);
      }
    });
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
  };

  // Node Drag Handler
  const handleNodePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    hasDraggedRef.current = false;
    const current = localPositions[nodeId] || { x: 0, y: 0 };
    dragStartPosRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      nodeX: current.x,
      nodeY: current.y,
    };
  };

  // Connect click handler
  const handleNodeConnectClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectingSourceId) {
      setConnectingSourceId(nodeId);
    } else if (connectingSourceId === nodeId) {
      setConnectingSourceId(null);
    } else {
      onAddEdge(connectingSourceId, nodeId);
      setConnectingSourceId(null);
    }
  };

  // Status Cycle Handler
  const cycleStatus = (node: SerializedRoadmapNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMap: Record<string, "TODO" | "IN_PROGRESS" | "COMPLETED"> = {
      TODO: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
      COMPLETED: "TODO",
    };
    onStatusChange(node.id, nextMap[node.status] || "TODO");
  };

  // Compute Bezier Curved Edge Path
  const computeBezierPath = (sourcePos: { x: number; y: number }, targetPos: { x: number; y: number }) => {
    const x1 = sourcePos.x + NODE_WIDTH;
    const y1 = sourcePos.y + NODE_HEIGHT / 2;
    const x2 = targetPos.x;
    const y2 = targetPos.y + NODE_HEIGHT / 2;

    const dx = Math.abs(x2 - x1) * 0.5;
    const controlX1 = x1 + Math.max(dx, 40);
    const controlX2 = x2 - Math.max(dx, 40);

    return {
      path: `M ${x1} ${y1} C ${controlX1} ${y1}, ${controlX2} ${y2}, ${x2} ${y2}`,
      midX: (x1 + x2) / 2,
      midY: (y1 + y2) / 2,
    };
  };

  return (
    <div
      ref={containerRef}
      id="canvas-bg"
      onWheel={handleWheel}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      className={cn(
        "relative w-full h-[calc(100vh-140px)] min-h-[500px] overflow-hidden select-none bg-background border border-border/60 rounded-2xl shadow-inner",
        isPanning ? "cursor-grabbing" : "cursor-grab"
      )}
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30"
        style={{
          backgroundImage: `radial-gradient(var(--foreground) 1.5px, transparent 1.5px)`,
          backgroundSize: `${24 * scale}px ${24 * scale}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Connection Notice Header */}
      {connectingSourceId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-bounce">
          <ConnectIcon className="w-4 h-4" />
          <span>Klik langkah tujuan untuk menghubungkan</span>
          <button
            onClick={() => setConnectingSourceId(null)}
            className="ml-2 underline hover:opacity-80"
          >
            Batal
          </button>
        </div>
      )}

      {/* Floating Canvas Controls Toolbar */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-1.5 p-1.5 rounded-xl glass-panel border-border/60 bg-card/90 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAutoLayout}
          title="Rapikan Tata Letak Canvas"
          className="h-8 gap-1.5 px-2.5 text-xs text-foreground font-medium hover:bg-muted"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-primary" />
          <span>Rapikan Canvas</span>
        </Button>

        <div className="w-[1px] h-4 bg-border/60 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          title="Perbesar"
          className="h-8 w-8 text-foreground"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <span className="text-[11px] font-mono text-muted-foreground px-1">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          title="Perkecil"
          className="h-8 w-8 text-foreground"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="w-[1px] h-4 bg-border/60 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetView}
          title="Reset Tampilan"
          className="h-8 w-8 text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas Transform Wrapper */}
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" className="fill-primary" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const sourcePos = localPositions[edge.sourceNodeId];
            const targetPos = localPositions[edge.targetNodeId];
            if (!sourcePos || !targetPos) return null;

            const { path, midX, midY } = computeBezierPath(sourcePos, targetPos);

            return (
              <g key={edge.id} className="group pointer-events-auto">
                <path
                  d={path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  markerEnd="url(#arrowhead)"
                  className="text-primary/70 group-hover:text-primary transition-colors stroke-dasharray-none"
                />
                {/* Edge Delete Hover Trigger */}
                <g
                  transform={`translate(${midX - 10}, ${midY - 10})`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setEdgeToDeleteId(edge.id)}
                >
                  <circle cx="10" cy="10" r="10" className="fill-destructive text-white" />
                  <text
                    x="10"
                    y="14"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    ×
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => {
          const isCompleted = node.status === "COMPLETED";
          const isInProgress = node.status === "IN_PROGRESS";
          const pos = localPositions[node.id] || { x: node.positionX || 0, y: node.positionY || 0 };
          const isDragging = draggingNodeId === node.id;
          const isConnectingSource = connectingSourceId === node.id;

          return (
            <div
              key={node.id}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                width: `${NODE_WIDTH}px`,
              }}              onPointerDown={(e) => handleNodePointerDown(node.id, e)}
              onClick={(e) => {
                if (!hasDraggedRef.current) {
                  setSelectedNodeForDetail(node);
                }
              }}
              className={cn(
                "absolute top-0 left-0 p-4 rounded-2xl border-2 transition-all glass-panel bg-card/95 shadow-md flex flex-col justify-between select-none cursor-grab active:cursor-grabbing group",
                isDragging && "shadow-2xl ring-2 ring-primary border-primary z-30 scale-[1.02]",
                isConnectingSource && "ring-2 ring-primary border-primary",
                !isDragging && isCompleted && "border-emerald-500/70 dark:border-emerald-400/60 bg-emerald-500/5 shadow-emerald-500/5",
                !isDragging && isInProgress && "border-amber-500/70 dark:border-amber-400/60 bg-amber-500/5 shadow-amber-500/5",
                !isDragging && !isCompleted && !isInProgress && "border-border/80 hover:border-primary/60"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer outline-none shadow-2xs group active:scale-95",
                        isCompleted
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                          : isInProgress
                          ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25"
                          : "border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          isCompleted ? "bg-emerald-500" : isInProgress ? "bg-amber-500" : "bg-slate-400"
                        )}
                      />
                      <span>
                        {isCompleted ? "Selesai" : isInProgress ? "Proses" : "To Do"}
                      </span>
                      <ChevronDown className="w-3 h-3 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-44 p-1.5 rounded-2xl border-border/80 bg-card/95 backdrop-blur-2xl shadow-xl space-y-1 z-50">
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 px-2.5 py-1 font-mono">
                      Status Node
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-border/40" />

                    <DropdownMenuItem
                      onClick={() => onStatusChange(node.id, "TODO")}
                      className={cn(
                        "flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors",
                        node.status === "TODO" ? "bg-muted font-semibold text-foreground" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>To Do</span>
                      </div>
                      {node.status === "TODO" && <Check className="w-3.5 h-3.5 text-primary stroke-[2.5]" />}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onStatusChange(node.id, "IN_PROGRESS")}
                      className={cn(
                        "flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors",
                        node.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold" : "hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Dalam Proses</span>
                      </div>
                      {node.status === "IN_PROGRESS" && <Check className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onStatusChange(node.id, "COMPLETED")}
                      className={cn(
                        "flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors",
                        node.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" : "hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Selesai</span>
                      </div>
                      {node.status === "COMPLETED" && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Title & Description */}
              <div
                className="my-2 space-y-1 cursor-pointer group/title"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeForDetail(node);
                }}
              >
                <h4 className={cn("text-sm font-semibold text-foreground line-clamp-1 group-hover/title:text-primary transition-colors", isCompleted && "line-through text-muted-foreground")}>
                  {node.title}
                </h4>
                {node.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {node.description}
                  </p>
                )}
              </div>

              {/* Link preview chip if available */}
              {node.type === "LINK" && node.link && (
                <a
                  href={node.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-primary/20 bg-background/80 hover:bg-muted text-[11px] transition-colors font-medium text-foreground hover:text-primary mb-2 max-w-full"
                >
                  {node.link.favicon ? (
                    <img src={node.link.favicon} alt="" className="w-3 h-3 rounded object-contain shrink-0" />
                  ) : (
                    <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate">{node.link.title}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                </a>
              )}

              {/* Footer / Connect, Detail & Delete toolbar */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleNodeConnectClick(node.id, e)}
                    className={cn(
                      "flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer px-1.5 py-0.5 rounded",
                      isConnectingSource
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    )}
                    title="Hubungkan ke node lain"
                  >
                    <ConnectIcon className="w-3.5 h-3.5" />
                    <span>{isConnectingSource ? "Menghubungkan..." : "Hubungkan"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeForDetail(node);
                    }}
                    className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-primary/10 transition-colors cursor-pointer"
                    title="Lihat Detail Lengkap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNodeToDelete(node);
                  }}
                  className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Hapus Node"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Node Confirmation Dialog */}
      <ConfirmDialog
        open={!!nodeToDelete}
        onOpenChange={(open) => !open && setNodeToDelete(null)}
        title="Hapus Node Roadmap"
        description={
          nodeToDelete
            ? `Apakah Anda yakin ingin menghapus node "${nodeToDelete.title}"? Seluruh koneksi pada node ini akan ikut terhapus.`
            : "Apakah Anda yakin ingin menghapus node ini?"
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

      {/* Delete Edge Confirmation Dialog */}
      <ConfirmDialog
        open={!!edgeToDeleteId}
        onOpenChange={(open) => !open && setEdgeToDeleteId(null)}
        title="Hapus Koneksi Alur"
        description="Apakah Anda yakin ingin menghapus garis koneksi ini?"
        confirmText="Hapus"
        cancelText="Batal"
        destructive={true}
        onConfirm={() => {
          if (edgeToDeleteId) {
            onDeleteEdge(edgeToDeleteId);
            setEdgeToDeleteId(null);
          }
        }}
      />

      {/* Node Detail Popup Modal */}
      <NodeDetailDialog
        node={selectedNodeForDetail}
        open={!!selectedNodeForDetail}
        onOpenChange={(open) => !open && setSelectedNodeForDetail(null)}
        onStatusChange={onStatusChange}
        onDeleteNode={onDeleteNode}
        targetNodes={
          selectedNodeForDetail
            ? nodes.filter((n) =>
                edges
                  .filter((e) => e.sourceNodeId === selectedNodeForDetail.id)
                  .map((e) => e.targetNodeId)
                  .includes(n.id)
              )
            : []
        }
      />
    </div>
  );
}
