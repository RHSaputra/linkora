import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const count = await prisma.link.count({
      where: {
        userId: user.id,
        category: { in: ["Custom", "Uncategorized", ""] }
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is empty or not JSON
    }

    let links: any[] = [];

    if (body?.linkId) {
      // Target single link
      const singleLink = await prisma.link.findFirst({
        where: { id: body.linkId, userId: user.id }
      });
      if (singleLink) {
        links = [singleLink];
      }
    } else {
      // Get up to 20 uncategorized or "Custom" category links
      links = await prisma.link.findMany({
        where: {
          userId: user.id,
          category: { in: ["Custom", "Uncategorized", ""] }
        },
        take: 20
      });
    }

    if (links.length === 0) {
      return NextResponse.json({ message: "Tidak ada tautan yang perlu dirapikan saat ini.", processed: 0 });
    }

    const linksData = links.map(l => ({ id: l.id, title: l.title, description: l.description, url: l.url }));

    const SYSTEM_PROMPT = `
Anda adalah AI Knowledge & Link Organizer cerdas dari Linkora bernama Liko.
Tugas: Analisis judul, deskripsi, dan URL tautan berikut, lalu tentukan kategori yang paling tepat, spesifik, dan rapi untuk masing-masing tautan.
Contoh Kategori: Tech, Design, Productivity, Business, Education, Entertainment, Tutorial, Artikel, Loker, Beasiswa, Finance, Tools, Career, News, Social Media, Health, Lifestyle.
Gunakan huruf kapital di awal kata (contoh: Tech, Design).
Input berupa JSON array berisi object { id, title, description, url }.
Output HARUS berupa JSON array berisi object { id, category }.
Pastikan ID sama persis dengan input. Kategori harus singkat (1-2 kata).
Output murni JSON, tanpa formatting markdown (tanpa \`\`\`json).
`;

    const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
    let responseText: string | null = null;
    let lastError: any = null;

    for (const modelName of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nInput: " + JSON.stringify(linksData) }] }
          ],
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Organize model ${modelName} failed, trying fallback:`, err?.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Tidak ada respon dari server AI.");
    }

    let parsedResponse: { id: string, category: string }[] = [];
    try {
      parsedResponse = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim() || "[]");
    } catch (_e) {
      console.error("Failed to parse Gemini response for organize");
      return NextResponse.json({ error: "Gagal memproses keluaran AI" }, { status: 500 });
    }

    // Update DB
    let updatedCount = 0;
    const changes: { title: string; category: string }[] = [];
    for (const item of parsedResponse) {
      if (item.id && item.category) {
        const link = linksData.find(l => l.id === item.id);
        if (link) {
          await prisma.link.update({
            where: { id: item.id },
            data: { category: item.category }
          });
          changes.push({ title: link.title, category: item.category });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      message: `Berhasil merapikan ${updatedCount} tautan!`,
      processed: updatedCount,
      changes
    });
  } catch (error: any) {
    console.error("Error in AI organize:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal merapikan tautan" },
      { status: 500 }
    );
  }
}
