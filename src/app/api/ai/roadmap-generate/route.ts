import { NextRequest, NextResponse } from "next/server";
import { executeGeminiRequest, normalizeAiError, sanitizeAIResponseText } from "@/lib/gemini";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { serializeRoadmap } from "@/lib/types";
import { calculateAutoLayout } from "@/lib/roadmap-layout";

function cleanNodeTitle(title: string | null | undefined, fallbackIndex: number): string {
  if (!title) return `Langkah ${fallbackIndex + 1}`;
  let cleaned = title.trim()
    .replace(/^[\*\_\#\`\~\!\[\]\-\+\>\s\:\;]+/, "")
    .replace(/[\*\_\#\`\~\!\[\]]+$/, "")
    .trim();
  return cleaned || `Langkah ${fallbackIndex + 1}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const limitCheck = await rateLimit(`ai_roadmap_${userId}`, { limit: 12, windowMs: 60 * 1000 });
    if (!limitCheck.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan AI Roadmap. Coba lagi sebentar." }, { status: 429 });
    }

    const body = await req.json();
    const { topic, existingRoadmapId } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Topik roadmap wajib diisi" }, { status: 400 });
    }

    const userLinks = await prisma.link.findMany({
      where: { userId },
      take: 30,
      select: { id: true, title: true, url: true, category: true },
    });

    const linksContext = userLinks.length > 0
      ? `DAFTAR LINK BOOKMARK USER SAAT INI (Hanya gunakan ID ini jika relevan):
${userLinks.map((l) => `- ID: "${l.id}", Judul: "${l.title}", URL: "${l.url}"`).join("\n")}`
      : "User belum memiliki link bookmark.";

    const systemPrompt = `Anda adalah Liko AI, asisten spesialis pembuat Roadmap & Alur Kerja visual terstruktur di Linkora.
Tugas Anda adalah merancang alur pengerjaan atau peta belajar yang LOGIS, RUNTUT, TERSTRUKTUR, dan BERDASARKAN DATA USER SESEUNGGUHNYA.

${linksContext}

ATURAN STRICT / ANTI-HALUSINASI:
1. PERSONALISASI & LEVEL USER: Hanya gunakan informasi level, skill, target, atau waktu yang secara EKSPLISIT disebutkan user dalam prompt. JIKA USER TIDAK MENYEBUTKAN LEVEL ATAU LATAR BELAKANG, DILARANG MENGARANG ASUMSI (seperti "Karena Anda seorang pemula..."). Tuliskan level sebagai "Level belum ditentukan" atau susun alur umum tanpa asumsi pribadi.
2. ANTI-HALUSINASI RESOURCE & URL: DILARANG KERAS mengarang URL palsu (misal https://example.com/course), mengarang nama buku, nama kursus berbayar, sertifikasi fiktif, atau harga.
3. PENGGUNAAN LINK BOOKMARK: Anda HANYA boleh menghubungkan node ke tipe "LINK" jika ID link tersebut benar-benar ada pada DAFTAR LINK BOOKMARK USER di atas. Jika tidak ada link bookmark yang cocok, gunakan tipe "TASK" atau "NOTE". Jika tidak ada sumber belajar spesifik dari bookmark user, cantumkan teks "Resource spesifik tidak tersedia" dalam deskripsi node.
4. DEPENDENSI LOGIS & RUNTUTAN: Buat antara 4 sampai 8 langkah (node) bertahap dari fondasi dasar, konsep utama, praktik, hingga checkpoint/indikator selesai. Setiap langkah harus berhubungan secara masuk akal dengan langkah sebelumnya.
5. TANPA KARAKTER ANNEH: Jangan menyertakan karakter dekoratif seperti *, _, #, !, atau markdown liar pada judul node.

FORMAT OUTPUT:
Kembalikan respon DALAM FORMAT JSON MURNI TANPA MARKDOWN (tanpa backticks \`\`\`json) dengan struktur berikut:

{
  "title": "Judul Roadmap yang Ringkas & Jelas",
  "description": "Gambaran umum alur kerja ini, asumsi level jika ada, dan target hasil akhir",
  "nodes": [
    {
      "type": "TASK" | "NOTE" | "LINK",
      "title": "Judul Langkah yang Spesifik dan Jelas",
      "description": "Penjelasan detail panduan, aktivitas, atau output dari langkah ini",
      "linkId": "ID_LINK_USER_JIKA_COCOK_ATAU_NULL"
    }
  ],
  "edges": [
    {
      "sourceIndex": 0,
      "targetIndex": 1
    }
  ]
}`;

    const { data: aiResult } = await executeGeminiRequest<any>({
      contents: [{ role: "user", parts: [{ text: `Topik / Instruksi User: "${topic.trim()}"` }] }],
      systemInstruction: systemPrompt,
      temperature: 0.2,
      responseMimeType: "application/json",
      expectJson: true,
      timeoutMs: 30000,
    });

    if (!aiResult || !aiResult.nodes || !Array.isArray(aiResult.nodes) || aiResult.nodes.length === 0) {
      return NextResponse.json({ error: "AI tidak dapat menghasilkan alur roadmap yang valid untuk topik ini." }, { status: 400 });
    }

    // 1. Validate & Sanitize Nodes
    const rawNodes = aiResult.nodes.slice(0, 12); // Max 12 nodes
    const validNodes: Array<{
      type: "TASK" | "NOTE" | "LINK";
      title: string;
      description: string | null;
      linkId: string | null;
    }> = [];

    const seenTitles = new Set<string>();

    for (let idx = 0; idx < rawNodes.length; idx++) {
      const n = rawNodes[idx];
      const cleanedTitle = cleanNodeTitle(n.title, idx);
      
      // Skip exact duplicate node titles in sequence
      const normKey = cleanedTitle.toLowerCase();
      if (seenTitles.has(normKey)) {
        continue;
      }
      seenTitles.add(normKey);

      let nodeType: "TASK" | "NOTE" | "LINK" = "TASK";
      if (n.type === "LINK" || n.type === "NOTE") {
        nodeType = n.type;
      }

      let validLinkId: string | null = null;
      if (nodeType === "LINK" && n.linkId) {
        const linkExists = userLinks.some((l) => l.id === n.linkId);
        if (linkExists) {
          validLinkId = n.linkId;
        } else {
          // Fallback to TASK if linkId is not in user's actual bookmarks
          nodeType = "TASK";
        }
      }

      const sanitizedDesc = n.description ? sanitizeAIResponseText(String(n.description)) : null;

      validNodes.push({
        type: nodeType,
        title: cleanedTitle,
        description: sanitizedDesc,
        linkId: validLinkId,
      });
    }

    if (validNodes.length === 0) {
      return NextResponse.json({ error: "Gagal memproses node roadmap dari AI." }, { status: 400 });
    }

    // 2. Validate & Sanitize Edges (Boundary, Self-loop, Duplicate, & Reverse Cycle Guard)
    const validEdges: Array<{ sourceIndex: number; targetIndex: number }> = [];
    const edgePairs = new Set<string>();

    if (Array.isArray(aiResult.edges)) {
      for (const e of aiResult.edges) {
        const sIndex = e.sourceIndex;
        const tIndex = e.targetIndex;

        if (
          typeof sIndex === "number" &&
          typeof tIndex === "number" &&
          sIndex >= 0 &&
          sIndex < validNodes.length &&
          tIndex >= 0 &&
          tIndex < validNodes.length &&
          sIndex !== tIndex
        ) {
          const pairKey = `${sIndex}->${tIndex}`;
          const reversePairKey = `${tIndex}->${sIndex}`;

          if (!edgePairs.has(pairKey) && !edgePairs.has(reversePairKey)) {
            edgePairs.add(pairKey);
            validEdges.push({ sourceIndex: sIndex, targetIndex: tIndex });
          }
        }
      }
    }

    // Fallback: If no valid edges returned, create a sequential linear chain
    if (validEdges.length === 0 && validNodes.length > 1) {
      for (let i = 0; i < validNodes.length - 1; i++) {
        validEdges.push({ sourceIndex: i, targetIndex: i + 1 });
      }
    }

    // 3. Layout Engine
    const tempNodes = validNodes.map((n, idx) => ({
      id: `temp_${idx}`,
      index: idx,
      raw: n,
    }));

    const tempEdges = validEdges.map((e) => ({
      sourceNodeId: `temp_${e.sourceIndex}`,
      targetNodeId: `temp_${e.targetIndex}`,
    }));

    const layoutedNodes = calculateAutoLayout(tempNodes, tempEdges);
    const layoutMap = new Map<number, { x: number; y: number }>();
    layoutedNodes.forEach((ln) => {
      layoutMap.set(ln.index, { x: ln.positionX, y: ln.positionY });
    });

    // 4. Persistence
    let roadmapId = existingRoadmapId;
    const cleanRoadmapTitle = cleanNodeTitle(aiResult.title, 0) || topic.trim();
    const cleanRoadmapDesc = aiResult.description
      ? sanitizeAIResponseText(String(aiResult.description))
      : `Roadmap terstruktur oleh Liko AI untuk: ${topic.trim()}`;

    if (!roadmapId) {
      const created = await prisma.roadmap.create({
        data: {
          title: cleanRoadmapTitle,
          description: cleanRoadmapDesc,
          userId,
        },
      });
      roadmapId = created.id;
    }

    const createdNodeIds: string[] = [];

    for (let i = 0; i < validNodes.length; i++) {
      const n = validNodes[i];
      const pos = layoutMap.get(i) || { x: 80 + (i % 3) * 340, y: 80 + Math.floor(i / 3) * 210 };

      const node = await prisma.roadmapNode.create({
        data: {
          roadmapId,
          type: n.type,
          title: n.title,
          description: n.description,
          status: "TODO",
          positionX: pos.x,
          positionY: pos.y,
          linkId: n.linkId,
        },
      });
      createdNodeIds.push(node.id);
    }

    for (const e of validEdges) {
      const sNodeId = createdNodeIds[e.sourceIndex];
      const tNodeId = createdNodeIds[e.targetIndex];
      if (sNodeId && tNodeId) {
        try {
          await prisma.roadmapEdge.create({
            data: {
              roadmapId,
              sourceNodeId: sNodeId,
              targetNodeId: tNodeId,
            },
          });
        } catch (_err) {
          // Ignore duplicate edge creation errors
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
    const normalized = normalizeAiError(error);
    return NextResponse.json({ error: normalized.friendlyMessage }, { status: normalized.statusCode });
  }
}

