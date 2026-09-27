/**
 * Unified Search Normalization & Relevance Engine
 */

export interface NormalizedQuery {
  raw: string;
  normalized: string;
  cleanString: string;
  tokens: string[];
  expandedTokens: string[];
}

const SYNONYM_MAP: Record<string, string[]> = {
  journal: ["journal", "jurnal"],
  jurnal: ["jurnal", "journal"],
  loker: ["loker", "lowongan", "kerja", "job", "career", "karir"],
  lowongan: ["lowongan", "loker", "kerja", "job"],
  volunteer: ["volunteer", "sukarelawan", "relawan"],
  sukarelawan: ["sukarelawan", "relawan", "volunteer"],
  relawan: ["relawan", "sukarelawan", "volunteer"],
  dev: ["dev", "development", "developer"],
  development: ["development", "dev", "developer"],
  developer: ["developer", "dev", "development"],
  web: ["web", "website", "webdev"],
  react: ["react", "reactjs", "react.js"],
  next: ["next", "nextjs", "next.js"],
};

export function normalizeSearchQuery(rawQuery: string): NormalizedQuery {
  if (!rawQuery) {
    return {
      raw: "",
      normalized: "",
      cleanString: "",
      tokens: [],
      expandedTokens: [],
    };
  }

  const normalized = rawQuery.toLowerCase().trim();
  // Strip non-alphanumeric except spaces
  const cleanString = normalized
    .replace(/[^\w\s\d]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleanString
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const expandedSet = new Set<string>();
  tokens.forEach((t) => {
    expandedSet.add(t);
    if (SYNONYM_MAP[t]) {
      SYNONYM_MAP[t].forEach((syn) => expandedSet.add(syn));
    }
  });

  // Also add original trimmed query if different
  if (normalized && !expandedSet.has(normalized)) {
    expandedSet.add(normalized);
  }

  return {
    raw: rawQuery,
    normalized,
    cleanString,
    tokens,
    expandedTokens: Array.from(expandedSet),
  };
}

export function calculateRelevanceScore<T>(
  item: T,
  queryData: NormalizedQuery,
  getFields: (item: T) => {
    title?: string | null;
    category?: string | null;
    tags?: string | string[] | null;
    description?: string | null;
    notes?: string | null;
    url?: string | null;
    content?: string | null;
  }
): number {
  const fields = getFields(item);
  const title = (fields.title || "").toLowerCase().trim();
  const category = (fields.category || "").toLowerCase().trim();
  const description = (fields.description || "").toLowerCase().trim();
  const notes = (fields.notes || fields.content || "").toLowerCase().trim();
  const url = (fields.url || "").toLowerCase().trim();

  let tagsStr = "";
  if (Array.isArray(fields.tags)) {
    tagsStr = fields.tags.join(" ").toLowerCase();
  } else if (typeof fields.tags === "string") {
    tagsStr = fields.tags.toLowerCase();
  }

  let score = 0;
  const { normalized, cleanString, tokens, expandedTokens } = queryData;

  if (!normalized) return 0;

  // 1. Exact & Title matching
  if (title === normalized || title === cleanString) {
    score += 1000;
  } else if (title.startsWith(normalized) || title.startsWith(cleanString)) {
    score += 500;
  } else if (title.includes(normalized) || (cleanString && title.includes(cleanString))) {
    score += 300;
  }

  // 2. Token matches across fields
  let titleTokenMatches = 0;
  let allTokensMatched = true;

  for (const token of tokens) {
    let tokenMatched = false;

    // Check primary token & synonyms
    const searchTerms = [token, ...(SYNONYM_MAP[token] || [])];

    for (const term of searchTerms) {
      if (title.includes(term)) {
        score += 100;
        titleTokenMatches++;
        tokenMatched = true;
        break;
      }
      if (category.includes(term)) {
        score += 60;
        tokenMatched = true;
        break;
      }
      if (tagsStr.includes(term)) {
        score += 50;
        tokenMatched = true;
        break;
      }
      if (description.includes(term)) {
        score += 30;
        tokenMatched = true;
        break;
      }
      if (notes.includes(term)) {
        score += 20;
        tokenMatched = true;
        break;
      }
      if (url.includes(term)) {
        score += 10;
        tokenMatched = true;
        break;
      }
    }

    if (!tokenMatched) {
      allTokensMatched = false;
    }
  }

  // Bonus if all tokens match somewhere
  if (tokens.length > 1 && allTokensMatched) {
    score += 150;
  }

  // Bonus for title token density
  if (tokens.length > 0 && titleTokenMatches === tokens.length) {
    score += 200;
  }

  // Check additional expanded tokens
  for (const expToken of expandedTokens) {
    if (!tokens.includes(expToken)) {
      if (title.includes(expToken)) score += 40;
      else if (category.includes(expToken) || tagsStr.includes(expToken)) score += 25;
      else if (description.includes(expToken) || notes.includes(expToken)) score += 15;
    }
  }

  return score;
}

export function rankByRelevance<T>(
  items: T[],
  rawQuery: string,
  getFields: (item: T) => {
    title?: string | null;
    category?: string | null;
    tags?: string | string[] | null;
    description?: string | null;
    notes?: string | null;
    url?: string | null;
    content?: string | null;
  }
): T[] {
  if (!rawQuery || !rawQuery.trim() || items.length === 0) {
    return items;
  }

  const queryData = normalizeSearchQuery(rawQuery);
  if (queryData.expandedTokens.length === 0) {
    return items;
  }

  const scored = items.map((item) => ({
    item,
    score: calculateRelevanceScore(item, queryData, getFields),
  }));

  // Filter items that have at least some relevance score if query is non-empty
  const matched = scored.filter((s) => s.score > 0);
  matched.sort((a, b) => b.score - a.score);

  return matched.map((m) => m.item);
}
