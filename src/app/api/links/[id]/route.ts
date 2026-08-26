import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeLink } from "@/lib/types";
import { updateLinkSchema } from "@/lib/validations";
import { stringifyTags } from "@/lib/utils";
import { auth } from "@/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const link = await prisma.link.findUnique({
      where: { id, userId: session.user.id },
      include: { collections: { include: { collection: true } } },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(serializeLink(link));
  } catch (error) {
    console.error("GET /api/links/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch link" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = updateLinkSchema.safeParse({ ...body, id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id: linkId, tags, reminderAt, ...rest } = parsed.data;
    void linkId;

    const link = await prisma.link.update({
      where: { id, userId: session.user.id },
      data: {
        ...rest,
        ...(tags !== undefined ? { tags: stringifyTags(tags) } : {}),
        ...(reminderAt !== undefined
          ? { reminderAt: reminderAt ? new Date(reminderAt) : null }
          : {}),
      },
    });

    return NextResponse.json(serializeLink(link));
  } catch (error) {
    console.error("PATCH /api/links/[id] error:", error);
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await prisma.link.delete({ where: { id, userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/links/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
