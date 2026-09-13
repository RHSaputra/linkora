/**
 * Server-Side Cache Utility (Upstash Redis REST Engine)
 * 
 * Fitur:
 * - Menggunakan Upstash Redis REST API (native fetch) tanpa beban package npm eksternal.
 * - Memiliki fallback otomatis (no-op) jika environment variables Upstash belum diset.
 * - Menyediakan helper getCache, setCache, deleteCache, dan invalidateUserCache.
 */

const getUpstashCredentials = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
};

/**
 * Mengambil data dari cache Redis
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const creds = getUpstashCredentials();
  if (!creds) return null;

  try {
    const res = await fetch(`${creds.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${creds.token}` },
      signal: AbortSignal.timeout(1500),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.result) return null;

    return JSON.parse(data.result) as T;
  } catch (_e) {
    return null;
  }
}

/**
 * Menyimpan data ke cache Redis dengan Time-To-Live (TTL dalam detik)
 */
export async function setCache(
  key: string,
  value: any,
  ttlSec: number = 300 // Default 5 menit
): Promise<boolean> {
  const creds = getUpstashCredentials();
  if (!creds) return false;

  try {
    const jsonStr = JSON.stringify(value);
    const res = await fetch(
      `${creds.url}/set/${encodeURIComponent(key)}?EX=${ttlSec}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.token}`,
          "Content-Type": "text/plain",
        },
        body: jsonStr,
        signal: AbortSignal.timeout(1500),
      }
    );

    return res.ok;
  } catch (_e) {
    return false;
  }
}

/**
 * Menghapus satu key spesifik dari cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  const creds = getUpstashCredentials();
  if (!creds) return false;

  try {
    const res = await fetch(`${creds.url}/del/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${creds.token}` },
      signal: AbortSignal.timeout(1500),
    });

    return res.ok;
  } catch (_e) {
    return false;
  }
}

/**
 * Invalider cache untuk pengguna spesifik (misal: "cache:links:user123:*")
 */
export async function invalidateUserCache(userId: string, scope: "links" | "notes" | "all" = "all"): Promise<void> {
  const creds = getUpstashCredentials();
  if (!creds) return;

  try {
    let pattern = `cache:*:${userId}:*`;
    if (scope === "links") pattern = `cache:links:${userId}:*`;
    if (scope === "notes") pattern = `cache:notes:${userId}:*`;

    // Cari keys sesuai pattern
    const res = await fetch(`${creds.url}/keys/${encodeURIComponent(pattern)}`, {
      headers: { Authorization: `Bearer ${creds.token}` },
      signal: AbortSignal.timeout(1500),
    });

    if (!res.ok) return;
    const data = await res.json();
    const keys: string[] = data.result || [];

    if (keys.length > 0) {
      await fetch(`${creds.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(keys.map((k) => ["DEL", k])),
        signal: AbortSignal.timeout(1500),
      });
    }
  } catch (_e) {
    // Fail silently
  }
}
