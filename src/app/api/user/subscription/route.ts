import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({
        ok: true,
        authenticated: false,
        isOwner: false,
        plan: "GUEST",
        hasAccess: true, // Guest preview access
        trialDaysLeft: 30,
        message: "Pengguna belum masuk.",
      });
    }

    const email = session.user.email.toLowerCase().trim();

    // 1. Pemilik Web: rahmatsaputra7818@gmail.com -> UNLIMITED SELAMANYA
    if (email === "rahmatsaputra7818@gmail.com") {
      return NextResponse.json({
        ok: true,
        authenticated: true,
        isOwner: true,
        plan: "UNLIMITED",
        hasAccess: true,
        trialDaysLeft: 99999,
        subscriptionEndsAt: null,
        message: "Akun Pemilik Website (Akses Bebas Unlimited Selamanya).",
      });
    }

    // 2. Cari data pengguna dari database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        createdAt: true,
        subscriptionPlan: true,
        subscriptionEndsAt: true,
        trialEndsAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        ok: true,
        authenticated: true,
        isOwner: false,
        plan: "TRIAL",
        hasAccess: true,
        trialDaysLeft: 30,
        message: "Pengguna baru dalam masa uji coba 30 hari.",
      });
    }

    const now = new Date();

    // 3. Cek apakah pengguna sudah memiliki langganan Premium aktif
    if (user.subscriptionPlan === "PREMIUM" && user.subscriptionEndsAt && user.subscriptionEndsAt > now) {
      const daysLeft = Math.ceil((user.subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return NextResponse.json({
        ok: true,
        authenticated: true,
        isOwner: false,
        plan: "PREMIUM",
        hasAccess: true,
        trialDaysLeft: daysLeft,
        subscriptionEndsAt: user.subscriptionEndsAt,
        message: `Status Premium Aktif (Sisa ${daysLeft} Hari).`,
      });
    }

    // 4. Hitung Uji Coba Gratis 1 Bulan (30 Hari) dari tanggal pembuatan akun
    const createdAt = new Date(user.createdAt);
    const trialEndDate = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    const trialDaysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const hasTrialAccess = now <= trialEndDate;

    return NextResponse.json({
      ok: true,
      authenticated: true,
      isOwner: false,
      plan: hasTrialAccess ? "TRIAL" : "EXPIRED",
      hasAccess: hasTrialAccess,
      trialDaysLeft,
      trialEndsAt: trialEndDate,
      message: hasTrialAccess
        ? `Masa Uji Coba Gratis Aktif (Sisa ${trialDaysLeft} Hari).`
        : "Masa Uji Coba Gratis 1 Bulan Telah Berakhir. Silakan Berlangganan Premium Rp 25.000 / Bulan.",
    });
  } catch (error: any) {
    console.error("Subscription status check error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal mengecek status langganan." },
      { status: 500 }
    );
  }
}
