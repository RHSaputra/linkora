import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const targetUrl = "https://cekjurnal.id/jurnal";

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "id,en-US;q=0.7,en;q=0.3",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Gagal memuat CekJurnal.id (Status: ${response.status})` },
        { status: response.status }
      );
    }

    let html = await response.text();

    // Inject <base href="https://cekjurnal.id/"> so all relative URLs (CSS, JS, images, links) load directly from cekjurnal.id
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head><base href="https://cekjurnal.id/">`);
    } else if (html.includes("<HEAD>")) {
      html = html.replace("<HEAD>", `<HEAD><base href="https://cekjurnal.id/">`);
    } else {
      html = `<base href="https://cekjurnal.id/">` + html;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan koneksi ke CekJurnal.id" },
      { status: 500 }
    );
  }
}
