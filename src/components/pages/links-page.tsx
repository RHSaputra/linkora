"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Zap } from "lucide-react";
import { LinkCard } from "@/components/links/link-card";
import { SearchBar, isNaturalLanguageQuery } from "@/components/links/search-bar";
import { useLinks, useTags } from "@/hooks/use-data";
import { SerializedLink } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/components/providers/i18n-provider";

interface LinksPageProps {
  refreshKey: number;
  triggerRefresh: () => void;
  openEditLink: (link: SerializedLink) => void;
}

export function LinksPage({ refreshKey, triggerRefresh, openEditLink }: LinksPageProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const { tags } = useTags();

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
    // Cancel any in-flight AI request
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
        // Fallback results from server — still show them but mark as non-AI
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
  const { links, loading, refresh, loadMore, hasMore, total } = useLinks(
    {
      q: isNL ? undefined : debouncedQuery, // Skip regular search if AI is handling it
      category: category === "all" ? undefined : category,
      tag: tag || undefined,
      favorite: favoriteOnly,
    },
    { pageSize: 24 }
  );

  useEffect(() => {
    if (refreshKey > 0) refresh(true);
  }, [refreshKey, refresh]);

  // Determine which results to display safely with fallback array
  const displayLinks = (isNL && aiResults !== null ? aiResults : links) || [];
  const displayTotal = isNL && aiResults !== null ? aiResults.length : (total ?? displayLinks.length);
  const isLoadingResults = isNL ? isAiSearching : loading;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{t("links.allLinksTitle")}</h1>
        <p className="text-muted-foreground mt-1">
          {displayTotal != null
            ? t("links.countSaved", { count: displayTotal })
            : `${displayLinks.length} ${t("dashboard.totalLinks")}`}
        </p>
      </motion.div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : displayLinks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayLinks.map((link, i) => (
              <LinkCard
                key={link.id}
                link={link}
                index={i}
                onUpdate={triggerRefresh}
                onEdit={openEditLink}
              />
            ))}
          </div>

          {!isNL && hasMore && (
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
