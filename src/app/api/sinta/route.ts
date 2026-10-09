import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { enforceServerEntitlement } from "@/lib/server-entitlement-check";

const SINTA_LEVEL_PAGE_OFFSETS: Record<string, number> = {
  "1": 1,
  "2": 126,
  "3": 385,
  "4": 660,
  "5": 1110,
  "6": 1648,
};

const ACRONYM_EXPANSIONS: Record<string, string[]> = {
  jpti: ["Jurnal Pendidikan Teknologi Informasi", "Jurnal PTI", "Pendidikan Teknologi Informasi"],
  jti: ["Jurnal Teknologi Informasi", "Teknologi Informasi"],
  jtiik: ["Jurnal Teknologi Informasi dan Ilmu Komputer"],
  jktp: ["Jurnal Kajian Teknologi Pendidikan"],
  jtik: ["Jurnal Teknologi Informasi dan Komunikasi"],
  jppi: ["Jurnal Penelitian Pendidikan Indonesia"],
  jpik: ["Jurnal Pendidikan dan Ilmu Komputer"],
  jpm: ["Jurnal Pendidikan Matematika"],
  jpipa: ["Jurnal Pendidikan IPA"],
};

// ── Cache for SINTA Journal Accreditation Ratings ──
const sintaJournalRatingCache = new Map<string, { sintaRating: string; sintaProfileUrl?: string; institution?: string }>();

async function fetchSintaSinglePage(targetUrl: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const items: any[] = [];
    $("div.col-md").each((_, el) => {
      const titleLinkEl = $(el).find(".affil-name a").first();
      const title = titleLinkEl.text().replace(/[\n\r\t]+/g, " ").trim();
      const sintaProfileUrl = titleLinkEl.attr("href") || "";

      if (!title || !sintaProfileUrl.includes("/journals/profile/")) return;

      const websiteUrl = $(el).find('.affil-abbrev a[href*="http"]').first().attr("href") || "";
      const institution = $(el).find(".affil-loc a").text().replace(/[\n\r\t]+/g, " ").trim();

      const rawIssnText = $(el).find(".profile-id").text() || "";
      const cleanedIssnText = rawIssnText
        .replace(/Subject Area.*/gi, "")
        .replace(/[\n\r\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const accreditedText = $(el).find(".stat-prev .accredited").text().replace(/\s+/g, " ").trim();
      const sintaMatch = accreditedText.match(/S[1-6]/i);
      const sintaRating = sintaMatch ? sintaMatch[0].toUpperCase() : "SINTA Registered";

      const nums: string[] = [];
      $(el)
        .find(".journal-list-stat .pr-num")
        .each((_, numEl) => {
          nums.push($(numEl).text().trim());
        });

      const impact = nums[0] || "-";
      const h5Index = nums[1] || "-";
      const citations5yr = nums[2] || "-";
      const citationsTotal = nums[3] || "-";

      const idMatch = sintaProfileUrl.match(/\/profile\/(\d+)/);
      const id = idMatch ? idMatch[1] : Math.random().toString();

      items.push({
        id,
        title,
        sintaRating,
        websiteUrl: websiteUrl || sintaProfileUrl,
        sintaProfileUrl,
        institution: institution || "Institusi Pendidikan Indonesia",
        issnText: cleanedIssnText || "-",
        impact,
        h5Index,
        citations5yr,
        citationsTotal,
      });
    });

    return items;
  } catch (_err) {
    return [];
  }
}

async function getSintaJournalDetails(journalName: string, issn?: string) {
  const searchKey = (issn || journalName || "").toLowerCase().trim();
  if (!searchKey) return null;

  if (sintaJournalRatingCache.has(searchKey)) {
    return sintaJournalRatingCache.get(searchKey);
  }

  try {
    const searchUrl = `https://sinta.kemdiktisaintek.go.id/journals?q=${encodeURIComponent(journalName || issn || "")}`;
    const journals = await fetchSintaSinglePage(searchUrl);
    if (journals && journals.length > 0) {
      const match = journals[0];
      const details = {
        sintaRating: match.sintaRating || "SINTA Registered",
        sintaProfileUrl: match.sintaProfileUrl || "",
        institution: match.institution || "",
      };
      sintaJournalRatingCache.set(searchKey, details);
      return details;
    }
  } catch (_err) {
    // Ignore error
  }

  const defaultDetails = { sintaRating: "SINTA Registered" };
  sintaJournalRatingCache.set(searchKey, defaultDetails);
  return defaultDetails;
}

// ── OpenAlex / DOI Resolver ──
async function resolveArticleViaOpenAlex(queryOrDoi: string) {
  const cleanStr = queryOrDoi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").trim();
  const isDoi = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i.test(cleanStr);

  const endpoint = isDoi
    ? `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(cleanStr)}`
    : `https://api.openalex.org/works?search=${encodeURIComponent(cleanStr)}&per-page=5`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { "User-Agent": "LinkoraScholar/1.0 (mailto:support@linkorian.online)" },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) return [];
    const data = await res.json();
    const works = isDoi ? (data ? [data] : []) : data.results || [];

    const items: any[] = [];
    for (const work of works) {
      const title = work.title || "";
      if (!title) continue;

      const containerTitle = work.primary_location?.source?.display_name || work.location?.source?.display_name || "";
      const issn = work.primary_location?.source?.issn?.[0] || work.primary_location?.source?.issn_l || "";
      const year = work.publication_year ? String(work.publication_year) : "-";
      const doi = work.doi ? work.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "") : "";
      const creators = work.authorships?.map((a: any) => a.author?.display_name).filter(Boolean).join(", ") || "Penulis SINTA";
      const citedByCount = work.cited_by_count || 0;
      const articleUrl = work.doi || work.primary_location?.landing_page_url || "https://sinta.kemdiktisaintek.go.id";

      items.push({
        id: doi || work.id || Math.random().toString(),
        title,
        creator: creators,
        publicationName: containerTitle || "Artikel Terindeks SINTA",
        coverDate: year,
        citedByCount,
        scopusUrl: articleUrl,
        issn,
        isArticle: true,
      });
    }

    return items;
  } catch (_err) {
    return [];
  }
}

