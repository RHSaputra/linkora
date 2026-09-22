import { useCallback, useEffect, useState, useMemo, useRef } from "react";
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

export function updateGlobalCacheLinks(updater: (links: SerializedLink[]) => SerializedLink[]) {
  for (const [key, val] of globalCache.entries()) {
    if (key.startsWith("/api/links")) {
      const pageData = val as LinksPage | undefined;
      const currentItems = pageData && Array.isArray(pageData.items) ? pageData.items : (Array.isArray(val) ? (val as any) : []);
      const newItems = updater(currentItems) || [];
      const diff = newItems.length - currentItems.length;
      if (pageData && typeof pageData === "object" && !Array.isArray(pageData)) {
        globalCache.set(key, {
          ...pageData,
          items: newItems,
          total: Math.max(0, (pageData.total || 0) + diff),
        });
      } else {
        globalCache.set(key, newItems);
      }
    }
  }
}

export function updateGlobalCacheCollections(updater: (collections: SerializedCollection[]) => SerializedCollection[]) {
  for (const [key, val] of globalCache.entries()) {
    if (key.startsWith("/api/collections") && Array.isArray(val)) {
      globalCache.set(key, updater(val as SerializedCollection[]));
    }
  }
}

export function updateGlobalCacheNotes(updater: (notes: any[]) => any[]) {
  for (const [key, val] of globalCache.entries()) {
    if (key.startsWith("/api/notes") && !key.startsWith("/api/notes/folders")) {
      if (Array.isArray(val)) {
        globalCache.set(key, updater(val as any[]));
      } else if (val && typeof val === "object" && "items" in val && Array.isArray((val as any).items)) {
        globalCache.set(key, { ...(val as any), items: updater((val as any).items) });
      }
    }
  }
}

export function updateGlobalCacheRoadmaps(updater: (roadmaps: any[]) => any[]) {
  for (const [key, val] of globalCache.entries()) {
    if (key.startsWith("/api/roadmaps")) {
      const data = val as { items?: any[] } | undefined;
      if (data && Array.isArray(data.items)) {
        globalCache.set(key, { ...data, items: updater(data.items) });
      }
    }
  }
}

export function updateGlobalCacheDashboard(updater: (stats: DashboardStats) => DashboardStats) {
  const current = globalCache.get("/api/dashboard") as DashboardStats | undefined;
  if (current) {
    globalCache.set("/api/dashboard", updater(current));
  }
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

export function dispatchRefresh(resources: RefreshResource[] = [], force = false) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(REFRESH_EVENT, { detail: { resources, force } })
  );
}

export function subscribeRefresh(
  cb: (force?: boolean) => void,
  resource?: RefreshResource
) {
  if (typeof window === "undefined") return () => { };
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<{ resources?: RefreshResource[]; force?: boolean }>).detail;
    if (detail == null) {
      cb(false);
      return;
    }
    if (resource && Array.isArray(detail.resources) && detail.resources.includes(resource)) {
      cb(Boolean(detail.force));
    }
  };
  window.addEventListener(REFRESH_EVENT, handler);
  return () => window.removeEventListener(REFRESH_EVENT, handler);
}

