"use client";

import { useCallback, useEffect, useState } from "react";
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
    const handleDataRefresh = () => refresh(true);
    window.addEventListener("refreshData", handleDataRefresh);
    return () => window.removeEventListener("refreshData", handleDataRefresh);
  }, [refresh]);

  return { stats, loading, refresh };
}

export function useLinks(filters?: {
  q?: string;
  category?: string;
  tag?: string;
  favorite?: boolean;
  collectionId?: string;
}) {
  const getUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (filters?.q) params.set("q", filters.q);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.tag) params.set("tag", filters.tag);
    if (filters?.favorite) params.set("favorite", "true");
    if (filters?.collectionId) params.set("collectionId", filters.collectionId);
    return `/api/links?${params.toString()}`;
  }, [filters?.q, filters?.category, filters?.tag, filters?.favorite, filters?.collectionId]);

  const [links, setLinks] = useState<SerializedLink[]>(() => {
    const url = getUrl();
    return (globalCache.get(url) as SerializedLink[]) || [];
  });
  const [loading, setLoading] = useState(() => {
    const url = getUrl();
    return !globalCache.has(url);
  });

  const refresh = useCallback(async (force = false) => {
    const url = getUrl();
    if (force && !globalCache.has(url)) setLoading(true);
    try {
      const data = await fetchWithCache(url, force);
      if (Array.isArray(data)) {
        setLinks((prev) => (prev === data ? prev : (data as SerializedLink[])));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getUrl]);

  useEffect(() => {
    const url = getUrl();
    if (globalCache.has(url)) {
      setLinks(globalCache.get(url) as SerializedLink[]);
      setLoading(false);
    } else {
      setLoading(true);
    }
    refresh();

    const handleDataRefresh = () => refresh(true);
    window.addEventListener("refreshData", handleDataRefresh);
    return () => window.removeEventListener("refreshData", handleDataRefresh);
  }, [refresh, getUrl]);

  return { links, loading, refresh, setLinks };
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
    } catch(e) {
       console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const handleDataRefresh = () => refresh(true);
    window.addEventListener("refreshData", handleDataRefresh);
    return () => window.removeEventListener("refreshData", handleDataRefresh);
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
    const handleDataRefresh = () => refresh(true);
    window.addEventListener("refreshData", handleDataRefresh);
    return () => window.removeEventListener("refreshData", handleDataRefresh);
  }, [refresh]);

  return { tags, refresh };
}

export function useNotesList(params?: { q?: string; filter?: string; folderId?: string | null }) {
  const getUrl = useCallback(() => {
    const searchParams = new URLSearchParams();
    if (params?.q?.trim()) searchParams.append("q", params.q.trim());
    if (params?.filter && params.filter !== "all") searchParams.append("filter", params.filter);
    if (params?.folderId) searchParams.append("folderId", params.folderId);
    return `/api/notes?${searchParams.toString()}`;
  }, [params?.q, params?.filter, params?.folderId]);

  const [notes, setNotes] = useState<any[]>(() => {
    const url = getUrl();
    return (globalCache.get(url) as any[]) || [];
  });
  const [loading, setLoading] = useState(() => {
    const url = getUrl();
    return !globalCache.has(url);
  });

  const refresh = useCallback(async (force = false) => {
    const url = getUrl();
    if (force && !globalCache.has(url)) setLoading(true);
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
  }, [getUrl]);

  useEffect(() => {
    const url = getUrl();
    if (globalCache.has(url)) {
      setNotes(globalCache.get(url) as any[]);
      setLoading(false);
    } else {
      setLoading(true);
    }
    refresh();
  }, [refresh, getUrl]);

  return { notes, loading, refresh, setNotes };
}

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
     invalidateCache("/api/links");
     invalidateCache("/api/dashboard");
     return res.json();
  }
  const data = await res.json().catch(() => ({}));
  const msg = data.error || "Gagal mengubah status favorit";
  import("@/components/ui/custom-toast").then(({ toast }) => {
    toast.error(msg, "Favorit");
  });
  throw new Error(msg);
}

export async function deleteLink(id: string) {
  invalidateCache("/api/links");
  invalidateCache("/api/dashboard");
  return fetch(`/api/links/${id}`, { method: "DELETE" });
}

export async function deleteCollection(id: string) {
  invalidateCache("/api/collections");
  invalidateCache("/api/dashboard");
  return fetch(`/api/collections/${id}`, { method: "DELETE" });
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
