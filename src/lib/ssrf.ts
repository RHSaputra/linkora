import dns from "dns/promises";
import net from "net";

export class SsrfSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SsrfSecurityError";
  }
}

/**
 * Checks if an IP address belongs to private, loopback, link-local,
 * cloud metadata, or reserved ranges.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  // Normalize IPv6-mapped IPv4 addresses (e.g. ::ffff:127.0.0.1)
  let normalizedIp = ip;
  if (ip.startsWith("::ffff:")) {
    normalizedIp = ip.slice(7);
  }

  const family = net.isIP(normalizedIp);
  if (family === 0) {
    return true; // Not a valid IP
  }

  if (family === 4) {
    const parts = normalizedIp.split(".").map(Number);
    const [b0, b1] = parts;

    // 0.0.0.0/8 (Current network)
    if (b0 === 0) return true;
    // 10.0.0.0/8 (Private network)
    if (b0 === 10) return true;
    // 127.0.0.0/8 (Loopback)
    if (b0 === 127) return true;
    // 169.254.0.0/16 (Link-local / Cloud Metadata: AWS/GCP/Azure 169.254.169.254)
    if (b0 === 169 && b1 === 254) return true;
    // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;
    // 192.168.0.0/16 (Private network)
    if (b0 === 192 && b1 === 168) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;
    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (b0 === 192 && b1 === 0) return true;
    // 192.0.2.0/24 (TEST-NET-1)
    // 198.51.100.0/24 (TEST-NET-2)
    // 203.0.113.0/24 (TEST-NET-3)
    if (b0 === 198 && (b1 === 18 || b1 === 19)) return true;
    if (b0 === 203 && b1 === 0) return true;
    // 224.0.0.0/4 (Multicast)
    if (b0 >= 224 && b0 <= 239) return true;
    // 240.0.0.0/4 (Reserved / Future use)
    if (b0 >= 240) return true;
    // 255.255.255.255 (Broadcast)
    if (b0 === 255) return true;

    return false;
  }

  if (family === 6) {
    const lower = normalizedIp.toLowerCase();
    // Loopback ::1
    if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
    // Unspecified ::
    if (lower === "::" || lower === "0:0:0:0:0:0:0:0") return true;
    // Unique local address fc00::/7 (fc00... or fd00...)
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    // Link-local unicast fe80::/10
    if (
      lower.startsWith("fe80:") ||
      lower.startsWith("fe9") ||
      lower.startsWith("fea") ||
      lower.startsWith("feb")
    )
      return true;
    // Multicast ff00::/8
    if (lower.startsWith("ff")) return true;

    return false;
  }

  return true;
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "instance-data",
  "kubernetes.default",
]);

/**
 * Validates whether a URL string is safe to fetch from server-side.
 * Resolves DNS to check against private/internal IP address spaces.
 */
export async function validateSafeExternalUrl(urlStr: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new SsrfSecurityError("Format URL tidak valid");
  }

  // Only allow HTTP and HTTPS
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SsrfSecurityError(`Protokol ${parsed.protocol} tidak diizinkan`);
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".corp")
  ) {
    throw new SsrfSecurityError("Akses ke domain lokal atau internal tidak diizinkan");
  }

  // If hostname is directly an IP address
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new SsrfSecurityError("Akses ke alamat IP privat/internal tidak diizinkan");
    }
    return parsed;
  }

  // Perform DNS lookup to inspect resolved IP(s)
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new SsrfSecurityError("Nama domain tidak dapat diresolusi");
    }

    for (const record of addresses) {
      if (isPrivateOrReservedIp(record.address)) {
        throw new SsrfSecurityError("Domain mengarah ke alamat IP privat/internal yang diblokir");
      }
    }
  } catch (err: any) {
    if (err instanceof SsrfSecurityError) throw err;
    throw new SsrfSecurityError(`Gagal memverifikasi domain: ${err?.message || "DNS error"}`);
  }

  return parsed;
}

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxSizeBytes?: number;
  maxRedirects?: number;
  headers?: Record<string, string>;
}

/**
 * Fetch an external URL safely with:
 * - Anti-SSRF DNS/IP validation on every hop
 * - Strict timeout
 * - Response size limit stream abortion (DoS mitigation)
 * - Safe manual redirect handling
 */
export async function safeFetchExternal(
  targetUrl: string,
  options: SafeFetchOptions = {}
): Promise<{ text: string; finalUrl: string; contentType: string }> {
  const timeoutMs = options.timeoutMs ?? 8000;
  const maxSizeBytes = options.maxSizeBytes ?? 2 * 1024 * 1024; // 2MB default
  const maxRedirects = options.maxRedirects ?? 3;

  let currentUrl = targetUrl;
  let redirectsCount = 0;

  while (redirectsCount <= maxRedirects) {
    const validatedUrl = await validateSafeExternalUrl(currentUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(validatedUrl.toString(), {
        signal: controller.signal,
        redirect: "manual", // Handle redirects manually to validate each target
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (compatible; Linkora/1.0; +https://linkora.app)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // Handle redirects
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (!location) {
          throw new SsrfSecurityError("Redirect tanpa header location");
        }
        currentUrl = new URL(location, validatedUrl).toString();
        redirectsCount++;
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type") || "";

      // Check Content-Length header if provided
      const contentLengthHeader = res.headers.get("content-length");
      if (contentLengthHeader && parseInt(contentLengthHeader, 10) > maxSizeBytes) {
        throw new Error("Ukuran konten melebihi batas maksimum");
      }

      // Stream body reading with strict size guard
      const body = res.body;
      if (!body) {
        return { text: "", finalUrl: currentUrl, contentType };
      }

      const reader = body.getReader();
      const chunks: Uint8Array[] = [];
      let totalSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          totalSize += value.length;
          if (totalSize > maxSizeBytes) {
            await reader.cancel();
            throw new Error("Ukuran halaman melebihi batas maksimum 2MB");
          }
          chunks.push(value);
        }
      }

      const fullBuffer = Buffer.concat(chunks);
      const text = fullBuffer.toString("utf-8");

      return { text, finalUrl: currentUrl, contentType };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  throw new SsrfSecurityError("Terlalu banyak redirect dari server tujuan");
}
