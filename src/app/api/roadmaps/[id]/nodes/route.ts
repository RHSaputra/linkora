import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createRoadmapNodeSchema } from "@/lib/validations";
import { serializeRoadmapNode } from "@/lib/types";

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
    const parsed = createRoadmapNodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, title, description, status, positionX, positionY, linkId } = parsed.data;

    // Security check for attached link
    let validLinkId: string | null = null;
    if (type === "LINK" && linkId) {
      const existingLink = await prisma.link.findFirst({
        where: { id: linkId, userId },
      });
      if (!existingLink) {
        return NextResponse.json(
          { error: "Tautan tidak ditemukan atau tidak memiliki akses" },
          { status: 400 }
        );
      }
      validLinkId = linkId;
    }

    const node = await prisma.roadmapNode.create({
      data: {
        roadmapId,
        type,
        title,
        description: description || null,
        status: status || "TODO",
        positionX: positionX ?? 0,
        positionY: positionY ?? 0,
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

    return NextResponse.json(serializeRoadmapNode(node), { status: 201 });
  } catch (error) {
    console.error("POST /api/roadmaps/[id]/nodes error:", error);
    return NextResponse.json({ error: "Gagal menambah node ke roadmap" }, { status: 500 });
  }
}
