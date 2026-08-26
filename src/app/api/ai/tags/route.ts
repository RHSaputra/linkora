import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

    // Get up to 10 links that don't have tags
    const links = await prisma.link.findMany({
      where: {
        userId: user.id,
        tags: "[]"
      },
      take: 10
    });

    if (links.length === 0) {
      return NextResponse.json({ message: "No links need tagging", processed: 0 });
    }

    const linksData = links.map(l => ({ id: l.id, title: l.title, description: l.description, category: l.category }));

    const SYSTEM_PROMPT = `
Anda adalah AI Tagger.
Tugas: Hasilkan 3-5 tag yang relevan untuk setiap tautan berdasarkan judul, deskripsi, dan kategorinya.
Input berupa JSON array berisi object { id, title, description, category }.
Output HARUS berupa JSON array berisi object { id, tags }. tags adalah array of string.
Pastikan ID sama dengan input.
Output murni JSON, tanpa markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nInput: " + JSON.stringify(linksData) }] }
      ],
      config: { responseMimeType: "application/json" }
    });

    let parsedResponse: { id: string, tags: string[] }[] = [];
    try {
      parsedResponse = JSON.parse(response.text?.replace(/```json/g, "").replace(/```/g, "").trim() || "[]");
    } catch (_e) {
      console.error("Failed to parse Gemini response for tags");
      return NextResponse.json({ error: "Failed to parse AI output" }, { status: 500 });
    }

    // Update DB
    let updatedCount = 0;
    for (const item of parsedResponse) {
      if (item.id && Array.isArray(item.tags) && item.tags.length > 0) {
        await prisma.link.update({
          where: { id: item.id },
          data: { tags: JSON.stringify(item.tags) }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ message: "Success", processed: updatedCount });
  } catch (error) {
    console.error("Error in AI tags:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
