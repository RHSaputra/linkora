import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sanitizeHtml } from "@/lib/sanitize";

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

    return NextResponse.json(notes);
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

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title: sanitizedTitle,
        content: sanitizedContent,
        folderId: folderId || null,
        isFavorite: isFavorite || false,
        isPinned: isPinned || false,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
