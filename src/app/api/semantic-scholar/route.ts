import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { enforceServerEntitlement } from "@/lib/server-entitlement-check";

// ── Cache for SINTA Journal Accreditation Ratings ──
const sintaRatingCache = new Map<string, { sintaRating: string; sintaProfileUrl: string; sintaRankingUrl: string }>();

const ACRONYM_EXPANSIONS: Record<string, string> = {
  jpti: "Jurnal Pendidikan Teknologi Informasi",
  jti: "Jurnal Teknologi Informasi",
  jtiik: "Jurnal Teknologi Informasi dan Ilmu Komputer",
  jktp: "Jurnal Kajian Teknologi Pendidikan",
  jtik: "Jurnal Teknologi Informasi dan Komunikasi",
  jppi: "Jurnal Penelitian Pendidikan Indonesia",
  jpik: "Jurnal Pendidikan dan Ilmu Komputer",
  jpm: "Jurnal Pendidikan Matematika",
  jpipa: "Jurnal Pendidikan IPA",
  jsi: "Jurnal Sistem Informasi",
  jil: "Jurnal Ilmu Lingkungan",
  jiipi: "Jurnal Ikatan Alumni Fisika Universitas Negeri Medan",
  jmat: "Jurnal Matematika",
};

function cleanVenueName(venue: string): string {
  if (!venue) return "";
  return venue
    .replace(/\b(vol|volume|no|number|issue|pp|pages|ed|edition)\b\.?\s*\d+/gi, "")
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/\b(e-?issn|issn)\s*:?\s*[\dxX\-]+/gi, "")
    .replace(/\b(special issue|conference series|proceedings of)\b.*/gi, "")
    .replace(/[\(\)\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchSintaJournalSearch(
  query: string,
  rawVenueName: string,
  retryCount = 1
): Promise<{ sintaRating: string; sintaProfileUrl: string; sintaRankingUrl: string } | null> {
  const cleanKey = (query || "").toLowerCase().trim();
  if (
    !cleanKey ||
    cleanKey.length < 3 ||
    cleanKey === "academic venue" ||
    cleanKey === "semantic scholar publication"
  ) {
    return null;
  }

  if (sintaRatingCache.has(cleanKey)) {
    return sintaRatingCache.get(cleanKey)!;
  }

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const searchUrl = `https://sinta.kemdiktisaintek.go.id/journals?q=${encodeURIComponent(query)}`;
      const res = await fetch(searchUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      }).finally(() => clearTimeout(timeoutId));

      if (!res.ok) {
        if (attempt < retryCount) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        return null;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      const normalizedVenue = (rawVenueName || query).toLowerCase().replace(/[^\w\s]/gi, "");

      let foundMatch: { sintaRating: string; sintaProfileUrl: string; sintaRankingUrl: string } | null = null;
      $("div.col-md").each((_, el) => {
        const titleLinkEl = $(el).find(".affil-name a").first();
        const journalTitle = titleLinkEl.text().replace(/[\n\r\t]+/g, " ").trim();
        let sintaProfileUrl = titleLinkEl.attr("href") || "";

        if (!journalTitle || !sintaProfileUrl.includes("/journals/profile/")) return;

        if (sintaProfileUrl.startsWith("/")) {
          sintaProfileUrl = `https://sinta.kemdiktisaintek.go.id${sintaProfileUrl}`;
        }

        // Verify that the found journal title matches or overlaps closely with the journal/venue name
        const normalizedJournal = journalTitle.toLowerCase().replace(/[^\w\s]/gi, "");
        const isMatch =
          normalizedJournal.includes(normalizedVenue) ||
          normalizedVenue.includes(normalizedJournal) ||
          query.toLowerCase().trim() === normalizedJournal ||
          normalizedJournal.split(/\s+/).some((word: string) => word.length > 3 && normalizedVenue.includes(word));

        if (!isMatch) return;

        const accreditedText = $(el).find(".stat-prev .accredited").text().replace(/\s+/g, " ").trim();
        const sintaMatch = accreditedText.match(/S[1-6]/i);
        const sintaRating = sintaMatch ? sintaMatch[0].toUpperCase() : "SINTA Registered";
        const sintaRankingUrl = `https://sinta.kemdiktisaintek.go.id/journals?q=${encodeURIComponent(journalTitle || query)}`;

        if (!foundMatch) {
          foundMatch = { sintaRating, sintaProfileUrl, sintaRankingUrl };
        }
      });

      if (foundMatch) {
        sintaRatingCache.set(cleanKey, foundMatch);
        return foundMatch;
      }

      // If page was parsed fine but no journals matched, no need to retry same URL
      break;
    } catch (_err) {
      if (attempt < retryCount) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
    }
  }

  return null;
}

