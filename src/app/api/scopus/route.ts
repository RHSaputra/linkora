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

function getQuartileFromMetrics(sjr: number, cs: number): string | undefined {
  if (sjr >= 0.8 || cs >= 6.0) return "Q1";
  if (sjr >= 0.40 || cs >= 2.5) return "Q2";
  if (sjr >= 0.18 || cs >= 1.0) return "Q3";
  if (sjr > 0 || cs > 0) return "Q4";
  return undefined;
}

function extractJournalMetrics(item: any): { sjr: number; cs: number; quartile: string | undefined } {
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

  return { sjr, cs, quartile: getQuartileFromMetrics(sjr, cs) };
}

async function fetchMetricsForArticleList(
  entries: any[],
  apiKey: string
): Promise<Map<string, { sjr: number; cs: number; quartile: string | undefined }>> {
  const metricsMap = new Map<string, { sjr: number; cs: number; quartile: string | undefined }>();
  if (!entries.length) return metricsMap;

  const lookupTasks: { key: string; param: string }[] = [];
  const seenKeys = new Set<string>();

  for (const item of entries) {
    const issn = (item["prism:issn"] || item["prism:eIssn"] || "").trim();
    const pubName = (item["prism:publicationName"] || "").trim();

    if (issn && !seenKeys.has(issn)) {
      seenKeys.add(issn);
      lookupTasks.push({ key: issn, param: `issn=${encodeURIComponent(issn)}` });
    }
    if (pubName && !seenKeys.has(pubName)) {
      seenKeys.add(pubName);
      lookupTasks.push({ key: pubName, param: `title=${encodeURIComponent(pubName)}` });
    }
  }

  const promises = lookupTasks.map(async (task) => {
    const url = `https://api.elsevier.com/content/serial/title?${task.param}&count=1`;
    const res = await fetchScopusChunk(url, apiKey);
    if (res.ok && res.data["serial-metadata-response"]?.entry?.[0]) {
      const entry = res.data["serial-metadata-response"].entry[0];
      metricsMap.set(task.key, extractJournalMetrics(entry));
    }
  });

  await Promise.all(promises);
  return metricsMap;
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
    const effectiveQ = cleanQ || (type === "journal" ? "technology" : "research");

    const startIndex = (page - 1) * targetCount;

    // Check if query is an ISSN (e.g. 2502-0714 or 25020714)
    const issnMatch = effectiveQ.match(/^(\d{4})-?(\d{3}[\dX])$/i);
    const formattedISSN = issnMatch ? `${issnMatch[1]}-${issnMatch[2]}` : null;
    const rawISSN = issnMatch ? `${issnMatch[1]}${issnMatch[2]}` : null;

    if (type === "journal") {
      // Elsevier Serial Title API max count per request = 25
      const fetchCount = quartileFilter ? 50 : targetCount;
      const batch1Size = Math.min(fetchCount, 25);
      const batch2Size = fetchCount > 25 ? Math.min(fetchCount - 25, 25) : 0;

      const paramKey = formattedISSN ? `issn=${encodeURIComponent(formattedISSN)}` : `title=${encodeURIComponent(effectiveQ)}`;
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
        const { quartile } = extractJournalMetrics(item);
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
        scopusQuery = `TITLE(${effectiveQ})`;
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

      const metricsMap = await fetchMetricsForArticleList(rawEntries, apiKey);

      const items = rawEntries.map((item: any) => {
        const scopusLinkObj = item.link?.find((l: any) => l["@ref"] === "scopus");
        const affiliation = item.affiliation?.[0]?.["affilname"] || "";
        const country = item.affiliation?.[0]?.["affiliation-country"] || "";
        const doi = item["prism:doi"] || "";
        const issn = item["prism:issn"] || item["prism:eIssn"] || "";
        const pubName = (item["prism:publicationName"] || "").trim();

        let cleanYear = "";
        const coverDate = item["prism:coverDate"] || item["prism:coverDisplayDate"] || "";
        if (coverDate) {
          const yearMatch = coverDate.match(/\b(19|20)\d{2}\b/);
          cleanYear = yearMatch ? yearMatch[0] : coverDate.split("-")[0];
        }

        const citedCount = parseInt(item["citedby-count"] || "0", 10);
        const journalMetric = metricsMap.get(issn) || metricsMap.get(pubName);
        const quartile = journalMetric?.quartile;

        return {
          id: item["dc:identifier"] || item["eid"] || doi || Math.random().toString(),
          title: item["dc:title"] || "Tanpa Judul Artikel",
          creator: item["dc:creator"] || "Penulis Scopus",
          publicationName: item["prism:publicationName"] || "Jurnal Scopus",
          issn,
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
