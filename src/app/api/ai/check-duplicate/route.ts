import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeLink } from "@/lib/types";
import { normalizeExactUrl, extractSourceDomain } from "@/lib/url-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const inputExactUrl = normalizeExactUrl(url);
    const inputDomain = extractSourceDomain(url);

    // Fetch user links strictly scoped by userId for ownership isolation
    const userLinks = await prisma.link.findMany({
      where: { userId },
      include: {
        collections: { include: { collection: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 1. CONDITION A: Exact URL Duplicate Check
    const exactMatches = userLinks.filter(
      (link) => normalizeExactUrl(link.url) === inputExactUrl
    );

    if (exactMatches.length > 0) {
      return NextResponse.json({
        type: "exact",
        domain: inputDomain,
        message: "Tautan ini sudah tersimpan dalam koleksimu.",
        duplicates: exactMatches.map(serializeLink),
      });
    }

    // 2. CONDITION B: Same Source / Domain (Different Page) Check
    const sameSourceMatches = userLinks.filter(
      (link) => extractSourceDomain(link.url) === inputDomain
    );

    if (sameSourceMatches.length > 0) {
      return NextResponse.json({
        type: "same_source",
        domain: inputDomain,
        message: `Tautan ini berasal dari sumber yang sama (${inputDomain}) dengan tautan yang sudah tersimpan, tetapi mengarah ke halaman yang berbeda.`,
        duplicates: sameSourceMatches.map(serializeLink),
      });
    }

    // 3. CONDITION C: Different Source
    return NextResponse.json({
      type: "none",
      domain: inputDomain,
      message: null,
      duplicates: [],
    });
  } catch (error) {
    console.error("Error in check-duplicate route:", error);
    return NextResponse.json(
      { error: "Gagal memeriksa duplikat tautan" },
      { status: 500 }
    );
  }
}
