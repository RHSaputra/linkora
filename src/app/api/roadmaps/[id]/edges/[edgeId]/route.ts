import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; edgeId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id: roadmapId, edgeId } = await params;

    const existingEdge = await prisma.roadmapEdge.findFirst({
      where: {
        id: edgeId,
        roadmapId,
        roadmap: { userId },
      },
    });

    if (!existingEdge) {
      return NextResponse.json({ error: "Koneksi tidak ditemukan" }, { status: 404 });
    }

    await prisma.roadmapEdge.delete({
      where: { id: edgeId },
    });

    // Touch roadmap updatedAt
    await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, id: edgeId });
  } catch (error) {
    console.error("DELETE /api/roadmaps/[id]/edges/[edgeId] error:", error);
    return NextResponse.json({ error: "Gagal menghapus koneksi node" }, { status: 500 });
  }
}
