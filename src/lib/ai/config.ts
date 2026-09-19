/**
 * Linkora Central AI Configuration Source of Truth
 */

export const AI_CONFIG = {
  provider: "gemini",
  apiVersion: "v1beta", // Stable supported API version for @google/genai SDK
  
  /**
   * Standardized Production Models List in Order of Preference
   * Primary: gemini-2.0-flash (Fast, 1M context, high quality, multi-modal & structured output support)
   * Fallbacks: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-lite
   */
  models: {
    primary: "gemini-2.0-flash",
    fallbacks: [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash-lite",
    ] as const,
  },

  /**
   * Temperature Profiles based on feature task requirement
   */
  temperatures: {
    factual: 0.1,       // Link Analysis, JSON extraction, Search filter parsing
    structured: 0.25,    // Roadmap generation, Organize, Tags, Summarize
    conversational: 0.7, // Liko AI Chat
  },

  /**
   * Default Timeouts (ms)
   */
  timeouts: {
    standard: 25000,
    heavy: 50000,
    fast: 10000,
  },

  /**
   * Retry Settings for Transient Failures
   */
  retry: {
    maxAttempts: 2,
    baseDelayMs: 1000,
    retryableStatusCodes: [429, 500, 502, 503, 504],
  },
} as const;

export const GEMINI_MODELS = [
  AI_CONFIG.models.primary,
  ...AI_CONFIG.models.fallbacks,
] as const;

export type GeminiModelName = (typeof GEMINI_MODELS)[number];
