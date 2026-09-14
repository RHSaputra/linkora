import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { serializeRoadmap } from "@/lib/types";
import { calculateAutoLayout } from "@/lib/roadmap-layout";

function extractJsonString(str: string): string {
  const clean = str.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstOpen = clean.indexOf("{");
  const lastClose = clean.lastIndexOf("}");
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    return clean.substring(firstOpen, lastClose + 1);
  }
  return clean;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not configured.");
      return NextResponse.json({ error: "GEMINI_API_KEY belum dikonfigurasi pada server." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const limitCheck = await rateLimit(`ai_roadmap_${userId}`, { limit: 10, windowMs: 60 * 1000 });
    if (!limitCheck.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan AI. Coba lagi sebentar." }, { status: 429 });
    }

    const body = await req.json();
    const { topic, existingRoadmapId } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Topik roadmap wajib diisi" }, { status: 400 });
    }

    // Fetch user's existing links so Gemini can intelligently attach relevant Link nodes if matching
    const userLinks = await prisma.link.findMany({
      where: { userId },
      take: 30,
      select: { id: true, title: true, url: true, category: true },
    });

    const linksContext = userLinks.length > 0
      ? `DAFTAR LINK BOOKMARK USER SAAT INI:
${userLinks.map((l) => `- ID: "${l.id}", Judul: "${l.title}", URL: "${l.url}"`).join("\n")}`
      : "User belum memiliki link bookmark.";

    const systemPrompt = `Anda adalah Liko AI, asisten spesialis pembuat Roadmap & Alur Kerja terstruktur.
Tugas Anda adalah membuat rencana alur kerja / belajar yang RAPI, LOGIS, TERSTRUKTUR, dan SANGAT MUDAH DIPAHAMI.

${linksContext}

PETUNJUK OUTPUT:
Kembalikan respon DALAM FORMAT JSON MURNI TANPA MARKDOWN (tanpa backticks \`\`\`json) dengan struktur berikut:

{
  "title": "Judul Roadmap yang Ringkas & Jelas",
  "description": "Gambaran umum alur kerja ini dan hasil akhirnya",
  "nodes": [
    {
      "type": "TASK" | "NOTE" | "LINK",
      "title": "Judul Langkah yang Spesifik dan Jelas",
      "description": "Penjelasan detail mengenai panduan atau tindakan yang perlu dilakukan di langkah ini",
      "linkId": "ID_LINK_USER_JIKA_COCOK_ATAU_NULL"
    }
  ],
  "edges": [
    {
      "sourceIndex": 0,
      "targetIndex": 1
    }
  ]
}

ATURAN PENTING:
1. Buat antara 4 sampai 8 langkah (node) yang runtut, logis, dan bertahap.
2. Setiap langkah HARUS memiliki judul yang jelas dan deskripsi singkat yang membantu user paham apa yang harus dilakukan.
3. Hubungkan langkah-langkah secara logis berurutan (0 -> 1 -> 2 -> 3 dst) atau bercabang jika ada tugas paralel.
4. Jika ada link bookmark user yang relevan, gunakan type "LINK" dan sertakan linkId yang tepat.`;

    const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash"];
    let rawText = "";
    let lastError: any = null;

    for (const modelName of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\nTopik user: "${topic.trim()}"` }] },
          ],
          config: {
            temperature: 0.3,
          },
        });
        rawText = response.text || "";
        if (rawText.trim()) break;
      } catch (err: any) {
        console.warn(`Roadmap AI model ${modelName} failed, trying next fallback:`, err?.message || err);
        lastError = err;
      }
    }

    if (!rawText.trim()) {
      console.error("All Gemini models failed for roadmap generation:", lastError);
      return NextResponse.json({ error: "Liko AI gagal terhubung dengan server AI. Silakan coba lagi." }, { status: 500 });
    }

    const cleanJsonText = extractJsonString(rawText);

    let aiResult: any;
    try {
      aiResult = JSON.parse(cleanJsonText);
    } catch (_err) {
      console.error("Gagal parse JSON Gemini:", rawText);
      return NextResponse.json({ error: "Liko AI menghasilkan respon yang tidak valid. Silakan coba lagi." }, { status: 500 });
    }

    if (!aiResult.nodes || !Array.isArray(aiResult.nodes) || aiResult.nodes.length === 0) {
      return NextResponse.json({ error: "AI tidak dapat menghasilkan langkah untuk topik ini." }, { status: 400 });
    }

    // Prepare temp items for layout engine
    const tempNodes = aiResult.nodes.map((n: any, idx: number) => ({
      id: `temp_${idx}`,
      index: idx,
      raw: n,
    }));

    const tempEdges = (aiResult.edges || []).map((e: any) => ({
      sourceNodeId: `temp_${e.sourceIndex}`,
      targetNodeId: `temp_${e.targetIndex}`,
    }));

    // Calculate non-overlapping layout coordinates
    const layoutedNodes = calculateAutoLayout(tempNodes, tempEdges);
    const layoutMap = new Map<number, { x: number; y: number }>();
    layoutedNodes.forEach((ln) => {
      layoutMap.set(ln.index, { x: ln.positionX, y: ln.positionY });
    });

    // Save to Database
    let roadmapId = existingRoadmapId;

    if (!roadmapId) {
      // Create new roadmap
      const created = await prisma.roadmap.create({
        data: {
          title: aiResult.title || topic.trim(),
          description: aiResult.description || `Roadmap terstruktur oleh Liko AI untuk: ${topic.trim()}`,
          userId,
        },
      });
      roadmapId = created.id;
    }

    // Create Nodes & Keep Track of DB Node IDs by Index
    const createdNodeIds: string[] = [];

    for (let i = 0; i < aiResult.nodes.length; i++) {
      const n = aiResult.nodes[i];
      const pos = layoutMap.get(i) || { x: 80 + (i % 3) * 340, y: 80 + Math.floor(i / 3) * 210 };

      // Verify linkId if provided
      let validLinkId: string | null = null;
      if (n.type === "LINK" && n.linkId) {
        const linkExists = userLinks.some((l) => l.id === n.linkId);
        if (linkExists) validLinkId = n.linkId;
      }

      const node = await prisma.roadmapNode.create({
        data: {
          roadmapId,
          type: n.type === "LINK" || n.type === "NOTE" ? n.type : "TASK",
          title: n.title || `Langkah ${i + 1}`,
          description: n.description || null,
          status: "TODO",
          positionX: pos.x,
          positionY: pos.y,
          linkId: validLinkId,
        },
      });
      createdNodeIds.push(node.id);
    }

    // Create Edges
    if (aiResult.edges && Array.isArray(aiResult.edges)) {
      for (const e of aiResult.edges) {
        const sIndex = e.sourceIndex;
        const tIndex = e.targetIndex;
        if (
          typeof sIndex === "number" &&
          typeof tIndex === "number" &&
          createdNodeIds[sIndex] &&
          createdNodeIds[tIndex] &&
          sIndex !== tIndex
        ) {
          try {
            await prisma.roadmapEdge.create({
              data: {
                roadmapId,
                sourceNodeId: createdNodeIds[sIndex],
                targetNodeId: createdNodeIds[tIndex],
              },
            });
          } catch (_err) {
            // Ignore duplicate edge
          }
        }
      }
    }

    const fullRoadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        nodes: { include: { link: true }, orderBy: { createdAt: "asc" } },
        edges: true,
      },
    });

    return NextResponse.json(serializeRoadmap(fullRoadmap));
  } catch (error) {
    console.error("POST /api/ai/roadmap-generate error:", error);
    return NextResponse.json({ error: "Gagal membuat roadmap dengan Liko AI" }, { status: 500 });
  }
}
