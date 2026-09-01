import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCollection, serializeLink } from "@/lib/types";
import { auth } from "@/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const collection = await prisma.collection.findFirst({
      where: { id, userId: session.user.id },
      include: {
        _count: { select: { links: true } },
        links: {
          include: { link: true },
          orderBy: { addedAt: "desc" },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...serializeCollection(collection),
      links: collection.links.map((cl) => serializeLink(cl.link)),
    });
  } catch (error) {
    console.error("GET /api/collections/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const existing = await prisma.collection.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/collections/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const { linkId } = await request.json();

    if (!linkId) {
      return NextResponse.json({ error: "linkId required" }, { status: 400 });
    }

    // Verify collection belongs to user
    const collection = await prisma.collection.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Verify link belongs to user
    const link = await prisma.link.findFirst({
      where: { id: linkId, userId: session.user.id },
    });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    await prisma.collectionLink.upsert({
      where: {
        collectionId_linkId: { collectionId: id, linkId },
      },
      create: { collectionId: id, linkId },
      update: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/collections/[id] error:", error);
    return NextResponse.json({ error: "Failed to add link to collection" }, { status: 500 });
  }
}
