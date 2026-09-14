import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createRoadmapEdgeSchema } from "@/lib/validations";
import { serializeRoadmapEdge } from "@/lib/types";

export async function POST(
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

    // Verify roadmap ownership
    const roadmap = await prisma.roadmap.findFirst({
      where: { id: roadmapId, userId },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap tidak ditemukan" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createRoadmapEdgeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { sourceNodeId, targetNodeId, label } = parsed.data;

    if (sourceNodeId === targetNodeId) {
      return NextResponse.json(
        { error: "Node tidak dapat dihubungkan ke dirinya sendiri" },
        { status: 400 }
      );
    }

    // Verify both nodes belong to this roadmap
    const nodes = await prisma.roadmapNode.findMany({
      where: {
        id: { in: [sourceNodeId, targetNodeId] },
        roadmapId,
      },
    });

    if (nodes.length !== 2) {
      return NextResponse.json(
        { error: "Node asal atau tujuan tidak valid pada roadmap ini" },
        { status: 400 }
      );
    }

    // Upsert or check existing
    const existingEdge = await prisma.roadmapEdge.findFirst({
      where: {
        roadmapId,
        sourceNodeId,
        targetNodeId,
      },
    });

    if (existingEdge) {
      return NextResponse.json(serializeRoadmapEdge(existingEdge));
    }

    const edge = await prisma.roadmapEdge.create({
      data: {
        roadmapId,
        sourceNodeId,
        targetNodeId,
        label: label || null,
      },
    });

    // Touch roadmap updatedAt
    await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(serializeRoadmapEdge(edge), { status: 201 });
  } catch (error) {
    console.error("POST /api/roadmaps/[id]/edges error:", error);
    return NextResponse.json({ error: "Gagal menghubungkan node" }, { status: 500 });
  }
}
