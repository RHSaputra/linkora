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
import { useTranslation } from "@/components/providers/i18n-provider";
import type { ImageAlignment, ImageWrapMode } from "@/lib/tiptap-image-advanced";
import {
  DynamicImageCropperModal,
  type DynamicCropperResult,
} from "./dynamic-image-cropper-modal";

interface ImageToolbarProps {
  editor: Editor;
}

export function ImageToolbar({ editor }: ImageToolbarProps) {
  const { locale } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<{
    pos: number;
    attrs: Record<string, any>;
  } | null>(null);

  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [cropModalOpen, setCropModalOpen] = useState(false);

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

  // Dynamic Crop execution
  const openCropDialog = () => {
    if (!attrs.src) return;
    setCropModalOpen(true);
  };

  const handleCropApply = (cropped: DynamicCropperResult) => {
    const maxDisplayWidth = 650;
    const newWidth = Math.min(maxDisplayWidth, Math.max(50, Math.round(cropped.width)));
    const newHeight = Math.max(30, Math.round(newWidth / (cropped.aspectRatio || 1)));

    updateAttrs({
      src: cropped.src,
      width: newWidth,
      height: newHeight,
      aspectRatio: cropped.aspectRatio,
    });
    setCropModalOpen(false);

    // Force re-measure and pagination re-compute so text flows up immediately into empty space on Page 1
    setTimeout(() => {
      if (editor && !editor.isDestroyed) {
        editor.view.dispatch(editor.state.tr);
      }
    }, 50);
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
              <TooltipContent side="top">{locale === "en" ? "Align Left" : "Rata Kiri"}</TooltipContent>
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
              <TooltipContent side="top">{locale === "en" ? "Align Center" : "Rata Tengah"}</TooltipContent>
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
              <TooltipContent side="top">{locale === "en" ? "Align Right" : "Rata Kanan"}</TooltipContent>
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
                        ? (locale === "en" ? "Square Left" : "Square Kiri")
                        : currentWrap === "square-right"
                        ? (locale === "en" ? "Square Right" : "Square Kanan")
                        : currentWrap === "behind"
                        ? (locale === "en" ? "Behind Text" : "Belakang Teks")
                        : currentWrap === "front"
                        ? (locale === "en" ? "In Front" : "Depan Teks")
                        : (locale === "en" ? "Top & Bottom" : "Atas & Bawah")}
                    </span>
                    <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">{locale === "en" ? "Wrap Text" : "Bungkus Teks (Wrap Text)"}</TooltipContent>
            </Tooltip>
            <PopoverContent
              align="start"
              className="p-2 w-56 rounded-2xl bg-neutral-900 text-white border border-neutral-700 shadow-2xl z-[100]"
            >
              <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
                {locale === "en" ? "Text Wrapping Style (Word)" : "Gaya Bungkus Teks (Word)"}
              </div>
              <div className="space-y-1 mt-1">
                {[
                  { key: "top-bottom", label: locale === "en" ? "Top & Bottom (Default)" : "Atas & Bawah (Default Word)", desc: locale === "en" ? "Text above and below image" : "Teks di atas dan bawah gambar" },
                  { key: "square-left", label: locale === "en" ? "Square (Left)" : "Square (Kiri)", desc: locale === "en" ? "Text flows to the right" : "Teks mengalir di sebelah kanan" },
                  { key: "square-right", label: locale === "en" ? "Square (Right)" : "Square (Kanan)", desc: locale === "en" ? "Text flows to the left" : "Teks mengalir di sebelah kiri" },
                  { key: "inline", label: locale === "en" ? "Inline with Text" : "Sejajar Teks (Inline)", desc: locale === "en" ? "Flows within sentence line" : "Menyatu dalam baris kalimat" },
                  { key: "behind", label: locale === "en" ? "Behind Text" : "Di Belakang Teks", desc: locale === "en" ? "Image stays in background" : "Gambar berada di latar belakang" },
                  { key: "front", label: locale === "en" ? "In Front of Text" : "Di Depan Teks", desc: locale === "en" ? "Image floats over text" : "Gambar melayang di atas teks" },
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
              <TooltipContent side="top">{locale === "en" ? "Precision Size (Word Size)" : "Atur Ukuran Presisi (Word Size)"}</TooltipContent>
            </Tooltip>
            <PopoverContent
              align="start"
              className="p-3 w-64 rounded-2xl bg-neutral-900 text-white border border-neutral-700 shadow-2xl z-[100]"
            >
              <div className="text-xs font-semibold pb-2 mb-2 border-b border-neutral-700 flex items-center justify-between">
                <span>{locale === "en" ? "Precision Image Size" : "Ukuran Gambar Presisi"}</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {(currentWidth / 37.8).toFixed(1)} × {(currentHeight / 37.8).toFixed(1)} cm
                </span>
              </div>

              {/* Dimensions Inputs */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">{locale === "en" ? "Width (px)" : "Lebar (px)"}</label>
                  <input
                    type="number"
                    value={currentWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-mono text-center focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">{locale === "en" ? "Height (px)" : "Tinggi (px)"}</label>
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
                  <span>{locale === "en" ? "Lock Aspect Ratio" : "Kunci Rasio Aspek"}</span>
                </div>
                <span className="text-[10px]">{lockAspectRatio ? (locale === "en" ? "Locked" : "Aktif") : (locale === "en" ? "Free" : "Bebas")}</span>
              </button>

              {/* Preset Scale Buttons */}
              <div className="text-[10px] text-neutral-400 mb-1.5">{locale === "en" ? "Quick Scale:" : "Skala Cepat:"}</div>
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
              <TooltipContent side="top">{locale === "en" ? "Rotate 90° Left" : "Putar 90° ke Kiri"}</TooltipContent>
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
              <TooltipContent side="top">{locale === "en" ? "Rotate 90° Right" : "Putar 90° ke Kanan"}</TooltipContent>
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
                <TooltipContent side="top">{locale === "en" ? "Reset Rotation (0°)" : "Reset Rotasi (0°)"}</TooltipContent>
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
            <TooltipContent side="top">{locale === "en" ? "Crop Image Area" : "Potong Area Gambar (Crop)"}</TooltipContent>
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
              <TooltipContent side="top">{locale === "en" ? "Image Description (Alt Text)" : "Teks Deskripsi Gambar (Alt Text)"}</TooltipContent>
            </Tooltip>
            <PopoverContent
              align="start"
              className="p-3 w-64 rounded-2xl bg-neutral-900 text-white border border-neutral-700 shadow-2xl z-[100]"
            >
              <div className="text-xs font-semibold mb-2">{locale === "en" ? "Description Text (Alt Text)" : "Teks Deskripsi (Alt Text)"}</div>
              <input
                type="text"
                placeholder={locale === "en" ? "Image description for documents & accessibility..." : "Deskripsi gambar untuk dokumen & aksesibilitas..."}
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
            <TooltipContent side="top">{locale === "en" ? "Duplicate Image (Ctrl+D)" : "Duplikasi Gambar (Ctrl+D)"}</TooltipContent>
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
            <TooltipContent side="top">{locale === "en" ? "Delete Image (Delete)" : "Hapus Gambar (Delete)"}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Dynamic Image Cropper Modal */}
      <DynamicImageCropperModal
        isOpen={cropModalOpen}
        imageSrc={attrs.src || ""}
        initialWidth={currentWidth}
        initialHeight={currentHeight}
        onClose={() => setCropModalOpen(false)}
        onApply={handleCropApply}
      />
    </>
  );
}
