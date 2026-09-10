import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const folders = await prisma.noteFolder.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { notes: true } }
      }
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("GET /api/notes/folders error:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, color, parentId } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const trimmedName = name.trim().slice(0, 100);

    let validatedParentId: string | null = null;
    if (parentId) {
      const parentFolder = await prisma.noteFolder.findFirst({
        where: { id: parentId, userId: session.user.id },
      });
      if (!parentFolder) {
        return NextResponse.json({ error: "Folder induk tidak ditemukan atau tidak memiliki akses" }, { status: 400 });
      }
      validatedParentId = parentId;
    }

    const folder = await prisma.noteFolder.create({
      data: {
        userId: session.user.id,
        name: trimmedName,
        color: color || "#94a3b8",
        parentId: validatedParentId,
      },
    });

    return NextResponse.json(folder);

  } catch (error) {
    console.error("POST /api/notes/folders error:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
