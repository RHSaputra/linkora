"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Zap, ChevronLeft, ChevronRight, Eye, Layers } from "lucide-react";
import { LinkCard } from "@/components/links/link-card";
import { SearchBar, isNaturalLanguageQuery } from "@/components/links/search-bar";
import { useLinks, useTags } from "@/hooks/use-data";
import { SerializedLink } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";

import { useViewMode } from "@/hooks/use-view-mode";
import { ViewModeSwitcher } from "@/components/ui/view-mode-switcher";
import { usePageStateRestoration } from "@/hooks/use-page-state-restoration";

interface LinksPageProps {
  refreshKey: number;
  triggerRefresh: () => void;
  openEditLink: (link: SerializedLink) => void;
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function LinksPage({ refreshKey, triggerRefresh, openEditLink }: LinksPageProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useViewMode();
  const { getSavedState, savePageState, restoreScrollPos } = usePageStateRestoration("links");

  // Read saved state on mount (page, display mode, scroll position)
  const savedStateRef = useRef(getSavedState());
  const initialPage = savedStateRef.current.page && savedStateRef.current.page > 0 ? savedStateRef.current.page : 1;
  const initialMode = savedStateRef.current.displayMode || "paginated";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sort, setSort] = useState<"added" | "edited" | "opened">("added");
  const { tags } = useTags();

  // Pagination & Display Mode State (Default: 12 cards per page)
  const [displayMode, setDisplayModeState] = useState<"paginated" | "all">(initialMode);
  const [aiPage, setAiPage] = useState(initialPage);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const setDisplayMode = (mode: "paginated" | "all") => {
    setDisplayModeState(mode);
    savePageState({ displayMode: mode });
  };

  // AI Search state
  const [aiResults, setAiResults] = useState<SerializedLink[] | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const aiAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // AI Search effect — triggers when debounced query is a natural language query
  const performAiSearch = useCallback(async (q: string) => {
    if (aiAbortRef.current) {
      aiAbortRef.current.abort();
    }

    if (!q || !isNaturalLanguageQuery(q)) {
      setAiResults(null);
      setAiExplanation(null);
      return;
    }

    const controller = new AbortController();
    aiAbortRef.current = controller;
    setIsAiSearching(true);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
        signal: controller.signal,
      });

      if (!res.ok) {
        setAiResults(null);
        setAiExplanation(null);
        return;
      }

