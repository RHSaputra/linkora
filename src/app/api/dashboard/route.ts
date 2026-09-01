import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  serializeLink,
  serializeActivity,
  DashboardStats,
} from "@/lib/types";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      const emptyStats: DashboardStats = {
        totalLinks: 0,
        favoriteCount: 0,
        categoryStats: [],
        recentLinks: [],
        favoriteLinks: [],
        recentActivity: [],
        upcomingReminders: [],
      };
      return NextResponse.json(emptyStats);
    }
    const userId = session.user.id;

    const [
      totalLinks,
      favoriteCount,
      categoryGroups,
      recentLinks,
      favoriteLinks,
      recentActivity,
      upcomingReminders,
    ] = await Promise.all([
      prisma.link.count({ where: { userId } }),
      prisma.link.count({ where: { isFavorite: true, userId } }),
      prisma.link.groupBy({
        by: ["category"],
        where: { userId },
        _count: { category: true },
        orderBy: { _count: { category: "desc" } },
      }),
      prisma.link.findMany({
        where: { userId, isFavorite: false },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.link.findMany({
        where: { isFavorite: true, userId },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.activity.findMany({
        where: { link: { userId } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { link: true },
      }),
      prisma.link.findMany({
        where: {
          userId,
          reminderAt: { gte: new Date() },
        },
        orderBy: { reminderAt: "asc" },
        take: 5,
      }),
    ]);

    const stats: DashboardStats = {
      totalLinks,
      favoriteCount,
      categoryStats: categoryGroups.map((g) => ({
        category: g.category,
        count: g._count.category,
      })),
      recentLinks: recentLinks.map(serializeLink),
      favoriteLinks: favoriteLinks.map(serializeLink),
      recentActivity: recentActivity.map(serializeActivity),
      upcomingReminders: upcomingReminders.map(serializeLink),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
