// In-memory cache + timeout helpers for AI routes.
//
// These run in the Node.js server runtime. The cache lives for the lifetime of
// the server process (per instance), which is enough to avoid repeating the
// same expensive Gemini call within a session/burst. It deliberately has a TTL
// so results stay fresh.

interface CacheEntry {
  value: unknown;
  exp: number;
}

const store = new Map<string, CacheEntry>();

const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function getAiCache(key: string): any | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.exp) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setAiCache(key: string, value: unknown, ttlMs: number = DEFAULT_TTL_MS): void {
  store.set(key, { value, exp: Date.now() + ttlMs });
}

// Reject after `ms` so a hung model call cannot stall the whole request.
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AI request timed out")), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}
