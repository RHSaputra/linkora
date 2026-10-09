import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { enforceServerEntitlement } from "@/lib/server-entitlement-check";

// ── Cache for SINTA Journal Accreditation Ratings ──
const sintaRatingCache = new Map<string, { sintaRating: string; sintaProfileUrl?: string }>();

async function getSintaDetailsForJournal(journalName: string): Promise<{ sintaRating: string; sintaProfileUrl?: string }> {
  const cleanKey = (journalName || "").toLowerCase().trim();
  if (!cleanKey || cleanKey === "academic venue" || cleanKey === "semantic scholar publication") {
    return { sintaRating: "" };
  }

  if (sintaRatingCache.has(cleanKey)) {
    return sintaRatingCache.get(cleanKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const searchUrl = `https://sinta.kemdiktisaintek.go.id/journals?q=${encodeURIComponent(journalName)}`;
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      let foundMatch: any = null;
      $("div.col-md").each((_, el) => {
        const titleLinkEl = $(el).find(".affil-name a").first();
        const title = titleLinkEl.text().replace(/[\n\r\t]+/g, " ").trim();
        const sintaProfileUrl = titleLinkEl.attr("href") || "";

        if (!title || !sintaProfileUrl.includes("/journals/profile/")) return;

        const accreditedText = $(el).find(".stat-prev .accredited").text().replace(/\s+/g, " ").trim();
        const sintaMatch = accreditedText.match(/S[1-6]/i);
        const sintaRating = sintaMatch ? sintaMatch[0].toUpperCase() : "SINTA Registered";

        if (!foundMatch) {
          foundMatch = { sintaRating, sintaProfileUrl };
        }
      });

      if (foundMatch) {
        sintaRatingCache.set(cleanKey, foundMatch);
        return foundMatch;
      }
    }
  } catch (_err) {
    // ignore
  }

  const fallback = { sintaRating: "" };
  sintaRatingCache.set(cleanKey, fallback);
  return fallback;
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

    // ── Enrich Semantic Scholar Articles with SINTA Accreditation Rating (S1 - S6) ──
    if (items.length > 0) {
      await Promise.all(
        items.map(async (item: any) => {
          if (item.venue && item.venue !== "Semantic Scholar Publication" && item.venue !== "Academic Venue") {
            const sintaInfo = await getSintaDetailsForJournal(item.venue);
            if (sintaInfo?.sintaRating) {
              item.sintaRating = sintaInfo.sintaRating;
              item.sintaProfileUrl = sintaInfo.sintaProfileUrl;
            }
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