async function fetchSintaSingleArticlePage(targetUrl: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const items: any[] = [];
    $(".ar-list-item").each((_, el) => {
      const titleLinkEl = $(el).find(".ar-title a").first();
      const title = titleLinkEl.text().replace(/[\n\r\t]+/g, " ").trim();
      const articleUrl = titleLinkEl.attr("href") || "";

      if (!title) return;

      const creator = $(el).find(".ar-meta").first().text().replace(/[\n\r\t]+/g, " ").trim();
      const publicationName = $(el).find(".ar-pub").text().replace(/[\n\r\t]+/g, " ").trim();
      const year = $(el).find(".ar-year").text().replace(/[\n\r\t]+/g, " ").trim();
      const cited = $(el).find(".ar-cited").text().replace(/[\n\r\t]+/g, " ").trim();
      const rawQuartile = $(el).find(".ar-quartile").text().replace(/[\n\r\t]+/g, " ").trim();
      const sintaMatch = rawQuartile.match(/S[1-6]/i);
      const sintaRating = sintaMatch ? sintaMatch[0].toUpperCase() : undefined;

      const idMatch = articleUrl.match(/eid=([^&]+)/) || articleUrl.match(/\/(\d+)/);
      const id = idMatch ? idMatch[1] : Math.random().toString();

      items.push({
        id,
        title,
        creator: creator.replace(/^Creator\s*:\s*/i, "") || "Penulis SINTA",
        publicationName: publicationName || "Artikel Terindeks SINTA",
        coverDate: year || "-",
        citedByCount: parseInt(cited.replace(/\D/g, "") || "0", 10),
        scopusUrl: articleUrl || "https://sinta.kemdiktisaintek.go.id",
        quartile: rawQuartile || "SINTA Indexed",
        sintaRating,
        isArticle: true,
      });
    });

    return items;
  } catch (_err) {
    return [];
  }
}

