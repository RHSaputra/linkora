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

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folder = await prisma.noteFolder.create({
      data: {
        userId: session.user.id,
        name,
        color: color || "#94a3b8",
        parentId: parentId || null,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("POST /api/notes/folders error:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
