import { useCallback, useEffect, useState, useMemo } from "react";
import { SerializedLink, DashboardStats, SerializedCollection } from "@/lib/types";

// Simple in-memory cache and request deduplicator
const globalCache = new Map<string, unknown>();
const activeRequests = new Map<string, Promise<unknown>>();

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    globalCache.clear();
    return;
  }
  for (const key of globalCache.keys()) {
    if (key.startsWith(prefix)) {
      globalCache.delete(key);
    }
  }
}

export async function fetchWithCache<T = any>(url: string, forceRefresh = false): Promise<T | null> {
  if (!forceRefresh && globalCache.has(url)) {
    return globalCache.get(url) as T;
  }

  if (activeRequests.has(url)) {
    return activeRequests.get(url) as Promise<T | null>;
  }

  const doFetch = async (): Promise<T | null> => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        globalCache.set(url, data);
        return data as T;
      }
      if (res.status === 401) {
        return null;
      }
      return null;
    } catch (_err) {
      return null;
    }
  };

  const promise = doFetch().finally(() => {
    activeRequests.delete(url);
  });

  activeRequests.set(url, promise);
  return promise;
}

export function getCachedData<T = any>(url: string): T | undefined {
  return globalCache.get(url) as T | undefined;
}

export function setCachedData(url: string, data: unknown) {
  globalCache.set(url, data);
}

// ─── Granular refresh events ───────────────────────────────────────────────
export type RefreshResource =
  | "dashboard"
  | "links"
  | "collections"
  | "tags"
  | "notes"
  | "noteFolders"
  | "roadmaps";

const REFRESH_EVENT = "refreshData";

export function dispatchRefresh(resources: RefreshResource[] = []) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(REFRESH_EVENT, { detail: { resources } })
  );
}

export function subscribeRefresh(
  cb: () => void,
  resource?: RefreshResource
) {
  if (typeof window === "undefined") return () => { };
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<{ resources?: RefreshResource[] }>).detail;
    if (detail == null) {
      cb();
      return;
    }
    if (resource && Array.isArray(detail.resources) && detail.resources.includes(resource)) {
      cb();
    }
  };
  window.addEventListener(REFRESH_EVENT, handler);
  return () => window.removeEventListener(REFRESH_EVENT, handler);
}

export function invalidateAndRefresh(resources: RefreshResource[]) {
  const resourceToPrefixMap: Record<RefreshResource, string[]> = {
    dashboard: ["/api/dashboard"],
    links: ["/api/links"],
    collections: ["/api/collections"],
    tags: ["/api/tags"],
    notes: ["/api/notes"],
    noteFolders: ["/api/notes/folders"],
    roadmaps: ["/api/roadmaps"],
  };

  for (const res of resources) {
    const prefixes = resourceToPrefixMap[res] || [];
    for (const prefix of prefixes) {
      invalidateCache(prefix);
    }
  }

  dispatchRefresh(resources);
}

export function buildLinksUrl(
  filters?: {
    q?: string;
    category?: string;
    tag?: string;
    favorite?: boolean;
    collectionId?: string;
    sort?: string;
  },
  page = 1,
  pageSize?: number
) {
  const params = new URLSearchParams();
  if (filters?.q) params.set("q", filters.q);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.tag) params.set("tag", filters.tag);
  if (filters?.favorite) params.set("favorite", "true");
  if (filters?.collectionId) params.set("collectionId", filters.collectionId);
  if (filters?.sort) params.set("sort", filters.sort);
  if (pageSize) {
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
  }
  const s = params.toString();
  return `/api/links${s ? `?${s}` : ""}`;
}

interface LinksPage {
  items: SerializedLink[];
  total: number;
  page: number;
  pageSize: number | null;
  hasMore: boolean;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>((globalCache.get("/api/dashboard") as DashboardStats) || null);
  const [loading, setLoading] = useState(!globalCache.has("/api/dashboard"));

