import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "article"; // "article" | "journal"
    const page = parseInt(searchParams.get("page") || "1", 10);
    const count = parseInt(searchParams.get("count") || "12", 10);

    const apiKey = process.env.ELSEVIER_SCOPUS_API_KEY || process.env.SCOPUS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key Elsevier Scopus belum dikonfigurasi di file .env" },
        { status: 500 }
      );
    }

    if (!query.trim()) {
      return NextResponse.json({ items: [], totalResults: 0 });
    }

    const startIndex = (page - 1) * count;

    if (type === "journal") {
      // Scopus Serial Title API (Journal Metrics & Info)
      const url = `https://api.elsevier.com/content/serial/title?title=${encodeURIComponent(
        query.trim()
      )}&count=${count}&start=${startIndex}`;

      const res = await fetch(url, {
        headers: {
          "X-ELS-APIKey": apiKey,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 429) {
          return NextResponse.json(
            { error: "Batas kuota pencarian API Elsevier Scopus telah terlampaui (HTTP 429 Rate Limit)." },
            { status: 429 }
          );
        }
        if (res.status === 401 || res.status === 403) {
          return NextResponse.json(
            { error: "Kunci API Elsevier Scopus tidak valid atau tidak diizinkan (HTTP 401/403)." },
            { status: res.status }
          );
        }
        const errData = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: errData["service-error"]?.status?.statusText || "Gagal mengambil data dari Elsevier Scopus API" },
          { status: res.status }
        );
      }

      const data = await res.json();
      const serialResponse = data["serial-metadata-response"] || {};
      const totalResults = parseInt(serialResponse["opensearch:totalResults"] || "0", 10);
      const rawEntries = serialResponse["entry"] || [];

      const items = rawEntries.map((item: any) => {
        const scopusLinkObj = item.link?.find((l: any) => l["@ref"] === "scopus-source");
        const subjectAreas = item["subject-area"]?.map((sa: any) => sa["$"]) || [];
        return {
          id: item["source-id"] || item["prism:issn"] || Math.random().toString(),
          title: item["dc:title"] || "Tanpa Judul Jurnal",
          publisher: item["dc:publisher"] || "Publikasi Scopus",
          issn: item["prism:issn"] || "-",
          aggregationType: item["prism:aggregationType"] || "Journal",
          coverageStartYear: item["coverageStartYear"] || "-",
          coverageEndYear: item["coverageEndYear"] || "Present",
          subjectAreas,
          openAccess: item["openaccess"] === "1" || item["openaccess"] === true,
          scopusUrl: scopusLinkObj?.["@href"] || `https://www.scopus.com/source/sourceInfo.url?sourceId=${item["source-id"]}`,
        };
      });

      return NextResponse.json({ ok: true, items, totalResults });
    } else {
      // Scopus Article / Paper Search API
      const searchUrl = `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(
        query.trim()
      )}&count=${count}&start=${startIndex}`;

      const res = await fetch(searchUrl, {
        headers: {
          "X-ELS-APIKey": apiKey,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 429) {
          return NextResponse.json(
            { error: "Batas kuota pencarian API Elsevier Scopus telah terlampaui (HTTP 429 Rate Limit)." },
            { status: 429 }
          );
        }
        if (res.status === 401 || res.status === 403) {
          return NextResponse.json(
            { error: "Kunci API Elsevier Scopus tidak valid atau tidak diizinkan (HTTP 401/403)." },
            { status: res.status }
          );
        }
        const errData = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: errData["service-error"]?.status?.statusText || "Gagal mencari artikel dari Elsevier Scopus API" },
          { status: res.status }
        );
      }

      const data = await res.json();
      const searchResults = data["search-results"] || {};
      const totalResults = parseInt(searchResults["opensearch:totalResults"] || "0", 10);
      const rawEntries = searchResults["entry"] || [];

      const items = rawEntries.map((item: any) => {
        const scopusLinkObj = item.link?.find((l: any) => l["@ref"] === "scopus");
        const affiliation = item.affiliation?.[0]?.["affilname"] || "";
        const country = item.affiliation?.[0]?.["affiliation-country"] || "";
        const doi = item["prism:doi"] || "";

        let cleanYear = "";
        const coverDate = item["prism:coverDate"] || item["prism:coverDisplayDate"] || "";
        if (coverDate) {
          const yearMatch = coverDate.match(/\b(19|20)\d{2}\b/);
          cleanYear = yearMatch ? yearMatch[0] : coverDate.split("-")[0];
        }

        return {
          id: item["dc:identifier"] || item["eid"] || doi || Math.random().toString(),
          title: item["dc:title"] || "Tanpa Judul Artikel",
          creator: item["dc:creator"] || "Penulis Scopus",
          publicationName: item["prism:publicationName"] || "Jurnal Scopus",
          issn: item["prism:issn"] || item["prism:eIssn"] || "",
          coverDate: cleanYear || coverDate,
          doi,
          doiUrl: doi ? `https://doi.org/${doi}` : "",
          citedByCount: parseInt(item["citedby-count"] || "0", 10),
          openAccess: item["openaccess"] === "1" || item["openaccessFlag"] === true,
          subtypeDescription: item["subtypeDescription"] || "Article",
          scopusUrl: scopusLinkObj?.["@href"] || (doi ? `https://doi.org/${doi}` : "https://www.scopus.com"),
          affiliation: affiliation ? `${affiliation}${country ? `, ${country}` : ""}` : "",
        };
      });

      return NextResponse.json({ ok: true, items, totalResults });
    }
  } catch (error: any) {
    console.error("Scopus API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
