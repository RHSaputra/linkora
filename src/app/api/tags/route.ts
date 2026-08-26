import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const links = await prisma.link.findMany({ 
      where: { userId: session.user.id },
      select: { tags: true } 
    });
    const tagSet = new Set<string>();

    for (const link of links) {
      try {
        const tags = JSON.parse(link.tags) as string[];
        tags.forEach((t) => tagSet.add(t));
      } catch {
        // skip invalid tags
      }
    }

    return NextResponse.json(Array.from(tagSet).sort());
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}
