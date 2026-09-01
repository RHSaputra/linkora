"use client";

import { Search, Star, X, Loader2, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_CATEGORIES } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/providers/i18n-provider";

// Heuristic to detect if query looks like natural language (Indonesian or English)
const NL_INDICATORS = [
  "yang", "tentang", "cari", "carikan", "cariin", "tampilkan", "mana",
  "berapa", "kapan", "apa", "dimana", "bulan", "minggu", "kemarin",
  "terakhir", "terbaru", "paling", "semua", "belum", "sudah", "pernah",
  "favorit", "penting", "prioritas", "deadline", "sebelum", "sesudah",
  "terkait", "mirip", "seperti", "kategori", "dibuka", "disimpan",
  "what", "where", "when", "how", "find", "show", "about", "which", "latest", "recent", "favorite"
];

export function isNaturalLanguageQuery(query: string): boolean {
  if (!query) return false;
  const words = query.trim().split(/\s+/);
  if (words.length < 3) return false;
  const lower = query.toLowerCase();
  return NL_INDICATORS.some((indicator) => lower.includes(indicator));
}

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  category: string;
  onCategoryChange: (c: string) => void;
  tag: string;
  onTagChange: (t: string) => void;
  favoriteOnly: boolean;
  onFavoriteChange: (f: boolean) => void;
  tags: string[];
  isAiSearching?: boolean;
}

export function SearchBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  tag,
  onTagChange,
  favoriteOnly,
  onFavoriteChange,
  tags,
  isAiSearching,
}: SearchBarProps) {
  const { t } = useTranslation();
  const hasFilters = category !== "all" || tag || favoriteOnly;
  const isNL = isNaturalLanguageQuery(query);

  const clearFilters = () => {
    onCategoryChange("all");
    onTagChange("");
    onFavoriteChange(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        {isAiSearching ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          placeholder={t("links.searchPlaceholder")}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className={cn(
            "pl-10 pr-24 h-10 bg-card/50 transition-all",
            isNL && "ring-1 ring-primary/30 border-primary/40"
          )}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isNL && !isAiSearching && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
              <Zap className="h-2.5 w-2.5" />
              AI
            </span>
          )}
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onQueryChange("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="flex-1 min-w-[120px] sm:w-[140px] sm:flex-initial h-9 sm:h-8 text-xs rounded-xl">
            <SelectValue placeholder={t("links.categoryLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("links.allCategories")}</SelectItem>
            {DEFAULT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tag || "all"} onValueChange={(v) => onTagChange(v === "all" ? "" : v)}>
          <SelectTrigger className="flex-1 min-w-[110px] sm:w-[120px] sm:flex-initial h-9 sm:h-8 text-xs rounded-xl">
            <SelectValue placeholder={t("links.tagsLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("links.allTags")}</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={favoriteOnly ? "default" : "outline"}
          size="sm"
          className="h-9 sm:h-8 gap-1.5 text-xs rounded-xl cursor-pointer shrink-0"
          onClick={() => onFavoriteChange(!favoriteOnly)}
        >
          <Star className={cn("h-3.5 w-3.5", favoriteOnly && "fill-current")} />
          {t("links.favorites")}
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 sm:h-8 text-xs rounded-xl cursor-pointer shrink-0" onClick={clearFilters}>
            {t("links.resetFilter")}
          </Button>
        )}
      </div>
    </div>
  );
}
