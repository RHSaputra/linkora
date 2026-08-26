import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeLink, serializeActivity } from "@/lib/types";
import { auth } from "@/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const link = await prisma.link.update({
      where: { id, userId: session.user.id },
      data: {
        openCount: { increment: 1 },
        lastOpenedAt: new Date(),
      },
    });

    const activity = await prisma.activity.create({
      data: { linkId: id, action: "opened" },
      include: { link: true },
    });

    return NextResponse.json({
      link: serializeLink(link),
      activity: serializeActivity(activity),
    });
  } catch (error) {
    console.error("POST /api/links/[id]/open error:", error);
    return NextResponse.json({ error: "Failed to record open" }, { status: 500 });
  }
}
