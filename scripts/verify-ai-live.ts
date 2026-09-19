import dotenv from "dotenv";
dotenv.config();

import { executeGeminiRequest, executeGeminiStream } from "../src/lib/ai/client";

async function verifyAiLive() {
  console.log("==========================================");
  console.log("LIVE INTEGRATION TEST — LINKORA AI CORE");
  console.log("==========================================");

  try {
    // 1. Test executeGeminiRequest with gemini-2.0-flash
    console.log("\n1. Testing executeGeminiRequest (Factual / JSON)...");
    const result = await executeGeminiRequest<{ testMsg: string }>({
      contents: [{ role: "user", parts: [{ text: "Berikan JSON dengan key 'testMsg' berisi 'Liko AI Berfungsi!'." }] }],
      expectJson: true,
      temperature: 0.1,
    });
    console.log("Model Used:", result.modelUsed);
    console.log("Result Data:", JSON.stringify(result.data));

    // 2. Test executeGeminiStream for AI Chat
    console.log("\n2. Testing executeGeminiStream (AI Chat Streaming)...");
    const streamResult = await executeGeminiStream({
      contents: [
        { role: "user", parts: [{ text: "Hai Liko AI, salam kenal." }] },
        { role: "model", parts: [{ text: "Hai! Aku Liko, asisten AI dari Linkora." }] },
        { role: "user", parts: [{ text: "Apa tugas utamamu di Linkora?" }] },
      ],
      temperature: 0.7,
    });

    console.log("Stream Model Used:", streamResult.modelUsed);
    let fullText = "";
    for await (const chunk of streamResult.stream) {
      if (chunk.text) {
        fullText += chunk.text;
      }
    }
    console.log("Streamed AI Output (First 200 chars):\n", fullText.substring(0, 200));

    console.log("\n==========================================");
    console.log("STATUS VERIFIKASI: 100% SUKSES & BERFUNGSI!");
    console.log("==========================================");
  } catch (err: any) {
    console.error("VERIFICATION FAILED:", err);
  }
}

verifyAiLive();