async function resolveSintaDetailsForPaper(
  item: any
): Promise<{ sintaRating: string; sintaProfileUrl: string; sintaRankingUrl: string }> {
  const venue = (item.venue || "").trim();

  // STRICT REQUIREMENT: Only search SINTA based on Journal / Venue Name.
  // NEVER search SINTA based on article title to guarantee accurate indexing.
  if (!venue || venue === "Semantic Scholar Publication" || venue === "Academic Venue") {
    return { sintaRating: "", sintaProfileUrl: "", sintaRankingUrl: "" };
  }

  // Build candidate keyword permutations to retry multiple times to SINTA page
  const candidates: string[] = [venue];

  const parenMatch = venue.match(/(.+?)\s*\((.+?)\)/);
  if (parenMatch) {
    if (parenMatch[2].trim() && !candidates.includes(parenMatch[2].trim())) {
      candidates.push(parenMatch[2].trim());
    }
    if (parenMatch[1].trim() && !candidates.includes(parenMatch[1].trim())) {
      candidates.push(parenMatch[1].trim());
    }
  }

  const cleaned = cleanVenueName(venue);
  if (cleaned && !candidates.includes(cleaned)) {
    candidates.push(cleaned);
  }

  // Colon or dash split (e.g., "UPGRADE: Jurnal Pendidikan..." -> "UPGRADE")
  if (venue.includes(":") || venue.includes(" - ")) {
    const parts = venue.split(/[:\-]/).map((p: string) => p.trim()).filter(Boolean);
    for (const p of parts) {
      if (p.length >= 3 && !candidates.includes(p)) {
        candidates.push(p);
      }
    }
  }

  // Stripped common prefixes
  const strippedPrefix = venue
    .replace(
      /^(jurnal\s+ilmiah|jurnal|the\s+journal\s+of|journal\s+of|international\s+journal\s+of|indonesian\s+journal\s+of)\s+/i,
      ""
    )
    .trim();
  if (strippedPrefix && strippedPrefix.length >= 3 && !candidates.includes(strippedPrefix)) {
    candidates.push(strippedPrefix);
  }

  const lowerVenue = venue.toLowerCase();
  for (const [acr, expansion] of Object.entries(ACRONYM_EXPANSIONS)) {
    if (lowerVenue === acr || lowerVenue.includes(`(${acr})`) || lowerVenue.includes(` ${acr} `)) {
      if (!candidates.includes(expansion)) candidates.push(expansion);
    }
  }

  // Try candidate keywords sequentially against SINTA official database
  for (const cand of candidates) {
    const sintaResult = await fetchSintaJournalSearch(cand, venue);
    if (sintaResult && sintaResult.sintaRating) {
      return sintaResult;
    }
  }

  // BUKAN MENGARANG: Strict policy - if not indexed in SINTA, do NOT fabricate SINTA ratings!
  return { sintaRating: "", sintaProfileUrl: "", sintaRankingUrl: "" };
}

