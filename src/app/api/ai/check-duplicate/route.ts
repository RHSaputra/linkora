import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeLink } from "@/lib/types";

/**
 * Normalize a URL for comparison:
 * - Remove protocol (http/https)
 * - Remove www. prefix
 * - Remove trailing slash
 * - Remove query params and hash
 */
function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.replace(/\/+$/, "");
    return `${host}${path}`.toLowerCase();
  } catch {
    return raw.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
  }
}

/**
 * Extract main keywords from a title for similarity search.
 * Removes common Indonesian stop words and short words.
 */
function extractKeywords(title: string): string[] {
  const stopWords = new Set([
    "dan", "atau", "yang", "di", "ke", "dari", "untuk", "dengan", "ini",
    "itu", "pada", "adalah", "the", "a", "an", "in", "on", "of", "for",
    "to", "and", "or", "is", "are", "was", "be", "by", "at", "as", "it",
    "how", "what", "when", "where", "why", "which", "cara", "tentang",
  ]);

  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { url, title } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const normalized = normalizeUrl(url);

    // 1. Exact URL match
    const exactMatch = await prisma.link.findFirst({
      where: {
        userId,
        url: url,
      },
      include: { collections: { include: { collection: true } } },
    });

    if (exactMatch) {
      return NextResponse.json({
        type: "exact",
        message: "Tautan ini sudah tersimpan dalam koleksimu.",
        duplicates: [serializeLink(exactMatch)],
      });
    }

    // 2. Normalized URL match (catches http vs https, www vs non-www, trailing slash differences)
    const userLinks = await prisma.link.findMany({
      where: { userId },
      select: { id: true, url: true, title: true },
      take: 500, // limit for performance
    });

    const normalizedMatches = userLinks.filter(
      (link) => normalizeUrl(link.url) === normalized
    );

    if (normalizedMatches.length > 0) {
      const fullLinks = await prisma.link.findMany({
        where: { id: { in: normalizedMatches.map((l) => l.id) } },
        include: { collections: { include: { collection: true } } },
      });

      return NextResponse.json({
        type: "similar_url",
        message: "Ditemukan tautan dengan URL yang serupa.",
        duplicates: fullLinks.map(serializeLink),
      });
    }

    // 3. Title similarity check (if title is provided)
    if (title && typeof title === "string" && title.trim().length > 3) {
      const keywords = extractKeywords(title);
      // Use the most significant keywords (longest words, up to 3)
      const searchKeywords = keywords
        .sort((a, b) => b.length - a.length)
        .slice(0, 3);

      if (searchKeywords.length > 0) {
        // All keywords must match (AND condition) for a title to be considered similar
        const titleMatches = await prisma.link.findMany({
          where: {
            userId,
            AND: searchKeywords.map((kw) => ({
              title: { contains: kw },
            })),
          },
          take: 3,
          include: { collections: { include: { collection: true } } },
        });

        if (titleMatches.length > 0) {
          return NextResponse.json({
            type: "similar_title",
            message: "Ditemukan tautan dengan judul serupa.",
            duplicates: titleMatches.map(serializeLink),
          });
        }
      }
    }

    // No duplicates found
    return NextResponse.json({
      type: "none",
      message: null,
      duplicates: [],
    });
  } catch (error) {
    console.error("Error in check-duplicate:", error);
    return NextResponse.json(
      { error: "Gagal memeriksa duplikat" },
      { status: 500 }
    );
  }
}
