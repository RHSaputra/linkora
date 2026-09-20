import { NextRequest, NextResponse } from "next/server";
import { executeGeminiRequest, normalizeAiError } from "@/lib/gemini";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

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
        category: { in: ["Custom", "Uncategorized", ""] },
      },
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

    const limitCheck = await rateLimit(`ai_organize_${user.id}`, { limit: 15, windowMs: 60 * 1000 });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan kategorisasi AI. Tunggu ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    let links: any[] = [];

    if (body?.linkId) {
      const singleLink = await prisma.link.findFirst({
        where: { id: body.linkId, userId: user.id },
      });
      if (singleLink) {
        links = [singleLink];
      }
    } else {
      links = await prisma.link.findMany({
        where: {
          userId: user.id,
          category: { in: ["Custom", "Uncategorized", ""] },
        },
        take: 20,
      });
    }

    const isEn = body?.locale === "en";

    if (links.length === 0) {
      return NextResponse.json({
        message: isEn ? "No links need organizing right now." : "Tidak ada tautan yang perlu dirapikan saat ini.",
        processed: 0,
      });
    }

    const linksData = links.map((l) => ({ id: l.id, title: l.title, description: l.description, url: l.url }));

    const SYSTEM_PROMPT = `
Anda adalah AI Knowledge & Link Organizer cerdas dari Linkorian bernama Liko.
Tugas: Analisis judul, deskripsi, dan URL tautan berikut, lalu tentukan kategori yang paling tepat, spesifik, dan rapi untuk masing-masing tautan.
Contoh Kategori: Tech, Design, Productivity, Business, Education, Entertainment, Tutorial, Artikel, Loker, Beasiswa, Finance, Tools, Career, News, Social Media, Health, Lifestyle.
Gunakan huruf kapital di awal kata (contoh: Tech, Design).
Input berupa JSON array berisi object { id, title, description, url }.
Output HARUS berupa JSON array berisi object { id, category }.
Pastikan ID sama persis dengan input. Kategori harus singkat (1-2 kata).
Output murni JSON, tanpa formatting markdown (tanpa \`\`\`json).
`;

    let parsedResponse: { id: string; category: string }[] = [];

    try {
      const { data } = await executeGeminiRequest<any>({
        contents: [{ role: "user", parts: [{ text: "Input: " + JSON.stringify(linksData) }] }],
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        responseMimeType: "application/json",
        expectJson: true,
        timeoutMs: 20000,
      });

      if (Array.isArray(data)) {
        parsedResponse = data;
      }
    } catch (err) {
      console.warn("AI organize failed, using smart keyword fallback:", err);
    }

    if (!parsedResponse || parsedResponse.length === 0) {
      const fallbackCategories: Record<string, string> = {
        beasiswa: "Beasiswa",
        scholarship: "Beasiswa",
        grant: "Beasiswa",
        loker: "Lowongan Kerja",
        job: "Lowongan Kerja",
        career: "Lowongan Kerja",
        hiring: "Lowongan Kerja",
        intern: "Magang",
        magang: "Magang",
        video: "Video",
        youtube: "Video",
        vimeo: "Video",
        ai: "AI Tools",
        chatgpt: "AI Tools",
        claude: "AI Tools",
        gemini: "AI Tools",
        tutorial: "Tutorial",
        guide: "Tutorial",
        learn: "Tutorial",
        course: "Tutorial",
        github: "Project",
        project: "Project",
        code: "Project",
        kampus: "Kampus",
        university: "Kampus",
        college: "Kampus",
        berita: "Artikel",
        news: "Artikel",
        article: "Artikel",
        blog: "Artikel",
        finance: "Finance",
        crypto: "Finance",
      };

      parsedResponse = linksData.map((l) => {
        const text = `${l.title} ${l.description || ""} ${l.url}`.toLowerCase();
        let matchedCategory = "Teknologi";
        for (const [kw, cat] of Object.entries(fallbackCategories)) {
          if (text.includes(kw)) {
            matchedCategory = cat;
            break;
          }
        }
        return { id: l.id, category: matchedCategory };
      });
    }

    let updatedCount = 0;
    const changes: { title: string; category: string }[] = [];
    for (const item of parsedResponse) {
      if (item.id && item.category && typeof item.category === "string") {
        const link = linksData.find((l) => l.id === item.id);
        if (link) {
          const cleanCategory = item.category.trim().slice(0, 50);
          await prisma.link.update({
            where: { id: item.id },
            data: { category: cleanCategory },
          });
          changes.push({ title: link.title, category: cleanCategory });
          updatedCount++;
        }
      }
    }

    return NextResponse.json({
      message: isEn
        ? `Successfully organized ${updatedCount} links!`
        : `Berhasil merapikan ${updatedCount} tautan!`,
      processed: updatedCount,
      changes,
    });
  } catch (error: any) {
    console.error("Error in AI organize:", error);
    const normalized = normalizeAiError(error);
    return NextResponse.json({ error: normalized.friendlyMessage }, { status: normalized.statusCode });
  }
}
