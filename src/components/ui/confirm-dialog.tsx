"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Hapus",
  cancelText = "Batal",
  destructive = true,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl p-6 shadow-2xl">
        <DialogHeader className="space-y-3">
          {destructive && (
            <div className="w-10 h-10 rounded-2xl bg-destructive/15 text-destructive border border-destructive/30 flex items-center justify-center shadow-xs shadow-destructive/10">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}
          <DialogTitle className="text-base sm:text-lg font-bold font-heading leading-snug break-words tracking-tight text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words font-medium">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto rounded-xl font-semibold text-xs h-9.5 px-4 cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto rounded-xl font-semibold text-xs h-9.5 px-5 shadow-sm cursor-pointer"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
