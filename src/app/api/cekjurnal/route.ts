import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const sinta = url.searchParams.get("sinta") || "";
    const apc = url.searchParams.get("apc") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sinta) params.set("sinta", sinta);
    if (apc) params.set("apc", apc);
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    params.set("per_page", limit.toString());

    const targetUrl = `https://cekjurnal.id/api/jurnal.php?${params.toString()}`;

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Gagal mengambil data dari CekJurnal.id (Status: ${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawItems: any[] = data.data || [];

    const items = rawItems.map((item: any) => {
      const sintaRating = item.sinta ? `S${item.sinta}` : "SINTA";
      const scopusRank = item.scopus_rank ? `Q${item.scopus_rank}` : null;
      const numericApc = typeof item.apc_idr === "number" ? item.apc_idr : parseInt(item.apc || "0", 10);
      const isFreeApc = numericApc === 0;

      return {
        id: item.id?.toString() || Math.random().toString(),
        title: item.nama || "Jurnal Tanpa Judul",
        publisher: item.penerbit || "Institusi Publikasi Indonesia",
        sintaRating,
        scopusRank,
        apcText: isFreeApc ? "Free APC (Gratis)" : `Rp ${numericApc.toLocaleString("id-ID")}`,
        isFreeApc,
        apcAmount: numericApc,
        issn: item.e_issn || item.p_issn || "-",
        language: item.bahasa === "en" ? "Bahasa Inggris" : "Bahasa Indonesia",
        frequency: item.frekuensi || "Terbit Berkala",
        scope: item.scope || item.taxonomy_id_list || "Multidisiplin / Umum",
        websiteUrl: item.link || "https://cekjurnal.id/jurnal",
        h5Index: item.h5_index || 0,
        citations: item.citations || 0,
      };
    });

    return NextResponse.json({
      items,
      totalResults: typeof data.total === "number" ? data.total : items.length,
      page,
      perPage: limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan sistem saat menghubungi server CekJurnal.id" },
      { status: 500 }
    );
  }
}
