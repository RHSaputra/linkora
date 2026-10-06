import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const targetUrl =
      "https://web.archive.org/web/20240501000000/https://www.scimagojr.com/journalrank.php?country=ID";

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Gagal memuat SCImago Journal Rank (Status: ${response.status})` },
        { status: response.status }
      );
    }

    let html = await response.text();

    // 1. Strip Wayback toolbar & archive scripts/links
    html = html.replace(
      /<!-- BEGIN WAYBACK TOOLBAR INSERT -->[\s\S]*?<!-- END WAYBACK TOOLBAR INSERT -->/gi,
      ""
    );
    html = html.replace(
      /<script[^>]*src="[^"]*archive\.org[^"]*"[^>]*><\/script>/gi,
      ""
    );
    html = html.replace(
      /<link[^>]*href="[^"]*archive\.org[^"]*"[^>]*>/gi,
      ""
    );
    html = html.replace(
      /<div[^>]*id="wm-ipp-base"[^>]*>[\s\S]*?<\/div>/gi,
      ""
    );

    // 2. Rewrite Wayback archive URL prefixes back to original scimagojr.com
    html = html.replace(
      /https:\/\/web\.archive\.org\/web\/\d+[a-z_]*\/https:\/\/www\.scimagojr\.com\//gi,
      "https://www.scimagojr.com/"
    );

    // 3. Inject base tag so all relative CSS, JS, fonts, and images load directly from scimagojr.com
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head><base href="https://www.scimagojr.com/">`);
    } else if (html.includes("<HEAD>")) {
      html = html.replace("<HEAD>", `<HEAD><base href="https://www.scimagojr.com/">`);
    } else {
      html = `<base href="https://www.scimagojr.com/">` + html;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan koneksi ke SCImago Journal Rank" },
      { status: 500 }
    );
  }
}
