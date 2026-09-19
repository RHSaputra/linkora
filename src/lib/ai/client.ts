import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG, GEMINI_MODELS, GeminiModelName } from "./config";
import { LinkoraAiError, normalizeAiError } from "./errors";
import { parseAIStructuredJson, sanitizeAIResponseText } from "./sanitizer";

/**
 * Single Shared Gemini Client Instance across Linkora.
 * ALL AI features (Chat, Link Analysis, Roadmap, Search, Organize, Summarize, Tags) MUST use this client.
 */
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

/**
 * Central Shared Request Engine for Non-Streaming Gemini API Calls
 * - Handles automatic model fallback looping across standardized production models
 * - Handles timeout control
 * - Normalizes errors
 * - Sanitizes / parses response outputs
 */
export async function executeGeminiRequest<T = string>(options: GeminiRequestOptions): Promise<{ data: T; modelUsed: GeminiModelName }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new LinkoraAiError("GEMINI_API_KEY belum dikonfigurasi pada server.", "AI_AUTH_ERROR", 500);
  }

  const timeoutMs = options.timeoutMs ?? AI_CONFIG.timeouts.standard;
  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const config: any = {
        temperature: options.temperature ?? AI_CONFIG.temperatures.factual,
      };

      if (options.maxOutputTokens) {
        config.maxOutputTokens = options.maxOutputTokens;
      }

      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }

      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }

      const response = await withTimeout(
        ai.models.generateContent({
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
        console.warn(`Model ${modelName} returned invalid JSON structure, trying next model fallback...`);
      } else {
        const cleanedText = sanitizeAIResponseText(rawText);
        if (cleanedText) {
          return { data: cleanedText as unknown as T, modelUsed: modelName as GeminiModelName };
        }
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} call failed:`, err?.message || err);
      lastError = err;
    }
  }

  const normalized = normalizeAiError(lastError);
  throw new LinkoraAiError(normalized.friendlyMessage, normalized.errorCode, normalized.statusCode);
}

/**
 * Central Shared Request Engine for Streaming Gemini API Calls (used by Liko AI Chat)
 */
export async function executeGeminiStream(options: {
  contents: any[];
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<{ stream: any; modelUsed: GeminiModelName }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new LinkoraAiError("GEMINI_API_KEY belum dikonfigurasi pada server.", "AI_AUTH_ERROR", 500);
  }

  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: options.contents,
        config: {
          temperature: options.temperature ?? AI_CONFIG.temperatures.conversational,
          maxOutputTokens: options.maxOutputTokens,
        },
      });

      if (responseStream) {
        return { stream: responseStream, modelUsed: modelName as GeminiModelName };
      }
    } catch (err: any) {
      console.warn(`Stream model ${modelName} failed:`, err?.message || err);
      lastError = err;
    }
  }

  const normalized = normalizeAiError(lastError);
  throw new LinkoraAiError(normalized.friendlyMessage, normalized.errorCode, normalized.statusCode);
}
