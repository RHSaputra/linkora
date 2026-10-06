import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const html = `<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SCImago Journal Rank Indonesia (SJR)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-6 md:p-8">
  <div class="max-w-7xl mx-auto space-y-6">
    
    <!-- Top Header Banner -->
    <div class="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/20 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            SJR Official Index
          </span>
          <span class="text-xs font-semibold text-slate-400">• Country: Indonesia (ID)</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>SCImago Journal &amp; Country Rank</span>
        </h1>
        <p class="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Direktori peringkat &amp; indikator ilmiah jurnal terakreditasi Scopus Indonesia berdasarkan SJR Indicator, Quartile (Q1–Q4), dan H-Index.
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <div class="px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div class="text-xs font-bold text-amber-400">Total Jurnal</div>
          <div class="text-lg font-black text-white" id="totalCount">120+</div>
        </div>
      </div>
    </div>

    <!-- Controls: Search & Quartile Filter Bar -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
      <div class="w-full md:w-96 relative">
        <input
          type="text"
          id="searchInput"
          placeholder="Cari nama jurnal, ISSN, atau penerbit..."
          class="w-full h-10 pl-10 pr-4 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
        />
        <svg class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>

      <!-- Quartile Filter Tabs -->
      <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
        <button onclick="filterQuartile('ALL')" class="q-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-amber-600 text-white" data-q="ALL">Semua Quartile</button>
        <button onclick="filterQuartile('Q1')" class="q-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-800 text-slate-300 hover:text-white" data-q="Q1">Q1</button>
        <button onclick="filterQuartile('Q2')" class="q-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-800 text-slate-300 hover:text-white" data-q="Q2">Q2</button>
        <button onclick="filterQuartile('Q3')" class="q-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-800 text-slate-300 hover:text-white" data-q="Q3">Q3</button>
        <button onclick="filterQuartile('Q4')" class="q-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-800 text-slate-300 hover:text-white" data-q="Q4">Q4</button>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th class="py-3.5 px-4 w-12 text-center">#</th>
              <th class="py-3.5 px-4">Judul Jurnal Indonesia</th>
              <th class="py-3.5 px-4 text-center">Quartile</th>
              <th class="py-3.5 px-4 text-center">SJR Score</th>
              <th class="py-3.5 px-4 text-center">H-Index</th>
              <th class="py-3.5 px-4">Penerbit / Institusi</th>
              <th class="py-3.5 px-4">ISSN</th>
            </tr>
          </thead>
          <tbody id="journalTableBody" class="divide-y divide-slate-800/60 text-xs">
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <script>
    const journals = [
      { rank: 1, title: "International Journal of Electrical and Computer Engineering (IJECE)", quartile: "Q2", sjr: "0.58", hIndex: 45, publisher: "IAES / Institute of Advanced Engineering and Science", issn: "2088-8708", area: "Engineering / Computer Science" },
      { rank: 2, title: "TELKOMNIKA (Telecommunication Computing Electronics and Control)", quartile: "Q2", sjr: "0.50", hIndex: 40, publisher: "Universitas Ahmad Dahlan", issn: "1693-6930", area: "Engineering / Telecommunications" },
      { rank: 3, title: "International Journal of Renewable Energy Development", quartile: "Q2", sjr: "0.65", hIndex: 28, publisher: "Universitas Diponegoro", issn: "2252-4940", area: "Energy / Renewable Energy" },
      { rank: 4, title: "IAES International Journal of Artificial Intelligence", quartile: "Q2", sjr: "0.55", hIndex: 22, publisher: "Intelektual Pustaka Media Utama", issn: "2252-8938", area: "Computer Science / AI" },
      { rank: 5, title: "Bulletin of Electrical Engineering and Informatics", quartile: "Q3", sjr: "0.48", hIndex: 26, publisher: "Universitas Ahmad Dahlan", issn: "2089-3191", area: "Electrical Engineering" },
      { rank: 6, title: "Indonesian Journal of Pharmacy", quartile: "Q3", sjr: "0.42", hIndex: 20, publisher: "Universitas Gadjah Mada", issn: "2338-9486", area: "Pharmacology & Pharmacy" },
      { rank: 7, title: "Atom Indonesia", quartile: "Q3", sjr: "0.38", hIndex: 15, publisher: "BATAN / BRIN Indonesia", issn: "0126-1568", area: "Nuclear Science & Physics" },
      { rank: 8, title: "Biodiversitas Journal of Biological Diversity", quartile: "Q3", sjr: "0.36", hIndex: 30, publisher: "Society for Indonesian Biodiversity", issn: "1412-033X", area: "Agricultural & Biological Sciences" },
      { rank: 9, title: "Indonesian Journal of Chemistry", quartile: "Q3", sjr: "0.35", hIndex: 24, publisher: "Universitas Gadjah Mada", issn: "1411-9420", area: "Chemistry & Chemical Engineering" },
      { rank: 10, title: "Journal of ICT Research and Applications", quartile: "Q3", sjr: "0.32", hIndex: 14, publisher: "Institut Teknologi Bandung (ITB)", issn: "2337-5787", area: "Computer Science & ICT" },
      { rank: 11, title: "Journal of Mathematical and Fundamental Sciences", quartile: "Q3", sjr: "0.30", hIndex: 18, publisher: "Institut Teknologi Bandung (ITB)", issn: "2337-5760", area: "Multidisciplinary Mathematics" },
      { rank: 12, title: "Jurnal Ilmu Komputer dan Informasi", quartile: "Q4", sjr: "0.28", hIndex: 12, publisher: "Universitas Indonesia", issn: "2502-9274", area: "Computer Science & IT" },
      { rank: 13, title: "Critical Care and Shock", quartile: "Q4", sjr: "0.25", hIndex: 16, publisher: "Indonesian Society of Critical Care Medicine", issn: "1410-7767", area: "Medicine & Critical Care" },
      { rank: 14, title: "Kukila - Journal of Indonesian Ornithology", quartile: "Q4", sjr: "0.20", hIndex: 10, publisher: "Indonesian Ornithologists' Union", issn: "0216-938X", area: "Zoology & Ecology" },
      { rank: 15, title: "Agrivita Journal of Agricultural Science", quartile: "Q3", sjr: "0.34", hIndex: 22, publisher: "Universitas Brawijaya", issn: "0126-0537", area: "Agricultural Sciences" },
      { rank: 16, title: "Indonesian Biomedical Journal", quartile: "Q2", sjr: "0.52", hIndex: 25, publisher: "ProDia Education and Research Institute", issn: "2085-3297", area: "Medicine & Biochemistry" },
      { rank: 17, title: "Bali Medical Journal", quartile: "Q4", sjr: "0.22", hIndex: 15, publisher: "DiscoverSys / Udayana", issn: "2089-1180", area: "Medicine & Health" },
      { rank: 18, title: "Journal of Engineering and Technological Sciences", quartile: "Q3", sjr: "0.31", hIndex: 19, publisher: "Institut Teknologi Bandung (ITB)", issn: "2337-5779", area: "Engineering & Technology" }
    ];

    let currentQuartile = 'ALL';
    let searchQuery = '';

    function getQuartileBadge(q) {
      if (q === 'Q1') return '<span class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Q1</span>';
      if (q === 'Q2') return '<span class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Q2</span>';
      if (q === 'Q3') return '<span class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">Q3</span>';
      return '<span class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-700/60 text-slate-300 border border-slate-600/50">Q4</span>';
    }

    function renderTable() {
      const tbody = document.getElementById('journalTableBody');
      const filtered = journals.filter(j => {
        const matchesQ = currentQuartile === 'ALL' || j.quartile === currentQuartile;
        const matchesSearch = !searchQuery || 
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.issn.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesQ && matchesSearch;
      });

      document.getElementById('totalCount').textContent = filtered.length;

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="py-12 text-center text-slate-500 font-medium">Tidak ada jurnal SCImago yang cocok dengan pencarian Anda.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map((item, idx) => \`
        <tr class="hover:bg-slate-800/40 transition-colors">
          <td class="py-3.5 px-4 text-center font-bold text-slate-500 font-mono">\${idx + 1}</td>
          <td class="py-3.5 px-4 font-bold text-white">
            <div class="line-clamp-2">\${item.title}</div>
            <div class="text-[10px] font-normal text-amber-400/90 mt-0.5">\${item.area}</div>
          </td>
          <td class="py-3.5 px-4 text-center">\${getQuartileBadge(item.quartile)}</td>
          <td class="py-3.5 px-4 text-center font-mono font-bold text-amber-400">\${item.sjr}</td>
          <td class="py-3.5 px-4 text-center font-mono font-semibold text-slate-300">\${item.hIndex}</td>
          <td class="py-3.5 px-4 text-slate-300">\${item.publisher}</td>
          <td class="py-3.5 px-4 font-mono text-slate-400 text-[11px]">\${item.issn}</td>
        </tr>
      \`).join('');
    }

    function filterQuartile(q) {
      currentQuartile = q;
      document.querySelectorAll('.q-btn').forEach(btn => {
        if (btn.getAttribute('data-q') === q) {
          btn.className = 'q-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-amber-600 text-white';
        } else {
          btn.className = 'q-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-800 text-slate-300 hover:text-white';
        }
      });
      renderTable();
    }

    document.getElementById('searchInput').addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderTable();
    });

    renderTable();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
