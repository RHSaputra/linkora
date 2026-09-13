import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sanitizeHtml } from "@/lib/sanitize";
import { getCache, setCache, invalidateUserCache } from "@/lib/cache";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const filter = searchParams.get("filter");
    const statusParam = searchParams.get("status");
    const q = searchParams.get("q");

    // ── 1. CHECK SERVER-SIDE REDIS CACHE ──
    const cacheKey = `cache:notes:${session.user.id}:${folderId || ""}:${filter || ""}:${statusParam || ""}:${q || ""}`;
    const cachedNotes = await getCache<any>(cacheKey);
    if (cachedNotes) {
      return NextResponse.json(cachedNotes, {
        headers: { "X-Cache": "HIT" },
      });
    }

    // Determine status
    const status = statusParam || (filter === "trash" ? "TRASH" : "ACTIVE");

    const where: Record<string, unknown> = {
      userId: session.user.id,
      status,
    };

    if (folderId && folderId !== "all") {
      where.folderId = folderId;
    }

    if (filter === "favorites" || searchParams.get("isFavorite") === "true") {
      where.isFavorite = true;
    }

    if (filter === "pinned" || searchParams.get("isPinned") === "true") {
      where.isPinned = true;
    }

    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" }
      ],
      include: {
        folder: true,
        tags: true,
      },
    });

    // ── 2. SAVE TO REDIS CACHE (5 Minutes TTL) ──
    await setCache(cacheKey, notes, 300);

    return NextResponse.json(notes, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, folderId, isFavorite, isPinned } = body;

    const sanitizedContent = typeof content === "string" ? sanitizeHtml(content) : null;
    const sanitizedTitle = typeof title === "string"
      ? title.replace(/<[^>]*>/g, "").trim().slice(0, 500) || "Catatan Tanpa Judul"
      : "Catatan Tanpa Judul";

    let validatedFolderId: string | null = null;
    if (folderId) {
      const folderExists = await prisma.noteFolder.findFirst({
        where: { id: folderId, userId: session.user.id },
      });
      if (!folderExists) {
        return NextResponse.json({ error: "Folder tidak ditemukan atau tidak memiliki akses" }, { status: 400 });
      }
      validatedFolderId = folderId;
    }

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title: sanitizedTitle,
        content: sanitizedContent,
        folderId: validatedFolderId,
        isFavorite: isFavorite || false,
        isPinned: isPinned || false,
      },
    });

    // ── INVALIDATE USER NOTE CACHE ON CREATION ──
    await invalidateUserCache(session.user.id, "notes");

    return NextResponse.json(note);
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
