import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG, GEMINI_MODELS, GeminiModelName } from "./config";
import { LinkoraAiError, normalizeAiError } from "./errors";
import { parseAIStructuredJson, sanitizeAIResponseText } from "./sanitizer";

/**
 * Get or create GoogleGenAI Client dynamically.
 * This guarantees process.env.GEMINI_API_KEY is read dynamically on request execution.
 */
export function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
}


/**
 * Utility helper to apply a strict execution timeout to promises.
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = AI_CONFIG.timeouts.standard): Promise<T> {
  let timerId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(new LinkoraAiError("Waktu tunggu permintaan AI telah habis.", "AI_TIMEOUT", 503));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timerId!);
    return result;
  } catch (err) {
    clearTimeout(timerId!);
    throw err;
  }
}

export interface GeminiRequestOptions {
  contents: any[];
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  timeoutMs?: number;
  expectJson?: boolean;
}

function isRateLimitError(err: any): boolean {
  if (!err) return false;
  const str = String(err?.message || err).toLowerCase();
  const status = err?.status || err?.statusCode || err?.error?.status || err?.error?.code;
  return status === 429 || status === "RESOURCE_EXHAUSTED" || str.includes("quota") || str.includes("rate limit") || str.includes("resource_exhausted");
}

/**
 * Central Shared Request Engine for Non-Streaming Gemini API Calls
 */
export async function executeGeminiRequest<T = string>(options: GeminiRequestOptions): Promise<{ data: T; modelUsed: GeminiModelName }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new LinkoraAiError("GEMINI_API_KEY belum dikonfigurasi pada server.", "AI_AUTH_ERROR", 500);
  }

  const client = getAiClient();
  const timeoutMs = options.timeoutMs ?? AI_CONFIG.timeouts.standard;
  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= AI_CONFIG.retry.maxAttempts; attempt++) {
      try {
        const config: any = {
          temperature: options.temperature ?? AI_CONFIG.temperatures.factual,
        };

        if (options.maxOutputTokens) {
          config.maxOutputTokens = options.maxOutputTokens;
        }

        if (options.responseMimeType && modelName === AI_CONFIG.models.primary) {
          config.responseMimeType = options.responseMimeType;
        }

        if (options.systemInstruction) {
          config.systemInstruction = options.systemInstruction;
        }

        const response = await withTimeout(
          client.models.generateContent({
            model: modelName,
            contents: options.contents,
            config,
          }),
          timeoutMs
        );

        const rawText = response?.text || "";

        if (options.expectJson) {
          const parsed = parseAIStructuredJson<T>(rawText);
          if (parsed !== null) {
            return { data: parsed, modelUsed: modelName as GeminiModelName };
          }
          console.warn(`Model ${modelName} (attempt ${attempt}) returned invalid JSON structure, retrying...`);
        } else {
          const cleanedText = sanitizeAIResponseText(rawText);
          if (cleanedText) {
            return { data: cleanedText as unknown as T, modelUsed: modelName as GeminiModelName };
          }
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} call (attempt ${attempt}) failed:`, err?.message || err);
        lastError = err;
        if (isRateLimitError(err)) {
          console.warn(`Model ${modelName} rate limited (429/Quota), switching to fallback model...`);
          break; // Immediately try next model in GEMINI_MODELS
        }
        if (attempt < AI_CONFIG.retry.maxAttempts) {
          await new Promise((r) => setTimeout(r, AI_CONFIG.retry.baseDelayMs * attempt));
        }
      }
    }
  }

  const normalized = normalizeAiError(lastError);
  throw new LinkoraAiError(normalized.friendlyMessage, normalized.errorCode, normalized.statusCode);
}

/**
 * Central Shared Request Engine for Streaming Gemini API Calls (used by Liko AI Chat)
 * Validates the first chunk before returning to guarantee fallback on 429 / Rate-Limits.
 */
export async function executeGeminiStream(options: {
  contents: any[];
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<{ stream: AsyncIterable<{ text?: string }>; modelUsed: GeminiModelName }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new LinkoraAiError("GEMINI_API_KEY belum dikonfigurasi pada server.", "AI_AUTH_ERROR", 500);
  }

  const client = getAiClient();
  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= AI_CONFIG.retry.maxAttempts; attempt++) {
      try {
        const responseStream = await client.models.generateContentStream({
          model: modelName,
          contents: options.contents,
          config: {
            temperature: options.temperature ?? AI_CONFIG.temperatures.conversational,
            maxOutputTokens: options.maxOutputTokens,
          },
        });

        const iterator = typeof (responseStream as any)[Symbol.asyncIterator] === "function"
          ? (responseStream as any)[Symbol.asyncIterator]()
          : (responseStream as any);

        const firstResult = await iterator.next();

        async function* wrappedStream() {
          if (firstResult && firstResult.value) {
            yield firstResult.value;
          }
          while (true) {
            const nextRes = await iterator.next();
            if (!nextRes || nextRes.done) break;
            if (nextRes.value) yield nextRes.value;
          }
        }

        return { stream: wrappedStream(), modelUsed: modelName as GeminiModelName };
      } catch (err: any) {
        console.warn(`Stream model ${modelName} (attempt ${attempt}) failed:`, err?.message || err);
        lastError = err;
        if (isRateLimitError(err)) {
          console.warn(`Stream model ${modelName} rate limited (429/Quota), switching to fallback model...`);
          break; // Immediately try next model in GEMINI_MODELS
        }
        if (attempt < AI_CONFIG.retry.maxAttempts) {
          await new Promise((r) => setTimeout(r, AI_CONFIG.retry.baseDelayMs * attempt));
        }
      }
    }
  }

  const normalized = normalizeAiError(lastError);
  throw new LinkoraAiError(normalized.friendlyMessage, normalized.errorCode, normalized.statusCode);
}
