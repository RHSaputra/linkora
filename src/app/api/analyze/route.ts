import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";
import { getAiCache, setAiCache, withTimeout } from "@/lib/ai-cache";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `
Anda adalah AI Knowledge Analyzer.

Tugas:
Analisis halaman, artikel, video, website, dokumentasi, beasiswa, magang, lowongan kerja, tutorial, berita, AI tools, repository GitHub, kursus, atau konten lainnya.

Tujuan:
Mengubah konten panjang menjadi informasi yang rapi, lengkap, dan mudah dipahami dalam format PLAIN TEXT.

Aturan:
- JANGAN GUNAKAN FORMAT MARKDOWN (seperti **, *, #, atau backticks).
- Gunakan HURUF KAPITAL untuk penekanan atau judul bagian (contoh: NAMA BEASISWA:).
- Beri jarak baris kosong antar bagian menggunakan \n agar tidak menumpuk.
- Gunakan karakter bullet asli (•) atau strip (-) untuk membuat list.
- Fokus pada informasi yang berguna dan langsung ke intinya.
- Jika informasi tidak ditemukan, jangan mengarang.

Tambahkan data meta berikut (ekstrak dari konten):
- Kategori otomatis (Beasiswa, Loker, Artikel, Video, Tutorial, atau Custom)
- Tag otomatis (array of string, max 5)
- Prioritas (Rendah/Sedang/Tinggi)
- Deadline jika ditemukan (format YYYY-MM-DDTHH:mm jika bisa, atau null)
- Estimasi waktu membaca atau menonton

Format Output JSON:
{
  "title": "Judul singkat",
  "description": "Deskripsi singkat (max 160 chars)",
  "category": "Kategori otomatis",
  "tags": ["tag1", "tag2"],
  "notes": "STRING PLAIN TEXT BERISI RINGKASAN. Tulis dengan rapi, gunakan escape character \\n untuk baris baru, gunakan bullet point asli (•), dan JANGAN ADA karakter markdown.",
  "deadline": "YYYY-MM-DDTHH:mm:ss.000Z" | null,
  "priority": "Tinggi" | "Sedang" | "Rendah"
}
Output HARUS murni JSON. JANGAN merender markdown apapun di luar JSON.
`;

import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { validateSafeExternalUrl, safeFetchExternal } from "@/lib/ssrf";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 15 analysis requests per minute per user
    const limitCheck = await rateLimit(`analyze_${session.user.id}`, {
      limit: 15,
      windowMs: 60 * 1000,
    });
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan analisis. Silakan tunggu ${limitCheck.reset} detik.` },
        { status: 429 }
      );
    }

    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = await validateSafeExternalUrl(url);
    } catch (validationErr: any) {
      return NextResponse.json(
        { error: validationErr?.message || "URL tidak diizinkan atau tidak valid" },
        { status: 400 }
      );
    }

    // Return cached analysis immediately if we already processed this URL.
    const cacheKey = `analyze:${parsedUrl.toString()}`;
    const cached = getAiCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // 1. Fetch website content safely with anti-SSRF & size guard
    let html = "";
    try {
      const { text } = await safeFetchExternal(parsedUrl.toString(), {
        timeoutMs: 10000,
        maxSizeBytes: 2 * 1024 * 1024,
      });
      html = text;
    } catch (error) {
      console.warn("Could not fetch URL directly, falling back to basic metadata if possible.", error);
      // We continue, the AI will just analyze the URL itself which might not yield much, but it won't crash.
    }


    // 2. Extract content with Cheerio
    let extractedText = "";
    let title = "";
    let metaDescription = "";

    if (html) {
      const $ = cheerio.load(html);
      
      // Remove unnecessary elements
      $("script, style, noscript, iframe, img, svg, video").remove();
      
      title = $("title").text().trim();
      metaDescription = $('meta[name="description"]').attr("content") || 
                       $('meta[property="og:description"]').attr("content") || "";
                       
      // Get readable text from body
      extractedText = $("body").text().replace(/\s+/g, " ").trim();
      
      // Limit text to roughly 8000 characters to process much faster
      if (extractedText.length > 8000) {
        extractedText = extractedText.substring(0, 8000) + "...";
      }
    }

    // 3. Call Gemini with fallback models in case of high demand (503)
    const userPrompt = `
      URL: ${url}
      Title: ${title}
      Description: ${metaDescription}
      Content:
      ${extractedText}
    `;

    const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
    let responseText: string | null = null;
    let lastError: any = null;

    for (const modelName of MODELS) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: [
              { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }] }
            ],
            config: {
              responseMimeType: "application/json",
            }
          }),
          30000
        );

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed, trying fallback if available:`, err?.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Tidak ada respon dari server AI.");
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (_e) {
      // Sometime the model still wraps in ```json
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedResponse = JSON.parse(cleanedText);
    }

    setAiCache(cacheKey, parsedResponse);

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error("Error in /api/analyze:", error);
    
    // Parse friendly error messaging
    let raw = typeof error === "string" ? error : (error?.message || "");
    try {
      const parsedJson = JSON.parse(raw);
      if (parsedJson?.error?.message) {
        raw = parsedJson.error.message;
      }
    } catch {
      // Not JSON, continue
    }

    const lower = (raw + " " + String(error)).toLowerCase();
    let friendlyMessage = "Gagal menganalisis link saat ini. Silakan coba kembali.";

    if (lower.includes("503") || lower.includes("high demand") || lower.includes("unavailable") || lower.includes("overloaded")) {
      friendlyMessage = "Server AI sedang mengalami antrean tinggi. Silakan klik tombol Analisis AI lagi dalam beberapa detik.";
    } else if (lower.includes("429") || lower.includes("resource_exhausted") || lower.includes("quota")) {
      friendlyMessage = "Batas kuota harian AI tercapai. Silakan coba kembali beberapa saat lagi.";
    } else if (lower.includes("api key") || lower.includes("unauthorized") || lower.includes("401") || lower.includes("403")) {
      friendlyMessage = "Layanan AI tidak dapat diakses (kunci API bermasalah). Silakan periksa konfigurasi.";
    } else if (lower.includes("fetch") || lower.includes("abort") || lower.includes("timeout") || lower.includes("network")) {
      friendlyMessage = "Tidak dapat menjangkau website tujuan. Pastikan link aktif dan dapat diakses.";
    }

    return NextResponse.json(
      { error: friendlyMessage },
      { status: 500 }
    );
  }
}
