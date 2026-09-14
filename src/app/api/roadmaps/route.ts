import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createRoadmapSchema } from "@/lib/validations";
import { serializeRoadmap } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ items: [], total: 0 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim().toLowerCase();

    const where: any = {
      userId,
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const roadmaps = await prisma.roadmap.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        nodes: {
          include: {
            link: true,
          },
        },
        edges: true,
      },
    });

    const items = roadmaps.map(serializeRoadmap);

    return NextResponse.json({
      items,
      total: items.length,
    });
  } catch (error) {
    console.error("GET /api/roadmaps error:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar roadmap" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = createRoadmapSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const roadmap = await prisma.roadmap.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        userId,
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

    return NextResponse.json(serializeRoadmap(roadmap), { status: 201 });
  } catch (error) {
    console.error("POST /api/roadmaps error:", error);
    return NextResponse.json({ error: "Gagal membuat roadmap baru" }, { status: 500 });
  }
}
