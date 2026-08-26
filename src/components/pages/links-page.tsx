"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link2 } from "lucide-react";
import { LinkCard } from "@/components/links/link-card";
import { SearchBar } from "@/components/links/search-bar";
import { useLinks, useTags } from "@/hooks/use-data";
import { SerializedLink } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface LinksPageProps {
  refreshKey: number;
  triggerRefresh: () => void;
  openEditLink: (link: SerializedLink) => void;
}

export function LinksPage({ refreshKey, triggerRefresh, openEditLink }: LinksPageProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const { tags } = useTags();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const { links, loading, refresh } = useLinks({
    q: debouncedQuery,
    category: category === "all" ? undefined : category,
    tag: tag || undefined,
    favorite: favoriteOnly,
  });

  useEffect(() => {
    if (refreshKey > 0) refresh(true);
  }, [refreshKey, refresh]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">All Links</h1>
        <p className="text-muted-foreground mt-1">
          {links.length} link tersimpan
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
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : links.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link, i) => (
            <LinkCard
              key={link.id}
              link={link}
              index={i}
              onUpdate={triggerRefresh}
              onEdit={openEditLink}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center py-8">
          <Card className="glass border-dashed max-w-sm w-full">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Link2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">Tidak ada link ditemukan</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Coba ubah filter atau tambah link baru
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
