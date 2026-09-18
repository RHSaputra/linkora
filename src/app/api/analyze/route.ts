import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { ai, GEMINI_MODELS } from "@/lib/gemini";
import { getAiCache, setAiCache, withTimeout } from "@/lib/ai-cache";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { validateSafeExternalUrl, safeFetchExternal } from "@/lib/ssrf";

export interface PreviewImageInfo {
  url: string;
  alt?: string;
  source: string;
}

const SYSTEM_PROMPT = `
Anda adalah AI Knowledge & Content Analyzer profesional dari Linkora.

Tugas Utama:
Analisis konten web, artikel, dokumentasi teknis, repository GitHub, paper/jurnal ilmiah, produk e-commerce, berita, atau landing page berikut secara MENDALAM, SUPER DETAIL, SANGAT LENGKAP, DAN KOMPREHENSIF. Tuliskan analisis yang kaya informasi sebagai catatan pengetahuan permanen. DILARANG KERAS menghasilkan ringkasan pendek 2-3 kalimat atau memotong informasi penting.

ATURAN FORMULASI ANALISIS BASED ON JENIS KONTEN:
1. Jika Artikel / Blog:
   Analisis topik utama, latar belakang, argumen, fakta kunci, poin pembahasan detail, dan kesimpulan.
2. Jika Dokumentasi Teknis / API:
   Analisis teknologi, API/fungsi utama, instalasi, konfigurasi, prasyarat (requirements), contoh penggunaan, dan praktek terbaik.
3. Jika GitHub / Repository:
   Analisis nama & tujuan project, teknologi/language, fitur utama, arsitektur/struktur, cara instalasi & dependensi, status lisensi/proyek.
4. Jika Paper / Jurnal Ilmiah:
   Analisis rumusan masalah, tujuan penelitian, metodologi & dataset, hasil/temuan utama, kontribusi ilmiah, keterbatasan (limitations), dan kesimpulan.
5. Jika Produk / E-commerce:
   Analisis deskripsi produk, fitur & keunggulan, spesifikasi teknis, harga & variasi (jika ada), target pengguna, dan detail pembelian.
6. Jika Berita / News:
   Analisis peristiwa utama, pihak/tokoh yang terlibat, waktu & lokasi, fakta kunci & kronologi, latar belakang konteks, dan sumber.
7. Jika Landing Page / Business:
   Analisis tujuan bisnis, produk/service, value proposition, fitur utama, target pengguna, Call to Action (CTA), dan informasi penting.

ATURAN STRUKTUR CATATAN ("notes"):
1. Gunakan BAHASA INDONESIA yang natural, padat informasi, dan profesional.
2. DILARANG MENGGUNAKAN EMOJI.
3. DILARANG MENGGUNAKAN KARAKTER DEKORATIF MARKDOWN SEPERTI: ---, ###, ##, #, atau backticks (\`\`\`).
4. Susun bagian utama dengan JUDUL HURUF KAPITAL tanpa karakter dekoratif.
5. Struktur Wajib Seksi "notes":
   IDENTITAS HALAMAN:
   (Judul, URL/Domain, Tipe Konten, Penulis/Publisher, Tanggal Publikasi/Update jika ada, Bahasa)

   RINGKASAN MENDALAM & OVERVIEW:
   (Gambaran umum, tujuan utama halaman, konteks, inti pembahasan, kesimpulan umum)

   POIN-POIN KUNCI & PEMBAHASAN DETAIL:
   (Seluruh poin utama, fakta penting, angka/statistik jika ada, istilah & konsep penting, penjelasan teknis)

   STRUKTUR KONTEN & SUBTOPIK:
   (Heading utama, bagian-bagian pembahasan, serta hubungan antarbagian)

   INSIGHT & IMPLIKASI:
   (Hal penting yang dapat dipahami, implikasi logis dari konten, manfaat bagi pembaca)

   SUMBER & REFERENSI:
   (Referensi penting, external links, internal links penting, atau sumber data jika tersedia)

   INFORMASI YANG TIDAK DITEMUKAN:
   (Sebutkan secara rinci jika informasi seperti harga, penulis, tanggal, atau data teknis spesifik tidak ditemukan pada halaman. DILARANG MENGARANG DATA / ANTI-HALLUCINATION)

6. Gunakan simbol bullet asli (•) untuk mendaftar poin-poin di setiap bagian.
7. Gunakan baris baru (\\n) di antara setiap bagian agar rapi dan mudah dibaca.

FORMAT OUTPUT MURNI JSON:
{
  "title": "Judul tautan yang representatif, jelas, dan rapi",
  "description": "Deskripsi komprehensif mengenai konten tautan (2-3 kalimat informatif)",
  "category": "Kategori spesifik (contoh: Beasiswa, Lowongan Kerja, Magang, Video, AI Tools, Tutorial, Artikel, Project, Finance, atau Custom)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "notes": "ANALISIS MENDALAM SUPER DETAIL SESUAI STRUKTUR WAJIB DI ATAS",
  "previewImage": {
    "url": "URL gambar preview valid dari halaman atau null",
    "alt": "Deskripsi gambar atau title",
    "source": "og:image | twitter:image | json-ld | body:image"
  } | null,
  "deadline": "YYYY-MM-DDTHH:mm:ss.000Z" | null,
  "priority": "Tinggi" | "Sedang" | "Rendah"
}
Output HARUS murni JSON tanpa formatting markdown (tanpa \`\`\`json ... \`\`\`).
`;

