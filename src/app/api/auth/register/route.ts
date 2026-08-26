import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import { generateSecureOtp, hashOtp } from "@/lib/email-auth-security";
import { sendVerificationOtpEmail } from "@/lib/email/service";

export async function POST(req: Request) {
  try {
    // Client IP rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limitCheck = await rateLimit(`register_${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });

    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan pendaftaran. Silakan coba lagi dalam ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password, province, regency, district, village, postalCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nama, email, dan kata sandi wajib diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Kata sandi minimal 6 karakter" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists and verified
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar dalam sistem" }, { status: 400 });
    }

    // Hash password for pending storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate secure 6-digit OTP
    const plainOtp = generateSecureOtp();
    const hashedOtp = hashOtp(plainOtp);

    const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Clean up any existing unverified OTP for this email
    await prisma.emailVerificationOtp.deleteMany({
      where: { email: normalizedEmail },
    });

    // Store pending registration with hashed OTP
    await prisma.emailVerificationOtp.create({
      data: {
        email: normalizedEmail,
        otpHash: hashedOtp,
        pendingData: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          province: province || null,
          regency: regency || null,
          district: district || null,
          village: village || null,
          postalCode: postalCode || null,
        }),
        expiresAt,
        attempts: 0,
        maxAttempts: 5,
        lastSentAt: new Date(),
      },
    });

    // Send OTP verification email
    const emailResult = await sendVerificationOtpEmail({
      to: normalizedEmail,
      name: name.trim(),
      otp: plainOtp,
      expiryMinutes,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Gagal mengirim kode verifikasi ke email. Silakan periksa kembali alamat email Anda." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requireOtp: true,
      email: normalizedEmail,
      message: "Kode verifikasi telah dikirim ke email Anda.",
      cooldownSeconds: 60,
      expiryMinutes,
    });
  } catch (error) {
    console.error("[Register Route Error]:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server" }, { status: 500 });
  }
}
