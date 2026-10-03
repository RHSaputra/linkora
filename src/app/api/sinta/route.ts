import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const sintaFilter = searchParams.get("sinta") || ""; // "1" | "2" | "3" | "4" | "5" | "6" | ""
    const page = searchParams.get("page") || "1";

    let targetUrl = `https://sinta.kemdiktisaintek.go.id/journals?page=${page}`;
    if (query.trim()) {
      targetUrl += `&q=${encodeURIComponent(query.trim())}`;
    }
    if (sintaFilter && ["1", "2", "3", "4", "5", "6"].includes(sintaFilter)) {
      targetUrl += `&sinta=${sintaFilter}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil data dari portal SINTA Kemdiktisaintek" },
        { status: res.status }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const items: any[] = [];

    // Extract journal cards from SINTA HTML structure
    $("div.col-md").each((_, el) => {
      const titleLinkEl = $(el).find(".affil-name a").first();
      const title = titleLinkEl.text().replace(/[\n\r\t]+/g, " ").trim();
      const sintaProfileUrl = titleLinkEl.attr("href") || "";

      if (!title || !sintaProfileUrl.includes("/journals/profile/")) return;

      const websiteUrl = $(el).find('.affil-abbrev a[href*="http"]').first().attr("href") || "";
      const institution = $(el).find(".affil-loc a").text().replace(/[\n\r\t]+/g, " ").trim();
      
      // Clean ISSN text: remove Subject Area suffix and sanitize spaces
      const rawIssnText = $(el).find(".profile-id").text() || "";
      const cleanedIssnText = rawIssnText
        .replace(/Subject Area.*/gi, "")
        .replace(/[\n\r\t]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Extract SINTA accreditation rating e.g. S1, S2, S3...
      const accreditedText = $(el).find(".stat-prev .accredited").text().replace(/\s+/g, " ").trim();
      const sintaMatch = accreditedText.match(/S[1-6]/i);
      const sintaRating = sintaMatch ? sintaMatch[0].toUpperCase() : "SINTA";

      // Extract stats metrics (Impact, H5-index, Citations 5yr, Citations total)
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

    // Check if next page link exists in pagination
    const hasNextPageLink = $("ul.pagination a[rel='next'], ul.pagination .next a, ul.pagination a:contains('»')").length > 0;
    const hasMore = hasNextPageLink || items.length >= 10;

    return NextResponse.json({
      ok: true,
      items,
      hasMore,
      count: items.length,
      currentPage: parseInt(page, 10),
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Koneksi ke server SINTA mengalami batas waktu (Timeout 8s). Silakan coba lagi." },
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