  const refresh = useCallback(async (force = false) => {
    try {
      if (force && !globalCache.has("/api/dashboard")) setLoading(true);
      const data = await fetchWithCache("/api/dashboard", force);
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeRefresh(() => refresh(true), "dashboard");
  }, [refresh]);

  return { stats, loading, refresh };
}

export function useLinks(
  filters?: {
    q?: string;
    category?: string;
    tag?: string;
    favorite?: boolean;
    collectionId?: string;
    sort?: string;
  },
  options?: { pageSize?: number }
) {
  const pageSize = options?.pageSize;

  const filterQ = filters?.q || "";
  const filterCategory = filters?.category || "";
  const filterTag = filters?.tag || "";
  const filterFavorite = Boolean(filters?.favorite);
  const filterCollectionId = filters?.collectionId || "";
  const filterSort = filters?.sort || "added";

  const firstUrl = useMemo(
    () => buildLinksUrl({ q: filterQ, category: filterCategory, tag: filterTag, favorite: filterFavorite, collectionId: filterCollectionId, sort: filterSort }, 1, pageSize),
    [filterQ, filterCategory, filterTag, filterFavorite, filterCollectionId, filterSort, pageSize]
  );

  const [links, setLinks] = useState<SerializedLink[]>(
    () => (globalCache.get(firstUrl) as LinksPage | undefined)?.items || []
  );
  const [loading, setLoading] = useState(() => !globalCache.has(firstUrl));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  const fetchPage = useCallback(
    async (p: number, force = false): Promise<LinksPage | null> => {
      const url = buildLinksUrl({ q: filterQ, category: filterCategory, tag: filterTag, favorite: filterFavorite, collectionId: filterCollectionId, sort: filterSort }, p, pageSize);
      const data = await fetchWithCache<LinksPage>(url, force);
      return (data as LinksPage) || null;
    },
    [filterQ, filterCategory, filterTag, filterFavorite, filterCollectionId, filterSort, pageSize]
  );

  const refresh = useCallback(
    async (force = false) => {
      setLoading(true);
      try {
        const d = await fetchPage(1, force);
        if (d) {
          setLinks(d.items);
          setTotal(d.total);
          setHasMore(d.hasMore);
          setPage(1);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const next = page + 1;
      const d = await fetchPage(next);
      if (d) {
        setLinks((prev) => [...prev, ...d.items]);
        setTotal(d.total);
        setHasMore(d.hasMore);
        setPage(next);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, page, hasMore, loading]);

  const goToPage = useCallback(
    async (targetPage: number, force = false) => {
      if (targetPage < 1) return;
      setLoading(true);
      try {
        const d = await fetchPage(targetPage, force);
        if (d) {
          setLinks(d.items);
          setTotal(d.total);
          setHasMore(d.hasMore);
          setPage(targetPage);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  useEffect(() => {
    if (globalCache.has(firstUrl)) {
      const cached = globalCache.get(firstUrl) as LinksPage | undefined;
      if (cached) {
        setLinks(cached.items);
        setTotal(cached.total);
        setHasMore(cached.hasMore);
        setLoading(false);
      }
    } else {
      setLoading(true);
    }
    refresh();

    return subscribeRefresh(() => refresh(true), "links");
  }, [firstUrl, refresh]);

  return { links, loading, refresh, loadMore, goToPage, page, hasMore, total, setLinks };
}

export function useCollections() {
  const [collections, setCollections] = useState<SerializedCollection[]>((globalCache.get("/api/collections") as SerializedCollection[]) || []);
  const [loading, setLoading] = useState(!globalCache.has("/api/collections"));

  const refresh = useCallback(async (force = false) => {
    if (force && !globalCache.has("/api/collections")) setLoading(true);
    try {
      const data = await fetchWithCache("/api/collections", force);
      if (Array.isArray(data)) {
        setCollections(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeRefresh(() => refresh(true), "collections");
  }, [refresh]);

  return { collections, loading, refresh, setCollections };
}

export function useTags() {
  const [tags, setTags] = useState<string[]>((globalCache.get("/api/tags") as string[]) || []);

  const refresh = useCallback(async (force = false) => {
    try {
      const data = await fetchWithCache("/api/tags", force);
      if (Array.isArray(data)) {
        setTags(data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeRefresh(() => refresh(true), "tags");
  }, [refresh]);

  return { tags, refresh };
}

export function useNotesList(params?: { q?: string; filter?: string; folderId?: string | null }) {
  const q = params?.q?.trim() || "";
  const filter = params?.filter || "all";
  const folderId = params?.folderId || null;

  const url = useMemo(() => {
    const searchParams = new URLSearchParams();
    if (q) searchParams.append("q", q);
    if (filter && filter !== "all") searchParams.append("filter", filter);
    if (folderId) searchParams.append("folderId", folderId);
    return `/api/notes?${searchParams.toString()}`;
  }, [q, filter, folderId]);

  const [notes, setNotes] = useState<any[]>(() => (globalCache.get(url) as any[]) || []);
  const [loading, setLoading] = useState(() => !globalCache.has(url));

  const refresh = useCallback(async (force = false) => {
    if (force && !globalCache.has(url) && notes.length === 0) setLoading(true);
    try {
      const data = await fetchWithCache(url, force);
      if (Array.isArray(data)) {
        setNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (globalCache.has(url)) {
      setNotes(globalCache.get(url) as any[]);
      setLoading(false);
    } else {
      setLoading(true);
    }
    refresh();
    return subscribeRefresh(() => refresh(true), "notes");
  }, [url, refresh]);

  return { notes, loading, refresh, setNotes };
}

export const useNotes = useNotesList;

export function useNoteFolders() {
  const [folders, setFolders] = useState<any[]>(() => {
    return (globalCache.get("/api/notes/folders") as any[]) || [];
  });
  const [loading, setLoading] = useState(!globalCache.has("/api/notes/folders"));

  const refresh = useCallback(async (force = false) => {
    try {
      const data = await fetchWithCache("/api/notes/folders", force);
      if (Array.isArray(data)) {
        setFolders(data);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeRefresh(() => refresh(true), "noteFolders");
  }, [refresh]);

  return { folders, loading, refresh, setFolders };
}

export async function openLink(link: SerializedLink) {
  window.open(link.url, "_blank", "noopener,noreferrer");
  await fetch(`/api/links/${link.id}/open`, { method: "POST" });
}

export async function toggleFavorite(link: SerializedLink): Promise<SerializedLink | null> {
  const res = await fetch(`/api/links/${link.id}/favorite`, { method: "POST" });
  if (res.ok) {
    const data = await res.json();
    invalidateAndRefresh(["links", "dashboard"]);
    return data;
  }
  const data = await res.json().catch(() => ({}));
  const msg = data.error || "Gagal mengubah status favorit";
  import("@/components/ui/custom-toast").then(({ toast }) => {
    toast.error(msg, "Favorit");
  });
  throw new Error(msg);
}

export async function deleteLink(id: string) {
  invalidateAndRefresh(["links", "dashboard", "collections", "tags"]);
  return fetch(`/api/links/${id}`, { method: "DELETE" });
}

export async function deleteCollection(id: string) {
  invalidateAndRefresh(["collections", "dashboard", "links"]);
  return fetch(`/api/collections/${id}`, { method: "DELETE" });
}

export async function deleteNoteFolder(id: string) {
  invalidateAndRefresh(["noteFolders", "notes"]);
  return fetch(`/api/notes/folders/${id}`, { method: "DELETE" });
}

export async function fetchMetadata(url: string) {
  const res = await fetch("/api/metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (res.ok) return res.json();
  return null;
}

export function useRoadmaps(searchQuery?: string) {
  const q = searchQuery?.trim() || "";
  const url = useMemo(
    () => (q ? `/api/roadmaps?q=${encodeURIComponent(q)}` : "/api/roadmaps"),
    [q]
  );

  const [roadmaps, setRoadmaps] = useState<import("@/lib/types").SerializedRoadmap[]>(() => {
    const cached = globalCache.get(url) as { items?: import("@/lib/types").SerializedRoadmap[] } | undefined;
    return cached?.items || [];
  });
  const [loading, setLoading] = useState(() => !globalCache.has(url));

  const refresh = useCallback(
    async (force = false) => {
      if (force && !globalCache.has(url)) {
        setLoading(true);
      }
      try {
        const data = await fetchWithCache<{ items: import("@/lib/types").SerializedRoadmap[] }>(url, force);
        if (data?.items) {
          setRoadmaps(data.items);
        }
      } catch (error) {
        console.error("Failed to fetch roadmaps:", error);
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  useEffect(() => {
    if (globalCache.has(url)) {
      const cached = globalCache.get(url) as { items?: import("@/lib/types").SerializedRoadmap[] } | undefined;
      if (cached?.items) setRoadmaps(cached.items);
      setLoading(false);
    } else {
      setLoading(true);
    }
    refresh();
    return subscribeRefresh(() => refresh(true), "roadmaps");
  }, [url, refresh]);

  return { roadmaps, loading, refresh, setRoadmaps };
}

export async function deleteRoadmap(id: string) {
  const res = await fetch(`/api/roadmaps/${id}`, { method: "DELETE" });
  if (res.ok) {
    invalidateAndRefresh(["roadmaps"]);
  }
  return res;
}


