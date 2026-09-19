/**
 * Linkora AI Error Normalization Layer
 * Converts raw provider errors into safe, localized, user-friendly responses.
 */

export class LinkoraAiError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, code = "AI_PROVIDER_ERROR", status = 500) {
    super(message);
    this.name = "LinkoraAiError";
    this.code = code;
    this.status = status;
  }
}

export function normalizeAiError(error: any): { friendlyMessage: string; statusCode: number; errorCode: string } {
  if (error instanceof LinkoraAiError) {
    return {
      friendlyMessage: error.message,
      statusCode: error.status,
      errorCode: error.code,
    };
  }

  const rawMessage = typeof error === "string" ? error : error?.message || String(error || "");
  const lower = rawMessage.toLowerCase();

  // Quota & Rate Limits
  if (lower.includes("429") || lower.includes("quota") || lower.includes("resource_exhausted")) {
    return {
      friendlyMessage: "Batas kuota harian AI tercapai. Silakan coba kembali beberapa saat lagi.",
      statusCode: 429,
      errorCode: "AI_RATE_LIMIT",
    };
  }

  // Auth & API Key Issues
  if (
    lower.includes("api key") ||
    lower.includes("unauthorized") ||
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("api_key_invalid")
  ) {
    return {
      friendlyMessage: "Layanan Liko AI tidak dapat diakses (kunci API bermasalah). Silakan periksa konfigurasi server.",
      statusCode: 503,
      errorCode: "AI_AUTH_ERROR",
    };
  }

  // High Demand / Overloaded / Server Timeout
  if (
    lower.includes("503") ||
    lower.includes("504") ||
    lower.includes("high demand") ||
    lower.includes("unavailable") ||
    lower.includes("overloaded") ||
    lower.includes("timeout")
  ) {
    return {
      friendlyMessage: "Server Liko AI sedang mengalami antrean tinggi. Silakan coba kembali dalam beberapa detik.",
      statusCode: 503,
      errorCode: "AI_TIMEOUT",
    };
  }

  // Generic Safe Fallback
  return {
    friendlyMessage: "Terjadi kendala saat memproses permintaan AI. Silakan coba kembali.",
    statusCode: 500,
    errorCode: "AI_PROVIDER_ERROR",
  };
}
