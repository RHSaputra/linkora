import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = searchParams.get("page") || "1";

    if (!query.trim()) {
      return NextResponse.json({ items: [], totalResults: 0 });
    }

    const targetUrl = `https://garuda.kemdiktisaintek.go.id/documents?page=${page}&q=${encodeURIComponent(
      query.trim()
    )}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil data dari portal GARUDA Kemdiktisaintek" },
        { status: res.status }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const items: any[] = [];

    $(".article-item").each((_, el) => {
      const titleEl = $(el).find("a.title-article").first();
      const title = titleEl.text().replace(/[\n\r\t]+/g, " ").trim();
      const detailPath = titleEl.attr("href") || "";

      if (!title) return;

      const garudaUrl = detailPath.startsWith("http")
        ? detailPath
        : `https://garuda.kemdiktisaintek.go.id${detailPath}`;

      const author = $(el).find("a.author-article").text().replace(/[\n\r\t]+/g, " ").trim();
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

    // Check pagination total
    const paginationText = $(".pagination-info").text().trim();
    const totalMatch = paginationText.match(/Total Record\s*:\s*(\d+)/i);
    const totalResults = totalMatch ? parseInt(totalMatch[1], 10) : items.length;
    const hasMore = items.length >= 10;

    return NextResponse.json({
      ok: true,
      items,
      totalResults,
      hasMore,
      currentPage: parseInt(page, 10),
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Koneksi ke portal GARUDA mengalami batas waktu (Timeout 8s)." },
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
