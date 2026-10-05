import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

async function fetchGarudaSinglePage(targetUrl: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) return { items: [], totalResults: 0 };

    const html = await res.text();
    const $ = cheerio.load(html);

    const items: any[] = [];
    let totalResults = 0;

    $(".article-item").each((_, el) => {
      const titleEl = $(el).find("a.title-article").first();
      const title = titleEl.text().replace(/[\n\r\t]+/g, " ").trim();
      const detailPath = titleEl.attr("href") || "";

      if (!title) return;

      const garudaUrl = detailPath.startsWith("http")
        ? detailPath
        : `https://garuda.kemdiktisaintek.go.id${detailPath}`;

      const authorsList: string[] = [];
      $(el)
        .find("a.author-article")
        .each((_, aEl) => {
          const aText = $(aEl).text().replace(/[\n\r\t]+/g, " ").trim();
          if (aText) authorsList.push(aText);
        });
      const author = authorsList.join(", ");
      const journalInfo = $(el).find("xmp.subtitle-article").first().text().replace(/[\n\r\t]+/g, " ").trim();

      const publisherEl = $(el).find("i.subtitle-article:contains('Publisher')").next("xmp.subtitle-article");
      const publisher = publisherEl.text().replace(/[\n\r\t]+/g, " ").trim();

      const downloadUrl = $(el).find("a.title-citation[href*='download']").attr("href") || "";
      const doiUrl = $(el).find("a.title-citation[href*='doi.org']").attr("href") || "";
      const abstractText = $(el).find(".abstract-article xmp").text().replace(/[\n\r\t]+/g, " ").trim();

      const idMatch = detailPath.match(/\/detail\/(\d+)/);
      const id = idMatch ? idMatch[1] : Math.random().toString();

      items.push({
        id,
        title,
        author: author || "Penulis Indonesia",
        journalInfo: journalInfo || "Garba Rujukan Digital",
        publisher: publisher || "Penerbit Indonesia",
        garudaUrl,
        downloadUrl,
        doiUrl,
        abstractText,
      });
    });

    const paginationText = $(".pagination-info").text().trim();
    const totalMatch = paginationText.match(/Total Record\s*:\s*(\d+)/i);
    if (totalMatch) {
      totalResults = parseInt(totalMatch[1], 10);
    }

    return { items, totalResults };
  } catch (err) {
    return { items: [], totalResults: 0 };
  }
}

async function fetchGarudaJournalSinglePage(targetUrl: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) return { items: [], totalResults: 0 };

    const html = await res.text();
    const $ = cheerio.load(html);

    const items: any[] = [];
    let totalResults = 0;

    $("table tr").each((_, el) => {
      const titleEl = $(el).find("a.title-journal").first();
      const title = titleEl.find("xmp").text().trim() || titleEl.text().replace(/[\n\r\t]+/g, " ").trim();
      const detailPath = titleEl.attr("href") || "";

      if (!title) return;

      const garudaUrl = detailPath.startsWith("http")
        ? detailPath
        : `https://garuda.kemdiktisaintek.go.id${detailPath}`;

      const publisherEl = $(el).find("a.subtitle-journal").first();
      const publisher = publisherEl.find("xmp").text().trim() || publisherEl.text().replace(/[\n\r\t]+/g, " ").trim();

      const rawText = $(el).text().replace(/[\n\r\t]+/g, " ");
      const issnMatch = rawText.match(/ISSN\s*:\s*([0-9X-]+)/i);
      const eissnMatch = rawText.match(/EISSN\s*:\s*([0-9X-]+)/i);
      const issnText = `ISSN: ${issnMatch ? issnMatch[1] : "-"} | E-ISSN: ${eissnMatch ? eissnMatch[1] : "-"}`;

      const subjectAreas: string[] = [];
      $(el).find("a.label-journal").each((_, sEl) => {
        const sText = $(sEl).find("xmp").text().trim() || $(sEl).text().trim();
        if (sText) subjectAreas.push(sText);
      });

      const idMatch = detailPath.match(/\/journal\/view\/(\d+)/);
      const id = idMatch ? idMatch[1] : Math.random().toString();

      items.push({
        id,
        title,
        publisher: publisher || "Penerbit Jurnal Indonesia",
        issnText,
        garudaUrl,
        subjectAreas: subjectAreas.length > 0 ? subjectAreas : ["Jurnal Indonesia"],
        isJournal: true,
      });
    });

    const paginationText = $(".pagination-info").text().trim();
    const totalMatch = paginationText.match(/Total Record\s*:\s*(\d+)/i);
    if (totalMatch) {
      totalResults = parseInt(totalMatch[1], 10);
    }

    return { items, totalResults };
  } catch (err) {
    return { items: [], totalResults: 0 };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "article"; // "article" | "journal"
    const select = searchParams.get("select") || "title"; // "title" | "abstract" | "author" | "doi"
    const publisher = searchParams.get("publisher") || "";
    const yearFrom = searchParams.get("year_from") || "";
    const yearTo = searchParams.get("year_to") || "";
    const pageNum = parseInt(searchParams.get("page") || "1", 10);

    const cleanQ = query.trim();
    const effectiveQuery = cleanQ || (type === "journal" ? "jurnal" : "penelitian");

    const startGarudaPage = (pageNum - 1) * 3 + 1;

    // Fetch 3 pages in parallel for 3x speedup
    const pagePromises = [0, 1, 2].map((i) => {
      const currentGarudaPage = startGarudaPage + i;
      let targetUrl = "";
      if (type === "journal") {
        targetUrl = `https://garuda.kemdiktisaintek.go.id/journal?page=${currentGarudaPage}&q=${encodeURIComponent(effectiveQuery)}`;
        if (publisher.trim()) {
          targetUrl += `&publisher=${encodeURIComponent(publisher.trim())}`;
        }
      } else {
        targetUrl = `https://garuda.kemdiktisaintek.go.id/documents?page=${currentGarudaPage}&select=${encodeURIComponent(select)}&q=${encodeURIComponent(effectiveQuery)}`;
        if (publisher.trim()) {
          targetUrl += `&publisher=${encodeURIComponent(publisher.trim())}`;
        }
        if (yearFrom.trim()) {
          targetUrl += `&year_from=${encodeURIComponent(yearFrom.trim())}`;
        }
        if (yearTo.trim()) {
          targetUrl += `&year_to=${encodeURIComponent(yearTo.trim())}`;
        }
      }
      
      return type === "journal"
        ? fetchGarudaJournalSinglePage(targetUrl)
        : fetchGarudaSinglePage(targetUrl);
    });

    const pageResults = await Promise.all(pagePromises);

    const items: any[] = [];
    const seenIds = new Set<string>();
    let totalResults = 0;

    for (const res of pageResults) {
      if (res && Array.isArray(res.items)) {
        if (res.totalResults > totalResults) {
          totalResults = res.totalResults;
        }
        for (const item of res.items) {
          if (item && item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            items.push(item);
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      items,
      totalResults: totalResults || items.length,
      hasMore: items.length >= 30,
      currentPage: pageNum,
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Koneksi ke portal GARUDA mengalami batas waktu (Timeout). Silakan coba lagi." },
        { status: 504 }
      );
    }
    console.error("GARUDA Scraper Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan scraping GARUDA" },
      { status: 500 }
    );
  }
}
