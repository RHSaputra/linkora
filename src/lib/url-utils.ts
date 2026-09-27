/**
 * URL & Domain Normalization Utilities for Linkora
 * Deterministic parsing and comparison for URL and Source/Domain duplicates.
 */

/**
 * Normalizes a full URL for exact equality checking.
 * - Lowercases hostname
 * - Removes leading www.
 * - Ignores http vs https scheme differences
 * - Trims trailing slash in pathname
 * - Sorts/normalizes query parameters
 * - Strips fragment / hash (#...)
 */
export function normalizeExactUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let urlString = rawUrl.trim();
  if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
    urlString = "https://" + urlString;
  }

  try {
    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    let path = parsed.pathname.toLowerCase().replace(/\/+$/, "");
    if (!path) path = "";

    // Normalize query string (sort params)
    let search = "";
    if (parsed.search) {
      const searchParams = new URLSearchParams(parsed.search);
      searchParams.sort();
      const stringified = searchParams.toString();
      if (stringified) {
        search = "?" + stringified;
      }
    }

    return `${host}${path}${search}`;
  } catch {
    // Fallback for malformed URLs
    return rawUrl
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/+$/, "")
      .split("#")[0];
  }
}

/**
 * Extracts normalized source/domain from a URL.
 * Example:
 * https://www.linkorian.id/dashboard -> linkorian.id
 * https://linkorian.id/landing -> linkorian.id
 * https://docs.google.com/document/d/123 -> docs.google.com
 */
export function extractSourceDomain(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let urlString = rawUrl.trim();
  if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
    urlString = "https://" + urlString;
  }

  try {
    const parsed = new URL(urlString);
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return rawUrl
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0];
  }
}
