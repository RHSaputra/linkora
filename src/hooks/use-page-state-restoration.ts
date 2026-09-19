"use client";

import { useEffect, useRef, useCallback } from "react";

export interface PageState {
  page?: number;
  displayMode?: "paginated" | "all";
  scrollPos?: number;
  category?: string;
  tag?: string;
  sort?: string;
  query?: string;
  favoriteOnly?: boolean;
  selectedCollectionId?: string;
  [key: string]: any;
}

export function saveCurrentScrollPosition(pageKey = "links") {
  if (typeof window === "undefined") return;
  try {
    const storageKey = `linkora_page_state_${pageKey}`;
    const item = sessionStorage.getItem(storageKey);
    const current: PageState = item ? JSON.parse(item) : {};
    current.scrollPos = window.scrollY;
    sessionStorage.setItem(storageKey, JSON.stringify(current));
  } catch (_e) {}
}

export function usePageStateRestoration(pageKey: string) {
  const storageKey = `linkora_page_state_${pageKey}`;
  const isInitialRestoredRef = useRef(false);

  // Get saved state from sessionStorage
  const getSavedState = useCallback((): PageState => {
    if (typeof window === "undefined") return {};
    try {
      const item = sessionStorage.getItem(storageKey);
      return item ? JSON.parse(item) : {};
    } catch {
      return {};
    }
  }, [storageKey]);

  // Save current page state
  const savePageState = useCallback(
    (updates: Partial<PageState>) => {
      if (typeof window === "undefined") return;
      try {
        const current = getSavedState();
        const next: PageState = {
          ...current,
          ...updates,
          scrollPos: typeof updates.scrollPos === "number" ? updates.scrollPos : (window.scrollY || current.scrollPos || 0),
        };
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch (_e) {}
    },
    [getSavedState, storageKey]
  );

  // Save current scroll position
  const saveScrollPos = useCallback(() => {
    saveCurrentScrollPosition(pageKey);
  }, [pageKey]);

  // Track user scroll automatically (throttled)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveScrollPos();
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [saveScrollPos]);

  // Save scroll before unmount or navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPos();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      saveScrollPos();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveScrollPos]);

  // Restore scroll position to saved location
  const restoreScrollPos = useCallback(
    (delay = 80, force = false) => {
      if (typeof window === "undefined") return;
      if (isInitialRestoredRef.current && !force) return;

      const saved = getSavedState();
      const targetY = saved.scrollPos;

      if (typeof targetY === "number" && targetY > 0) {
        const tryScroll = (attemptsLeft: number) => {
          window.scrollTo({ top: targetY, behavior: "instant" as ScrollBehavior });
          if (attemptsLeft > 0) {
            requestAnimationFrame(() => tryScroll(attemptsLeft - 1));
          }
        };

        setTimeout(() => {
          tryScroll(3);
          isInitialRestoredRef.current = true;
        }, delay);
      }
    },
    [getSavedState]
  );

  return {
    getSavedState,
    savePageState,
    saveScrollPos,
    restoreScrollPos,
  };
}
