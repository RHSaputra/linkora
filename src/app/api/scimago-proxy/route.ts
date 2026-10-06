import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const targetUrl = "https://www.scimagojr.com/journalrank.php?country=ID";

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
        "Cache-Control": "no-cache",
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

    // Inject <base href="https://www.scimagojr.com/"> so all relative assets (CSS, JS, images) load directly from scimagojr.com
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
        "Cache-Control": "no-cache, no-store, must-revalidate",
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
