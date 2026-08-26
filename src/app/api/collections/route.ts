import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCollection } from "@/lib/types";
import { createCollectionSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { links: true } },
        links: { include: { link: true }, take: 3 },
      },
    });

    return NextResponse.json(collections.map(serializeCollection));
  } catch (error) {
    console.error("GET /api/collections error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = createCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.create({ 
      data: { ...parsed.data, userId: session.user.id } 
    });
    return NextResponse.json(serializeCollection({ ...collection, _count: { links: 0 } }), {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/collections error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