      const data = await res.json();
      if (data.aiPowered) {
        setAiResults(data.items || []);
        setAiExplanation(data.explanation || null);
      } else {
        setAiResults(data.items || []);
        setAiExplanation(null);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setAiResults(null);
        setAiExplanation(null);
      }
    } finally {
      setIsAiSearching(false);
    }
  }, []);

  useEffect(() => {
    performAiSearch(debouncedQuery);
  }, [debouncedQuery, performAiSearch]);

  // Clear AI results when query is cleared
  useEffect(() => {
    if (!query) {
      setAiResults(null);
      setAiExplanation(null);
    }
  }, [query]);

  // Regular search (used when query is NOT natural language)
  const isNL = isNaturalLanguageQuery(debouncedQuery);
  const { links, loading, refresh, loadMore, goToPage, page, hasMore, total } = useLinks(
    {
      q: isNL ? undefined : debouncedQuery,
      category: category === "all" ? undefined : category,
      tag: tag || undefined,
      favorite: favoriteOnly,
      sort,
    },
    { pageSize: displayMode === "paginated" ? 12 : 100, initialPage }
  );

  useEffect(() => {
    if (refreshKey > 0) refresh(true);
  }, [refreshKey, refresh]);

  // Calculate Display Items & Pagination Metrics
  const isAiActive = isNL && aiResults !== null;
  const rawLinks = isAiActive ? aiResults : links;
  const displayTotal = isAiActive ? aiResults.length : (total ?? rawLinks.length);
  const isLoadingResults = isAiActive ? isAiSearching : loading;

  const pageSize = 12;
  const totalPages = isAiActive
    ? Math.max(1, Math.ceil(aiResults.length / pageSize))
    : Math.max(1, Math.ceil(displayTotal / pageSize));

  const currentPage = isAiActive ? aiPage : page;

  // Save current page state
  useEffect(() => {
    if (currentPage > 0) {
      savePageState({ page: currentPage, displayMode });
    }
  }, [currentPage, displayMode, savePageState]);

  // Restore scroll position after results finished loading
  useEffect(() => {
    if (!isLoadingResults && (isAiActive ? (aiResults?.length ?? 0) > 0 : links.length > 0)) {
      restoreScrollPos(100);
    }
  }, [isLoadingResults, isAiActive, aiResults?.length, links.length, restoreScrollPos]);

  // Filter links based on display mode
  const displayLinks = (
    displayMode === "paginated" && isAiActive
      ? aiResults.slice((aiPage - 1) * pageSize, aiPage * pageSize)
      : rawLinks
  ) || [];

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    savePageState({ page: newPage, scrollPos: 0 });

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("page", newPage.toString());
      window.history.replaceState(null, "", url.toString());
    }

    if (isAiActive) {
      setAiPage(newPage);
    } else {
      goToPage(newPage);
    }
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{t("links.allLinksTitle")}</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            {displayTotal != null
              ? t("links.countSaved", { count: displayTotal })
              : `${displayLinks.length} ${t("dashboard.totalLinks")}`}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Quick Mode Switcher Pill (12 Per Halaman vs Lihat Semua) */}
          {displayTotal > 12 && (
            <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-xl border border-border/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDisplayMode("paginated")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all cursor-pointer select-none",
                  displayMode === "paginated"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t("links.modePaginated")}
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all cursor-pointer select-none",
                  displayMode === "all"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t("links.modeAll")}
              </button>
            </div>
          )}

          <ViewModeSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </motion.div>

      {/* Quick Filter Pill Switcher Tabs with Animated Glow & Sliding Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <div className="relative inline-flex items-center p-0.5 sm:p-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-inner">
          {[
            { id: "added", label: t("dashboard.filterAdded") },
            { id: "edited", label: t("dashboard.filterEdited") },
            { id: "opened", label: t("dashboard.filterOpened") },
          ].map((item) => {
            const isActive = sort === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSort(item.id as "added" | "edited" | "opened")}
                className={cn(
                  "relative px-3 sm:px-3.5 py-1 text-[11px] sm:text-xs font-bold rounded-full transition-colors duration-200 cursor-pointer select-none whitespace-nowrap z-10",
                  isActive
                    ? "text-primary-foreground font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSortPill"
                    className="absolute inset-0 rounded-full bg-primary shadow-sm shadow-primary/30 z-[-1]"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  >
                    <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-primary via-indigo-400 to-purple-500 opacity-65 blur-[2px] animate-pulse z-[-1]" />
                  </motion.div>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <SearchBar
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        tag={tag}
        onTagChange={setTag}
        favoriteOnly={favoriteOnly}
        onFavoriteChange={setFavoriteOnly}
        tags={tags}
        isAiSearching={isAiSearching}
      />

      {/* Anchor for smooth scroll target when changing pages */}
      <div ref={gridTopRef} className="scroll-mt-6" />

      {/* AI Explanation Banner */}
      <AnimatePresence>
        {aiExplanation && isNL && !isAiSearching && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-sm">
              <Zap className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground/80">{aiExplanation}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoadingResults ? (
        <div className={viewMode === "compact" ? "flex flex-col gap-2.5 w-full" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={viewMode === "compact" ? "h-14 bg-muted rounded-xl animate-pulse" : "h-40 bg-muted rounded-xl animate-pulse"} />
          ))}
        </div>
      ) : displayLinks.length > 0 ? (
        <>
          <div className={viewMode === "compact" ? "flex flex-col gap-2.5 w-full" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
            {displayLinks.map((link, i) => (
              <LinkCard
                key={link.id}
                link={link}
                index={i}
                viewMode={viewMode}
                onUpdate={triggerRefresh}
                onEdit={openEditLink}
              />
            ))}
          </div>

          {/* Load More Button in View All Mode */}
          {displayMode === "all" && !isNL && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => loadMore()}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl border border-border bg-foreground/5 hover:bg-foreground/10 active:scale-95 text-sm font-semibold text-foreground transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {loading ? t("common.loading") : t("links.loadMore")}
              </button>
            </div>
          )}

          {/* Pagination Controls Bar & View All Toggle */}
          {displayTotal > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel bg-card/80 border border-border/70 shadow-sm backdrop-blur-md">
              {/* Range Information */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                {displayMode === "paginated" && displayTotal > 12 ? (
                  <span>
                    {t("links.showingRange", {
                      start: (currentPage - 1) * pageSize + 1,
                      end: Math.min(currentPage * pageSize, displayTotal),
                      total: displayTotal,
                    })}
                  </span>
                ) : (
                  <span>{t("links.countSaved", { count: displayTotal })}</span>
                )}
              </div>

              {/* Center Pagination Navigation Controls */}
              {displayMode === "paginated" && totalPages > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoadingResults}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer select-none"
                    title={t("links.previousPage")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("links.previousPage")}</span>
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground select-none">
                          ...
                        </span>
                      );
                    }
                    const pageNum = p as number;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoadingResults}
                        className={cn(
                          "relative min-w-[34px] h-[34px] px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none flex items-center justify-center",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                            : "bg-background/80 hover:bg-muted border border-border/60 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoadingResults}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer select-none"
                    title={t("links.nextPage")}
                  >
                    <span className="hidden sm:inline">{t("links.nextPage")}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* View All / Paginated Toggle Button */}
              {displayTotal > 12 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDisplayMode(displayMode === "paginated" ? "all" : "paginated")}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer select-none shadow-xs active:scale-95",
                      displayMode === "all"
                        ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                        : "bg-background hover:bg-muted border-border text-foreground"
                    )}
                  >
                    {displayMode === "paginated" ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>{t("links.viewAllLinks", { count: displayTotal })}</span>
                      </>
                    ) : (
                      <>
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        <span>{t("links.viewPaginated")}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center py-8">
          <Card className="glass border-dashed max-w-sm w-full">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Link2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">{t("links.noLinksFound")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("links.noLinksFoundDesc")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
