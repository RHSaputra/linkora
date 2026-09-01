import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type RouteParams = { params: Promise<{ id: string; linkId: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, linkId } = await params;

    // Verify collection belongs to user
    const collection = await prisma.collection.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    await prisma.collectionLink.delete({
      where: {
        collectionId_linkId: { collectionId: id, linkId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/collections/[id]/link/[linkId] error:", error);
    return NextResponse.json({ error: "Failed to remove link from collection" }, { status: 500 });
  }
}
