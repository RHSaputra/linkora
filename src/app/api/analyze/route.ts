import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeAiError } from "@/lib/gemini";
import { analyzeUrlWithLinkIntelligence } from "@/lib/ai/link-intelligence";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limitCheck = await rateLimit(`analyze_${session.user.id}`, {
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan analisis. Silakan tunggu ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
    }

    const analysisResult = await analyzeUrlWithLinkIntelligence(url);
    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("Error in /api/analyze:", error);
    const normalized = normalizeAiError(error);
    return NextResponse.json({ error: normalized.friendlyMessage }, { status: normalized.statusCode });
  }
}
