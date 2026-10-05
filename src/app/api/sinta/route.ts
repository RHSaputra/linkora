import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const SINTA_LEVEL_PAGE_OFFSETS: Record<string, number> = {
  "1": 1,
  "2": 126,
  "3": 385,
  "4": 660,
  "5": 900,
  "6": 1050,
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
      const sintaRating = sintaMatch ? sintaMatch[0].toUpperCase() : "SINTA";

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
  } catch (err) {
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
      const quartile = $(el).find(".ar-quartile").text().replace(/[\n\r\t]+/g, " ").trim();

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
        quartile: quartile || "SINTA Indexed",
        isArticle: true,
      });
    });

    return items;
  } catch (err) {
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

    // 1. Build list of candidate search queries
    const cleanQ = query.trim();
    const queryCandidates: string[] = [cleanQ];

    if (cleanQ) {
      // If ISSN with dash (e.g., 2502-0714 -> 25020714)
      const rawISSN = cleanQ.replace(/-/g, "");
      if (rawISSN !== cleanQ && /^\d+$/.test(rawISSN)) {
        queryCandidates.push(rawISSN);
      }

      // If known acronym (e.g. JPTI)
      const lowerQ = cleanQ.toLowerCase();
      if (ACRONYM_EXPANSIONS[lowerQ]) {
        queryCandidates.push(...ACRONYM_EXPANSIONS[lowerQ]);
      }
    }

    const items: any[] = [];
    const seenIds = new Set<string>();

    for (const qCandidate of queryCandidates) {
      const results = await fetchSintaQuery(qCandidate, sintaFilter, startSintaPage, type);
      for (const item of results) {
        // Enforce level filter if specified
        if (sintaFilter && ["1", "2", "3", "4", "5", "6"].includes(sintaFilter)) {
          if (type === "journal") {
            if (item.sintaRating !== `S${sintaFilter}`) {
              continue;
            }
          } else if (type === "article") {
            // Check if article's journal rating matches requested level
            if (item.sintaRating && item.sintaRating !== `S${sintaFilter}`) {
              continue;
            }
          }
        }
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          items.push(item);
        }
      }

      if (items.length >= 10) break; // Found sufficient accurate results
    }

    return NextResponse.json({
      ok: true,
      items,
      hasMore: items.length >= targetCount,
      count: items.length,
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
