import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sanitizeHtml } from "@/lib/sanitize";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const note = await prisma.note.findUnique({
      where: { id, userId: session.user.id },
      include: {
        folder: true,
        tags: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("GET /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, content, folderId, isFavorite, isPinned, status, reminderAt, expectedVersion, documentSettings } = body;

    // Verify ownership
    const existing = await prisma.note.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Optimistic concurrency check — only for content/title updates
    if (expectedVersion !== undefined && expectedVersion !== null) {
      if (existing.version !== expectedVersion) {
        return NextResponse.json(
          {
            error: "Conflict",
            message: "Catatan ini telah diubah di tempat lain. Muat ulang untuk melihat versi terbaru.",
            serverVersion: existing.version,
            serverUpdatedAt: existing.updatedAt,
          },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    // Sanitize and set content
    if (content !== undefined) {
      updateData.content = typeof content === 'string' ? sanitizeHtml(content) : null;
    }

    // Sanitize title (strip HTML tags)
    if (title !== undefined) {
      updateData.title = typeof title === 'string'
        ? title.replace(/<[^>]*>/g, '').trim().slice(0, 500) || 'Untitled Note'
        : 'Untitled Note';
    }

    if (folderId !== undefined) updateData.folderId = folderId;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (status !== undefined) updateData.status = status;
    if (reminderAt !== undefined) updateData.reminderAt = reminderAt;
    if (documentSettings !== undefined) updateData.documentSettings = typeof documentSettings === 'string' ? documentSettings : JSON.stringify(documentSettings);

    // Increment version when content or title changes
    if (content !== undefined || title !== undefined) {
      updateData.version = existing.version + 1;
    }

    let note;
    try {
      note = await prisma.note.update({
        where: { id },
        data: updateData as any,
      });
    } catch (updateErr: any) {
      console.warn("Standard note update failed, attempting resilient update:", updateErr?.message);

      // If documentSettings field caused an issue with in-memory Prisma client, update it via executeRaw
      if (documentSettings !== undefined) {
        const settingsStr = typeof documentSettings === 'string' ? documentSettings : JSON.stringify(documentSettings);
        try {
          await prisma.$executeRawUnsafe(
            `UPDATE Note SET documentSettings = ? WHERE id = ?`,
            settingsStr,
            id
          );
        } catch (rawErr) {
          console.error("Raw documentSettings update error:", rawErr);
        }
        delete updateData.documentSettings;
      }

      note = await prisma.note.update({
        where: { id },
        data: updateData as any,
      });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("PATCH /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    const existing = await prisma.note.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (permanent || existing.status === "TRASH") {
      // Hard delete
      await prisma.note.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, action: "deleted" });
    } else {
      // Soft delete to Trash
      const updated = await prisma.note.update({
        where: { id },
        data: { status: "TRASH" },
      });
      return NextResponse.json({ success: true, action: "trashed", note: updated });
    }
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