/**
 * Robust JSON Parser with Sanitization & Extraction
 */
function cleanAndParseJson(text: string | null): any {
  if (!text) return null;
  
  try {
    return JSON.parse(text);
  } catch {}

  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonSub = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonSub);
    } catch {}

    try {
      const sanitized = jsonSub.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
        if (match === "\n") return "\\n";
        if (match === "\r") return "\\r";
        if (match === "\t") return "\\t";
        return "";
      });
      return JSON.parse(sanitized);
    } catch {}
  }

  return null;
}

/**
 * Robust image URL sanitizer and absolute URL converter
 */
function resolveAndValidateImageUrl(rawUrl: string | undefined | null, baseUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  let trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return null;

  if (trimmed.startsWith("//")) {
    trimmed = "https:" + trimmed;
  }

  try {
    const resolved = new URL(trimmed, baseUrl).toString();
    const lower = resolved.toLowerCase();

    if (!lower.startsWith("http://") && !lower.startsWith("https://")) return null;

    if (
      lower.includes("1x1") ||
      lower.includes("pixel") ||
      lower.includes("tracking") ||
      lower.includes("spinner") ||
      lower.includes("blank.gif") ||
      lower.includes("spacer.gif")
    ) {
      return null;
    }

    return resolved;
  } catch {
    return null;
  }
}

/**
 * Extract preview image with strict priority rules:
 * 1. og:image / og:image:secure_url
 * 2. twitter:image / twitter:image:src
 * 3. JSON-LD image
 * 4. Main article / body images
 */
function extractPreviewImage($: cheerio.CheerioAPI, baseUrl: string, jsonLdImages: string[]): PreviewImageInfo | null {
  const candidates: { url: string; alt?: string; source: string }[] = [];

  const ogImg =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[property="og:image:secure_url"]').attr("content") ||
    $('meta[name="og:image"]').attr("content");
  const ogImgValid = resolveAndValidateImageUrl(ogImg, baseUrl);
  if (ogImgValid) {
    candidates.push({ url: ogImgValid, alt: $('meta[property="og:image:alt"]').attr("content") || "OG Preview", source: "og:image" });
  }

  const twImg =
    $('meta[name="twitter:image"]').attr("content") ||
    $('meta[name="twitter:image:src"]').attr("content") ||
    $('meta[property="twitter:image"]').attr("content");
  const twImgValid = resolveAndValidateImageUrl(twImg, baseUrl);
  if (twImgValid) {
    candidates.push({ url: twImgValid, alt: $('meta[name="twitter:image:alt"]').attr("content") || "Twitter Card Preview", source: "twitter:image" });
  }

  for (const jImg of jsonLdImages) {
    const jValid = resolveAndValidateImageUrl(jImg, baseUrl);
    if (jValid) {
      candidates.push({ url: jValid, alt: "JSON-LD Image", source: "json-ld" });
    }
  }

  $("article img, main img, [itemprop='image'], .post-content img, .entry-content img, body img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("srcset")?.split(" ")[0];
    const alt = $(el).attr("alt") || $(el).attr("title");
    const valid = resolveAndValidateImageUrl(src, baseUrl);
    if (valid) {
      candidates.push({ url: valid, alt: alt || "Article Image", source: "body:image" });
    }
  });

  const seen = new Set<string>();
  for (const item of candidates) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      return item;
    }
  }

  return null;
}

