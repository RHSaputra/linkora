"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Sparkles, RefreshCw, Globe } from "lucide-react";
import { getCategoryColor, getFaviconUrl, cn } from "@/lib/utils";
import { toast } from "@/components/ui/custom-toast";

interface LinkoraCardThumbnailProps {
  url: string;
  title: string;
  category: string;
  thumbnail?: string | null;
  favicon?: string | null;
  linkId?: string;
  onUpdate?: () => void;
  className?: string;
  aspectRatio?: "card" | "dialog";
}

export function LinkoraCardThumbnail({
  url,
  title,
  category,
  thumbnail,
  favicon,
  linkId,
  onUpdate,
  className,
  aspectRatio = "card",
}: LinkoraCardThumbnailProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(() => (thumbnail && !thumbnail.includes("s0.wp.com/mshots") ? thumbnail : null));
  const [imgError, setImgError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  React.useEffect(() => {
    const validThumb = thumbnail && !thumbnail.includes("s0.wp.com/mshots") ? thumbnail : null;
    setImgSrc(validThumb);
    setImgError(false);
    setFaviconError(false);
  }, [thumbnail, favicon, url]);

  const catColor = useMemo(() => getCategoryColor(category), [category]);

  const domainInfo = useMemo(() => {
    try {
      let target = (url || "").trim();
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = "https://" + target;
      }
      const parsed = new URL(target);
      const host = parsed.hostname.replace(/^www\./, "");
      const namePart = host.split(".")[0] || host;
      const initials = namePart.slice(0, 2).toUpperCase();
      return { host, namePart, initials };
    } catch {
      return { host: url || "linkorian.online", namePart: title || "Link", initials: (title || "LK").slice(0, 2).toUpperCase() };
    }
  }, [url, title]);

  const fallbackFavicon = useMemo(() => {
    return favicon || getFaviconUrl(url);
  }, [favicon, url]);

  const handleRetryAnalysis = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetrying(true);
    toast.info("Liko AI sedang mencoba mengambil gambar & metadata ulang...", "Analisis Gambar");

    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = "https://" + targetUrl;
      }

      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (res.ok) {
        const meta = await res.json();
        if (meta.thumbnail) {
          setImgSrc(meta.thumbnail);
          setImgError(false);
          toast.success("Gambar preview berhasil diperbarui!", "Sukses");

          // Update backend if linkId is provided
          if (linkId) {
            await fetch(`/api/links/${linkId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: linkId, thumbnail: meta.thumbnail }),
            }).catch(() => {});
            onUpdate?.();
          }
          return;
        }
      }
      toast.warning("Tidak dapat mengambil gambar dari situs tujuan. Menampilkan Banner Estetis Linkora.", "Preview Linkora");
    } catch (err) {
      toast.error("Gagal menghubungkan ke server analisis.", "Error");
    } finally {
      setIsRetrying(false);
    }
  }, [url, linkId, onUpdate]);

  const renderFallbackBanner = () => (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between p-4 sm:p-5 select-none bg-slate-950/90 text-white">
      {/* ── 1. AMBIENT MESH GRADIENT & RADIAL GLOW ── */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen transition-opacity duration-700 group-hover:opacity-65 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 75% 20%, ${catColor} 0%, transparent 65%), radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 60%)`,
        }}
      />
      
      {/* Cybernetic Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"
      />

      {/* Top Banner Row: Brand Label + Retry AI Button */}
      <div className="relative z-10 flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm text-[10px] font-bold tracking-wider uppercase text-white/90">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>Linkora Preview</span>
        </div>

        {/* Retry AI Analysis Button */}
        <button
          type="button"
          onClick={handleRetryAnalysis}
          disabled={isRetrying}
          title="Coba analisis ulang metadata & gambar"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[10px] font-semibold text-white/90 backdrop-blur-md border border-white/20 transition-all cursor-pointer select-none touch-manipulation disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3 h-3 text-cyan-300", isRetrying && "animate-spin")} />
          <span className="hidden xs:inline">{isRetrying ? "Menganalisis..." : "Coba Ulang"}</span>
        </button>
      </div>

      {/* Center Monogram & Domain Emblem */}
      <div className="relative z-10 flex items-center gap-3 my-auto pt-1">
        {/* Glowing Glass Icon Circle */}
        <div 
          className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center font-extrabold text-lg sm:text-xl text-white shadow-xl backdrop-blur-xl border border-white/25 shrink-0 transition-transform duration-500 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${catColor}dd, #1e1b4b)`,
            boxShadow: `0 10px 25px -5px ${catColor}50`,
          }}
        >
          {fallbackFavicon && !faviconError ? (
            <img
              src={fallbackFavicon}
              alt=""
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-md object-contain"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <span>{domainInfo.initials}</span>
          )}
        </div>

        {/* Hostname & Subtitle */}
        <div className="min-w-0 flex-1">
          <p className="font-mono font-bold text-xs sm:text-sm text-white/90 truncate tracking-tight">
            {domainInfo.host}
          </p>
          <p className="text-[11px] text-white/60 truncate font-sans font-medium">
            {title || category}
          </p>
        </div>
      </div>

      {/* Bottom Subtle Bar */}
      <div className="relative z-10 flex items-center justify-between text-[10px] text-white/50 font-mono pt-1">
        <span className="capitalize">{category}</span>
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-white/40" />
          <span>SSL Secured</span>
        </span>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden shrink-0 border-b border-border/50 bg-slate-950",
        aspectRatio === "card" ? "h-36 sm:h-40" : "h-48 sm:h-56 rounded-2xl border",
        className
      )}
    >
      {imgSrc && !imgError ? (
        <div className="relative w-full h-full">
          <Image
            src={imgSrc}
            alt={title || "Linkora Preview"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            unoptimized
            onError={() => {
              setImgError(true);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
        </div>
      ) : (
        renderFallbackBanner()
      )}
    </div>
  );
}
