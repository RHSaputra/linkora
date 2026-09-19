import { NextRequest, NextResponse } from "next/server";
import { executeGeminiRequest, normalizeAiError } from "@/lib/gemini";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const limitCheck = await rateLimit(`ai_summarize_${user.id}`, { limit: 15, windowMs: 60 * 1000 });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan ringkasan AI. Tunggu ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    const links = await prisma.link.findMany({
      where: {
        userId: user.id,
        OR: [{ aiSummary: null }, { aiSummary: "" }],
      },
      take: 5,
    });

    if (links.length === 0) {
      return NextResponse.json({ message: "No links need summarizing", processed: 0 });
    }

    const linksData = links.map((l) => ({ id: l.id, title: l.title, description: l.description }));

    const SYSTEM_PROMPT = `
Anda adalah AI Summarizer dari Linkora.
Tugas: Buat ringkasan pendek (1-2 kalimat) dalam bahasa Indonesia untuk masing-masing tautan berikut berdasarkan judul dan deskripsi.
Input berupa JSON array berisi object { id, title, description }.
Output HARUS berupa JSON array berisi object { id, aiSummary }.
Pastikan ID sama dengan input.
Output murni JSON, tanpa markdown.
`;

    const { data: parsedResponse } = await executeGeminiRequest<any>({
      contents: [{ role: "user", parts: [{ text: "Input: " + JSON.stringify(linksData) }] }],
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.2,
      responseMimeType: "application/json",
      expectJson: true,
      timeoutMs: 20000,
    });

    if (!parsedResponse || !Array.isArray(parsedResponse)) {
      return NextResponse.json({ error: "Gagal memproses ringkasan dari server AI" }, { status: 500 });
    }

    let updatedCount = 0;
    for (const item of parsedResponse) {
      if (item.id && item.aiSummary) {
        const targetLink = links.find((l) => l.id === item.id);
        if (targetLink) {
          await prisma.link.update({
            where: { id: item.id },
            data: { aiSummary: item.aiSummary },
          });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ message: "Success", processed: updatedCount });
  } catch (error: any) {
    console.error("Error in AI summarize:", error);
    const normalized = normalizeAiError(error);
    return NextResponse.json({ error: normalized.friendlyMessage }, { status: normalized.statusCode });
  }
}
