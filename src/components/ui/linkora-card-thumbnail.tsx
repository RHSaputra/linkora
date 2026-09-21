"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { RefreshCw, Globe } from "lucide-react";
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
  // Normalize target URL
  const targetUrl = useMemo(() => {
    let target = (url || "").trim();
    if (target && !target.startsWith("http://") && !target.startsWith("https://")) {
      target = "https://" + target;
    }
    return target;
  }, [url]);

  // Priority 2 Screenshot URL generator (thum.io instant web screenshot)
  const screenshotUrl = useMemo(() => {
    if (!targetUrl) return null;
    return `https://image.thum.io/get/width/800/crop/600/noanimate/${targetUrl}`;
  }, [targetUrl]);

  // Determine initial image source & level:
  // Level "og": OpenGraph / Preview image
  // Level "ss": Screenshot of site
  // Level "fallback": LINKORIAN PREVIEW fallback banner
  const initialSrc = useMemo(() => {
    if (thumbnail && !thumbnail.includes("s0.wp.com/mshots")) {
      return thumbnail;
    }
    return screenshotUrl;
  }, [thumbnail, screenshotUrl]);

  const [imgSrc, setImgSrc] = useState<string | null>(initialSrc);
  const [attemptLevel, setAttemptLevel] = useState<"og" | "ss" | "fallback">(
    thumbnail && !thumbnail.includes("s0.wp.com/mshots") ? "og" : "ss"
  );
  const [faviconError, setFaviconError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const validThumb = thumbnail && !thumbnail.includes("s0.wp.com/mshots") ? thumbnail : null;
    if (validThumb) {
      setImgSrc(validThumb);
      setAttemptLevel("og");
    } else if (screenshotUrl) {
      setImgSrc(screenshotUrl);
      setAttemptLevel("ss");
    } else {
      setImgSrc(null);
      setAttemptLevel("fallback");
    }
    setFaviconError(false);
  }, [thumbnail, screenshotUrl]);

  const catColor = useMemo(() => getCategoryColor(category), [category]);

  const domainInfo = useMemo(() => {
    try {
      const parsed = new URL(targetUrl || "https://linkorian.online");
      const host = parsed.hostname.replace(/^www\./, "");
      const namePart = host.split(".")[0] || host;
      const initials = namePart.slice(0, 2).toUpperCase();
      return { host, namePart, initials };
    } catch {
      return { host: url || "linkorian.online", namePart: title || "Link", initials: (title || "LK").slice(0, 2).toUpperCase() };
    }
  }, [targetUrl, url, title]);

  const fallbackFavicon = useMemo(() => {
    return favicon || getFaviconUrl(url);
  }, [favicon, url]);

  // Handle Image Load Error -> Fallback Level Progression:
  // Level "og" fail -> try Screenshot ("ss") -> Screenshot fail -> Fallback Banner ("LINKORIAN PREVIEW")
  const handleImageError = useCallback(() => {
    if (attemptLevel === "og" && screenshotUrl) {
      setAttemptLevel("ss");
      setImgSrc(screenshotUrl);
    } else {
      setAttemptLevel("fallback");
      setImgSrc(null);
    }
  }, [attemptLevel, screenshotUrl]);

  const handleRetryAnalysis = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetrying(true);
    toast.info("Liko AI sedang menganalisis ulang preview...", "Analisis Preview");

    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (res.ok) {
        const meta = await res.json();
        if (meta.thumbnail) {
          setImgSrc(meta.thumbnail);
          setAttemptLevel("og");
          toast.success("Gambar preview berhasil diperbarui!", "Sukses");

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

      if (screenshotUrl) {
        setImgSrc(screenshotUrl);
        setAttemptLevel("ss");
      } else {
        setAttemptLevel("fallback");
        setImgSrc(null);
      }
    } catch {
      if (screenshotUrl) {
        setImgSrc(screenshotUrl);
        setAttemptLevel("ss");
      } else {
        setAttemptLevel("fallback");
      }
    } finally {
      setIsRetrying(false);
    }
  }, [targetUrl, screenshotUrl, linkId, onUpdate]);

  const renderFallbackBanner = () => (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between p-4 sm:p-5 select-none bg-slate-950 text-white">
      {/* Ambient Radial Glow */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-screen transition-opacity duration-500 group-hover:opacity-50 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 75% 20%, ${catColor} 0%, transparent 65%), radial-gradient(circle at 20% 80%, #475569 0%, transparent 60%)`,
        }}
      />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"
      />

      {/* Top Banner Row: Clean Brand Label "LINKORIAN PREVIEW" (NO strange icons!) */}
      <div className="relative z-10 flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-bold tracking-wider uppercase text-white/90">
          <span>LINKORIAN PREVIEW</span>
        </div>

        {/* Retry Button (Clean, no weird colored icons) */}
        <button
          type="button"
          onClick={handleRetryAnalysis}
          disabled={isRetrying}
          title="Coba analisis ulang metadata & gambar"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[10px] font-medium text-white/80 backdrop-blur-md border border-white/15 transition-all cursor-pointer select-none touch-manipulation disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3 h-3 text-white/70", isRetrying && "animate-spin")} />
          <span className="hidden xs:inline">{isRetrying ? "Proses..." : "Ulang"}</span>
        </button>
      </div>

      {/* Center Monogram & Domain Emblem */}
      <div className="relative z-10 flex items-center gap-3 my-auto pt-1">
        {/* Glass Icon Circle */}
        <div 
          className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center font-extrabold text-lg sm:text-xl text-white shadow-xl backdrop-blur-xl border border-white/20 shrink-0 transition-transform duration-500 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${catColor}cc, #0f172a)`,
            boxShadow: `0 8px 20px -4px ${catColor}40`,
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

        {/* Hostname & Title */}
        <div className="min-w-0 flex-1">
          <p className="font-mono font-bold text-xs sm:text-sm text-white/90 truncate tracking-tight">
            {domainInfo.host}
          </p>
          <p className="text-[11px] text-white/60 truncate font-sans font-medium">
            {title || category}
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 flex items-center justify-between text-[10px] text-white/40 font-mono pt-1">
        <span className="capitalize">{category}</span>
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-white/30" />
          <span>{domainInfo.host}</span>
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
      {imgSrc && attemptLevel !== "fallback" ? (
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={imgSrc}
            alt={title || "LINKORIAN PREVIEW"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            unoptimized
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent pointer-events-none" />
        </div>
      ) : (
        renderFallbackBanner()
      )}
    </div>
  );
}
