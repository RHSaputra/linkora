import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeLink } from "@/lib/types";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }
    const userId = session.user.id;

    const filter = request.nextUrl.searchParams.get("filter") || "added";

    let orderBy: any = { createdAt: "desc" };
    if (filter === "edited") {
      orderBy = { updatedAt: "desc" };
    } else if (filter === "opened") {
      orderBy = { lastOpenedAt: "desc" };
    }

    const recentLinks = await prisma.link.findMany({
      where: { userId, isFavorite: false },
      orderBy,
      take: 6,
    });

    return NextResponse.json(recentLinks.map(serializeLink));
  } catch (error) {
    console.error("GET /api/dashboard/recent error:", error);
    return NextResponse.json({ error: "Failed to fetch recent links" }, { status: 500 });
  }
}