/**
 * Smart Content Extraction & Sampling (Anti-Truncation)
 */
function extractComprehensiveContent($: cheerio.CheerioAPI) {
  const jsonLdImages: string[] = [];
  const jsonLdDataList: any[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const rawText = $(el).html();
      if (!rawText) return;
      const parsed = JSON.parse(rawText);
      const items = Array.isArray(parsed) ? parsed : parsed["@graph"] ? parsed["@graph"] : [parsed];

      for (const item of items) {
        if (!item) continue;
        jsonLdDataList.push(item);
        if (item.image) {
          if (typeof item.image === "string") jsonLdImages.push(item.image);
          else if (Array.isArray(item.image)) {
            item.image.forEach((img: any) => typeof img === "string" ? jsonLdImages.push(img) : img?.url && jsonLdImages.push(img.url));
          } else if (item.image.url) {
            jsonLdImages.push(item.image.url);
          }
        }
      }
    } catch {}
  });

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("title").text().trim() ||
    $("h1").first().text().trim();

  const metaDescription =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    "";

  const author =
    $('meta[name="author"]').attr("content") ||
    $('meta[property="article:author"]').attr("content") ||
    jsonLdDataList.find(d => d.author?.name || d.author)?.author?.name || "";

  const publishedDate =
    $('meta[property="article:published_time"]').attr("content") ||
    $('meta[name="dc.date"]').attr("content") ||
    $('meta[name="publish-date"]').attr("content") ||
    jsonLdDataList.find(d => d.datePublished)?.datePublished || "";

  const canonicalUrl = $('link[rel="canonical"]').attr("href") || "";

  const headings: string[] = [];
  $("h1, h2, h3, h4").each((_, el) => {
    const tag = el.tagName.toUpperCase();
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text && text.length > 3) {
      headings.push(`[${tag}] ${text}`);
    }
  });

  const listItems: string[] = [];
  $("ul li, ol li").each((idx, el) => {
    if (idx > 50) return false;
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text && text.length > 5) {
      listItems.push(`• ${text}`);
    }
  });

  const tableData: string[] = [];
  $("table").each((idx, tbl) => {
    if (idx > 3) return false;
    $(tbl).find("tr").each((_, tr) => {
      const cells: string[] = [];
      $(tr).find("th, td").each((_, td) => {
        const text = $(td).text().replace(/\s+/g, " ").trim();
        if (text) cells.push(text);
      });
      if (cells.length > 0) tableData.push(cells.join(" | "));
    });
  });

  $("script, style, noscript, iframe, svg, nav, footer, header").remove();
  let fullBodyText = $("body").text().replace(/\s+/g, " ").trim();

  let sampledContent = fullBodyText;
  if (fullBodyText.length > 12000) {
    const headChunk = fullBodyText.substring(0, 8000);
    const midStart = Math.floor(fullBodyText.length / 2) - 4000;
    const midChunk = fullBodyText.substring(midStart, midStart + 8000);
    const tailChunk = fullBodyText.substring(fullBodyText.length - 5000);

    sampledContent = `
[BAGIAN AWAL HALAMAN]:
${headChunk}

[BAGIAN TENGAH HALAMAN]:
${midChunk}

[BAGIAN AKHIR HALAMAN & KESIMPULAN]:
${tailChunk}
    `.trim();
  }

  return {
    title,
    metaDescription,
    author,
    publishedDate,
    canonicalUrl,
    headings,
    listItems,
    tableData,
    jsonLdImages,
    jsonLdSummary: jsonLdDataList.length > 0 ? JSON.stringify(jsonLdDataList.slice(0, 2)) : "",
    sampledContent,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const cacheKey = `analyze:${parsedUrl.toString()}`;
    const cached = getAiCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    let html = "";
    try {
      const { text } = await safeFetchExternal(parsedUrl.toString(), {
        timeoutMs: 10000,
        maxSizeBytes: 3 * 1024 * 1024,
      });
      html = text;
    } catch (error: any) {
      console.warn("Could not fetch URL directly:", error?.message || error);
    }

    if (!html || html.trim().length < 50) {
      return NextResponse.json(
        {
          error: "Halaman web tidak dapat diakses atau konten tidak tersedia untuk dibaca. Pastikan link bersifat publik, aktif, dan dapat dijangkau.",
          fetchStatus: "failed",
        },
        { status: 422 }
      );
    }

    const $ = cheerio.load(html);
    const extractedData = extractComprehensiveContent($);
    const previewImg = extractPreviewImage($, parsedUrl.toString(), extractedData.jsonLdImages);

    const userPrompt = `
URL HALAMAN: ${parsedUrl.toString()}
CANONICAL URL: ${extractedData.canonicalUrl || "Tidak ada"}
JUDUL HALAMAN: ${extractedData.title || "Tidak ada judul"}
META DESCRIPTION: ${extractedData.metaDescription || "Tidak ada deskripsi"}
PENULIS / AUTHOR: ${extractedData.author || "Tidak ditemukan"}
TANGGAL PUBLIKASI: ${extractedData.publishedDate || "Tidak ditemukan"}

STRUKTUR HEADING (H1-H4):
${extractedData.headings.length > 0 ? extractedData.headings.join("\n") : "Tidak ada heading terdeteksi"}

DAFTAR POIN PENTING (LISTS):
${extractedData.listItems.length > 0 ? extractedData.listItems.slice(0, 30).join("\n") : "Tidak ada daftar terdeteksi"}

DATA TABEL (JIKA ADA):
${extractedData.tableData.length > 0 ? extractedData.tableData.join("\n") : "Tidak ada tabel"}

METADATA JSON-LD:
${extractedData.jsonLdSummary || "Tidak ada JSON-LD"}

ISI HALAMAN LENGKAP (SAMPLED CONTENT DARI AWAL, TENGAH, DAN AKHIR):
${extractedData.sampledContent}
    `.trim();

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
                maxOutputTokens: 8192,
                temperature: 0.2,
              }
            }),
            45000
          );

          if (response?.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed in /api/analyze, trying fallback if available:`, err?.message || err);
          lastError = err;
        }
      }
    }

    const parsedResponse = cleanAndParseJson(responseText);

    // If Gemini API failed or returned invalid JSON
    if (!parsedResponse) {
      console.error("AI Analysis failed or API returned empty/invalid response. Last Error:", lastError);
      
      const rawError = String(lastError?.message || lastError || "");
      const lower = rawError.toLowerCase();
      
      let friendlyError = "Server AI sedang mengalami antrean tinggi. Silakan klik Analisis AI kembali beberapa saat lagi.";
      if (lower.includes("429") || lower.includes("quota") || lower.includes("resource_exhausted")) {
        friendlyError = "Batas kuota harian AI tercapai. Silakan coba kembali beberapa saat lagi.";
      } else if (lower.includes("api key") || lower.includes("unauthorized") || lower.includes("401") || lower.includes("403")) {
        friendlyError = "Layanan AI tidak dapat diakses (kunci API bermasalah). Silakan periksa konfigurasi.";
      }

      return NextResponse.json(
        { error: friendlyError },
        { status: 503 }
      );
    }

    // Attach preview image if present
    if (previewImg) {
      parsedResponse.previewImage = previewImg;
      parsedResponse.thumbnail = previewImg.url;
    } else {
      parsedResponse.previewImage = null;
      if (!parsedResponse.thumbnail) {
        parsedResponse.thumbnail = null;
      }
    }

    // Only cache successful AI responses with substantial detailed notes
    if (parsedResponse && parsedResponse.notes && parsedResponse.notes.length >= 300) {
      setAiCache(cacheKey, parsedResponse);
    }

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error("Error in /api/analyze:", error);

    let raw = typeof error === "string" ? error : (error?.message || "");
    try {
      const parsedJson = JSON.parse(raw);
      if (parsedJson?.error?.message) {
        raw = parsedJson.error.message;
      }
    } catch {}

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
