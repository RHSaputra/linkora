/**
 * Rate Limiter Utility (Sliding Window Algorithm)
 * 
 * Desain modular:
 * - Menggunakan in-memory Map untuk lingkungan standalone / development.
 * - Siap diintegrasikan ke Redis / Upstash untuk arsitektur multi-instance / autoscaling.
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
 * Memeriksa apakah identifier (misal: IP address atau user ID) melebihi batas request
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60 * 1000 }
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const current = store.get(identifier) || { tokens: [] };
  // Hapus token yang sudah melewati window
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
