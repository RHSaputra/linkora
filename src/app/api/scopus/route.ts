import { NextResponse } from "next/server";

async function fetchScopusChunk(baseUrl: string, apiKey: string) {
  const res = await fetch(baseUrl, {
    headers: {
      "X-ELS-APIKey": apiKey,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    if (res.status === 429) {
      return { ok: false, status: 429, error: "Batas kuota pencarian API Elsevier Scopus telah terlampaui (HTTP 429 Rate Limit)." };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, status: res.status, error: "Kunci API Elsevier Scopus tidak valid atau tidak diizinkan (HTTP 401/403)." };
    }
    const errData = await res.json().catch(() => ({}));
    return {
      ok: false,
      status: res.status,
      error: errData["service-error"]?.status?.statusText || "Gagal mengambil data dari Elsevier Scopus API",
    };
  }
  const data = await res.json();
  return { ok: true, data };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "article"; // "article" | "journal"
    const page = parseInt(searchParams.get("page") || "1", 10);
    const targetCount = parseInt(searchParams.get("count") || "30", 10);

    const apiKey = process.env.ELSEVIER_SCOPUS_API_KEY || process.env.SCOPUS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key Elsevier Scopus belum dikonfigurasi di file .env" },
        { status: 500 }
      );
    }

    const cleanQ = query.trim();
    if (!cleanQ) {
      return NextResponse.json({ items: [], totalResults: 0 });
    }

    const startIndex = (page - 1) * targetCount;

    // Check if query is an ISSN (e.g. 2502-0714 or 25020714)
    const issnMatch = cleanQ.match(/^(\d{4})-?(\d{3}[\dX])$/i);
    const formattedISSN = issnMatch ? `${issnMatch[1]}-${issnMatch[2]}` : null;
    const rawISSN = issnMatch ? `${issnMatch[1]}${issnMatch[2]}` : null;

    if (type === "journal") {
      // Elsevier Serial Title API max count per request = 25
      const batch1Size = Math.min(targetCount, 25);
      const batch2Size = targetCount > 25 ? Math.min(targetCount - 25, 25) : 0;

      const paramKey = formattedISSN ? `issn=${encodeURIComponent(formattedISSN)}` : `title=${encodeURIComponent(cleanQ)}`;
      const url1 = `https://api.elsevier.com/content/serial/title?${paramKey}&count=${batch1Size}&start=${startIndex}`;

      const promises: Promise<any>[] = [fetchScopusChunk(url1, apiKey)];
      if (batch2Size > 0) {
        const url2 = `https://api.elsevier.com/content/serial/title?${paramKey}&count=${batch2Size}&start=${startIndex + 25}`;
        promises.push(fetchScopusChunk(url2, apiKey));
      }

      const results = await Promise.all(promises);
      const res1 = results[0];

      if (!res1.ok) {
        return NextResponse.json({ error: res1.error }, { status: res1.status });
      }

      const serialResponse1 = res1.data["serial-metadata-response"] || {};
      let rawEntries = serialResponse1["entry"] || [];
      const parsedTotal = parseInt(
        serialResponse1["opensearch:totalResults"] || serialResponse1["@totalResults"] || "0",
        10
      );
      const totalResults = parsedTotal > 0 ? parsedTotal : rawEntries.length;

      if (results[1]?.ok && results[1].data["serial-metadata-response"]?.["entry"]) {
        rawEntries = [...rawEntries, ...results[1].data["serial-metadata-response"]["entry"]];
      }

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
      // Scopus Article / Paper Search API max count per request = 25
      const batch1Size = Math.min(targetCount, 25);
      const batch2Size = targetCount > 25 ? Math.min(targetCount - 25, 25) : 0;

      let scopusQuery = cleanQ;
      if (formattedISSN || rawISSN) {
        scopusQuery = `ISSN(${formattedISSN || rawISSN})`;
      }

      const searchUrl1 = `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(
        scopusQuery
      )}&count=${batch1Size}&start=${startIndex}`;

      const promises: Promise<any>[] = [fetchScopusChunk(searchUrl1, apiKey)];
      if (batch2Size > 0) {
        const searchUrl2 = `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(
          scopusQuery
        )}&count=${batch2Size}&start=${startIndex + 25}`;
        promises.push(fetchScopusChunk(searchUrl2, apiKey));
      }

      const results = await Promise.all(promises);
      const res1 = results[0];

      if (!res1.ok) {
        return NextResponse.json({ error: res1.error }, { status: res1.status });
      }

      const searchResults1 = res1.data["search-results"] || {};
      const totalResults = parseInt(searchResults1["opensearch:totalResults"] || "0", 10);
      let rawEntries = searchResults1["entry"] || [];

      if (results[1]?.ok && results[1].data["search-results"]?.["entry"]) {
        rawEntries = [...rawEntries, ...results[1].data["search-results"]["entry"]];
      }

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
