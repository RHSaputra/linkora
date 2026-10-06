import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { claimUserTrial, getUserEntitlement } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { ok: false, error: "Anda harus masuk ke akun terlebih dahulu untuk mengklaim Uji Coba Gratis." },
        { status: 401 }
      );
    }

    const email = session.user.email.toLowerCase().trim();

    try {
      await claimUserTrial(email);
    } catch (err: any) {
      return NextResponse.json(
        { ok: false, error: err.message || "Gagal mengklaim Uji Coba Gratis." },
        { status: 400 }
      );
    }

    const updatedEntitlement = await getUserEntitlement(email);

    return NextResponse.json({
      ...updatedEntitlement,
      ok: true,
      message: "Uji Coba Gratis 30 Hari berhasil diklaim!",
      plan: updatedEntitlement.status,
    });
  } catch (error: any) {
    console.error("Claim trial error:", error);
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan pada server saat mengklaim uji coba." },
      { status: 500 }
    );
  }
}
