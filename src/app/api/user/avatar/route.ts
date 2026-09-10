import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const searchParams = req.nextUrl.searchParams;
    const requestedUserId = searchParams.get("userId") || session?.user?.id;

    if (!requestedUserId) {
      return new NextResponse(null, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
      select: { image: true, name: true }
    });

    if (!user || !user.image) {
      const fallbackUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.name || "Linkorian")}`;
      return NextResponse.redirect(fallbackUrl);
    }

    // Jika berupa base64 data URL (misal data:image/jpeg;base64,...)
    if (user.image.startsWith("data:")) {
      const matches = user.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=60, stale-while-revalidate=600",
          }
        });
      }
    }

    // Jika berupa URL eksternal (Google avatar, Dicebear, dsb)
    if (user.image.startsWith("http://") || user.image.startsWith("https://")) {
      return NextResponse.redirect(user.image);
    }

    const fallbackUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || "Linkorian")}`;
    return NextResponse.redirect(fallbackUrl);
  } catch (error) {
    console.error("GET /api/user/avatar error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
