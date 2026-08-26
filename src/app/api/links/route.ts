import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeLink } from "@/lib/types";
import { createLinkSchema } from "@/lib/validations";
import { stringifyTags } from "@/lib/utils";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase();
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const favorite = searchParams.get("favorite");
    const collectionId = searchParams.get("collectionId");

    const links = await prisma.link.findMany({
      where: {
        userId,
        ...(favorite === "true" ? { isFavorite: true } : {}),
        ...(category && category !== "all" ? { category } : {}),
        ...(collectionId
          ? { collections: { some: { collectionId } } }
          : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { url: { contains: q } },
                { description: { contains: q } },
                { notes: { contains: q } },
                { tags: { contains: q } },
              ],
            }
          : {}),
        ...(tag
          ? {
              tags: { contains: `"${tag}"` },
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        collections: { include: { collection: true } },
      },
    });

    const filtered = links.map(serializeLink);
    return NextResponse.json(filtered);
  } catch (error) {
    console.error("GET /api/links error:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
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
    const parsed = createLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const link = await prisma.link.create({
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: stringifyTags(data.tags),
        notes: data.notes,
        favicon: data.favicon,
        thumbnail: data.thumbnail,
        isFavorite: data.isFavorite,
        reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
        userId,
      },
    });

    return NextResponse.json(serializeLink(link), { status: 201 });
  } catch (error) {
    console.error("POST /api/links error:", error);
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
