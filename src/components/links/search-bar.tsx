"use client";

import { Search, Star, X } from "lucide-react";
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
}: SearchBarProps) {
  const hasFilters = category !== "all" || tag || favoriteOnly;

  const clearFilters = () => {
    onCategoryChange("all");
    onTagChange("");
    onFavoriteChange(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari link, tag, atau catatan..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10 h-10 bg-card/50"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => onQueryChange("")}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {DEFAULT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tag || "all"} onValueChange={(v) => onTagChange(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tag</SelectItem>
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
          className="h-8 gap-1.5 text-xs"
          onClick={() => onFavoriteChange(!favoriteOnly)}
        >
          <Star className={cn("h-3.5 w-3.5", favoriteOnly && "fill-current")} />
          Favorit
        </Button>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
            Reset filter
          </Button>
        )}
      </div>
    </div>
  );
}
