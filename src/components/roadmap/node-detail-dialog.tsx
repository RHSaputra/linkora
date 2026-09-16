import React, { useState, useEffect } from "react";
import { SerializedRoadmapNode } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Link2,
  CheckSquare,
  StickyNote,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  Circle,
  Check,
  ChevronDown,
  Globe,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeDetailDialogProps {
  node: SerializedRoadmapNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (nodeId: string, status: "TODO" | "IN_PROGRESS" | "COMPLETED") => void;
  onDeleteNode: (nodeId: string) => void;
  targetNodes?: SerializedRoadmapNode[];
}

export function NodeDetailDialog({
  node,
  open,
  onOpenChange,
  onStatusChange,
  onDeleteNode,
  targetNodes = [],
}: NodeDetailDialogProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"TODO" | "IN_PROGRESS" | "COMPLETED">(
    node?.status || "TODO"
  );

  useEffect(() => {
    if (node) {
      setCurrentStatus(node.status);
    }
  }, [node?.id, node?.status]);

  if (!node) return null;

  const handleStatusSelect = (newStatus: "TODO" | "IN_PROGRESS" | "COMPLETED") => {
    setCurrentStatus(newStatus);
    onStatusChange(node.id, newStatus);
  };

  const isCompleted = currentStatus === "COMPLETED";
  const isInProgress = currentStatus === "IN_PROGRESS";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl p-6 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-2xl space-y-5 overflow-hidden">
          <DialogHeader className="space-y-3 text-left">
            {/* Badges & Status Selector Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {node.type === "LINK" && (
                  <Badge
                    variant="outline"
                    className="text-xs gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 px-3 py-1 font-semibold rounded-full"
                  >
                    <Link2 className="w-3.5 h-3.5" /> Link Node
                  </Badge>
                )}
                {node.type === "TASK" && (
                  <Badge
                    variant="outline"
                    className="text-xs gap-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 px-3 py-1 font-semibold rounded-full"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Task Node
                  </Badge>
                )}
                {node.type === "NOTE" && (
                  <Badge
                    variant="outline"
                    className="text-xs gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 px-3 py-1 font-semibold rounded-full"
                  >
                    <StickyNote className="w-3.5 h-3.5" /> Note Node
                  </Badge>
                )}
              </div>

              {/* Status Switcher Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer outline-none shadow-xs group active:scale-95",
                      isCompleted
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                        : isInProgress
                        ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        isCompleted
                          ? "bg-emerald-500"
                          : isInProgress
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      )}
                    />
                    <span>
                      {isCompleted
                        ? "Selesai"
                        : isInProgress
                        ? "Dalam Proses"
                        : "To Do"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180 ml-0.5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-48 p-1.5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-xl space-y-1 z-50"
                >
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 px-2.5 py-1 font-mono">
                    Ubah Status
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-border/40" />

                  <DropdownMenuItem
                    onClick={() => handleStatusSelect("TODO")}
                    className={cn(
                      "flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors",
                      currentStatus === "TODO"
                        ? "bg-muted font-semibold text-foreground"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-500 shrink-0">
                        <Circle className="w-3.5 h-3.5" />
                      </div>
                      <span>To Do</span>
                    </div>
                    {currentStatus === "TODO" && (
                      <Check className="w-4 h-4 text-primary stroke-[2.5]" />
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleStatusSelect("IN_PROGRESS")}
                    className={cn(
                      "flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors",
                      currentStatus === "IN_PROGRESS"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                        : "hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <span>Dalam Proses</span>
                    </div>
                    {currentStatus === "IN_PROGRESS" && (
                      <Check className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleStatusSelect("COMPLETED")}
                    className={cn(
                      "flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors",
                      currentStatus === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>Selesai</span>
                    </div>
                    {currentStatus === "COMPLETED" && (
                      <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title */}
            <DialogTitle className="text-xl font-heading font-bold text-foreground leading-snug">
              {node.title}
            </DialogTitle>
          </DialogHeader>

          {/* Body Section: Full Description & Attached Link */}
          <div className="space-y-4 text-left">
            {/* Description Box */}
            {node.description ? (
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80 font-medium">
                  Deskripsi Lengkap
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {node.description}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-200/80 dark:border-slate-700/50 text-xs text-muted-foreground italic">
                Tidak ada deskripsi tambahan untuk langkah ini.
              </div>
            )}

            {/* Attached Link Card */}
            {node.type === "LINK" && node.link && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80 font-medium">
                  Tautan Terkait
                </span>
                <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {node.link.favicon ? (
                      <img
                        src={node.link.favicon}
                        alt=""
                        className="w-5 h-5 rounded object-contain shrink-0"
                      />
                    ) : (
                      <Globe className="w-5 h-5 text-primary shrink-0" />
                    )}
                    <div className="overflow-hidden">
                      <h5 className="text-xs font-semibold text-foreground truncate">
                        {node.link.title}
                      </h5>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {node.link.url}
                      </p>
                    </div>
                  </div>
                  <a
                    href={node.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary-hover transition-colors shrink-0"
                  >
                    <span>Buka Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Connected Next Steps */}
            {targetNodes.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80 font-medium">
                  Langkah Selanjutnya
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {targetNodes.map((target) => (
                    <span
                      key={target.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-xs font-semibold text-foreground border border-primary/20"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                      <span>{target.title}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <DialogFooter className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowConfirmDelete(true)}
              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 rounded-xl h-9 px-3 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Langkah</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-9 px-4 text-xs font-semibold cursor-pointer border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Direct Delete Confirmation Modal */}
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title="Hapus Langkah Roadmap"
        description={`Apakah Anda yakin ingin menghapus langkah "${node.title}"? Seluruh koneksi pada langkah ini akan disesuaikan.`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive={true}
        onConfirm={() => {
          onDeleteNode(node.id);
          setShowConfirmDelete(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
