"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Star,
  FolderOpen,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { LinkCard } from "@/components/links/link-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useDashboard, subscribeRefresh } from "@/hooks/use-data";
import { CATEGORY_COLORS } from "@/lib/utils";
import { SerializedLink } from "@/lib/types";
import { LinkoraText, LinkorianText } from "@/components/ui/linkora-text";
import { useSession } from "next-auth/react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTranslation } from "@/components/providers/i18n-provider";
import { useViewMode } from "@/hooks/use-view-mode";
import { ViewModeSwitcher } from "@/components/ui/view-mode-switcher";

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
  const { requireAuth } = useRequireAuth();
  const { t, locale } = useTranslation();
  const [viewMode, setViewMode] = useViewMode();
  const userName = session?.user?.name || "Linkorian";

  const { stats, refresh } = useDashboard();

  useEffect(() => {
    if (refreshKey > 0) {
      refresh(true);
    }
  }, [refreshKey, refresh]);

  useEffect(() => {
    const handleRefresh = () => {
      refresh(true);
    };
    return subscribeRefresh(handleRefresh, "dashboard");
  }, [refresh]);

  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizeResult, setOrganizeResult] = useState<{
    message: string;
    processed: number;
    changes?: any[];
    error?: string;
  } | null>(null);

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
      recentCacheRef.current["added"] = stats.recentLinks;
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
    if (requireAuth(
      locale === "en" ? "Organize Links with AI Liko" : "Merapikan Tautan dengan AI Liko",
      locale === "en" ? "Sign in or register for free to use AI Liko assistant to automatically group and organize all your links." : "Masuk atau daftar gratis untuk menggunakan asisten AI Liko yang otomatis mengelompokkan dan merapikan seluruh tautan Anda."
    )) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("liko-trigger-organize", {
        detail: { isAll: true },
      })
    );
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
    <div className="relative space-y-6 sm:space-y-8 pb-10">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO COCKPIT (Layer Z-10) with Cyber Corners & Fractured Notch */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* SECTION 1: HERO COCKPIT & AI ASSISTANT (UNIFIED SINGLE CARD)             */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full"
      >
        <div className="relative glass-panel rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 overflow-hidden border border-border/80 shadow-2xl shadow-primary/10 bg-gradient-to-br from-card/95 via-card/85 to-primary/[0.05]">
          {/* Cybernetic Angled Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent/40 rounded-tr-2xl pointer-events-none" />

          {/* Ambient Glowing Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-accent/20 via-primary/15 to-purple-500/15 blur-2xl animate-pulse" />
            <div className="absolute right-12 top-8 w-20 h-20 rounded-full border border-accent/25 opacity-70 animate-[spin_20s_linear_infinite]" />
            <div className="absolute right-36 bottom-10 w-3 h-3 rounded-full bg-accent/40 blur-[1px]" />
            <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-primary/10 blur-[90px] rounded-full pointer-events-none" />
          </div>

          <div className="relative z-10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 sm:gap-8 lg:gap-10 w-full">
            {/* Left Block: Welcome Greeting & Security Info */}
            <div className="space-y-2 text-left flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-medium tracking-tight text-muted-foreground font-sans flex items-center gap-1.5">
                {locale === "en" ? "Hello," : "Halo,"} <LinkorianText />
              </h2>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-heading leading-tight break-words">
                {userName || "Linkorian"}
              </h1>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 pt-0.5">
                <span>{locale === "en" ? "Your workspace on" : "Ruang Anda"}</span> <LinkoraText />
              </div>
              <div className="flex items-center gap-2.5 pt-2 text-xs sm:text-sm text-muted-foreground font-medium">
                <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <span>{locale === "en" ? "All notes, links, and documents are securely encrypted." : "Semua catatan, tautan, dan dokumen terenkripsi dengan aman."}</span>
              </div>
            </div>

            {/* Right Block: Seamlessly Integrated AI Liko Assistant Pod */}
            <div className="w-full xl:w-auto shrink-0 bg-background/50 dark:bg-card/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-primary/20 shadow-lg flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              {/* Mascot Avatar with High-Tech Laser Rings */}
              <div className="flex-shrink-0 relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
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
                  className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-background shadow-2xl bg-background z-10 transform-gpu"
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
              <div className="flex-1 text-center sm:text-left space-y-2 max-w-sm">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold">
                  {t("dashboard.aiAssistant")}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-foreground font-heading leading-tight">
                  {s.totalLinks === 0
                    ? t("dashboard.aiEmptyTitle")
                    : uncatCount > 0
                      ? t("dashboard.aiUncatTitle", { count: uncatCount })
                      : t("dashboard.aiOrganizedTitle")}
                </h3>

                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">
                  {s.totalLinks === 0
                    ? t("dashboard.aiEmptyDesc")
                    : uncatCount > 0
                      ? t("dashboard.aiUncatDesc", { count: uncatCount })
                      : t("dashboard.aiOrganizedDesc")}
                </p>

                <div className="pt-1">
                  <Button
                    size="lg"
                    onClick={handleOrganize}
                    disabled={isOrganizing || s.totalLinks === 0}
                    className="w-full sm:w-auto h-9 sm:h-10 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold gap-2 shadow-md bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer active:scale-95 transition-transform"
                  >
                    {isOrganizing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>{t("dashboard.organizingBtn")}</span>
                      </>
                    ) : s.totalLinks === 0 ? (
                      <span>{t("dashboard.noLinksBtn")}</span>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 shrink-0" />
                        <span>{t("dashboard.aiOrganizeBtn")}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
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
                <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground tracking-tight">
                  {t("dashboard.priorityLinks")}
                </h2>
              </div>

              <div className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-500">
                {s.favoriteLinks.length} {locale === "en" ? (s.favoriteLinks.length === 1 ? "Item" : "Items") : "Item"}
              </div>
            </div>

            {/* Grid of Cards */}
            <div className={viewMode === "compact" ? "flex flex-col gap-2.5 w-full" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"}>
              {s.favoriteLinks.map((link, i) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  index={i}
                  viewMode={viewMode}
                  onUpdate={triggerRefresh}
                  onDelete={(deletedId) => {
                    s.favoriteLinks = s.favoriteLinks.filter((l) => l.id !== deletedId);
                    setFilteredRecentLinks((prev) => prev.filter((l) => l.id !== deletedId));
                  }}
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 max-w-full overflow-x-auto scrollbar-none">
                <div className="flex items-center p-1 rounded-xl bg-background/80 border border-border/80 shadow-inner overflow-x-auto max-w-full scrollbar-none">
                  {(
                    [
                      { id: "added", label: t("dashboard.filterAdded") },
                      { id: "edited", label: t("dashboard.filterEdited") },
                      { id: "opened", label: t("dashboard.filterOpened") }
                    ] as const
                  ).map((tab) => {
                    const isActive = recentFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setRecentFilter(tab.id)}
                        className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer touch-manipulation select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
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

                <ViewModeSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
              </div>

              <Link
                href="/links"
                prefetch={true}
                className="self-end sm:self-auto px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold flex items-center gap-1.5 transition-all group"
              >
                <span>{t("common.viewAll")}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Links Content Grid */}
            {loadingRecent ? (
              <div className={viewMode === "compact" ? "flex flex-col gap-2.5 w-full" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={viewMode === "compact" ? "h-14 bg-card/60 animate-pulse rounded-xl border border-border/40" : "h-56 bg-card/60 animate-pulse rounded-2xl border border-border/40"} />
                ))}
              </div>
            ) : filteredRecentLinks.length > 0 ? (
              <div className={viewMode === "compact" ? "flex flex-col gap-2.5 w-full" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"}>
                {filteredRecentLinks.map((link, i) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    index={i}
                    viewMode={viewMode}
                    onUpdate={triggerRefresh}
                    onDelete={(deletedId) => {
                      setFilteredRecentLinks((prev) => prev.filter((l) => l.id !== deletedId));
                    }}
                    onEdit={openEditLink}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel p-10 rounded-2xl border border-dashed border-border text-center">
                <p className="text-muted-foreground text-sm font-medium">
                  {t("links.noLinksFound")}
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
              <div className="mx-auto w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary shadow-lg shadow-primary/20">
                <FolderOpen className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-black text-foreground font-heading">
                {t("dashboard.emptyTitle")}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {t("dashboard.emptyDesc")}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DIALOG 1: AI ORGANIZE RESULT REPORT                                      */}
      {/* ========================================================================= */}
      <Dialog open={!!organizeResult} onOpenChange={(open) => !open && setOrganizeResult(null)}>
        <DialogContent className="border-primary/20 sm:max-w-xl md:max-w-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl rounded-3xl space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-black font-heading text-primary">
              {organizeResult?.error ? t("common.error") : (locale === "en" ? "Liko AI Insights Report" : "Laporan Wawasan AI Liko")}
            </DialogTitle>
            <DialogDescription>
              {organizeResult?.error
                ? (locale === "en" ? "Failed to organize links." : "Gagal mengorganisir tautan.")
                : (locale === "en"
                    ? `Successfully analyzed and grouped ${organizeResult?.processed || 0} links into relevant categories.`
                    : `Berhasil menganalisis dan mengelompokkan ${organizeResult?.processed || 0} tautan ke dalam kategori yang sesuai.`)}
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
                {locale === "en" ? "All links are already categorized accurately." : "Semua tautan sudah memiliki kategori yang tepat saat ini."}
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setOrganizeResult(null)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all active:scale-95 shadow-md cursor-pointer"
            >
              {t("common.close")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
