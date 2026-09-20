import { NextRequest, NextResponse } from "next/server";
import { executeGeminiRequest, normalizeAiError } from "@/lib/gemini";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeLink } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limitCheck = await rateLimit(`ai_search_${session.user.email}`, {
      limit: 15,
      windowMs: 60 * 1000,
    });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi dalam ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const userId = session.user.id;

    const [categoryGroups, allLinks] = await Promise.all([
      prisma.link.groupBy({
        by: ["category"],
        where: { userId },
        _count: { category: true },
        orderBy: { _count: { category: "desc" } },
      }),
      prisma.link.findMany({
        where: { userId },
        select: { tags: true },
      }),
    ]);

    const userCategories = categoryGroups.map((g) => g.category);

    const tagSet = new Set<string>();
    for (const link of allLinks) {
      try {
        const parsed = JSON.parse(link.tags || "[]");
        if (Array.isArray(parsed)) {
          parsed.forEach((t: string) => tagSet.add(t));
        }
      } catch {
        // skip malformed tags
      }
    }
    const userTags = Array.from(tagSet).slice(0, 50);
    const today = new Date().toISOString().split("T")[0];

    const SYSTEM_PROMPT = `Anda adalah mesin pencari cerdas untuk aplikasi bookmark manager bernama Linkorian.
Tugas: Analisis query pencarian pengguna dalam bahasa natural, lalu ekstrak menjadi filter terstruktur.

Konteks pengguna:
- Kategori yang tersedia: ${JSON.stringify(userCategories)}
- Tag yang tersedia: ${JSON.stringify(userTags)}
- Tanggal hari ini: ${today}

Aturan:
- Jika pengguna menyebut kategori, cocokkan dengan kategori yang tersedia (case-insensitive).
- Jika pengguna menyebut waktu ("bulan lalu", "minggu ini", "kemarin", "3 bulan terakhir"), hitung dateFrom dan dateTo relatif terhadap tanggal hari ini.
- Jika pengguna menyebut favorit/prioritas/penting, set favorite ke true.
- Ekstrak kata kunci utama yang bisa digunakan untuk text search.
- Buat explanation singkat dalam bahasa Indonesia (1 kalimat) tentang apa yang dicari.

Output HARUS berupa JSON object:
{
  "keywords": string[],
  "category": string | null,
  "tags": string[],
  "favorite": boolean | null,
  "dateFrom": "YYYY-MM-DD" | null,
  "dateTo": "YYYY-MM-DD" | null,
  "explanation": string
}

Output murni JSON, tanpa markdown.`;

    let filters: any = null;

    try {
      const { data } = await executeGeminiRequest<any>({
        contents: [{ role: "user", parts: [{ text: "Query pengguna: " + query }] }],
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        responseMimeType: "application/json",
        expectJson: true,
        timeoutMs: 10000,
      });
      filters = data;
    } catch (err: any) {
      console.warn("AI search request failed, falling back to keyword search:", err?.message || err);
    }

    if (!filters) {
      const fallbackLinks = await prisma.link.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query.toLowerCase() } },
            { url: { contains: query.toLowerCase() } },
            { description: { contains: query.toLowerCase() } },
            { notes: { contains: query.toLowerCase() } },
            { tags: { contains: query.toLowerCase() } },
          ],
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: { collections: { include: { collection: true } } },
      });

      return NextResponse.json({
        items: fallbackLinks.map(serializeLink),
        total: fallbackLinks.length,
        explanation: null,
        aiPowered: false,
      });
    }

    const where: any = { userId };
    const andConditions: any[] = [];

    if (filters.category) {
      const matched = userCategories.find(
        (c) => c.toLowerCase() === filters.category!.toLowerCase()
      );
      if (matched) {
        where.category = matched;
      }
    }

    if (filters.favorite === true) {
      where.isFavorite = true;
    }

    if (filters.dateFrom || filters.dateTo) {
      const dateFilter: any = {};
      if (filters.dateFrom) {
        dateFilter.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter.lte = endDate;
      }
      where.createdAt = dateFilter;
    }

    if (filters.tags && filters.tags.length > 0) {
      andConditions.push({
        OR: filters.tags.map((t: string) => ({
          tags: { contains: `"${t}"` },
        })),
      });
    }

    if (filters.keywords && filters.keywords.length > 0) {
      const keywordConditions = filters.keywords.map((kw: string) => ({
        OR: [
          { title: { contains: kw.toLowerCase() } },
          { description: { contains: kw.toLowerCase() } },
          { notes: { contains: kw.toLowerCase() } },
          { url: { contains: kw.toLowerCase() } },
        ],
      }));
      andConditions.push(...keywordConditions);
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const links = await prisma.link.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { collections: { include: { collection: true } } },
    });

    return NextResponse.json({
      items: links.map(serializeLink),
      total: links.length,
      explanation: filters.explanation || null,
      aiPowered: true,
    });
  } catch (error: any) {
    console.error("Error in AI search:", error);
    const normalized = normalizeAiError(error);
    return NextResponse.json({ error: normalized.friendlyMessage }, { status: normalized.statusCode });
  }
}
