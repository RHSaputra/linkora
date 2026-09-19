/**
 * Linkora Central AI Configuration Source of Truth
 */

export const AI_CONFIG = {
  provider: "gemini",
  apiVersion: "v1beta",
  
  /**
   * Standardized Production Models List in Order of Preference
   * Primary: gemini-3.6-flash (Active flagship model)
   * Fallbacks: gemini-3.5-flash-lite, gemini-2.5-flash
   */
  models: {
    primary: "gemini-3.6-flash",
    fallbacks: [
      "gemini-3.5-flash-lite",
      "gemini-2.5-flash",
    ] as const,
  },

  temperatures: {
    factual: 0.1,       // Link Analysis, JSON extraction, Search filter parsing
    structured: 0.25,    // Roadmap generation, Organize, Tags, Summarize
    conversational: 0.7, // Liko AI Chat
  },

  timeouts: {
    standard: 25000,
    heavy: 50000,
    fast: 10000,
  },

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
