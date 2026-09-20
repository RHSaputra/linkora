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

    const limitCheck = await rateLimit(`ai_tags_${user.id}`, { limit: 15, windowMs: 60 * 1000 });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan tagging AI. Tunggu ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    const links = await prisma.link.findMany({
      where: {
        userId: user.id,
        tags: "[]",
      },
      take: 10,
    });

    if (links.length === 0) {
      return NextResponse.json({ message: "No links need tagging", processed: 0 });
    }

    const linksData = links.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      category: l.category,
    }));

    const SYSTEM_PROMPT = `
Anda adalah AI Tagger dari Linkorian.
Tugas: Hasilkan 3-5 tag yang relevan untuk setiap tautan berdasarkan judul, deskripsi, dan kategorinya.
Input berupa JSON array berisi object { id, title, description, category }.
Output HARUS berupa JSON array berisi object { id, tags }. tags adalah array of string.
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
      return NextResponse.json({ error: "Gagal memproses tag dari server AI" }, { status: 500 });
    }

    let updatedCount = 0;
    for (const item of parsedResponse) {
      if (item.id && Array.isArray(item.tags) && item.tags.length > 0) {
        const targetLink = links.find((l) => l.id === item.id);
        if (targetLink) {
          await prisma.link.update({
            where: { id: item.id },
            data: { tags: JSON.stringify(item.tags) },
          });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ message: "Success", processed: updatedCount });
  } catch (error: any) {
    console.error("Error in AI tags:", error);
    const normalized = normalizeAiError(error);
    return NextResponse.json({ error: normalized.friendlyMessage }, { status: normalized.statusCode });
  }
}
