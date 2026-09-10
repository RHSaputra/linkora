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
import { rateLimit } from "@/lib/rate-limit";
import { validateSafeExternalUrl, safeFetchExternal } from "@/lib/ssrf";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 30 metadata requests per minute per user
    const limitCheck = await rateLimit(`metadata_${session.user.id}`, {
      limit: 30,
      windowMs: 60 * 1000,
    });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan metadata. Tunggu ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = await validateSafeExternalUrl(url);
    } catch (validationErr: any) {
      return NextResponse.json(
        { error: validationErr?.message || "URL tidak diizinkan atau tidak valid" },
        { status: 400 }
      );
    }

    const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;

    let title = parsedUrl.hostname;
    let description: string | null = null;
    let thumbnail: string | null = null;

    try {
      const { text: html } = await safeFetchExternal(parsedUrl.toString(), {
        timeoutMs: 8000,
        maxSizeBytes: 2 * 1024 * 1024,
      });

      if (html) {
        title = extractTitle(html) || title;
        description =
          extractMeta(html, "og:description") ||
          extractMeta(html, "description");
        thumbnail =
          extractMeta(html, "og:image") ||
          extractMeta(html, "twitter:image");
      }
    } catch {
      // Safe fallback: return partial data with favicon
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

