import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { updateRoadmapSchema } from "@/lib/validations";
import { serializeRoadmap } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;

    const roadmap = await prisma.roadmap.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        nodes: {
          include: {
            link: true,
          },
          orderBy: { createdAt: "asc" },
        },
        edges: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(serializeRoadmap(roadmap));
  } catch (error) {
    console.error("GET /api/roadmaps/[id] error:", error);
    return NextResponse.json({ error: "Gagal memuat detail roadmap" }, { status: 500 });
  }
}

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
    const { id } = await params;

    const existing = await prisma.roadmap.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Roadmap tidak ditemukan" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateRoadmapSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.roadmap.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
      },
      include: {
        nodes: {
          include: {
            link: true,
          },
        },
        edges: true,
      },
    });

    return NextResponse.json(serializeRoadmap(updated));
  } catch (error) {
    console.error("PATCH /api/roadmaps/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui roadmap" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;

    const existing = await prisma.roadmap.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Roadmap tidak ditemukan" }, { status: 404 });
    }

    await prisma.roadmap.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/roadmaps/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus roadmap" }, { status: 500 });
  }
}
