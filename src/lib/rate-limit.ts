/**
 * Rate Limiter Utility (Hybrid Dual-Engine)
 * 
 * Desain Modular & Resilience Tinggi:
 * 1. Lingkungan Multi-Instance / Serverless (Production):
 *    Menggunakan Upstash Redis REST API (via native fetch) jika UPSTASH_REDIS_REST_URL
 *    dan UPSTASH_REDIS_REST_TOKEN dikonfigurasi.
 * 2. Lingkungan Standalone / Development (Local):
 *    Menggunakan Sliding Window In-Memory Store berbasis JavaScript Map.
 */

interface RateLimitStore {
  tokens: number[];
}

const store = new Map<string, RateLimitStore>();

// Cleanup otomatis memory setiap 10 menit untuk mencegah memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of store.entries()) {
      const validTokens = data.tokens.filter(t => now - t < 3600000);
      if (validTokens.length === 0) {
        store.delete(key);
      } else {
        data.tokens = validTokens;
      }
    }
  }, 10 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;      // Maksimum jumlah request
  windowMs: number;   // Jangka waktu dalam milidetik
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Distributed Upstash Redis Rate Limiter (Zero external dependencies via REST API)
 */
async function upstashRateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const key = `ratelimit:${identifier}`;
    const windowSec = Math.ceil(options.windowMs / 1000);

    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSec, "NX"],
        ["TTL", key],
      ]),
      // Low timeout to fail fast to in-memory fallback if Redis is unreachable
      signal: AbortSignal.timeout(1500),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const currentCount = Number(data[0]?.result || 1);
    const ttl = Number(data[2]?.result || windowSec);

    if (currentCount > options.limit) {
      return {
        success: false,
        limit: options.limit,
        remaining: 0,
        reset: ttl > 0 ? ttl : windowSec,
      };
    }

    return {
      success: true,
      limit: options.limit,
      remaining: Math.max(0, options.limit - currentCount),
      reset: ttl > 0 ? ttl : windowSec,
    };
  } catch (_e) {
    // Graceful fallback to in-memory sliding window if Upstash is unreachable
    return null;
  }
}

/**
 * Memeriksa apakah identifier (misal: IP address atau user ID) melebihi batas request
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60 * 1000 }
): Promise<RateLimitResult> {
  // 1. Coba eksekusi terdistribusi via Upstash Redis (jika env vars tersedia)
  const upstashResult = await upstashRateLimit(identifier, options);
  if (upstashResult) {
    return upstashResult;
  }

  // 2. Fallback ke In-Memory Sliding Window
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const current = store.get(identifier) || { tokens: [] };
  const validTokens = current.tokens.filter(timestamp => timestamp > windowStart);

  if (validTokens.length >= options.limit) {
    const oldest = validTokens[0];
    const resetTime = oldest + options.windowMs;
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: Math.ceil((resetTime - now) / 1000),
    };
  }

  validTokens.push(now);
  store.set(identifier, { tokens: validTokens });

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - validTokens.length,
    reset: Math.ceil(options.windowMs / 1000),
  };
}

export function clearRateLimit(identifier: string): void {
  store.delete(identifier);
}



