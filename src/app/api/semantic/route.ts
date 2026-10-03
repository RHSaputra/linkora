import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("count") || "12", 10);

    if (!query.trim()) {
      return NextResponse.json({ items: [], totalResults: 0 });
    }

    const offset = (page - 1) * limit;
    const apiUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
      query.trim()
    )}&offset=${offset}&limit=${limit}&fields=title,authors,year,abstract,citationCount,isOpenAccess,openAccessPdf,url,venue,journal,externalIds`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil data dari Semantic Scholar API" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const totalResults = data.total || 0;
    const rawData = data.data || [];

    const items = rawData.map((item: any) => {
      const doi = item.externalIds?.DOI || "";
      const doiUrl = doi ? `https://doi.org/${doi}` : "";
      const authors = item.authors?.map((a: any) => a.name).join(", ") || "Unknown Author";

      return {
        id: item.paperId || Math.random().toString(),
        title: item.title || "Untitled Paper",
        authors,
        year: item.year || "-",
        venue: item.venue || item.journal?.name || "Semantic Scholar Publication",
        abstractText: item.abstract || "",
        citationCount: item.citationCount || 0,
        isOpenAccess: item.isOpenAccess || false,
        openAccessPdfUrl: item.openAccessPdf?.url || "",
        semanticUrl: item.url || (doiUrl ? doiUrl : "https://www.semanticscholar.org"),
        doiUrl,
      };
    });

    return NextResponse.json({
      ok: true,
      items,
      totalResults,
      currentPage: page,
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Koneksi ke Semantic Scholar mengalami batas waktu (Timeout 8s)." },
        { status: 504 }
      );
    }
    console.error("Semantic Scholar API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
