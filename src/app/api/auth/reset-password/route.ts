import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import { hashResetToken, verifyResetTokenHash } from "@/lib/email-auth-security";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limitCheck = await rateLimit(`reset_pw_${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });

    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan reset password. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, token reset, dan kata sandi baru wajib diisi" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi baru minimal 6 karakter" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanToken = String(token).trim();
    const computedHash = hashResetToken(cleanToken);

    // Find token record
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: computedHash },
    });

    if (!resetRecord || resetRecord.email !== normalizedEmail) {
      return NextResponse.json(
        { error: "Link reset password tidak valid atau sudah tidak berlaku." },
        { status: 400 }
      );
    }

    // Check one-time use
    if (resetRecord.usedAt !== null) {
      return NextResponse.json(
        { error: "Link reset password sudah pernah digunakan. Silakan minta link baru." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: "Link reset password sudah kedaluwarsa. Silakan minta link baru." },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Execute atomic update: update password and invalidate token
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await tx.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });

      // Log event
      await tx.emailLog.create({
        data: {
          email: normalizedEmail,
          eventType: "password_reset_completed",
          provider: "resend",
          status: "SUCCESS",
          metadata: JSON.stringify({ ip }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Kata sandi Anda berhasil diperbarui. Silakan masuk dengan kata sandi baru.",
    });
  } catch (error) {
    console.error("[Reset Password Route Error]:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server" }, { status: 500 });
  }
}