export function invalidateAndRefresh(resources: RefreshResource[], force = true) {
  if (force) {
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
  }

  dispatchRefresh(resources, force);
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
      if (force && !globalCache.has("/api/dashboard") && !stats) setLoading(true);
      const data = await fetchWithCache<DashboardStats>("/api/dashboard", force);
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    refresh(false);
    return subscribeRefresh((force) => refresh(force), "dashboard");
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
  options?: { pageSize?: number; initialPage?: number }
) {
  const pageSize = options?.pageSize;
  const initialPage = options?.initialPage && options.initialPage > 0 ? options.initialPage : 1;

  const filterQ = filters?.q || "";
  const filterCategory = filters?.category || "";
  const filterTag = filters?.tag || "";
  const filterFavorite = Boolean(filters?.favorite);
  const filterCollectionId = filters?.collectionId || "";
  const filterSort = filters?.sort || "added";

  const filterKey = `${filterQ}:${filterCategory}:${filterTag}:${filterFavorite}:${filterCollectionId}:${filterSort}:${pageSize}`;

  const [page, setPage] = useState(initialPage);
  const [links, setLinks] = useState<SerializedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  const safeLinks = Array.isArray(links) ? links : [];
  const linksLength = safeLinks.length;

  const prevFilterKeyRef = useRef(filterKey);
  const isMountedRef = useRef(false);

  const fetchPage = useCallback(
    async (p: number, force = false): Promise<LinksPage | null> => {
      const url = buildLinksUrl(
        { q: filterQ, category: filterCategory, tag: filterTag, favorite: filterFavorite, collectionId: filterCollectionId, sort: filterSort },
        p,
        pageSize
      );
      const data = await fetchWithCache<LinksPage>(url, force);
      return (data as LinksPage) || null;
    },
    [filterQ, filterCategory, filterTag, filterFavorite, filterCollectionId, filterSort, pageSize]
  );

  const goToPage = useCallback(
    async (targetPage: number, force = false) => {
      if (targetPage < 1) return;
      setLoading(true);
      try {
        const d = await fetchPage(targetPage, force);
        if (d && Array.isArray(d.items)) {
          setLinks(d.items);
          setTotal(d.total);
          setHasMore(d.hasMore);
          setPage(targetPage);
        } else if (Array.isArray(d)) {
          setLinks(d as any);
        } else {
          setLinks([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  const refresh = useCallback(
    async (force = false) => {
      const currentUrl = buildLinksUrl(
        { q: filterQ, category: filterCategory, tag: filterTag, favorite: filterFavorite, collectionId: filterCollectionId, sort: filterSort },
        page,
        pageSize
      );
      if (force && !globalCache.has(currentUrl) && linksLength === 0) {
        setLoading(true);
      }
      try {
        const d = await fetchPage(page, force);
        if (d && Array.isArray(d.items)) {
          setLinks(d.items);
          setTotal(d.total);
          setHasMore(d.hasMore);
        } else if (Array.isArray(d)) {
          setLinks(d as any);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [fetchPage, page, filterQ, filterCategory, filterTag, filterFavorite, filterCollectionId, filterSort, pageSize, linksLength]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const next = page + 1;
      const d = await fetchPage(next);
      if (d && Array.isArray(d.items)) {
        setLinks((prev) => [...(Array.isArray(prev) ? prev : []), ...d.items]);
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

  useEffect(() => {
    let targetPage = page;

    if (isMountedRef.current && prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      targetPage = 1;
      setPage(1);
    }
    isMountedRef.current = true;

    const currentUrl = buildLinksUrl(
      { q: filterQ, category: filterCategory, tag: filterTag, favorite: filterFavorite, collectionId: filterCollectionId, sort: filterSort },
      targetPage,
      pageSize
    );

    if (globalCache.has(currentUrl)) {
      const cached = globalCache.get(currentUrl) as LinksPage | undefined;
      if (cached && Array.isArray(cached.items)) {
        setLinks(cached.items);
        setTotal(cached.total);
        setHasMore(cached.hasMore);
        setLoading(false);
      } else if (Array.isArray(cached)) {
        setLinks(cached as any);
        setLoading(false);
      }
    } else {
      setLoading(true);
    }

    fetchPage(targetPage).then((d) => {
      if (d && Array.isArray(d.items)) {
        setLinks(d.items);
        setTotal(d.total);
        setHasMore(d.hasMore);
        setPage(targetPage);
      } else if (Array.isArray(d)) {
        setLinks(d as any);
      }
      setLoading(false);
    });

    return subscribeRefresh((force) => refresh(force), "links");
  }, [filterKey]);

  return { links: safeLinks, loading, refresh, loadMore, goToPage, page, hasMore, total, setLinks };
}

export function useCollections() {
  const [collections, setCollections] = useState<SerializedCollection[]>((globalCache.get("/api/collections") as SerializedCollection[]) || []);
  const [loading, setLoading] = useState(!globalCache.has("/api/collections"));

  const refresh = useCallback(async (force = false) => {
    if (force && !globalCache.has("/api/collections") && collections.length === 0) setLoading(true);
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
  }, [collections.length]);

  useEffect(() => {
    refresh(false);
    return subscribeRefresh((force) => refresh(force), "collections");
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
    refresh(false);
    return subscribeRefresh((force) => refresh(force), "tags");
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
  }, [url, notes.length]);

  useEffect(() => {
    if (globalCache.has(url)) {
      setNotes(globalCache.get(url) as any[]);
      setLoading(false);
    } else {
      setLoading(true);
    }
    refresh(false);
    return subscribeRefresh((force) => refresh(force), "notes");
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
    if (force && !globalCache.has("/api/notes/folders") && folders.length === 0) setLoading(true);
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
  }, [folders.length]);

  useEffect(() => {
    refresh(false);
    return subscribeRefresh((force) => refresh(force), "noteFolders");
  }, [refresh]);

  return { folders, loading, refresh, setFolders };
}

export async function openLink(link: SerializedLink) {
  window.open(link.url, "_blank", "noopener,noreferrer");
  await fetch(`/api/links/${link.id}/open`, { method: "POST" });
}

export async function toggleFavorite(link: SerializedLink): Promise<SerializedLink | null> {
  const nextVal = !link.isFavorite;
  const updatedLink = { ...link, isFavorite: nextVal };

  // 1. Optimistically update global cache
  updateGlobalCacheLinks((items) =>
    items.map((item) => (item.id === link.id ? updatedLink : item))
  );
  setCachedData(`/api/links/${link.id}`, updatedLink);

  // 2. Dispatch soft refresh
  dispatchRefresh(["links", "dashboard"], false);

  try {
    const res = await fetch(`/api/links/${link.id}/favorite`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setCachedData(`/api/links/${link.id}`, data);
      return data;
    }
    throw new Error("Gagal mengubah status favorit");
  } catch (err) {
    // 3. Rollback on failure
    updateGlobalCacheLinks((items) =>
      items.map((item) => (item.id === link.id ? link : item))
    );
    dispatchRefresh(["links", "dashboard"], false);

    import("@/components/ui/custom-toast").then(({ toast }) => {
      toast.error("Gagal mengubah status favorit", "Favorit");
    });
    throw err;
  }
}

export async function deleteLink(id: string) {
  let removedLink: SerializedLink | null = null;

  // 1. Optimistically remove from cache
  updateGlobalCacheLinks((items) => {
    const found = items.find((i) => i.id === id);
    if (found) removedLink = found;
    return items.filter((i) => i.id !== id);
  });
  updateGlobalCacheDashboard((stats) => {
    const isFav = Boolean((removedLink as SerializedLink | null)?.isFavorite);
    const currentFavCount = typeof stats.favoriteCount === "number" ? stats.favoriteCount : 0;
    return {
      ...stats,
      totalLinks: Math.max(0, (stats.totalLinks || 0) - 1),
      favoriteCount: isFav ? Math.max(0, currentFavCount - 1) : currentFavCount,
      recentLinks: (stats.recentLinks || []).filter((l) => l.id !== id),
      favoriteLinks: (stats.favoriteLinks || []).filter((l) => l.id !== id),
      upcomingReminders: (stats.upcomingReminders || []).filter((l) => l.id !== id),
    };
  });

  // 2. Dispatch soft refresh
  dispatchRefresh(["links", "dashboard", "collections", "tags"], false);

  try {
    const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus link");
    return res;
  } catch (err) {
    // 3. Rollback on failure
    if (removedLink) {
      updateGlobalCacheLinks((items) => [removedLink!, ...items]);
      updateGlobalCacheDashboard((stats) => ({
        ...stats,
        totalLinks: (stats.totalLinks || 0) + 1,
      }));
      dispatchRefresh(["links", "dashboard", "collections", "tags"], false);
    }
    import("@/components/ui/custom-toast").then(({ toast }) => {
      toast.error("Gagal menghapus link", "Hapus Link");
    });
    throw err;
  }
}

export async function createLinkOptimistic(newLinkData: Partial<SerializedLink>): Promise<SerializedLink | null> {
  const tempId = `temp-${Date.now()}`;
  const tempLink = {
    id: tempId,
    url: newLinkData.url || "",
    title: newLinkData.title || newLinkData.url || "Untitled",
    description: newLinkData.description || null,
    category: newLinkData.category || "General",
    tags: newLinkData.tags || [],
    notes: newLinkData.notes || null,
    favicon: newLinkData.favicon || null,
    thumbnail: newLinkData.thumbnail || null,
    isFavorite: Boolean(newLinkData.isFavorite),
    openCount: 0,
    lastOpenedAt: null,
    reminderAt: newLinkData.reminderAt || null,
    aiSummary: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "",
    collections: [],
  } as unknown as SerializedLink;

  updateGlobalCacheLinks((items) => [tempLink, ...items]);
  updateGlobalCacheDashboard((stats) => ({
    ...stats,
    totalLinks: (stats.totalLinks || 0) + 1,
    recentLinks: [tempLink, ...(stats.recentLinks || [])],
  }));
  dispatchRefresh(["links", "dashboard", "tags"], false);

  try {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLinkData),
    });
    if (res.ok) {
      const realLink: SerializedLink = await res.json();
      updateGlobalCacheLinks((items) =>
        items.map((item) => (item.id === tempId ? realLink : item))
      );
      dispatchRefresh(["links", "dashboard", "tags"], false);
      return realLink;
    }
    throw new Error("Gagal membuat link");
  } catch (err) {
    updateGlobalCacheLinks((items) => items.filter((item) => item.id !== tempId));
    updateGlobalCacheDashboard((stats) => ({
      ...stats,
      totalLinks: Math.max(0, stats.totalLinks - 1),
    }));
    dispatchRefresh(["links", "dashboard", "tags"], false);

    import("@/components/ui/custom-toast").then(({ toast }) => {
      toast.error("Gagal menambahkan link", "Tambah Link");
    });
    throw err;
  }
}

export async function deleteCollection(id: string) {
  let removedCol: SerializedCollection | null = null;
  updateGlobalCacheCollections((items) => {
    const found = items.find((c) => c.id === id);
    if (found) removedCol = found;
    return items.filter((c) => c.id !== id);
  });
  dispatchRefresh(["collections", "dashboard", "links"], false);

  try {
    const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus koleksi");
    return res;
  } catch (err) {
    if (removedCol) {
      updateGlobalCacheCollections((items) => [...items, removedCol!]);
      dispatchRefresh(["collections", "dashboard", "links"], false);
    }
    import("@/components/ui/custom-toast").then(({ toast }) => {
      toast.error("Gagal menghapus koleksi", "Koleksi");
    });
    throw err;
  }
}

export async function deleteNoteFolder(id: string) {
  let removedFolder: any = null;
  for (const [key, val] of globalCache.entries()) {
    if (key.startsWith("/api/notes/folders") && Array.isArray(val)) {
      removedFolder = (val as any[]).find((f: any) => f.id === id);
      globalCache.set(key, (val as any[]).filter((f: any) => f.id !== id));
    }
  }
  dispatchRefresh(["noteFolders", "notes"], false);

  try {
    const res = await fetch(`/api/notes/folders/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus folder catatan");
    return res;
  } catch (err) {
    if (removedFolder) {
      for (const [key, val] of globalCache.entries()) {
        if (key.startsWith("/api/notes/folders") && Array.isArray(val)) {
          globalCache.set(key, [...(val as any[]), removedFolder]);
        }
      }
      dispatchRefresh(["noteFolders", "notes"], false);
    }
    import("@/components/ui/custom-toast").then(({ toast }) => {
      toast.error("Gagal menghapus folder catatan", "Folder Catatan");
    });
    throw err;
  }
}

export async function deleteNote(id: string, isPermanent = false) {
  let removedNotes: any[] = [];

  // 1. Optimistically remove from global cache
  updateGlobalCacheNotes((items) => {
    const found = items.find((n) => n.id === id);
    if (found) removedNotes.push(found);
    return items.filter((n) => n.id !== id);
  });
  dispatchRefresh(["notes", "noteFolders"], false);

  try {
    const res = await fetch(`/api/notes/${id}${isPermanent ? "?permanent=true" : ""}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Gagal menghapus catatan");
    return res;
  } catch (err) {
    if (removedNotes.length > 0) {
      updateGlobalCacheNotes((items) => [...removedNotes, ...items]);
      dispatchRefresh(["notes", "noteFolders"], false);
    }
    import("@/components/ui/custom-toast").then(({ toast }) => {
      toast.error("Gagal menghapus catatan", "Catatan");
    });
    throw err;
  }
}

export async function deleteNotesBulk(ids: string[], isPermanent = false) {
  let removedNotes: any[] = [];
  const idSet = new Set(ids);

  // 1. Optimistically remove from global cache
  updateGlobalCacheNotes((items) => {
    const found = items.filter((n) => idSet.has(n.id));
    removedNotes.push(...found);
    return items.filter((n) => !idSet.has(n.id));
  });
  dispatchRefresh(["notes", "noteFolders"], false);

  try {
    const res = await fetch("/api/notes/bulk", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, permanent: isPermanent }),
    });
    if (!res.ok) throw new Error("Gagal menghapus beberapa catatan");
    return res;
  } catch (err) {
    if (removedNotes.length > 0) {
      updateGlobalCacheNotes((items) => [...removedNotes, ...items]);
      dispatchRefresh(["notes", "noteFolders"], false);
    }
    import("@/components/ui/custom-toast").then(({ toast }) => {
      toast.error("Gagal menghapus beberapa catatan", "Catatan");
    });
    throw err;
  }
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
    refresh(false);
    return subscribeRefresh((force) => refresh(force), "roadmaps");
  }, [url, refresh]);

  return { roadmaps, loading, refresh, setRoadmaps };
}

export async function deleteRoadmap(id: string) {
  let removedRoadmap: any = null;
  updateGlobalCacheRoadmaps((items) => {
    const found = items.find((r) => r.id === id);
    if (found) removedRoadmap = found;
    return items.filter((r) => r.id !== id);
  });
  dispatchRefresh(["roadmaps"], false);

  try {
    const res = await fetch(`/api/roadmaps/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus roadmap");
    return res;
  } catch (err) {
    if (removedRoadmap) {
      updateGlobalCacheRoadmaps((items) => [...items, removedRoadmap]);
      dispatchRefresh(["roadmaps"], false);
    }
    import("@/components/ui/custom-toast").then(({ toast }) => {
      toast.error("Gagal menghapus roadmap", "Roadmap");
    });
    throw err;
  }
}



