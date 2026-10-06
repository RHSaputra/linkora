import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Program Trial/Uji Coba Gratis telah berakhir. Silakan berlangganan Premium Riset Rp 25.000 / bulan.",
    },
    { status: 400 }
  );
}
