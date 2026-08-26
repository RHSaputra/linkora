"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  FolderOpen,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Shield,
  ChevronRight,
  PieChart
} from "lucide-react";
import Link from "next/link";
import { LinkCard3D } from "@/components/ui/link-card-3d";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/use-data";
import { CATEGORY_COLORS } from "@/lib/utils";
import { SerializedLink } from "@/lib/types";
import { LinkoraText } from "@/components/ui/linkora-text";
import { useSession } from "next-auth/react";

interface DashboardPageProps {
  refreshKey: number;
  triggerRefresh: () => void;
  openEditLink: (link: SerializedLink) => void;
}

export function DashboardPage({
  refreshKey,
  triggerRefresh,
  openEditLink
}: DashboardPageProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Komandan";

  const { stats, loading, refresh } = useDashboard();

  useEffect(() => {
    if (refreshKey > 0) {
      recentCacheRef.current = {};
      refresh(true);
    }
  }, [refreshKey, refresh]);

  useEffect(() => {
    const handleRefresh = () => {
      recentCacheRef.current = {};
      refresh(true);
    };
    window.addEventListener("refreshData", handleRefresh);
    return () => window.removeEventListener("refreshData", handleRefresh);
  }, [refresh]);

  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizeResult, setOrganizeResult] = useState<{
    message: string;
    processed: number;
    changes?: any[];
    error?: string;
  } | null>(null);
  const [clusterDialogOpen, setClusterDialogOpen] = useState(false);

  useEffect(() => {
    const handleOrganizeState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOrganizing: boolean }>;
      if (customEvent.detail !== undefined) {
        setIsOrganizing(Boolean(customEvent.detail.isOrganizing));
      }
    };
    window.addEventListener("liko-organize-state", handleOrganizeState);
    return () => window.removeEventListener("liko-organize-state", handleOrganizeState);
  }, []);

  const [recentFilter, setRecentFilter] = useState<"added" | "edited" | "opened">("added");
  const [filteredRecentLinks, setFilteredRecentLinks] = useState<SerializedLink[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const recentCacheRef = useRef<Record<string, SerializedLink[]>>({});

  useEffect(() => {
    if (stats) {
      if (recentFilter === "added") {
        setFilteredRecentLinks(stats.recentLinks);
      } else if (recentCacheRef.current[recentFilter]) {
        setFilteredRecentLinks(recentCacheRef.current[recentFilter]);
      } else {
        setLoadingRecent(true);
        fetch(`/api/dashboard/recent?filter=${recentFilter}`)
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data)) {
              recentCacheRef.current[recentFilter] = data;
              setFilteredRecentLinks(data);
            }
          })
          .finally(() => setLoadingRecent(false));
      }
    }
  }, [recentFilter, stats]);

  const handleOrganize = async () => {
    setIsOrganizing(true);
    try {
      const res = await fetch("/api/ai/organize", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setOrganizeResult({
          message: data.message,
          processed: data.processed,
          changes: data.changes
        });
        refresh();
      } else {
        setOrganizeResult({ message: "Gagal", processed: 0, error: data.error });
      }
    } catch (e: any) {
      setOrganizeResult({ message: "Error", processed: 0, error: e.message });
    } finally {
      setIsOrganizing(false);
    }
  };

  if (!stats) {
    return (
      <div className="space-y-8 animate-pulse pt-8 pb-20">
        <div className="h-64 bg-card/60 rounded-[2.5rem] border border-border/40" />
        <div className="h-44 bg-card/60 rounded-3xl border border-border/40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-60 bg-card/40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const s = stats;
  const uncatCount =
    s?.categoryStats?.find((c) => c.category === "Custom" || c.category === "Uncategorized")?.count || 0;

  return (
    <div className="relative space-y-8 pb-28 overflow-x-hidden">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO COCKPIT (Layer Z-10) with Cyber Corners & Fractured Notch */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full"
      >
        <div className="relative glass-panel rounded-[2.5rem] p-6 sm:p-10 lg:p-12 overflow-hidden border border-border/80 shadow-[0_20px_50px_-15px_rgba(99,102,241,0.12)] bg-gradient-to-br from-card/90 via-card/75 to-primary/[0.04]">
          {/* Cybernetic Angled Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40 rounded-tr-2xl pointer-events-none" />

          {/* Ambient Right Sphere & Orbit Nodes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-cyan-400/20 via-primary/15 to-purple-500/15 blur-2xl animate-pulse" />
            <div className="absolute right-12 top-8 w-20 h-20 rounded-full border border-cyan-400/25 opacity-70 animate-[spin_20s_linear_infinite]" />
            <div className="absolute right-36 bottom-10 w-3 h-3 rounded-full bg-cyan-400/40 blur-[1px]" />
            <div className="absolute right-10 top-1/3 w-3.5 h-3.5 rounded-full bg-primary/60 shadow-[0_0_10px_var(--primary)]" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 w-full">
            {/* Left Block: Status Pill, Welcome Header */}
            <div className="space-y-1.5 text-left">

              <h2 className="text-lg sm:text-xl font-medium tracking-tight text-muted-foreground font-sans">
                Selamat Datang,
              </h2>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] font-sans leading-tight">
                {userName}
              </h1>
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 pt-0.5">
                <span>Ruang Anda</span> <LinkoraText />
              </div>
              <div className="flex items-center gap-2.5 pt-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
                <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <span>Semua catatan, tautan, dan dokumen terenkripsi dengan aman.</span>
              </div>
            </div>

            {/* Right Block: Redesigned Kluster Data Interactive Widget */}
            {s.categoryStats.length > 0 && (
              <motion.button
                type="button"
                onClick={() => setClusterDialogOpen(true)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="relative w-full lg:w-auto lg:min-w-[280px] text-left glass-panel bg-card/85 hover:bg-card/95 backdrop-blur-xl border border-primary/30 hover:border-primary/60 rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] transition-all duration-300 group cursor-pointer overflow-hidden"
              >
                {/* Subtle scanning light effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                    Kluster Data
                  </span>
                </div>
                  <div className="flex items-center gap-1 text-xs text-primary font-bold group-hover:translate-x-1 transition-transform">
                    <span>Lihat Rincian</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Visual Distribution Segment Bar */}
                <div className="h-2.5 rounded-full bg-muted/80 overflow-hidden flex mb-3 p-[1px] shadow-inner">
                  {s.categoryStats.map((cat) => {
                    const pct = s.totalLinks > 0 ? (cat.count / s.totalLinks) * 100 : 0;
                    const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Custom;
                    return (
                      <div
                        key={cat.category}
                        className="h-full transition-all hover:opacity-80 rounded-sm"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                        title={`${cat.category}: ${cat.count}`}
                      />
                    );
                  })}
                </div>

                {/* Minimalist Summary Footer */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    <strong className="text-foreground font-bold">{s.categoryStats.length}</strong> Kategori Aktif
                  </span>
                  <span className="font-mono bg-primary/15 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    {s.totalLinks} Tautan
                  </span>
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* SECTION 2: AI LIKO INSIGHT ENGINE                                        */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative z-20"
      >
        <div className="relative glass-panel rounded-3xl p-6 sm:p-8 lg:p-8 border-2 border-primary/30 overflow-hidden bg-card/90 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(99,102,241,0.2)]">
          {/* Holographic Glowing Gradients & Stepped Shard Accents */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-cyan-500/10 opacity-70 pointer-events-none" />
          <div className="absolute right-0 top-0 w-80 h-80 bg-primary/20 blur-[110px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/15 blur-[90px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

          {/* Overlapping Interior Card with Neon Rings & Dynamic Action */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            {/* Mascot Avatar with High-Tech Laser Rings */}
            <div className="flex-shrink-0 relative w-32 h-32 flex items-center justify-center">
              {/* Outer Ambient Glow Pulsing */}
              <motion.div
                className="absolute -inset-3 rounded-full bg-gradient-to-tr from-cyan-500/30 via-primary/30 to-purple-500/30 blur-xl pointer-events-none transform-gpu"
                animate={{
                  scale: isOrganizing ? [1, 1.2, 1] : [1, 1.05, 1],
                  opacity: isOrganizing ? [0.6, 1, 0.6] : [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: isOrganizing ? 1.5 : 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Outer Dashed Orbit Ring */}
              <motion.div
                className="absolute -inset-1.5 rounded-full border border-dashed border-primary/40 pointer-events-none transform-gpu"
                animate={{ rotate: isOrganizing ? -360 : 360 }}
                transition={{ duration: isOrganizing ? 8 : 24, repeat: Infinity, ease: "linear" }}
              />

              {/* Main Laser Conic Ring */}
              <motion.div
                className="absolute inset-0 rounded-full transform-gpu"
                animate={isOrganizing ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  isOrganizing
                    ? { duration: 1.8, repeat: Infinity, ease: "linear" }
                    : { duration: 0.3 }
                }
              >
                <div
                  className={`relative w-full h-full rounded-full p-[3px] transition-all duration-500 ${
                    isOrganizing
                      ? "bg-[conic-gradient(from_0deg,transparent_0_120deg,#06b6d4_220deg,#8b5cf6_290deg,#3b82f6_360deg)] shadow-[0_0_30px_rgba(59,130,246,0.8)]"
                      : "bg-gradient-to-tr from-primary/50 via-cyan-400/40 to-purple-500/50"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-background" />
                  {isOrganizing && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#38bdf8,0_0_20px_#818cf8]" />
                  )}
                </div>
              </motion.div>

              {/* Mascot Image Container with Gentle Levitating Floating Motion */}
              <motion.div
                className="relative w-22 h-22 rounded-full overflow-hidden border-2 border-background shadow-2xl bg-background z-10 transform-gpu"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src="/maskot.jpeg"
                  alt="Liko Asisten AI"
                  className="w-full h-full object-cover object-top"
                />
              </motion.div>
            </div>

            {/* AI Text Insight & Recommendation */}
            <div className="flex-1 text-left space-y-2.5">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                Liko Asisten AI
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                {uncatCount > 0
                  ? `Ditemukan ${uncatCount} tautan yang perlu dirapikan!`
                  : "Semua koleksi tautanmu sudah tersusun rapi!"}
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                {uncatCount > 0
                  ? `Hai! Liko mendeteksi ${uncatCount} tautan belum memiliki kategori yang spesifik. Klik tombol di samping agar Liko secara otomatis menganalisis judul dan konten tautanmu untuk mengelompokkannya.`
                  : "Semua tautanmu sudah terorganisir dengan rapi dalam kluster yang tepat. Saat kamu menambahkan tautan baru di masa mendatang, Liko akan selalu siap membantumu."}
              </p>
            </div>

            {/* AI Action CTA Button */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOrganize}
                disabled={isOrganizing}
                className="relative w-full lg:w-auto px-7 py-3.5 sm:px-8 sm:py-3.5 rounded-2xl bg-gradient-to-r from-primary via-indigo-500 to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-[0_10px_30px_-5px_rgba(99,102,241,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                {isOrganizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menganalisis & Merapikan...</span>
                  </>
                ) : (
                  <span>Bantu Rapikan, Liko!</span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* SECTION 3 & 4: ASET PRIORITAS & STREAM TAUTAN (Layer Z-25 & Z-30)          */}
      {/* ========================================================================= */}
      <div className="space-y-10 pt-4">
        {/* ASET PRIORITAS (FAVORITES) */}
        {s.favoriteLinks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative z-25"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Star className="h-5 w-5 fill-amber-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-foreground tracking-tight">
                  Link Prioritas
                </h2>
              </div>

              <div className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-500">
                {s.favoriteLinks.length} Item
              </div>
            </div>

            {/* Grid of 3D Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
              {s.favoriteLinks.map((link, i) => (
                <LinkCard3D
                  key={link.id}
                  link={link}
                  index={i}
                  onUpdate={triggerRefresh}
                  onEdit={openEditLink}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* TAUTAN TERBARU (RECENT STREAM) */}
        {s.recentLinks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative z-30"
          >
            {/* Dynamic Interactive Filter Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center p-1 rounded-xl bg-background/80 border border-border/80 shadow-inner">
                {(
                  [
                    { id: "added", label: "Baru Ditambahkan" },
                    { id: "edited", label: "Baru Diedit" },
                    { id: "opened", label: "Baru Dibuka" }
                  ] as const
                ).map((tab) => {
                  const isActive = recentFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRecentFilter(tab.id)}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeFilterPill"
                          className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <Link
                href="/links"
                prefetch={true}
                className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold flex items-center gap-1.5 transition-all group"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Links Content Grid */}
            {loadingRecent ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-56 bg-card/60 animate-pulse rounded-2xl border border-border/40" />
                ))}
              </div>
            ) : filteredRecentLinks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                {filteredRecentLinks.map((link, i) => (
                  <LinkCard3D
                    key={link.id}
                    link={link}
                    index={i}
                    onUpdate={triggerRefresh}
                    onEdit={openEditLink}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel p-10 rounded-2xl border border-dashed border-border text-center">
                <p className="text-muted-foreground text-sm font-medium">
                  Tidak ada tautan untuk filter ini.
                </p>
              </div>
            )}
          </motion.section>
        )}

        {/* EMPTY STATE */}
        {s.totalLinks === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center py-10"
          >
            <div className="glass-panel bg-card/70 p-12 rounded-[3rem] text-center border-dashed border-2 border-primary/30 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="mx-auto w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary shadow-[0_0_25px_rgba(var(--primary),0.2)]">
                <FolderOpen className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-black text-foreground font-heading">
                Brankas Belum Terisi
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Belum ada aliran data terdeteksi. Mulai tambahkan tautan baru di bilah samping atau gunakan fitur import otomatis.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DIALOG 1: AI ORGANIZE RESULT REPORT                                      */}
      {/* ========================================================================= */}
      <Dialog open={!!organizeResult} onOpenChange={(open) => !open && setOrganizeResult(null)}>
        <DialogContent className="glass-panel border-primary/30 sm:max-w-md bg-card/95 backdrop-blur-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black font-heading text-primary">
              {organizeResult?.error ? "Terjadi Kesalahan" : "Laporan Wawasan AI Liko"}
            </DialogTitle>
            <DialogDescription>
              {organizeResult?.error
                ? "Gagal mengorganisir tautan."
                : `Berhasil menganalisis dan mengelompokkan ${organizeResult?.processed || 0} tautan ke dalam kategori yang sesuai.`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {organizeResult?.error ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{organizeResult.error}</p>
              </div>
            ) : organizeResult?.changes && organizeResult.changes.length > 0 ? (
              <div className="bg-foreground/5 rounded-2xl p-4 max-h-[260px] overflow-y-auto space-y-3 border border-border">
                {organizeResult.changes.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm group">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="truncate flex-1 text-foreground font-medium group-hover:text-primary transition-colors">
                      {c.title}
                    </span>
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/5 border-primary/20"
                      style={{
                        color: CATEGORY_COLORS[c.category] || CATEGORY_COLORS.Custom
                      }}
                    >
                      {c.category}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-foreground/5 rounded-2xl border border-dashed border-border text-muted-foreground text-sm font-medium">
                Semua tautan sudah memiliki kategori yang tepat saat ini.
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setOrganizeResult(null)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all active:scale-95 shadow-md cursor-pointer"
            >
              Tutup Laporan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 2: DETAIL KLUSTER DATA MODAL                                       */}
      {/* ========================================================================= */}
      <Dialog open={clusterDialogOpen} onOpenChange={setClusterDialogOpen}>
        <DialogContent className="glass-panel border-primary/30 sm:max-w-lg bg-card/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl max-h-[85vh] flex flex-col">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                <PieChart className="h-5 w-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl sm:text-2xl font-black font-heading text-foreground">
                  Distribusi Kluster Data
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Rincian {s.totalLinks} tautan dalam {s.categoryStats.length} kategori aktif.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Full Distribution Segment Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="h-3 rounded-full bg-muted/70 overflow-hidden flex shadow-inner p-[1px]">
              {s.categoryStats.map((cat) => {
                const pct = s.totalLinks > 0 ? (cat.count / s.totalLinks) * 100 : 0;
                const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Custom;
                return (
                  <div
                    key={cat.category}
                    className="h-full hover:opacity-80 transition-opacity rounded-xs"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                    title={`${cat.category}: ${cat.count} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Scrollable Category List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[340px] mt-4">
            {s.categoryStats.map((cat, i) => {
              const pct = s.totalLinks > 0 ? (cat.count / s.totalLinks) * 100 : 0;
              const color = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Custom;
              return (
                <Link
                  key={cat.category}
                  href={`/links?category=${encodeURIComponent(cat.category)}`}
                  onClick={() => setClusterDialogOpen(false)}
                  className="p-3.5 rounded-2xl bg-foreground/[0.03] hover:bg-foreground/[0.07] border border-border/50 hover:border-primary/40 transition-all space-y-2 group block shadow-xs"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {cat.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {cat.count} tautan
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        ({pct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full bg-muted/80 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 flex sm:justify-between items-center gap-3">
            <Link
              href="/links"
              onClick={() => setClusterDialogOpen(false)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Buka Semua Tautan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setClusterDialogOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
