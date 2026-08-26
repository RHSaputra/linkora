import { NextRequest, NextResponse } from "next/server";

function extractMeta(html: string, property: string): string | null {
  const ogMatch = html.match(
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")
  );
  if (ogMatch) return ogMatch[1];

  const ogMatch2 = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i")
  );
  if (ogMatch2) return ogMatch2[1];

  const nameMatch = html.match(
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")
  );
  if (nameMatch) return nameMatch[1];

  return null;
}

function extractTitle(html: string): string | null {
  const ogTitle = extractMeta(html, "og:title");
  if (ogTitle) return ogTitle;

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;

    let title = parsedUrl.hostname;
    let description: string | null = null;
    let thumbnail: string | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; Linkora/1.0; +https://linkora.app)",
          Accept: "text/html",
        },
        redirect: "follow",
      });

      clearTimeout(timeout);

      if (response.ok) {
        const html = await response.text();
        title = extractTitle(html) || title;
        description =
          extractMeta(html, "og:description") ||
          extractMeta(html, "description");
        thumbnail =
          extractMeta(html, "og:image") ||
          extractMeta(html, "twitter:image");
      }
    } catch {
      // Metadata fetch failed — return partial data with favicon
    }

    return NextResponse.json({
      title,
      description,
      favicon,
      thumbnail,
    });
  } catch (error) {
    console.error("POST /api/metadata error:", error);
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
