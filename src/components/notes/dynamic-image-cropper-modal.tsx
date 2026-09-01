"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Crop as CropIcon,
  X,
  Check,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/custom-toast";
import { useTranslation } from "@/components/providers/i18n-provider";

export interface DynamicCropperResult {
  src: string;
  width: number;
  height: number;
  aspectRatio: number;
}

interface DynamicImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  initialWidth?: number;
  initialHeight?: number;
  onClose: () => void;
  onApply: (result: DynamicCropperResult) => void;
}

type AspectRatioMode = "free" | "1:1" | "4:3" | "16:9" | "3:2" | "original";

interface CropBox {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
}

type DragHandleType =
  | "move"
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | "n"
  | "s"
  | "w"
  | "e"
  | null;

export function DynamicImageCropperModal({
  isOpen,
  imageSrc,
  initialWidth,
  initialHeight,
  onClose,
  onApply,
}: DynamicImageCropperModalProps) {
  const { locale } = useTranslation();
  const [mounted, setMounted] = useState<boolean>(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: initialWidth || 800,
    height: initialHeight || 600,
  });

  const [aspectRatioMode, setAspectRatioMode] = useState<AspectRatioMode>("free");
  const [cropBox, setCropBox] = useState<CropBox>({ x: 5, y: 5, width: 90, height: 90 });
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const draggingRef = useRef<{
    handle: DragHandleType;
    startX: number;
    startY: number;
    initialBox: CropBox;
    imgRect: DOMRect;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load natural dimensions of image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setNaturalSize({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 600,
      });
      // Initial centered crop box
      setCropBox({ x: 5, y: 5, width: 90, height: 90 });
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setZoom(1);
      setAspectRatioMode("free");
    };
    img.src = imageSrc;
  }, [imageSrc, isOpen]);

  // Adjust crop box when aspect ratio mode changes
  const applyAspectRatio = useCallback(
    (mode: AspectRatioMode) => {
      setAspectRatioMode(mode);
      if (mode === "free") return;

      const imgW = naturalSize.width;
      const imgH = naturalSize.height;
      let targetRatio = 1; // width / height in physical pixels

      if (mode === "1:1") targetRatio = 1;
      else if (mode === "4:3") targetRatio = 4 / 3;
      else if (mode === "16:9") targetRatio = 16 / 9;
      else if (mode === "3:2") targetRatio = 3 / 2;
      else if (mode === "original") targetRatio = imgW / (imgH || 1);

      // Convert target ratio into percentage ratio: (wPct / hPct) = targetRatio * (imgH / imgW)
      const imageAspect = imgW / (imgH || 1);
      const percentRatio = targetRatio / imageAspect;

      let newWidth = 80;
      let newHeight = newWidth / percentRatio;

      if (newHeight > 90) {
        newHeight = 90;
        newWidth = newHeight * percentRatio;
      }
      if (newWidth > 90) {
        newWidth = 90;
        newHeight = newWidth / percentRatio;
      }

      const newX = Math.max(0, (100 - newWidth) / 2);
      const newY = Math.max(0, (100 - newHeight) / 2);

      setCropBox({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    },
    [naturalSize]
  );

  // Pointer Down (Start dragging or resizing)
  const handlePointerDown = (e: React.PointerEvent, handle: DragHandleType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!imgRef.current) return;
    const imgRect = imgRef.current.getBoundingClientRect();

    draggingRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialBox: { ...cropBox },
      imgRect,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer Move (Perform real-time dynamic resize / drag)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const { handle, startX, startY, initialBox, imgRect } = draggingRef.current;
    if (imgRect.width === 0 || imgRect.height === 0) return;

    const deltaXPct = ((e.clientX - startX) / imgRect.width) * 100;
    const deltaYPct = ((e.clientY - startY) / imgRect.height) * 100;

    const MIN_SIZE_PCT = 4; // minimum 4% width/height to prevent collapsing

    if (handle === "move") {
      const newX = Math.min(
        100 - initialBox.width,
        Math.max(0, initialBox.x + deltaXPct)
      );
      const newY = Math.min(
        100 - initialBox.height,
        Math.max(0, initialBox.y + deltaYPct)
      );
      setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
      return;
    }

    let { x, y, width, height } = initialBox;

    // Handle horizontal resizing
    if (handle === "nw" || handle === "w" || handle === "sw") {
      const candidateX = Math.max(0, Math.min(initialBox.x + initialBox.width - MIN_SIZE_PCT, initialBox.x + deltaXPct));
      width = initialBox.x + initialBox.width - candidateX;
      x = candidateX;
    } else if (handle === "ne" || handle === "e" || handle === "se") {
      width = Math.max(MIN_SIZE_PCT, Math.min(100 - initialBox.x, initialBox.width + deltaXPct));
    }

    // Handle vertical resizing
    if (handle === "nw" || handle === "n" || handle === "ne") {
      const candidateY = Math.max(0, Math.min(initialBox.y + initialBox.height - MIN_SIZE_PCT, initialBox.y + deltaYPct));
      height = initialBox.y + initialBox.height - candidateY;
      y = candidateY;
    } else if (handle === "sw" || handle === "s" || handle === "se") {
      height = Math.max(MIN_SIZE_PCT, Math.min(100 - initialBox.y, initialBox.height + deltaYPct));
    }

    // Aspect ratio locking if not in free mode
    if (aspectRatioMode !== "free") {
      const imgAspect = naturalSize.width / (naturalSize.height || 1);
      let targetRatio = 1;
      if (aspectRatioMode === "1:1") targetRatio = 1;
      else if (aspectRatioMode === "4:3") targetRatio = 4 / 3;
      else if (aspectRatioMode === "16:9") targetRatio = 16 / 9;
      else if (aspectRatioMode === "3:2") targetRatio = 3 / 2;
      else if (aspectRatioMode === "original") targetRatio = imgAspect;

      const percentRatio = targetRatio / imgAspect;

      if (handle === "e" || handle === "w" || handle === "ne" || handle === "nw") {
        height = width / percentRatio;
        if (y + height > 100) {
          height = 100 - y;
          width = height * percentRatio;
        }
      } else {
        width = height * percentRatio;
        if (x + width > 100) {
          width = 100 - x;
          height = width / percentRatio;
        }
      }
    }

    // Final boundary clamp
    x = Math.max(0, Math.min(100 - MIN_SIZE_PCT, x));
    y = Math.max(0, Math.min(100 - MIN_SIZE_PCT, y));
    width = Math.max(MIN_SIZE_PCT, Math.min(100 - x, width));
    height = Math.max(MIN_SIZE_PCT, Math.min(100 - y, height));

    setCropBox({ x, y, width, height });
  };

  // Pointer Up (End dragging)
  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingRef.current) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      draggingRef.current = null;
    }
  };

  // Execute High-Resolution Canvas Crop
  const handleExecuteCrop = () => {
    setIsProcessing(true);
    try {
      const sourceImg = imgRef.current;
      if (!sourceImg) {
        toast.error("Elemen gambar belum siap.", "Crop Gagal");
        setIsProcessing(false);
        return;
      }

      const origW = sourceImg.naturalWidth || naturalSize.width || 800;
      const origH = sourceImg.naturalHeight || naturalSize.height || 600;

      // Calculate source rectangle from percentages
      const sx = Math.max(0, Math.round((cropBox.x / 100) * origW));
      const sy = Math.max(0, Math.round((cropBox.y / 100) * origH));
      const sw = Math.min(origW - sx, Math.round((cropBox.width / 100) * origW));
      const sh = Math.min(origH - sy, Math.round((cropBox.height / 100) * origH));

      if (sw <= 0 || sh <= 0) {
        toast.error("Area crop terlalu kecil.", "Crop Gagal");
        setIsProcessing(false);
        return;
      }

      // Temporary canvas for cropped area
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = sw;
      cropCanvas.height = sh;
      const cropCtx = cropCanvas.getContext("2d");

      if (!cropCtx) {
        throw new Error("Gagal menginisialisasi 2D Canvas");
      }

      cropCtx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, sw, sh);

      // Final canvas for transforms (rotation & flip)
      const finalCanvas = document.createElement("canvas");
      const isRotated90or270 = rotation === 90 || rotation === 270;
      finalCanvas.width = isRotated90or270 ? sh : sw;
      finalCanvas.height = isRotated90or270 ? sw : sh;
      const finalCtx = finalCanvas.getContext("2d");

      if (!finalCtx) {
        throw new Error("Gagal menginisialisasi Final 2D Canvas");
      }

      // Center transforms
      finalCtx.save();
      finalCtx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
      finalCtx.rotate((rotation * Math.PI) / 180);
      finalCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      finalCtx.drawImage(cropCanvas, -sw / 2, -sh / 2);
      finalCtx.restore();

      const croppedDataUrl = finalCanvas.toDataURL("image/png");

      onApply({
        src: croppedDataUrl,
        width: finalCanvas.width,
        height: finalCanvas.height,
        aspectRatio: finalCanvas.width / (finalCanvas.height || 1),
      });

      toast.success(
        locale === "en"
          ? `Image cropped successfully (${finalCanvas.width} × ${finalCanvas.height} px).`
          : `Gambar berhasil dipotong (${finalCanvas.width} × ${finalCanvas.height} px).`,
        locale === "en" ? "Crop Successful" : "Crop Berhasil"
      );
      onClose();
    } catch (err) {
      console.error("Gagal melakukan crop gambar:", err);
      toast.error(locale === "en" ? "Failed to process image crop." : "Gagal memproses crop gambar.", "Error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard shortcut: Escape to close, Enter to apply
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
        handleExecuteCrop();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, cropBox, rotation, flipH, flipV]);

  if (!mounted || !isOpen) return null;

  const currentCropPixelWidth = Math.round((cropBox.width / 100) * naturalSize.width);
  const currentCropPixelHeight = Math.round((cropBox.height / 100) * naturalSize.height);
  const modalContent = (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-hidden">
      <div
        className="bg-neutral-900 text-white rounded-2xl sm:rounded-3xl border border-neutral-700/80 shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CropIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                <span>{locale === "en" ? "Dynamic Image Cropper" : "Crop Gambar Dinamis"}</span>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {currentCropPixelWidth} × {currentCropPixelHeight} px
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {locale === "en" ? "Drag box or handles to freely crop the image." : "Tarik kotak atau 8 titik sudut/sisi untuk memotong bebas sesuka Anda."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === "en" ? "Close Cropper" : "Tutup Crop"}
            className="p-1.5 rounded-xl hover:bg-neutral-800 active:scale-90 text-neutral-400 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Aspect Ratios & Transformations */}
        <div className="px-5 py-2.5 bg-neutral-950/80 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
          {/* Aspect Ratio Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[11px] font-medium text-neutral-400 mr-1">
              {locale === "en" ? "Ratio:" : "Rasio:"}
            </span>
            {(
              [
                ["free", locale === "en" ? "Free (Custom)" : "Bebas (Custom)"],
                ["1:1", locale === "en" ? "1:1 Square" : "1:1 Persegi"],
                ["4:3", locale === "en" ? "4:3 Standard" : "4:3 Standar"],
                ["16:9", locale === "en" ? "16:9 Widescreen" : "16:9 Lebar"],
                ["3:2", locale === "en" ? "3:2 Photo" : "3:2 Foto"],
                ["original", locale === "en" ? "Original" : "Asli"],
              ] as [AspectRatioMode, string][]
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => applyAspectRatio(mode)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                  aspectRatioMode === mode
                    ? "bg-amber-500 text-neutral-950 shadow-xs"
                    : "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tools: Rotate, Flip, Zoom, Reset */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 active:scale-90 text-neutral-300 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title={locale === "en" ? "Rotate Left (-90°)" : "Putar Kiri (-90°)"}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 active:scale-90 text-neutral-300 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title={locale === "en" ? "Rotate Right (+90°)" : "Putar Kanan (+90°)"}
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-neutral-700 mx-0.5" />

            <button
              type="button"
              onClick={() => setFlipH((prev) => !prev)}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                flipH
                  ? "bg-amber-500 text-neutral-950"
                  : "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white"
              )}
              title={locale === "en" ? "Flip Horizontal (Mirror)" : "Balik Horizontal (Mirror)"}
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setFlipV((prev) => !prev)}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                flipV
                  ? "bg-amber-500 text-neutral-950"
                  : "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white"
              )}
              title={locale === "en" ? "Flip Vertical" : "Balik Vertikal"}
            >
              <FlipVertical className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-neutral-700 mx-0.5" />

            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 active:scale-90 text-neutral-300 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title={locale === "en" ? "Zoom Out Preview" : "Perkecil Preview"}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(2.5, prev + 0.1))}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 active:scale-90 text-neutral-300 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title={locale === "en" ? "Zoom In Preview" : "Perbesar Preview"}
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCropBox({ x: 0, y: 0, width: 100, height: 100 });
                setRotation(0);
                setFlipH(false);
                setFlipV(false);
                setZoom(1);
                setAspectRatioMode("free");
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 text-[11px] font-medium text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title={locale === "en" ? "Reset All Settings" : "Reset Semua Pengaturan"}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Dynamic Canvas Workspace */}
        <div
          ref={containerRef}
          className="flex-1 bg-neutral-950 p-4 sm:p-6 flex items-center justify-center overflow-hidden relative min-h-[280px] max-h-[48vh] select-none cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Scaled Image Wrapper */}
          <div
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
              transformOrigin: "center center",
              transition: "transform 120ms ease-out",
            }}
            className="relative inline-block max-w-full max-h-full"
          >
            {/* Base Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              crossOrigin="anonymous"
              alt="Workspace image for cropping"
              className="max-h-[44vh] max-w-[65vw] w-auto h-auto object-contain block pointer-events-none rounded-xs shadow-2xl border border-neutral-800"
              draggable={false}
            />

            {/* Dark Overlay Outside Crop Area (Cutout Mask) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "rgba(0, 0, 0, 0.55)",
                clipPath: `polygon(
                  0% 0%,
                  0% 100%,
                  ${cropBox.x}% 100%,
                  ${cropBox.x}% ${cropBox.y}%,
                  ${cropBox.x + cropBox.width}% ${cropBox.y}%,
                  ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%,
                  ${cropBox.x}% ${cropBox.y + cropBox.height}%,
                  ${cropBox.x}% 100%,
                  100% 100%,
                  100% 0%
                )`,
              }}
            />

            {/* Dynamic Crop Box Box */}
            <div
              className="absolute border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-move"
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.width}%`,
                height: `${cropBox.height}%`,
              }}
              onPointerDown={(e) => handlePointerDown(e, "move")}
            >
              {/* 3x3 Rule of Thirds Grid Lines */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-60">
                <div className="border-r border-b border-dashed border-amber-300/40" />
                <div className="border-r border-b border-dashed border-amber-300/40" />
                <div className="border-b border-dashed border-amber-300/40" />
                <div className="border-r border-b border-dashed border-amber-300/40" />
                <div className="border-r border-b border-dashed border-amber-300/40" />
                <div className="border-b border-dashed border-amber-300/40" />
                <div className="border-r border-dashed border-amber-300/40" />
                <div className="border-r border-dashed border-amber-300/40" />
                <div />
              </div>

              {/* Dimension Tag in Center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-black/75 text-amber-300 rounded-md border border-amber-400/40 backdrop-blur-xs shadow-md">
                  {currentCropPixelWidth} × {currentCropPixelHeight}
                </span>
              </div>

              {/* ─── 4 Corner Drag Handles ─── */}
              {/* Top-Left (NW) */}
              <div
                className="absolute -top-2 -left-2 w-4 h-4 bg-amber-400 rounded-full border-2 border-neutral-950 shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "nw")}
              />
              {/* Top-Right (NE) */}
              <div
                className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full border-2 border-neutral-950 shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "ne")}
              />
              {/* Bottom-Left (SW) */}
              <div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-400 rounded-full border-2 border-neutral-950 shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "sw")}
              />
              {/* Bottom-Right (SE) */}
              <div
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-400 rounded-full border-2 border-neutral-950 shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "se")}
              />

              {/* ─── 4 Edge Drag Handles ─── */}
              {/* Top (N) */}
              <div
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-amber-400 rounded-full border-2 border-neutral-950 shadow-md cursor-ns-resize hover:scale-110 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "n")}
              />
              {/* Bottom (S) */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-amber-400 rounded-full border-2 border-neutral-950 shadow-md cursor-ns-resize hover:scale-110 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "s")}
              />
              {/* Left (W) */}
              <div
                className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-6 bg-amber-400 rounded-full border-2 border-neutral-950 shadow-md cursor-ew-resize hover:scale-110 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "w")}
              />
              {/* Right (E) */}
              <div
                className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-6 bg-amber-400 rounded-full border-2 border-neutral-950 shadow-md cursor-ew-resize hover:scale-110 transition-transform"
                onPointerDown={(e) => handlePointerDown(e, "e")}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-800 bg-neutral-900/95 shrink-0">
          <div className="text-[11px] text-neutral-400 flex items-center gap-2">
            <span>{locale === "en" ? "Original:" : "Asli:"} {naturalSize.width} × {naturalSize.height} px</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">{locale === "en" ? "Result:" : "Hasil:"} {currentCropPixelWidth} × {currentCropPixelHeight} px</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
            >
              {locale === "en" ? "Cancel" : "Batal"}
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExecuteCrop}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 touch-manipulation"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isProcessing ? (locale === "en" ? "Processing..." : "Memproses...") : (locale === "en" ? "Apply Crop" : "Terapkan Hasil Crop")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
