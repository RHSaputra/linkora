/**
 * Linkora AI Text & Output Sanitizer Layer
 * Ensures AI outputs are clean, structured, and free of accidental raw markdown or control character corruption.
 */

export interface TextSanitizeOptions {
  stripMarkdownHeadings?: boolean;
  stripDecorativeSymbols?: boolean;
  preserveBullets?: boolean;
  preserveCodeBlocks?: boolean;
}

/**
 * Normalizes text output from AI responses.
 * Cleans extra symbols (*, #, ---, !?) while leaving valid formatting intact.
 */
export function sanitizeAIResponseText(text: string | null | undefined, options: TextSanitizeOptions = {}): string {
  if (!text) return "";

  let cleaned = text.trim();

  // Strip JSON markdown wrapper if mistakenly returned as plain text
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();
  }

  // Remove decorative markdown headers (# ## ###) if requested or redundant
  if (options.stripMarkdownHeadings) {
    cleaned = cleaned.replace(/^(#{1,6})\s+/gm, "");
  }

  // Remove decorative lines like --- or ===
  if (options.stripDecorativeSymbols) {
    cleaned = cleaned.replace(/^[=\-]{3,}\s*$/gm, "");
  }

  // Remove excessive blank lines (more than 2 consecutive newlines)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

/**
 * Robust JSON Parser for AI Structured Outputs
 * Handles fenced code blocks, leading noise, and Unicode control characters safely.
 */
export function parseAIStructuredJson<T = any>(text: string | null | undefined): T | null {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {}

  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}

  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx > startIdx) {
    const jsonSub = cleaned.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(jsonSub);
    } catch {}

    try {
      const sanitized = jsonSub.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
        if (match === "\n") return "\\n";
        if (match === "\r") return "\\r";
        if (match === "\t") return "\\t";
        return "";
      });
      return JSON.parse(sanitized);
    } catch {}
  }

  return null;
}
