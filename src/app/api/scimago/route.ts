import { NextRequest, NextResponse } from "next/server";

export interface ScimagoItem {
  id: string;
  rank: number;
  title: string;
  quartile: string; // "Q1" | "Q2" | "Q3" | "Q4"
  sjr: string;
  hIndex: number;
  publisher: string;
  issn: string;
  area: string;
  totalDocs?: number;
  totalCites?: number;
  scimagoUrl: string;
}

const SCIMAGO_INDONESIA_DATABASE: ScimagoItem[] = [
  { id: "sjr-1", rank: 1, title: "International Journal of Electrical and Computer Engineering (IJECE)", quartile: "Q2", sjr: "0.58", hIndex: 45, publisher: "IAES / Institute of Advanced Engineering and Science", issn: "2088-8708", area: "Engineering / Computer Science", totalDocs: 1450, totalCites: 8420, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-2", rank: 2, title: "TELKOMNIKA (Telecommunication Computing Electronics and Control)", quartile: "Q2", sjr: "0.50", hIndex: 40, publisher: "Universitas Ahmad Dahlan", issn: "1693-6930", area: "Engineering / Telecommunications", totalDocs: 980, totalCites: 5210, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-3", rank: 3, title: "International Journal of Renewable Energy Development", quartile: "Q2", sjr: "0.65", hIndex: 28, publisher: "Universitas Diponegoro", issn: "2252-4940", area: "Energy / Renewable Energy", totalDocs: 420, totalCites: 2850, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-4", rank: 4, title: "IAES International Journal of Artificial Intelligence", quartile: "Q2", sjr: "0.55", hIndex: 22, publisher: "Intelektual Pustaka Media Utama", issn: "2252-8938", area: "Computer Science / AI", totalDocs: 560, totalCites: 1940, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-5", rank: 5, title: "Indonesian Biomedical Journal", quartile: "Q2", sjr: "0.52", hIndex: 25, publisher: "ProDia Education and Research Institute", issn: "2085-3297", area: "Medicine & Biochemistry", totalDocs: 310, totalCites: 1820, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-6", rank: 6, title: "Bulletin of Electrical Engineering and Informatics", quartile: "Q3", sjr: "0.48", hIndex: 26, publisher: "Universitas Ahmad Dahlan", issn: "2089-3191", area: "Electrical Engineering", totalDocs: 640, totalCites: 2980, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-7", rank: 7, title: "Indonesian Journal of Pharmacy", quartile: "Q3", sjr: "0.42", hIndex: 20, publisher: "Universitas Gadjah Mada", issn: "2338-9486", area: "Pharmacology & Pharmacy", totalDocs: 290, totalCites: 1450, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-8", rank: 8, title: "Atom Indonesia", quartile: "Q3", sjr: "0.38", hIndex: 15, publisher: "BATAN / BRIN Indonesia", issn: "0126-1568", area: "Nuclear Science & Physics", totalDocs: 210, totalCites: 940, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-9", rank: 9, title: "Biodiversitas Journal of Biological Diversity", quartile: "Q3", sjr: "0.36", hIndex: 30, publisher: "Society for Indonesian Biodiversity", issn: "1412-033X", area: "Agricultural & Biological Sciences", totalDocs: 1850, totalCites: 6890, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-10", rank: 10, title: "Indonesian Journal of Chemistry", quartile: "Q3", sjr: "0.35", hIndex: 24, publisher: "Universitas Gadjah Mada", issn: "1411-9420", area: "Chemistry & Chemical Engineering", totalDocs: 820, totalCites: 3120, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-11", rank: 11, title: "Agrivita Journal of Agricultural Science", quartile: "Q3", sjr: "0.34", hIndex: 22, publisher: "Universitas Brawijaya", issn: "0126-0537", area: "Agricultural Sciences", totalDocs: 490, totalCites: 1980, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-12", rank: 12, title: "Journal of ICT Research and Applications", quartile: "Q3", sjr: "0.32", hIndex: 14, publisher: "Institut Teknologi Bandung (ITB)", issn: "2337-5787", area: "Computer Science & ICT", totalDocs: 180, totalCites: 750, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-13", rank: 13, title: "Journal of Engineering and Technological Sciences", quartile: "Q3", sjr: "0.31", hIndex: 19, publisher: "Institut Teknologi Bandung (ITB)", issn: "2337-5779", area: "Engineering & Technology", totalDocs: 340, totalCites: 1420, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-14", rank: 14, title: "Journal of Mathematical and Fundamental Sciences", quartile: "Q3", sjr: "0.30", hIndex: 18, publisher: "Institut Teknologi Bandung (ITB)", issn: "2337-5760", area: "Multidisciplinary Mathematics", totalDocs: 280, totalCites: 1180, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-15", rank: 15, title: "Jurnal Ilmu Komputer dan Informasi", quartile: "Q4", sjr: "0.28", hIndex: 12, publisher: "Universitas Indonesia", issn: "2502-9274", area: "Computer Science & IT", totalDocs: 190, totalCites: 620, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-16", rank: 16, title: "Critical Care and Shock", quartile: "Q4", sjr: "0.25", hIndex: 16, publisher: "Indonesian Society of Critical Care Medicine", issn: "1410-7767", area: "Medicine & Critical Care", totalDocs: 220, totalCites: 780, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-17", rank: 17, title: "Bali Medical Journal", quartile: "Q4", sjr: "0.22", hIndex: 15, publisher: "DiscoverSys / Udayana", issn: "2089-1180", area: "Medicine & Health", totalDocs: 740, totalCites: 1890, scimagoUrl: "https://www.scimagojr.com/" },
  { id: "sjr-18", rank: 18, title: "Kukila - Journal of Indonesian Ornithology", quartile: "Q4", sjr: "0.20", hIndex: 10, publisher: "Indonesian Ornithologists' Union", issn: "0216-938X", area: "Zoology & Ecology", totalDocs: 110, totalCites: 390, scimagoUrl: "https://www.scimagojr.com/" }
];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const quartile = (url.searchParams.get("quartile") || "").trim().toUpperCase();
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);

    let filtered = SCIMAGO_INDONESIA_DATABASE;

    if (quartile && quartile !== "ALL") {
      filtered = filtered.filter((item) => item.quartile === quartile);
    }

    if (q) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.publisher.toLowerCase().includes(q) ||
          item.issn.toLowerCase().includes(q) ||
          item.area.toLowerCase().includes(q)
      );
    }

    const totalResults = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      items,
      totalResults,
      page,
      perPage: limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses data SCImago" },
      { status: 500 }
    );
  }
}
