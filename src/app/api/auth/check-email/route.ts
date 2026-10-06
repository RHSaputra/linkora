import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limitCheck = await rateLimit(`check_email_${ip}`, { limit: 20, windowMs: 60 * 1000 });

    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        password: true,
        accounts: {
          select: { provider: true },
        },
      },
    });

    const isGoogle = user?.accounts.some((a) => a.provider === "google") || false;

    return NextResponse.json({
      exists: !!user,
      hasPassword: !!user?.password,
      isGoogle,
    });
  } catch (error) {
    console.error("[Check Email API Error]:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
