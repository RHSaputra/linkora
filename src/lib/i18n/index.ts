import { SupportedLocale, DEFAULT_LOCALE, FALLBACK_LOCALE, SUPPORTED_LOCALES } from "./types";
import { dictionaries } from "./dictionaries";

/**
 * Retrieve a nested translation value from a dictionary.
 */
function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = path.split(".");
  let current: any = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

/**
 * Format string with interpolation variables: e.g. "Hello, {name}" -> "Hello, Alice"
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Core translation resolver with automated Indonesian fallback.
 */
export function translate(
  locale: SupportedLocale,
  key: string,
  params?: Record<string, string | number>
): string {
  // 1. Try selected locale
  const dict = dictionaries[locale];
  let val = getNestedValue(dict, key);

  // 2. Fallback to Indonesian (Primary) if missing
  if (!val && locale !== FALLBACK_LOCALE) {
    val = getNestedValue(dictionaries[FALLBACK_LOCALE], key);
  }

  // 3. If still not found, return the last key segment formatted cleanly
  if (!val) {
    const fallbackSegments = key.split(".");
    return fallbackSegments[fallbackSegments.length - 1] || key;
  }

  return interpolate(val, params);
}

export * from "./types";
export * from "./dictionaries";
