"use client";

import { useEffect, useState, useRef } from "react";
import { type Editor } from "@tiptap/react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  RotateCw,
  RotateCcw,
  Crop as CropIcon,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Layers,
  ImageIcon,
  Info,
  Check,
  X,
  FlipHorizontal,
  ChevronDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/custom-toast";
import type { ImageAlignment, ImageWrapMode } from "@/lib/tiptap-image-advanced";

interface ImageToolbarProps {
  editor: Editor;
}

export function ImageToolbar({ editor }: ImageToolbarProps) {
  const [selectedNode, setSelectedNode] = useState<{
    pos: number;
    attrs: Record<string, any>;
  } | null>(null);

  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState("");
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 }); // percentage
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);

  // Detect selection changes in TipTap
  useEffect(() => {
    if (!editor) return;

    const checkSelection = () => {
      const { selection } = editor.state;
      const sel = selection as any;
      if (sel && sel.node && sel.node.type.name === "image") {
        setSelectedNode({
          pos: selection.from,
          attrs: { ...sel.node.attrs },
        });
      } else if (editor.isActive("image")) {
        setSelectedNode({
          pos: selection.from,
          attrs: { ...editor.getAttributes("image") },
        });
      } else {
        setSelectedNode((prev) => (prev !== null ? null : prev));
      }
    };

    checkSelection();
    editor.on("selectionUpdate", checkSelection);

    return () => {
      editor.off("selectionUpdate", checkSelection);
    };
  }, [editor]);

  if (!selectedNode) return null;

  const { attrs } = selectedNode;
  const currentWidth = attrs.width ? Math.round(Number(attrs.width)) : 300;
  const currentHeight = attrs.height ? Math.round(Number(attrs.height)) : 200;
  const currentAlign: ImageAlignment = attrs.align || "center";
  const currentWrap: ImageWrapMode = attrs.wrap || "top-bottom";
  const currentRotation = attrs.rotation || 0;
  const aspectRatio = attrs.aspectRatio || (currentWidth / (currentHeight || 1)) || 1;

  const updateAttrs = (newAttrs: Record<string, any>) => {
    (editor.chain().focus() as any).updateImageAttributes(newAttrs).run();
  };

  // Width / Height input handlers
  const handleWidthChange = (val: number) => {
    const w = Math.max(40, val);
    if (lockAspectRatio) {
      const h = Math.round(w / aspectRatio);
      updateAttrs({ width: w, height: h });
    } else {
      updateAttrs({ width: w });
    }
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(40, val);
    if (lockAspectRatio) {
      const w = Math.round(h * aspectRatio);
      updateAttrs({ width: w, height: h });
    } else {
      updateAttrs({ height: h });
    }
  };

  const handleRotate = (delta: number) => {
    const next = ((currentRotation + delta) % 360 + 360) % 360;
    updateAttrs({ rotation: next });
  };

  const handleResetRotation = () => {
    updateAttrs({ rotation: 0 });
  };

  // Crop execution
  const openCropDialog = () => {
    if (!attrs.src) return;
    setCropSrc(attrs.src);
    setCropBox({ x: 10, y: 10, width: 80, height: 80 });
    setCropModalOpen(true);
  };

  const executeCrop = () => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const sx = (cropBox.x / 100) * image.naturalWidth;
      const sy = (cropBox.y / 100) * image.naturalHeight;
      const sWidth = (cropBox.width / 100) * image.naturalWidth;
      const sHeight = (cropBox.height / 100) * image.naturalHeight;

      canvas.width = sWidth;
      canvas.height = sHeight;

      ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      const croppedDataUrl = canvas.toDataURL("image/png");

      updateAttrs({
        src: croppedDataUrl,
        width: Math.round(sWidth),
        height: Math.round(sHeight),
        aspectRatio: sWidth / sHeight,
      });

      setCropModalOpen(false);
      toast.success("Gambar berhasil dipotong (crop).", "Edit Gambar");
    };
    image.src = cropSrc;
  };

  return (
    <>
      {/* Floating Context Toolbar */}
      <div className="sticky top-[132px] z-30 mb-3 w-full animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-neutral-900/95 text-white dark:bg-neutral-800/95 rounded-2xl shadow-2xl border border-neutral-700/80 backdrop-blur-xl text-xs select-none">
          {/* Header indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/20 text-primary-foreground font-semibold border border-primary/30 text-[11px]">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span>Format Gambar (Word)</span>
          </div>

          <div className="w-px h-5 bg-neutral-700 mx-0.5" />

          {/* Alignment */}
          <div className="flex items-center bg-neutral-800 dark:bg-neutral-900 rounded-xl p-0.5 border border-neutral-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => updateAttrs({ align: "left" })}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                    currentAlign === "left"
                      ? "bg-primary text-white font-bold"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-700"
                  )}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Rata Kiri</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => updateAttrs({ align: "center" })}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                    currentAlign === "center"
                      ? "bg-primary text-white font-bold"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-700"
                  )}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Rata Tengah</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => updateAttrs({ align: "right" })}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                    currentAlign === "right"
                      ? "bg-primary text-white font-bold"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-700"
                  )}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Rata Kanan</TooltipContent>
            </Tooltip>
          </div>

          {/* Text Wrapping Popover */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 dark:bg-neutral-900 text-neutral-200 hover:text-white hover:bg-neutral-700 border border-neutral-700 transition-colors cursor-pointer text-xs"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {currentWrap === "inline"
                        ? "Inline"
                        : currentWrap === "square-left"
                        ? "Square Kiri"
                        : currentWrap === "square-right"
                        ? "Square Kanan"
                        : currentWrap === "behind"
                        ? "Belakang Teks"
                        : currentWrap === "front"
                        ? "Depan Teks"
                        : "Atas & Bawah"}
                    </span>
                    <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">Bungkus Teks (Wrap Text)</TooltipContent>
            </Tooltip>
            <PopoverContent
              align="start"
              className="p-2 w-56 rounded-2xl bg-neutral-900 text-white border border-neutral-700 shadow-2xl z-[100]"
            >
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
                Gaya Bungkus Teks (Word)
              </div>
              <div className="space-y-1 mt-1">
                {[
                  { key: "top-bottom", label: "Atas & Bawah (Default Word)", desc: "Teks di atas dan bawah gambar" },
                  { key: "square-left", label: "Square (Kiri)", desc: "Teks mengalir di sebelah kanan" },
                  { key: "square-right", label: "Square (Kanan)", desc: "Teks mengalir di sebelah kiri" },
                  { key: "inline", label: "Sejajar Teks (Inline)", desc: "Menyatu dalam baris kalimat" },
                  { key: "behind", label: "Di Belakang Teks", desc: "Gambar berada di latar belakang" },
                  { key: "front", label: "Di Depan Teks", desc: "Gambar melayang di atas teks" },
                ].map((wrapOpt) => (
                  <button
                    key={wrapOpt.key}
                    type="button"
                    onClick={() => updateAttrs({ wrap: wrapOpt.key })}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex flex-col gap-0.5",
                      currentWrap === wrapOpt.key
                        ? "bg-primary text-white font-semibold"
                        : "hover:bg-neutral-800 text-neutral-200"
                    )}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span>{wrapOpt.label}</span>
                      {currentWrap === wrapOpt.key && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] opacity-70 font-normal">
                      {wrapOpt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Size & Presets Popover */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-800 dark:bg-neutral-900 text-neutral-200 hover:text-white hover:bg-neutral-700 border border-neutral-700 transition-colors cursor-pointer text-xs"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono">{currentWidth}×{currentHeight}px</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">Atur Ukuran Presisi (Word Size)</TooltipContent>
            </Tooltip>
            <PopoverContent
              align="start"
              className="p-3 w-64 rounded-2xl bg-neutral-900 text-white border border-neutral-700 shadow-2xl z-[100]"
            >
              <div className="text-xs font-semibold pb-2 mb-2 border-b border-neutral-700 flex items-center justify-between">
                <span>Ukuran Gambar Presisi</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {(currentWidth / 37.8).toFixed(1)} × {(currentHeight / 37.8).toFixed(1)} cm
                </span>
              </div>

              {/* Dimensions Inputs */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Lebar (px)</label>
                  <input
                    type="number"
                    value={currentWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-mono text-center focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Tinggi (px)</label>
                  <input
                    type="number"
                    value={currentHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-mono text-center focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Lock Aspect Ratio Toggle */}
              <button
                type="button"
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer mb-3",
                  lockAspectRatio
                    ? "bg-primary/20 border-primary/40 text-primary font-medium"
                    : "bg-neutral-800 border-neutral-700 text-neutral-300"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>Kunci Rasio Aspek</span>
                </div>
                <span className="text-[10px]">{lockAspectRatio ? "Aktif" : "Bebas"}</span>
              </button>

              {/* Preset Scale Buttons */}
              <div className="text-[10px] text-neutral-400 mb-1.5">Skala Cepat:</div>
              <div className="grid grid-cols-4 gap-1">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    onClick={() => {
                      const base = 700; // standard page width baseline
                      const targetWidth = Math.round((base * percent) / 100);
                      handleWidthChange(targetWidth);
                    }}
                    className="px-1.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-md text-[11px] font-mono text-center transition-colors cursor-pointer"
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Rotate Controls */}
          <div className="flex items-center bg-neutral-800 dark:bg-neutral-900 rounded-xl p-0.5 border border-neutral-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleRotate(-90)}
                  className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Putar 90° ke Kiri</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleRotate(90)}
                  className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Putar 90° ke Kiri</TooltipContent>
            </Tooltip>

            {currentRotation !== 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleResetRotation}
                    className="px-1.5 py-1 rounded-lg text-[10px] font-mono text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    {currentRotation}°
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Reset Rotasi (0°)</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Crop Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={openCropDialog}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 dark:bg-neutral-900 text-neutral-200 hover:text-white hover:bg-neutral-700 border border-neutral-700 transition-colors cursor-pointer text-xs"
              >
                <CropIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Crop</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Potong Area Gambar (Crop)</TooltipContent>
          </Tooltip>

          {/* Alt Text Popover */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 dark:bg-neutral-900 text-neutral-200 hover:text-white hover:bg-neutral-700 border border-neutral-700 transition-colors cursor-pointer text-xs"
                  >
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Alt Text</span>
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">Teks Deskripsi Gambar (Alt Text)</TooltipContent>
            </Tooltip>
            <PopoverContent
              align="start"
              className="p-3 w-64 rounded-2xl bg-neutral-900 text-white border border-neutral-700 shadow-2xl z-[100]"
            >
              <div className="text-xs font-semibold mb-2">Teks Deskripsi (Alt Text)</div>
              <input
                type="text"
                placeholder="Deskripsi gambar untuk dokumen & aksesibilitas..."
                value={attrs.alt || ""}
                onChange={(e) => updateAttrs({ alt: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-primary"
              />
            </PopoverContent>
          </Popover>

          <div className="w-px h-5 bg-neutral-700 mx-0.5" />

          {/* Duplicate Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => (editor.chain().focus() as any).duplicateSelectedImage().run()}
                className="p-1.5 rounded-xl bg-neutral-800 dark:bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-700 border border-neutral-700 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Duplikasi Gambar (Ctrl+D)</TooltipContent>
          </Tooltip>

          {/* Delete Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => (editor.chain().focus() as any).deleteSelectedImage().run()}
                className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-red-100 border border-red-800/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Hapus Gambar (Delete)</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Crop Modal Dialog */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 text-white rounded-3xl border border-neutral-700 shadow-2xl max-w-xl w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CropIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-sm">Potong Gambar (Crop Mode)</h3>
              </div>
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Crop Preview Area */}
            <div className="relative bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center p-4 min-h-[260px] max-h-[380px]">
              <div className="relative inline-block select-none max-w-full max-h-[340px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cropSrc}
                  alt="Crop preview"
                  className="max-h-[320px] max-w-full object-contain pointer-events-none"
                />

                {/* Simulated Crop Boundary Overlay */}
                <div
                  className="absolute border-2 border-dashed border-amber-400 bg-amber-400/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                  }}
                >
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-amber-400" />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400" />
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-amber-400" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-400" />
                </div>
              </div>
            </div>

            {/* Quick Crop Presets */}
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="text-[11px] text-neutral-400">Pilih Area Potong:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setCropBox({ x: 0, y: 0, width: 100, height: 100 })}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px]"
                >
                  Penuh (100%)
                </button>
                <button
                  type="button"
                  onClick={() => setCropBox({ x: 10, y: 10, width: 80, height: 80 })}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px]"
                >
                  Tengah (80%)
                </button>
                <button
                  type="button"
                  onClick={() => setCropBox({ x: 20, y: 20, width: 60, height: 60 })}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px]"
                >
                  Fokus (60%)
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeCrop}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Crop</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
