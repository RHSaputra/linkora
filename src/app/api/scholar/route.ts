import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

async function fetchGoogleScholarSinglePage(targetUrl: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const items: any[] = [];

    $(".gs_r.gs_or.gs_scl").each((_, el) => {
      const titleEl = $(el).find(".gs_rt a").first();
      const title = titleEl.text().replace(/[\n\r\t]+/g, " ").trim();
      const scholarUrl = titleEl.attr("href") || "";

      if (!title) return;

      const authorJournalText = $(el).find(".gs_a").text().replace(/[\n\r\t]+/g, " ").trim();
      const snippetText = $(el).find(".gs_rs").text().replace(/[\n\r\t]+/g, " ").trim();
      const citedByText = $(el).find(".gs_or_cited").text().trim();
      const pdfUrl = $(el).find(".gs_or_ggsm a").attr("href") || "";

      const citeMatch = citedByText.match(/\d+/);
      const citationsCount = citeMatch ? parseInt(citeMatch[0], 10) : 0;

      items.push({
        id: Math.random().toString(),
        title,
        authorJournalText: authorJournalText || "Google Scholar Entry",
        snippetText,
        scholarUrl,
        pdfUrl,
        citationsCount,
      });
    });

    return items;
  } catch (err) {
    return [];
  }
}

async function fetchOpenAlexFallback(query: string, pageNum: number) {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(
    query
  )}&per-page=30&page=${pageNum}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "LinkoraScholar/1.0 (mailto:support@linkorian.online)",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) return [];

    const data = await res.json();
    const rawData = data.results || [];

    return rawData.map((item: any) => {
      const authors =
        item.authorships
          ?.map((a: any) => a.author?.display_name)
          .filter(Boolean)
          .join(", ") || "Scholar Author";

      const venue = item.primary_location?.source?.display_name || item.location?.source?.display_name || "";
      const year = item.publication_year || "";
      const authorJournalText = `${authors}${venue ? ` - ${venue}` : ""}${year ? ` (${year})` : ""}`;

      const pdfUrl = item.open_access?.oa_url || item.primary_location?.pdf_url || "";
      const landingUrl =
        item.primary_location?.landing_page_url ||
        item.doi ||
        (item.ids?.doi ? `https://doi.org/${item.ids.doi}` : `https://openalex.org/${item.id}`);

      return {
        id: item.id || Math.random().toString(),
        title: item.title || "Scholar Entry",
        authorJournalText,
        snippetText: item.abstract_inverted_index ? "Abstrak artikel tersedia di rujukan resmi." : "",
        scholarUrl: landingUrl,
        pdfUrl,
        citationsCount: item.cited_by_count || 0,
      };
    });
  } catch (err) {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const pageNum = parseInt(searchParams.get("page") || "1", 10);

    if (!query.trim()) {
      return NextResponse.json({ items: [], totalResults: 0 });
    }

    const startOffset = (pageNum - 1) * 10;
    const targetUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(
      query.trim()
    )}&start=${startOffset}&hl=id`;

    // 1. Primary Attempt: Google Scholar
    const scholarItems = await fetchGoogleScholarSinglePage(targetUrl);

    if (scholarItems.length > 0) {
      return NextResponse.json({
        ok: true,
        items: scholarItems,
        hasMore: scholarItems.length >= 10,
        currentPage: pageNum,
      });
    }

    // 2. Fallback Attempt: OpenAlex Academic Database API (250M+ indexed works)
    const openAlexItems = await fetchOpenAlexFallback(query.trim(), pageNum);

    return NextResponse.json({
      ok: true,
      items: openAlexItems,
      hasMore: openAlexItems.length >= 30,
      currentPage: pageNum,
      fallbackUsed: true,
    });
  } catch (error: any) {
    console.error("Google Scholar Scraper Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan pencarian Google Scholar" },
      { status: 500 }
    );
  }
}
