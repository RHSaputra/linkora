import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
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
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const SYSTEM_PROMPT = `Anda adalah Liko, asisten AI pintar dan ramah dari Linkora. Anda bertugas membantu pengguna mengelola, mencari, merapikan, dan memahami tautan maupun catatan yang mereka simpan di Linkora. Bersikaplah ceria, hangat, membantu, dan menggunakan bahasa Indonesia yang santai tapi tetap sopan dan jelas.`;

    // Map messages format
    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Hai! Aku Liko, asisten AI kamu di Linkora. Siap membantu!" }] }
    ];

    for (const msg of messages) {
      // Ignore initial prompt message in history if we want
      if (msg.role === "user") {
        contents.push({ role: "user", parts: [{ text: msg.content }] });
      } else if (msg.role === "ai" || msg.role === "model") {
        contents.push({ role: "model", parts: [{ text: msg.content }] });
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
