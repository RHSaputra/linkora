import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const start = (page - 1) * limit;

    if (!query.trim()) {
      return NextResponse.json({ items: [], totalResults: 0 });
    }

    const targetUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(
      query.trim()
    )}&start=${start}&hl=id`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
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

        // Extract citation count e.g. "Dirujuk 263 kali" -> 263
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

      if (items.length > 0) {
        return NextResponse.json({
          ok: true,
          items,
          hasMore: items.length >= 10,
          currentPage: page,
        });
      }
    }

    // Fallback: If Google Scholar blocks with CAPTCHA or returns 0 items, query Semantic Scholar API
    const fallbackUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
      query.trim()
    )}&offset=${start}&limit=${limit}&fields=title,authors,year,abstract,citationCount,isOpenAccess,openAccessPdf,url,venue,journal,externalIds`;

    const fallbackRes = await fetch(fallbackUrl, {
      headers: { Accept: "application/json" },
    });

    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      const rawData = fallbackData.data || [];

      const items = rawData.map((item: any) => {
        const authors = item.authors?.map((a: any) => a.name).join(", ") || "Scholar Author";
        const venue = item.venue || item.journal?.name || "";
        const year = item.year || "";
        const authorJournalText = `${authors} ${venue ? `- ${venue}` : ""} ${year ? `(${year})` : ""}`;

        return {
          id: item.paperId || Math.random().toString(),
          title: item.title || "Scholar Entry",
          authorJournalText,
          snippetText: item.abstract || "",
          scholarUrl: item.url || (item.externalIds?.DOI ? `https://doi.org/${item.externalIds.DOI}` : "https://scholar.google.com"),
          pdfUrl: item.openAccessPdf?.url || "",
          citationsCount: item.citationCount || 0,
        };
      });

      return NextResponse.json({
        ok: true,
        items,
        hasMore: items.length >= 10,
        currentPage: page,
        fallbackUsed: true,
      });
    }

    return NextResponse.json({ ok: true, items: [], hasMore: false, currentPage: page });
  } catch (error: any) {
    console.error("Google Scholar Scraper Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan pencarian Google Scholar" },
      { status: 500 }
    );
  }
}
