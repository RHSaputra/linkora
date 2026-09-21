import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function makeNoCacheRedirect(url: string) {
  const res = NextResponse.redirect(url, 307);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const searchParams = req.nextUrl.searchParams;
    const requestedUserId = searchParams.get("userId") || session?.user?.id;

    if (!requestedUserId) {
      return new NextResponse(null, {
        status: 401,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
      select: { image: true, name: true }
    });

    if (!user || !user.image) {
      const fallbackUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.name || "Linkorian")}`;
      return makeNoCacheRedirect(fallbackUrl);
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
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
              "Pragma": "no-cache",
              "Expires": "0",
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
          return makeNoCacheRedirect(user.image);
        }
      } catch {
        // Fallback below
      }
    }

    const fallbackUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || "Linkorian")}`;
    return makeNoCacheRedirect(fallbackUrl);
  } catch (error) {
    console.error("GET /api/user/avatar error:", error);
    return new NextResponse(null, {
      status: 500,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }
}
