import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, color, parentId } = body;

    const existing = await prisma.noteFolder.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (parentId !== undefined) updateData.parentId = parentId;

    const folder = await prisma.noteFolder.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("PATCH /api/notes/folders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.noteFolder.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Prisma relation onDelete: Cascade will delete notes if folder is deleted
    // Or we could set `onDelete: SetNull` in schema (which I did for notes).
    // Let's delete the folder.
    await prisma.noteFolder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notes/folders/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
