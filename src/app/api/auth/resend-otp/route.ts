import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { generateSecureOtp, hashOtp } from "@/lib/email-auth-security";
import { sendVerificationOtpEmail } from "@/lib/email/service";

const RESEND_COOLDOWN_SECONDS = 60;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limitCheck = await rateLimit(`resend_otp_${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });

    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan kirim ulang. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const pendingRecord = await prisma.emailVerificationOtp.findFirst({
      where: {
        email: normalizedEmail,
        verifiedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pendingRecord) {
      return NextResponse.json(
        { error: "Permintaan verifikasi tidak ditemukan. Silakan lakukan pendaftaran kembali." },
        { status: 400 }
      );
    }

    // Cooldown check
    const now = Date.now();
    const lastSentTime = new Date(pendingRecord.lastSentAt).getTime();
    const elapsedSeconds = Math.floor((now - lastSentTime) / 1000);

    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      const remaining = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
      return NextResponse.json(
        { error: `Harap tunggu ${remaining} detik sebelum meminta kode baru.` },
        { status: 429 }
      );
    }

    // Generate new OTP
    const plainOtp = generateSecureOtp();
    const hashedOtp = hashOtp(plainOtp);
    const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    let userName = null;
    if (pendingRecord.pendingData) {
      try {
        const parsed = JSON.parse(pendingRecord.pendingData);
        userName = parsed.name;
      } catch {}
    }

    // Update pending record with new OTP, refreshed expiry, and reset attempts
    await prisma.emailVerificationOtp.update({
      where: { id: pendingRecord.id },
      data: {
        otpHash: hashedOtp,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
    });

    // Send email
    const emailResult = await sendVerificationOtpEmail({
      to: normalizedEmail,
      name: userName,
      otp: plainOtp,
      expiryMinutes,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Gagal mengirim kode verifikasi. Silakan periksa kembali email Anda." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kode verifikasi baru telah dikirim ke email Anda.",
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
      expiryMinutes,
    });
  } catch (error) {
    console.error("[Resend OTP Route Error]:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server" }, { status: 500 });
  }
}
