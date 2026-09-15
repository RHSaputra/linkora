import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { invalidateUserCache } from "@/lib/cache";

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ids, permanent } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    await invalidateUserCache(session.user.id, "notes");

    if (permanent) {
      await prisma.note.deleteMany({
        where: {
          id: { in: ids },
          userId: session.user.id,
        },
      });
    } else {
      await prisma.note.updateMany({
        where: {
          id: { in: ids },
          userId: session.user.id,
        },
        data: { status: "TRASH" },
      });
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("DELETE /api/notes/bulk error:", error);
    return NextResponse.json({ error: "Failed to bulk delete notes" }, { status: 500 });
  }
}
