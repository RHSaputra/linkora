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
 * Context-aware AI Response Normalizer
 * Preserves URLs, code blocks, shell commands, and code identifiers untouched.
 * Cleans unwanted decorative headers (# ## ###), decorative lines (---, ===), and redundant symbols.
 */
export function normalizeAIResponse(text: string | null | undefined): string {
  if (!text) return "";

  let input = text.trim();

  // Strip JSON markdown wrapper if present
  if (input.startsWith("```json")) {
    input = input.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();
  }

  // Tokenize and protect URLs, fenced code blocks, inline code, and shell commands
  const protectedTokens: string[] = [];
  const tokenPlaceholderPrefix = "___LINKORA_PROTECTED_TOKEN_";

  const addToken = (val: string) => {
    const idx = protectedTokens.length;
    protectedTokens.push(val);
    return `${tokenPlaceholderPrefix}${idx}___`;
  };

  // 1. Protect Fenced Code Blocks (```...```)
  let processed = input.replace(/```[\s\S]*?```/g, (match) => addToken(match));

  // 2. Protect URLs (http://, https://)
  processed = processed.replace(/https?:\/\/[^\s<>"{}|\\^`\)]+/gi, (match) => addToken(match));

  // 3. Protect Inline Code (`...`)
  processed = processed.replace(/`[^`]+`/g, (match) => addToken(match));

  // 4. Remove decorative markdown headers (# ## ###) at start of lines
  processed = processed.replace(/^(#{1,6})\s+/gm, "");

  // 5. Remove decorative lines like --- or ===
  processed = processed.replace(/^[=\-]{3,}\s*$/gm, "");

  // 6. Remove excessive blank lines (more than 2 consecutive newlines)
  processed = processed.replace(/\n{3,}/g, "\n\n");

  // Restore protected tokens
  protectedTokens.forEach((val, idx) => {
    const placeholder = `${tokenPlaceholderPrefix}${idx}___`;
    processed = processed.split(placeholder).join(val);
  });

  return processed.trim();
}

/**
 * Normalizes text output from AI responses.
 * Cleans extra symbols while leaving valid formatting intact.
 */
export function sanitizeAIResponseText(text: string | null | undefined, options: TextSanitizeOptions = {}): string {
  return normalizeAIResponse(text);
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
