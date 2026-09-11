import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { verifyOtpHash } from "@/lib/email-auth-security";
import { sendWelcomeEmail } from "@/lib/email/service";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limitCheck = await rateLimit(`verify_otp_${ip}`, { limit: 10, windowMs: 60 * 1000 });

    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Percobaan verifikasi terlalu banyak. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email dan kode verifikasi wajib diisi" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Find pending verification record
    const pendingRecord = await prisma.emailVerificationOtp.findFirst({
      where: {
        email: normalizedEmail,
        verifiedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pendingRecord) {
      return NextResponse.json(
        { error: "Permintaan verifikasi tidak ditemukan atau sudah kedaluwarsa. Silakan daftar ulang." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > pendingRecord.expiresAt) {
      return NextResponse.json(
        { error: "Kode verifikasi sudah kedaluwarsa. Silakan minta kode baru." },
        { status: 400 }
      );
    }

    // Check attempt limit
    if (pendingRecord.attempts >= pendingRecord.maxAttempts) {
      return NextResponse.json(
        { error: "Percobaan verifikasi terlalu banyak. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    // Verify OTP timing-safely against hash
    const isValid = verifyOtpHash(cleanOtp, pendingRecord.otpHash);

    if (!isValid) {
      // Increment attempt counter
      await prisma.emailVerificationOtp.update({
        where: { id: pendingRecord.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json({ error: "Kode verifikasi tidak sesuai." }, { status: 400 });
    }

    // Parse pending registration data
    if (!pendingRecord.pendingData) {
      return NextResponse.json({ error: "Data pendaftaran tidak valid." }, { status: 400 });
    }

    const registrationData = JSON.parse(pendingRecord.pendingData);

    // Double check user duplication to prevent race conditions
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar. Silakan masuk langsung ke akun Anda." },
        { status: 400 }
      );
    }

    // Create user in database with verified status and welcome timestamp
    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: registrationData.name,
          email: normalizedEmail,
          password: registrationData.password,
          province: registrationData.province,
          regency: registrationData.regency,
          district: registrationData.district,
          village: registrationData.village,
          postalCode: registrationData.postalCode,
          emailVerified: new Date(),
          welcomeEmailSentAt: new Date(),
        },
      });

      // Mark OTP as verified / one-time-use consumed
      await tx.emailVerificationOtp.update({
        where: { id: pendingRecord.id },
        data: { verifiedAt: new Date() },
      });

      return created;
    });

    // Send Welcome Email
    await sendWelcomeEmail({
      to: normalizedEmail,
      name: newUser.name,
      isGoogleAuth: false,
    });

    return NextResponse.json({
      success: true,
      message: "Verifikasi berhasil! Akun Anda telah aktif.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("[Verify OTP Route Error]:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server" }, { status: 500 });
  }
}