async function fetchSintaQuery(searchQuery: string, sintaFilter: string, startPage: number, type: string = "journal") {
  const pagePromises = [0, 1, 2].map((i) => {
    const pageNum = startPage + i;
    if (type === "article") {
      let targetUrl = `https://sinta.kemdiktisaintek.go.id/scopus?page=${pageNum}`;
      if (searchQuery.trim()) {
        targetUrl += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }
      return fetchSintaSingleArticlePage(targetUrl);
    } else {
      let targetUrl = `https://sinta.kemdiktisaintek.go.id/journals?page=${pageNum}`;
      if (searchQuery.trim()) {
        targetUrl += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (sintaFilter && ["1", "2", "3", "4", "5", "6"].includes(sintaFilter)) {
        targetUrl += `&sinta=${encodeURIComponent(sintaFilter)}`;
      }
      return fetchSintaSinglePage(targetUrl);
    }
  });

  const pageResults = await Promise.all(pagePromises);
  return pageResults.flat();
}

export async function GET(request: Request) {
  try {
    const check = await enforceServerEntitlement();
    if (!check.allowed) {
      return check.response;
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "journal"; // "journal" | "article"
    const sintaFilter = searchParams.get("sinta") || ""; // "1" | "2" | "3" | "4" | "5" | "6" | ""
    const pageNum = parseInt(searchParams.get("page") || "1", 10);
    const targetCount = 30;

    const baseOffset =
      type === "journal" && !query.trim() && sintaFilter && SINTA_LEVEL_PAGE_OFFSETS[sintaFilter]
        ? SINTA_LEVEL_PAGE_OFFSETS[sintaFilter]
        : 1;

    const startSintaPage = baseOffset + (pageNum - 1) * 3;

    const cleanQ = query.trim();
    const queryCandidates: string[] = [cleanQ];

    if (cleanQ) {
      const rawISSN = cleanQ.replace(/-/g, "");
      if (rawISSN !== cleanQ && /^\d+$/.test(rawISSN)) {
        queryCandidates.push(rawISSN);
      }

      const lowerQ = cleanQ.toLowerCase();
      if (ACRONYM_EXPANSIONS[lowerQ]) {
        queryCandidates.push(...ACRONYM_EXPANSIONS[lowerQ]);
      }
    }

    const items: any[] = [];
    const seenIds = new Set<string>();

    // 1. Primary Scraper Loop
    for (const qCandidate of queryCandidates) {
      const results = await fetchSintaQuery(qCandidate, sintaFilter, startSintaPage, type);
      for (const item of results) {
        if (sintaFilter && ["1", "2", "3", "4", "5", "6"].includes(sintaFilter)) {
          if (type === "journal" && item.sintaRating !== `S${sintaFilter}`) {
            continue;
          }
        }
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          items.push(item);
        }
      }

      if (items.length >= 10) break;
    }

    // 2. OpenAlex Fallback for Articles / DOIs if SINTA primary returned few items
    if (type === "article" && cleanQ && items.length < 5) {
      const openAlexItems = await resolveArticleViaOpenAlex(cleanQ);
      for (const item of openAlexItems) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          items.push(item);
        }
      }
    }

    // 3. Enrich Article Items with SINTA Accreditation Rating (S1 - S6)
    if (type === "article" && items.length > 0) {
      await Promise.all(
        items.map(async (item) => {
          if (!item.sintaRating || item.sintaRating === "SINTA Indexed") {
            if (item.publicationName) {
              const details = await getSintaJournalDetails(item.publicationName, item.issn);
              if (details?.sintaRating) {
                item.sintaRating = details.sintaRating;
                item.quartile = `${details.sintaRating} Accredited`;
              }
            }
          } else if (item.sintaRating.startsWith("S")) {
            item.quartile = `${item.sintaRating} Accredited`;
          }
        })
      );
    }

    // 4. Filter by requested SINTA Level if specified
    let finalItems = items;
    if (type === "article" && sintaFilter && ["1", "2", "3", "4", "5", "6"].includes(sintaFilter)) {
      finalItems = items.filter(
        (it) => it.sintaRating === `S${sintaFilter}` || (it.quartile && it.quartile.includes(`S${sintaFilter}`))
      );
    }

    return NextResponse.json({
      ok: true,
      items: finalItems,
      hasMore: finalItems.length >= targetCount,
      count: finalItems.length,
      currentPage: pageNum,
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Koneksi ke server SINTA mengalami batas waktu (Timeout). Silakan coba lagi." },
        { status: 504 }
      );
    }
    console.error("SINTA Scraper Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan scraping SINTA" },
      { status: 500 }
    );
  }
}
