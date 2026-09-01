import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeLink } from "@/lib/types";
import { auth } from "@/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const link = await prisma.link.findFirst({ where: { id, userId: session.user.id } });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    if (!link.isFavorite) {
      const favCount = await prisma.link.count({
        where: { userId: session.user.id, isFavorite: true },
      });
      if (favCount >= 6) {
        return NextResponse.json(
          { error: "Maksimal 6 tautan yang dapat dibintangi (Aset Prioritas)." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.link.update({
      where: { id },
      data: { isFavorite: !link.isFavorite },
    });

    return NextResponse.json(serializeLink(updated));
  } catch (error) {
    console.error("POST /api/links/[id]/favorite error:", error);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
