import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeLink } from "@/lib/types";
import { createLinkSchema } from "@/lib/validations";
import { stringifyTags } from "@/lib/utils";
import { auth } from "@/auth";
import { getCache, setCache, invalidateUserCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({
        links: [],
        total: 0,
        page: 1,
        pageSize: 24,
        totalPages: 0,
        hasMore: false,
      });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase();
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const favorite = searchParams.get("favorite");
    const collectionId = searchParams.get("collectionId");
    const sort = searchParams.get("sort") || "added";
    const pageRaw = searchParams.get("page");
    const pageSizeRaw = searchParams.get("pageSize");

    const page = Math.max(1, parseInt(pageRaw || "1", 10) || 1);
    const pageSize = pageSizeRaw ? Math.max(1, parseInt(pageSizeRaw, 10) || 1) : null;

    // ── 1. CHECK SERVER-SIDE REDIS CACHE ──
    const cacheKey = `cache:links:${userId}:${q || ""}:${category || ""}:${tag || ""}:${favorite || ""}:${collectionId || ""}:${sort}:${page}:${pageSize || ""}`;
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: { "X-Cache": "HIT" },
      });
    }

    const where = {
      userId,
      ...(favorite === "true" ? { isFavorite: true } : {}),
      ...(category && category !== "all" ? { category } : {}),
      ...(collectionId
        ? { collections: { some: { collectionId } } }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { url: { contains: q } },
              { description: { contains: q } },
              { notes: { contains: q } },
              { tags: { contains: q } },
            ],
          }
        : {}),
      ...(tag
        ? {
            tags: { contains: `"${tag}"` },
          }
        : {}),
    };

    let orderBy: any = { createdAt: "desc" };
    if (sort === "edited" || sort === "updated") {
      orderBy = { updatedAt: "desc" };
    } else if (sort === "opened") {
      orderBy = [
        { lastOpenedAt: { sort: "desc", nulls: "last" } },
        { updatedAt: "desc" },
      ];
    } else {
      orderBy = { createdAt: "desc" };
    }

    const findManyArgs: any = {
      where,
      orderBy,
      include: {
        collections: { include: { collection: true } },
      },
    };

    if (pageSize) {
      findManyArgs.skip = (page - 1) * pageSize;
      findManyArgs.take = pageSize;
    }

    const [links, totalCount] = await Promise.all([
      prisma.link.findMany(findManyArgs),
      pageSize ? prisma.link.count({ where }) : Promise.resolve(null),
    ]);

    const items = links.map(serializeLink);
    const total = totalCount ?? items.length;
    const hasMore = pageSize ? page * pageSize < total : false;

    const responsePayload = {
      items,
      total,
      page,
      pageSize,
      hasMore,
    };

    // ── 2. SAVE TO REDIS CACHE (5 Minutes TTL) ──
    await setCache(cacheKey, responsePayload, 300);

    return NextResponse.json(responsePayload, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("GET /api/links error:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = createLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const link = await prisma.link.create({
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: stringifyTags(data.tags),
        notes: data.notes,
        favicon: data.favicon,
        thumbnail: data.thumbnail,
        isFavorite: data.isFavorite,
        reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
        userId,
      },
    });

    // ── INVALIDATE USER LINK CACHE ON CREATION ──
    await invalidateUserCache(userId, "links");

    return NextResponse.json(serializeLink(link), { status: 201 });
  } catch (error) {
    console.error("POST /api/links error:", error);
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
