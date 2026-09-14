import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { updateRoadmapNodeSchema } from "@/lib/validations";
import { serializeRoadmapNode } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id: roadmapId, nodeId } = await params;

    // Verify roadmap ownership and node existence
    const existingNode = await prisma.roadmapNode.findFirst({
      where: {
        id: nodeId,
        roadmapId,
        roadmap: { userId },
      },
    });

    if (!existingNode) {
      return NextResponse.json({ error: "Node tidak ditemukan" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateRoadmapNodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Link authorization check
    let validLinkId = existingNode.linkId;
    if (data.linkId !== undefined) {
      if (data.linkId) {
        const linkObj = await prisma.link.findFirst({
          where: { id: data.linkId, userId },
        });
        if (!linkObj) {
          return NextResponse.json(
            { error: "Tautan tidak ditemukan atau tidak memiliki akses" },
            { status: 400 }
          );
        }
        validLinkId = data.linkId;
      } else {
        validLinkId = null;
      }
    }

    const updatedNode = await prisma.roadmapNode.update({
      where: { id: nodeId },
      data: {
        ...(data.type ? { type: data.type } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.positionX !== undefined ? { positionX: data.positionX } : {}),
        ...(data.positionY !== undefined ? { positionY: data.positionY } : {}),
        linkId: validLinkId,
      },
      include: {
        link: true,
      },
    });

    // Touch roadmap updatedAt
    await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(serializeRoadmapNode(updatedNode));
  } catch (error) {
    console.error("PATCH /api/roadmaps/[id]/nodes/[nodeId] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui node" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id: roadmapId, nodeId } = await params;

    const existingNode = await prisma.roadmapNode.findFirst({
      where: {
        id: nodeId,
        roadmapId,
        roadmap: { userId },
      },
    });

    if (!existingNode) {
      return NextResponse.json({ error: "Node tidak ditemukan" }, { status: 404 });
    }

    await prisma.roadmapNode.delete({
      where: { id: nodeId },
    });

    // Touch roadmap updatedAt
    await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, id: nodeId });
  } catch (error) {
    console.error("DELETE /api/roadmaps/[id]/nodes/[nodeId] error:", error);
    return NextResponse.json({ error: "Gagal menghapus node" }, { status: 500 });
  }
}
