import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { ai, GEMINI_MODELS } from "@/lib/gemini";
import { getAiCache, setAiCache, withTimeout } from "@/lib/ai-cache";

const SYSTEM_PROMPT = `
Anda adalah AI Knowledge & Content Analyzer profesional dari Linkora.

Tugas Utama:
Analisis konten web, artikel, dokumentasi, beasiswa, lowongan kerja, tutorial, video, atau repository berikut secara MENDALAM, DETAIL, SANGAT LENGKAP, DAN KOMPREHENSIF. Tuliskan analisis yang kaya informasi sebagai catatan pengetahuan permanen.

Aturan Pembuatan Catatan ("notes"):
1. "notes" HARUS BERISI ANALISIS DAN RANGKUMAN PANJANG, LENGKAP, DETAIL, TERSTRUKTUR, DAN BERKUALITAS TINGGI (DILARANG KRAS MENGHASILKAN RINGKASAN PENDEK 2-3 KALIMAT!).
2. Susun minimal 4-5 Bagian Utama dengan HURUF KAPITAL, contoh:
   RINGKASAN UTAMA & OVERVIEW:
   POIN-POIN KUNCI & PEMBAHASAN DETAIL:
   MANFAAT, TARGET AUDIENS & FITUR UTAMA:
   REKOMENDASI & PANDUAN PRAKTIS:
   KESIMPULAN:
3. Gunakan simbol bullet asli (•) untuk mendaftar poin-poin penjelasan di setiap bagian.
4. Gunakan baris baru (\n) di antara setiap paragraf dan bagian agar rapi dan mudah dibaca.
5. DILARANG MENGGUNAKAN MARKDOWN (seperti **, #, ###, atau backticks). Gunakan format PLAIN TEXT yang bersih dan mudah dibaca.
6. Berikan penjelasan yang mendalam dan panjang di setiap bagian agar catatan ini sangat berguna bagi pengguna.

Format Output Murni JSON:
{
  "title": "Judul tautan yang representatif, jelas, dan rapi",
  "description": "Deskripsi singkat mengenai konten tautan (max 160 karakter)",
  "category": "Kategori yang paling spesifik (contoh: Beasiswa, Lowongan Kerja, Magang, Video, AI Tools, Tutorial, Artikel, Project, Finance, atau Custom)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "notes": "ANALISIS MENDALAM LENGKAP DETAIL DENGAN BEBERAPA BAGIAN KATEGORI KONTEN. Gunakan huruf kapital untuk judul bagian dan bullet point asli (•).",
  "deadline": "YYYY-MM-DDTHH:mm:ss.000Z" | null,
  "priority": "Tinggi" | "Sedang" | "Rendah"
}
Output HARUS murni JSON tanpa formatting markdown.
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

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = await validateSafeExternalUrl(normalizedUrl);
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

    // 1. Fetch website content safely with anti-SSRF & size guard
    let html = "";
    try {
      const { text } = await safeFetchExternal(parsedUrl.toString(), {
        timeoutMs: 8000,
        maxSizeBytes: 2 * 1024 * 1024,
      });
      html = text;
    } catch (error) {
      console.warn("Could not fetch URL directly, falling back to basic metadata if possible.", error);
    }

    // 2. Extract content with Cheerio
    let extractedText = "";
    let title = "";
    let metaDescription = "";

    if (html) {
      const $ = cheerio.load(html);
      $("script, style, noscript, iframe, img, svg, video").remove();
      title = $("title").text().trim();
      metaDescription = $('meta[name="description"]').attr("content") || 
                       $('meta[property="og:description"]').attr("content") || "";
      extractedText = $("body").text().replace(/\s+/g, " ").trim();
      if (extractedText.length > 10000) {
        extractedText = extractedText.substring(0, 10000) + "...";
      }
    }

    // 3. Call Gemini with fallback models in case of high demand (503)
    const userPrompt = `
      URL: ${parsedUrl.toString()}
      Title: ${title || "Tidak ada judul"}
      Description: ${metaDescription || "Tidak ada deskripsi"}
      Content:
      ${extractedText || "Halaman web umum. Analisis URL ini berdasarkan topik dan domain tersebut."}
    `;

    let responseText: string | null = null;
    let lastError: any = null;

    if (process.env.GEMINI_API_KEY) {
      for (const modelName of GEMINI_MODELS) {
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

          if (response?.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed, trying fallback if available:`, err?.message || err);
          lastError = err;
        }
      }
    }

    let parsedResponse: any = null;

    if (responseText) {
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (_e) {
        try {
          const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedResponse = JSON.parse(cleanedText);
        } catch {}
      }
    }

    // Resilient Fallback if AI API returned empty or failed
    if (!parsedResponse) {
      const hostname = parsedUrl.hostname.replace("www.", "");
      const cleanTitle = title || hostname.charAt(0).toUpperCase() + hostname.slice(1);
      const cleanDesc = metaDescription || (extractedText ? extractedText.slice(0, 160) + "..." : `Tautan dari ${hostname}`);
      
      let fallbackCategory = "Custom";
      const lower = `${cleanTitle} ${cleanDesc} ${parsedUrl.toString()}`.toLowerCase();
      if (lower.includes("beasiswa") || lower.includes("scholarship")) fallbackCategory = "Beasiswa";
      else if (lower.includes("loker") || lower.includes("job") || lower.includes("career")) fallbackCategory = "Lowongan Kerja";
      else if (lower.includes("intern") || lower.includes("magang")) fallbackCategory = "Magang";
      else if (lower.includes("video") || lower.includes("youtube")) fallbackCategory = "Video";
      else if (lower.includes("ai") || lower.includes("gpt") || lower.includes("claude")) fallbackCategory = "AI Tools";
      else if (lower.includes("tutorial") || lower.includes("learn") || lower.includes("guide")) fallbackCategory = "Tutorial";
      else if (lower.includes("github") || lower.includes("code") || lower.includes("project")) fallbackCategory = "Project";

      parsedResponse = {
        title: cleanTitle,
        description: cleanDesc,
        category: fallbackCategory,
        tags: [fallbackCategory.toLowerCase()],
        notes: `INFORMASI TAUTAN:\n• Judul: ${cleanTitle}\n• Domain: ${hostname}\n• Deskripsi: ${cleanDesc}`,
        deadline: null,
        priority: "Sedang",
      };
    }

    // Only cache successful AI responses with substantial detailed notes
    if (responseText && parsedResponse && parsedResponse.notes && parsedResponse.notes.length >= 200) {
      setAiCache(cacheKey, parsedResponse);
    }

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
