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

function getJournalQuartile(item: any): string {
  let sjr = 0;
  if (item.SJRList?.SJR) {
    const arr = Array.isArray(item.SJRList.SJR) ? item.SJRList.SJR : [item.SJRList.SJR];
    sjr = parseFloat(arr[0]?.["$"] || "0");
  } else if (item["SJR"]) {
    sjr = parseFloat(item["SJR"] || "0");
  }

  let cs = 0;
  if (item.citeScoreYearInfoList?.citeScoreCurrentMetric) {
    cs = parseFloat(item.citeScoreYearInfoList.citeScoreCurrentMetric || "0");
  } else if (item["citeScoreCurrentMetric"]) {
    cs = parseFloat(item["citeScoreCurrentMetric"] || "0");
  }

  const title = (item["dc:title"] || "").toLowerCase();
  const publisher = (item["dc:publisher"] || "").toLowerCase();

  if (sjr >= 0.8 || cs >= 6.0) return "Q1";
  if (sjr >= 0.45 || cs >= 2.5) return "Q2";
  if (sjr >= 0.20 || cs >= 1.0) return "Q3";
  if (sjr > 0 || cs > 0) return "Q4";

  if (
    title.includes("acm transactions") ||
    title.includes("ieee transactions") ||
    title.includes("nature") ||
    title.includes("science") ||
    title.includes("lancet") ||
    title.includes("cell") ||
    title.includes("advanced") ||
    title.includes("acs ") ||
    title.includes("nano")
  ) {
    return "Q1";
  }
  if (
    title.includes("journal of") ||
    title.includes("international journal") ||
    publisher.includes("elsevier") ||
    publisher.includes("springer") ||
    publisher.includes("wiley") ||
    publisher.includes("ieee")
  ) {
    return "Q2";
  }
  if (
    title.includes("bulletin") ||
    title.includes("letters") ||
    title.includes("advances") ||
    publisher.includes("mdpi") ||
    publisher.includes("frontiers")
  ) {
    return "Q3";
  }
  return "Q4";
}

function getArticleQuartile(item: any): string {
  if (item.quartile && ["Q1", "Q2", "Q3", "Q4"].includes(item.quartile.toUpperCase())) {
    return item.quartile.toUpperCase();
  }

  const pubName = (item["prism:publicationName"] || "").toLowerCase();
  const citedCount = parseInt(item["citedby-count"] || "0", 10);
  const subtype = (item["subtypeDescription"] || "").toLowerCase();

  if (citedCount >= 30) return "Q1";
  if (citedCount >= 15) return "Q2";

  if (
    pubName.includes("nature") ||
    pubName.includes("science") ||
    pubName.includes("lancet") ||
    pubName.includes("cell") ||
    pubName.includes("nano") ||
    pubName.includes("ieee transactions") ||
    pubName.includes("acm transactions") ||
    pubName.includes("advanced") ||
    pubName.includes("acs ") ||
    pubName.includes("neurology") ||
    pubName.includes("food control") ||
    pubName.includes("management education") ||
    pubName.includes("electric power systems") ||
    pubName.includes("review of") ||
    pubName.includes("annual review")
  ) {
    return "Q1";
  }

  if (
    pubName.includes("ieee") ||
    pubName.includes("acm") ||
    pubName.includes("international journal") ||
    pubName.includes("applied") ||
    pubName.includes("communications") ||
    pubName.includes("journal of research") ||
    pubName.includes("educational research") ||
    pubName.includes("engineering") ||
    pubName.includes("computers")
  ) {
    return "Q2";
  }

  if (
    pubName.includes("journal") ||
    pubName.includes("letters") ||
    pubName.includes("bulletin") ||
    pubName.includes("advances") ||
    pubName.includes("proceedings") ||
    pubName.includes("frontiers") ||
    pubName.includes("mdpi") ||
    subtype.includes("review")
  ) {
    return "Q3";
  }

  return "Q4";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "article"; // "article" | "journal"
    const quartileFilter = (searchParams.get("quartile") || "").toUpperCase(); // "Q1" | "Q2" | "Q3" | "Q4" | ""
    const page = parseInt(searchParams.get("page") || "1", 10);
    const targetCount = parseInt(searchParams.get("count") || "30", 10);

    const apiKey =
      process.env.ELSEVIER_SCOPUS_API_KEY ||
      process.env.SCOPUS_API_KEY ||
      "91da0f47bd8aa466b8ff2479eaa7970d";

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
      const fetchCount = quartileFilter ? 50 : targetCount;
      const batch1Size = Math.min(fetchCount, 25);
      const batch2Size = fetchCount > 25 ? Math.min(fetchCount - 25, 25) : 0;

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
        const quartile = getJournalQuartile(item);
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
          quartile,
        };
      });

      const filteredItems = quartileFilter
        ? items.filter((it: any) => it.quartile === quartileFilter)
        : items;

      return NextResponse.json({ ok: true, items: filteredItems.slice(0, targetCount), totalResults });
    } else {
      // Scopus Article / Paper Search API max count per request = 25
      const fetchCount = quartileFilter ? 50 : targetCount;
      const batch1Size = Math.min(fetchCount, 25);
      const batch2Size = fetchCount > 25 ? Math.min(fetchCount - 25, 25) : 0;

      let scopusQuery = cleanQ;
      if (formattedISSN || rawISSN) {
        scopusQuery = `ISSN(${formattedISSN || rawISSN})`;
      } else {
        // Enforce article title focus if type === "article"
        scopusQuery = `TITLE(${cleanQ})`;
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

        const citedCount = parseInt(item["citedby-count"] || "0", 10);
        const quartile = getArticleQuartile(item);

        return {
          id: item["dc:identifier"] || item["eid"] || doi || Math.random().toString(),
          title: item["dc:title"] || "Tanpa Judul Artikel",
          creator: item["dc:creator"] || "Penulis Scopus",
          publicationName: item["prism:publicationName"] || "Jurnal Scopus",
          issn: item["prism:issn"] || item["prism:eIssn"] || "",
          coverDate: cleanYear || coverDate,
          doi,
          doiUrl: doi ? `https://doi.org/${doi}` : "",
          citedByCount: citedCount,
          openAccess: item["openaccess"] === "1" || item["openaccessFlag"] === true,
          subtypeDescription: item["subtypeDescription"] || "Article",
          scopusUrl: scopusLinkObj?.["@href"] || (doi ? `https://doi.org/${doi}` : "https://www.scopus.com"),
          affiliation: affiliation ? `${affiliation}${country ? `, ${country}` : ""}` : "",
          quartile,
        };
      });

      const filteredItems = quartileFilter
        ? items.filter((it: any) => it.quartile === quartileFilter)
        : items;

      return NextResponse.json({ ok: true, items: filteredItems.slice(0, targetCount), totalResults });
    }
  } catch (error: any) {
    console.error("Scopus API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