export async function GET(request: Request) {
  try {
    const check = await enforceServerEntitlement();
    if (!check.allowed) {
      return check.response;
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const yearFrom = searchParams.get("year_from") || "";
    const yearTo = searchParams.get("year_to") || "";
    const openAccess = searchParams.get("open_access") === "true";
    const pageNum = parseInt(searchParams.get("page") || "1", 10);

    const cleanQ = query.trim();
    const effectiveQuery = cleanQ || "artificial intelligence";

    const limit = 30;
    const offset = (pageNum - 1) * limit;

    let items: any[] = [];
    let totalResults = 0;

    // Strategy 1: Direct Semantic Scholar API
    const ssUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(effectiveQuery)}&offset=${offset}&limit=${limit}&fields=paperId,title,url,authors,year,abstract,citationCount,isOpenAccess,openAccessPdf,publicationVenue,externalIds`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const ssRes = await fetch(ssUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
      }).finally(() => clearTimeout(timeoutId));

      if (ssRes.ok) {
        const ssData = await ssRes.json();
        if (ssData && Array.isArray(ssData.data) && ssData.data.length > 0) {
          items = ssData.data.map((item: any) => {
            const authors = (item.authors || []).map((a: any) => a.name).filter(Boolean).join(", ");
            const doiStr = item.externalIds?.DOI ? `https://doi.org/${item.externalIds.DOI}` : "";
            const sUrl = item.url || (item.paperId ? `https://www.semanticscholar.org/paper/${item.paperId}` : doiStr);

            return {
              id: item.paperId || Math.random().toString(),
              paperId: item.paperId || "",
              title: item.title || "Untitled Paper",
              authors: authors || "Penulis Semantic Scholar",
              venue: item.publicationVenue?.name || "Semantic Scholar Publication",
              year: item.year ? item.year.toString() : "",
              citationCount: item.citationCount || 0,
              semanticScholarUrl: sUrl,
              pdfUrl: item.openAccessPdf?.url || "",
              doi: doiStr,
              isOpenAccess: Boolean(item.isOpenAccess || item.openAccessPdf?.url),
              abstract: item.abstract || "",
            };
          });
          totalResults = ssData.total || items.length;
        }
      }
    } catch (_e) {
      // Fall through to OpenAlex fallback
    }

    // Strategy 2: OpenAlex Engine Fallback if Strategy 1 returned no items
    if (items.length === 0) {
      const filterParts: string[] = [];
      if (yearFrom && yearTo) {
        filterParts.push(`publication_year:${yearFrom}-${yearTo}`);
      } else if (yearFrom) {
        const yF = parseInt(yearFrom, 10);
        if (!isNaN(yF)) filterParts.push(`publication_year:>${yF - 1}`);
      } else if (yearTo) {
        const yT = parseInt(yearTo, 10);
        if (!isNaN(yT)) filterParts.push(`publication_year:<${yT + 1}`);
      }

      if (openAccess) {
        filterParts.push("is_oa:true");
      }

      const filterParam = filterParts.length > 0 ? `&filter=${filterParts.join(",")}` : "";
      const openAlexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(effectiveQuery)}&per-page=${limit}&page=${pageNum}${filterParam}`;

      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 6000);
      const alexRes = await fetch(openAlexUrl, {
        signal: controller2.signal,
        headers: {
          "User-Agent": "LinkoraSemanticScholar/1.0 (mailto:support@linkora.app)",
          Accept: "application/json",
        },
      }).finally(() => clearTimeout(timeoutId2));

      if (alexRes.ok) {
        const alexData = await alexRes.json();
        items = (alexData.results || []).map((item: any) => {
          const sId = item.ids?.semanticscholar;
          const rawDoi = item.ids?.doi || item.doi || "";
          const cleanDoi = rawDoi.replace("https://doi.org/", "");

          const cleanSUrl = sId
            ? `https://www.semanticscholar.org/paper/${sId}`
            : cleanDoi
            ? `https://www.semanticscholar.org/paper/${cleanDoi}`
            : item.primary_location?.landing_page_url || `https://www.semanticscholar.org/search?q=${encodeURIComponent(item.title)}`;

          const authorsList = (item.authorships || []).map((a: any) => a.author?.display_name).filter(Boolean);
          const venue = item.primary_location?.source?.display_name || item.location?.source?.display_name || "Academic Venue";
          const year = item.publication_year ? item.publication_year.toString() : "";
          const pdfUrl = item.open_access?.oa_url || item.primary_location?.pdf_url || "";
          const citationCount = item.cited_by_count || 0;

          return {
            id: item.id || Math.random().toString(),
            paperId: sId || cleanDoi || item.id,
            title: item.title || "Untitled Paper",
            authors: authorsList.length > 0 ? authorsList.join(", ") : "Penulis Semantic Scholar",
            venue,
            year,
            citationCount,
            semanticScholarUrl: cleanSUrl,
            pdfUrl,
            doi: cleanDoi ? `https://doi.org/${cleanDoi}` : "",
            isOpenAccess: Boolean(item.open_access?.is_oa || pdfUrl),
            abstract: item.abstract_inverted_index ? "Abstrak riset akademis tersedia di portal resmi Semantic Scholar." : "",
          };
        });
        totalResults = alexData.meta?.count || items.length;
      }
    }

    // Apply local filters if specified
    if (yearFrom) {
      const yFrom = parseInt(yearFrom, 10);
      if (!isNaN(yFrom)) {
        items = items.filter((it: any) => !it.year || parseInt(it.year, 10) >= yFrom);
      }
    }
    if (yearTo) {
      const yTo = parseInt(yearTo, 10);
      if (!isNaN(yTo)) {
        items = items.filter((it: any) => !it.year || parseInt(it.year, 10) <= yTo);
      }
    }
    if (openAccess) {
      items = items.filter((it: any) => it.isOpenAccess);
    }

    // ── Enrich ALL Semantic Scholar Articles aggressively with SINTA Accreditation Rating (S1 - S6 / Scopus / Registered) ──
    if (items.length > 0) {
      await Promise.all(
        items.map(async (item: any) => {
          const sintaInfo = await resolveSintaDetailsForPaper(item);
          if (sintaInfo?.sintaRating) {
            item.sintaRating = sintaInfo.sintaRating;
            item.sintaProfileUrl = sintaInfo.sintaProfileUrl;
            item.sintaRankingUrl = sintaInfo.sintaRankingUrl;
          }
        })
      );
    }

    return NextResponse.json({
      ok: true,
      items,
      totalResults: totalResults || items.length,
      currentPage: pageNum,
      hasMore: items.length >= 30,
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Koneksi ke Semantic Scholar mengalami batas waktu (Timeout). Silakan coba lagi." },
        { status: 504 }
      );
    }
    console.error("Semantic Scholar Scraper Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan pencarian Semantic Scholar" },
      { status: 500 }
    );
  }
}
