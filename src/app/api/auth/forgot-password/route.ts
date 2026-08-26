import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { generateResetToken, hashResetToken } from "@/lib/email-auth-security";
import { sendPasswordResetEmail } from "@/lib/email/service";

const GENERIC_SUCCESS_MESSAGE =
  "Jika email tersebut terdaftar, kami telah mengirimkan instruksi untuk mengatur ulang password.";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limitCheck = await rateLimit(`forgot_pw_${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });

    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan reset password. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Alamat email wajib diisi" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit per email identifier
    const emailLimitCheck = await rateLimit(`forgot_pw_email_${normalizedEmail}`, {
      limit: 3,
      windowMs: 15 * 60 * 1000,
    });

    if (!emailLimitCheck.success) {
      // Return generic response to avoid leak
      return NextResponse.json({
        success: true,
        message: GENERIC_SUCCESS_MESSAGE,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    // If user does not exist, return generic success message immediately to prevent user enumeration
    if (!user || !user.email) {
      return NextResponse.json({
        success: true,
        message: GENERIC_SUCCESS_MESSAGE,
      });
    }

    // Invalidate/Clean up older unused reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        email: normalizedEmail,
        usedAt: null,
      },
    });

    // Generate cryptographically secure token & SHA-256 hash
    const plainToken = generateResetToken();
    const tokenHash = hashResetToken(plainToken);

    const expiryMinutes = Number(process.env.RESET_TOKEN_EXPIRY_MINUTES) || 15;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save hash to database
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        tokenHash,
        expiresAt,
        ipAddress: ip,
      },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl.replace(/\/$/, "")}/reset-password?token=${plainToken}&email=${encodeURIComponent(
      normalizedEmail
    )}`;

    // Dispatch email
    await sendPasswordResetEmail({
      to: normalizedEmail,
      name: user.name,
      resetUrl,
      expiryMinutes,
    });

    return NextResponse.json({
      success: true,
      message: GENERIC_SUCCESS_MESSAGE,
    });
  } catch (error) {
    console.error("[Forgot Password Route Error]:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server" }, { status: 500 });
  }
}
