import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Build a context summary of the user's link collection to inject into Liko's
 * system prompt. This gives the AI grounded, factual data about what the user
 * has stored so it can answer questions like "berapa total tautanku?" or
 * "kategori apa yang paling banyak?" accurately.
 */
async function buildUserContext(userId: string, userName: string, isEn: boolean): Promise<string> {
  const [
    totalLinks,
    favoriteCount,
    categoryGroups,
    recentLinks,
    upcomingReminders,
    collectionCount,
  ] = await Promise.all([
    prisma.link.count({ where: { userId } }),
    prisma.link.count({ where: { userId, isFavorite: true } }),
    prisma.link.groupBy({
      by: ["category"],
      where: { userId },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
    }),
    prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        title: true,
        category: true,
        tags: true,
        url: true,
        isFavorite: true,
        reminderAt: true,
        createdAt: true,
      },
    }),
    prisma.link.findMany({
      where: {
        userId,
        reminderAt: { gte: new Date() },
      },
      orderBy: { reminderAt: "asc" },
      take: 5,
      select: { title: true, reminderAt: true },
    }),
    prisma.collection.count({ where: { userId } }),
  ]);

  // If user has no links, return minimal context
  if (totalLinks === 0) {
    return isEn
      ? `=== USER DATA CONTEXT ===
Name: ${userName}
Total links: 0
The user has not saved any links yet.
=== END OF CONTEXT ===`
      : `=== KONTEKS DATA PENGGUNA ===
Nama: ${userName}
Total tautan: 0
Pengguna belum menyimpan tautan apapun.
=== AKHIR KONTEKS ===`;
  }

  // Category distribution
  const categoryLines = categoryGroups
    .map((g) => `${g.category} (${g._count.category})`)
    .join(", ");

  // Extract unique tags across all recent links
  const tagSet = new Set<string>();
  for (const link of recentLinks) {
    try {
      const parsed = JSON.parse(link.tags || "[]");
      if (Array.isArray(parsed)) {
        parsed.forEach((t: string) => tagSet.add(t));
      }
    } catch {
      // skip
    }
  }
  const topTags = Array.from(tagSet).slice(0, 15).join(", ");

  // Recent links summary
  const recentSummary = recentLinks
    .map((l, i) => {
      const tags = (() => {
        try {
          return JSON.parse(l.tags || "[]").join(", ");
        } catch {
          return "";
        }
      })();
      const fav = l.isFavorite ? (isEn ? " [Favorite]" : " [Favorit]") : "";
      const reminder = l.reminderAt
        ? ` — reminder: ${new Date(l.reminderAt).toLocaleDateString(isEn ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" })}`
        : "";
      return `${i + 1}. "${l.title}" [${l.category}]${fav} tags: ${tags || "-"}${reminder}`;
    })
    .join("\n");

  // Upcoming reminders
  const reminderLines =
    upcomingReminders.length > 0
      ? upcomingReminders
          .map(
            (r) =>
              `- "${r.title}" — ${new Date(r.reminderAt!).toLocaleDateString(isEn ? "en-US" : "id-ID", { day: "numeric", month: "long", year: "numeric" })}`
          )
          .join("\n")
      : isEn
      ? "No upcoming reminders."
      : "Tidak ada reminder yang mendekat.";

  return isEn
    ? `=== USER DATA CONTEXT ===
Name: ${userName}
Total links: ${totalLinks} | Favorites: ${favoriteCount} | Collections: ${collectionCount}
Categories: ${categoryLines}
Top tags: ${topTags || "-"}

20 Recent links:
${recentSummary}

Upcoming reminders:
${reminderLines}
=== END OF CONTEXT ===`
    : `=== KONTEKS DATA PENGGUNA ===
Nama: ${userName}
Total tautan: ${totalLinks} | Favorit: ${favoriteCount} | Koleksi: ${collectionCount}
Kategori: ${categoryLines}
Tag populer: ${topTags || "-"}

20 tautan terbaru:
${recentSummary}

Reminder mendekat:
${reminderLines}
=== AKHIR KONTEKS ===`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    const userId = session?.user?.id;
    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limitCheck = await rateLimit(`chat_${userEmail}`, { limit: 10, windowMs: 60 * 1000 });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi dalam ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, locale = "id" } = body;
    const isEn = locale === "en";

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    // Build user context from their actual data
    const userName = session?.user?.name || (isEn ? "User" : "Pengguna");
    const userContext = await buildUserContext(userId, userName, isEn);

    const SYSTEM_PROMPT = isEn
      ? `You are Liko, the friendly, helpful, and intelligent AI assistant of Linkora — an all-in-one link management and personal notes workspace.

Your Role:
- Assist the user with managing, organizing, searching, and understanding their link and personal note collections.
- Answer user queries regarding their saved links and notes strictly based on the USER DATA CONTEXT below.
- Provide thoughtful, tailored recommendations based on their usage patterns.

MANDATORY LANGUAGE INSTRUCTION:
- The user has selected ENGLISH mode. You MUST answer and communicate 100% IN NATURAL, FLUENT, POLITE, AND PROFESSIONAL ENGLISH.
- NEVER switch to Indonesian while English mode is active, even if answering questions about Indonesian link titles or queries. Everything you output must be in English.

Important Rules:
- Answer factual questions (such as total links, categories, specific tags, or reminders) ONLY using data from the CONTEXT. Do not hallucinate numbers or links.
- If asked about information not in the context, politely clarify that the data is not in your current summary.
- If the user provides a web URL and expresses interest in saving it, inform them that they can click the "Save Link" button displayed right above the chat message to automatically analyze and save it.
- Keep responses concise, warm, and clear. Use at most 1 emoji per message where contextually appropriate.
- Maintain your identity as Liko from Linkora.

${userContext}`
      : `Anda adalah Liko, asisten AI cerdas dan ramah dari Linkora — aplikasi manajemen tautan dan catatan pribadi all-in-one.

Peran Anda:
- Membantu pengguna mengelola, mencari, dan memahami koleksi tautan serta catatan pribadi mereka.
- Menjawab pertanyaan tentang data tautan mereka berdasarkan KONTEKS DATA di bawah.
- Memberikan rekomendasi cerdas berdasarkan pola penggunaan mereka.

INSTRUKSI BAHASA WAJIB:
- Pengguna memilih mode BAHASA INDONESIA. Anda HARUS menjawab 100% dalam BAHASA INDONESIA yang ramah, profesional, dan ringkas.

Aturan penting:
- Jawab pertanyaan faktual (jumlah tautan, kategori, dll) HANYA berdasarkan data di KONTEKS. Jangan mengarang angka atau data yang tidak ada.
- Jika ditanya sesuatu yang tidak ada di konteks, sampaikan dengan jujur bahwa data tersebut tidak tersedia dalam ringkasan yang Anda miliki.
- Jika pengguna mengirim URL/tautan web dan ingin menyimpannya, beri tahu bahwa mereka dapat langsung mengklik tombol "Simpan Tautan" yang muncul di atas pesan untuk menganalisis dan menyimpannya secara otomatis.
- Jangan gunakan emoji berlebihan. Maksimal 1 emoji per pesan jika memang sesuai konteks.
- Jangan berperilaku seperti AI generik. Anda spesifik untuk Linkora.

${userContext}`;

    const initialGreeting = isEn
      ? `Hi ${userName}! I'm Liko, your Linkora assistant. I'm synced with your workspace and ready to help. Feel free to ask anything about your links, notes, or categories!`
      : `Hai ${userName}! Aku Liko, asisten Linkora-mu. Aku sudah terhubung dengan koleksi tautanmu dan siap membantu. Tanya apa saja seputar tautan, kategori, atau hal lain yang bisa kubantu.`;

    // Map messages format
    const contents = [
      { role: "user" as const, parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model" as const, parts: [{ text: initialGreeting }] },
    ];

    for (const msg of messages) {
      if (msg.role === "user") {
        contents.push({ role: "user" as const, parts: [{ text: msg.content }] });
      } else if (msg.role === "ai" || msg.role === "model") {
        contents.push({ role: "model" as const, parts: [{ text: msg.content }] });
      }
    }

    const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let responseStream: any = null;
    let lastError: any = null;

    for (const modelName of MODELS) {
      try {
        responseStream = await ai.models.generateContentStream({
          model: modelName,
          contents: contents,
        });
        if (responseStream) break;
      } catch (err: any) {
        console.warn(`Chat model ${modelName} failed, trying fallback:`, err?.message || err);
        lastError = err;
      }
    }

    if (!responseStream) {
      throw lastError || new Error("Failed to initialize stream from AI");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
