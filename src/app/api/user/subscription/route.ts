import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserEntitlement } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    const result = await getUserEntitlement(session?.user?.email);

    return NextResponse.json({
      ...result,
      plan: result.status, // Maintains backward compatibility for UI props
    });
  } catch (error: any) {
    console.error("Subscription status check error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal mengecek status langganan." },
      { status: 500 }
    );
  }
}
