import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { batchUpdateNodePositionsSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id: roadmapId } = await params;

    const roadmap = await prisma.roadmap.findFirst({
      where: { id: roadmapId, userId },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap tidak ditemukan" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = batchUpdateNodePositionsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { positions } = parsed.data;

    // Perform updates in transaction
    await prisma.$transaction(
      positions.map((pos) =>
        prisma.roadmapNode.updateMany({
          where: {
            id: pos.id,
            roadmapId,
          },
          data: {
            positionX: pos.positionX,
            positionY: pos.positionY,
          },
        })
      )
    );

    // Touch roadmap updatedAt
    await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, count: positions.length });
  } catch (error) {
    console.error("PATCH /api/roadmaps/[id]/nodes/batch-position error:", error);
    return NextResponse.json({ error: "Gagal menyelaraskan posisi node" }, { status: 500 });
  }
}
