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

    // Whitelist only safe raster image types
    const ALLOWED_MIME_TYPES = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ]);

    // Base64 data URL handling
    if (user.image.startsWith("data:")) {
      const matches = user.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1].toLowerCase();
        
        // Strictly reject unsafe types like text/html, image/svg+xml, etc.
        if (ALLOWED_MIME_TYPES.has(mimeType)) {
          const buffer = Buffer.from(matches[2], "base64");
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": mimeType,
              "Cache-Control": "public, max-age=60, stale-while-revalidate=600",
              "X-Content-Type-Options": "nosniff",
              "Content-Security-Policy": "default-src 'none'",
            },
          });
        }
      }
    }

    // External URL handling (Google avatar, Dicebear, dsb)
    if (user.image.startsWith("https://")) {
      try {
        const parsed = new URL(user.image);
        // Only allow trusted external hosts or secure HTTPS domains
        if (
          !parsed.hostname.includes("localhost") &&
          !parsed.hostname.endsWith(".internal") &&
          !parsed.hostname.endsWith(".local")
        ) {
          return NextResponse.redirect(user.image);
        }
      } catch {
        // Fallback below
      }
    }

    const fallbackUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || "Linkorian")}`;
    return NextResponse.redirect(fallbackUrl);
  } catch (error) {
    console.error("GET /api/user/avatar error:", error);
    return new NextResponse(null, { status: 500 });
  }
}

