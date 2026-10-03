"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Search,
  BookOpen,
  ExternalLink,
  BookmarkPlus,
  Check,
  Loader2,
  Building2,
  Award,
  FileText,
  Globe,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Library,
  Quote,
  ShieldCheck,
  BrainCircuit,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/components/providers/i18n-provider";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useCollections, dispatchRefresh } from "@/hooks/use-data";
import { toast } from "@/components/ui/custom-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ScopusItem {
  id: string;
  title: string;
  creator?: string;
  publicationName?: string;
  issn?: string;
  coverDate?: string;
  doi?: string;
  doiUrl?: string;
  citedByCount?: number;
  openAccess?: boolean;
  subtypeDescription?: string;
  scopusUrl: string;
  affiliation?: string;
  publisher?: string;
  coverageStartYear?: string;
  coverageEndYear?: string;
  subjectAreas?: string[];
  aggregationType?: string;
}

interface SintaItem {
  id: string;
  title: string;
  sintaRating: string;
  websiteUrl: string;
  sintaProfileUrl: string;
  institution: string;
  issnText: string;
  impact: string;
  h5Index: string;
  citations5yr: string;
  citationsTotal: string;
}

interface GarudaItem {
  id: string;
  title: string;
  author: string;
  journalInfo: string;
  publisher: string;
  garudaUrl: string;
  downloadUrl: string;
  doiUrl: string;
  abstractText: string;
}

interface SemanticItem {
  id: string;
  title: string;
  authors: string;
  year: string;
  venue: string;
  abstractText: string;
  citationCount: number;
  isOpenAccess: boolean;
  openAccessPdfUrl: string;
  semanticUrl: string;
  doiUrl: string;
}

interface ScholarItem {
  id: string;
  title: string;
  authorJournalText: string;
  snippetText: string;
  scholarUrl: string;
  pdfUrl: string;
  citationsCount: number;
}

export function ScopusPage() {
  const { t, locale } = useTranslation();
  const isEn = locale === "en";
  const { requireAuth } = useRequireAuth();
  const { collections } = useCollections();

  // Provider Tab: "scopus" | "sinta" | "garuda" | "semantic" | "scholar"
  const [provider, setProvider] = useState<
    "scopus" | "sinta" | "garuda" | "semantic" | "scholar"
  >("scopus");

  // Scopus State
  const [scopusSubTab, setScopusSubTab] = useState<"article" | "journal">("article");
  const [scopusQuery, setScopusQuery] = useState("machine learning");
  const [activeScopusQuery, setActiveScopusQuery] = useState("machine learning");
  const [scopusPage, setScopusPage] = useState(1);
  const [scopusLoading, setScopusLoading] = useState(false);
  const [scopusItems, setScopusItems] = useState<ScopusItem[]>([]);
  const [scopusTotalResults, setScopusTotalResults] = useState(0);
  const [scopusErrorMsg, setScopusErrorMsg] = useState<string | null>(null);

  // SINTA State
  const [sintaQuery, setSintaQuery] = useState("teknologi");
  const [activeSintaQuery, setActiveSintaQuery] = useState("teknologi");
  const [sintaLevel, setSintaLevel] = useState<string>("");
  const [sintaPage, setSintaPage] = useState(1);
  const [sintaLoading, setSintaLoading] = useState(false);
  const [sintaHasMore, setSintaHasMore] = useState(true);
  const [sintaItems, setSintaItems] = useState<SintaItem[]>([]);
  const [sintaErrorMsg, setSintaErrorMsg] = useState<string | null>(null);

  // GARUDA State
  const [garudaQuery, setGarudaQuery] = useState("teknologi");
  const [activeGarudaQuery, setActiveGarudaQuery] = useState("teknologi");
  const [garudaPage, setGarudaPage] = useState(1);
  const [garudaLoading, setGarudaLoading] = useState(false);
  const [garudaHasMore, setGarudaHasMore] = useState(true);
  const [garudaItems, setGarudaItems] = useState<GarudaItem[]>([]);
  const [garudaErrorMsg, setGarudaErrorMsg] = useState<string | null>(null);

  // Semantic Scholar State
  const [semanticQuery, setSemanticQuery] = useState("artificial intelligence");
  const [activeSemanticQuery, setActiveSemanticQuery] = useState("artificial intelligence");
  const [semanticPage, setSemanticPage] = useState(1);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticItems, setSemanticItems] = useState<SemanticItem[]>([]);
  const [semanticTotalResults, setSemanticTotalResults] = useState(0);
  const [semanticErrorMsg, setSemanticErrorMsg] = useState<string | null>(null);

  // Google Scholar State
  const [scholarQuery, setScholarQuery] = useState("sistem informasi");
  const [activeScholarQuery, setActiveScholarQuery] = useState("sistem informasi");
  const [scholarPage, setScholarPage] = useState(1);
  const [scholarLoading, setScholarLoading] = useState(false);
  const [scholarHasMore, setScholarHasMore] = useState(true);
  const [scholarItems, setScholarItems] = useState<ScholarItem[]>([]);
  const [scholarErrorMsg, setScholarErrorMsg] = useState<string | null>(null);

  // Save Modal State
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<{
    id: string;
    title: string;
    url: string;
    desc: string;
  } | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [savingLink, setSavingLink] = useState(false);
  const [savedLinkIds, setSavedLinkIds] = useState<Record<string, boolean>>({});

  // ── Scopus Data Fetcher ──
  const fetchScopusData = useCallback(
    async (q: string, activeTab: "article" | "journal", pageNum: number) => {
      if (!q.trim()) return;
      setScopusLoading(true);
      setScopusErrorMsg(null);
      try {
        const res = await fetch(
          `/api/scopus?q=${encodeURIComponent(q.trim())}&type=${activeTab}&page=${pageNum}&count=12`
        );
        const data = await res.json();
        if (res.ok && data.ok) {
          setScopusItems(data.items || []);
          setScopusTotalResults(data.totalResults || 0);
        } else {
          setScopusErrorMsg(data.error || "Gagal mengambil data dari Scopus API");
          setScopusItems([]);
        }
      } catch (err: any) {
        console.error(err);
        setScopusErrorMsg("Gagal terhubung ke layanan Scopus API");
      } finally {
        setScopusLoading(false);
      }
    },
    []
  );

  // ── SINTA Scraper Fetcher ──
  const fetchSintaData = useCallback(async (q: string, level: string, pageNum: number) => {
    setSintaLoading(true);
    setSintaErrorMsg(null);
    try {
      const res = await fetch(
        `/api/sinta?q=${encodeURIComponent(q.trim())}&sinta=${level}&page=${pageNum}`
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        setSintaItems(data.items || []);
        setSintaHasMore(data.hasMore ?? (data.items?.length >= 10));
      } else {
        setSintaErrorMsg(data.error || "Gagal mengambil data jurnal SINTA");
      }
    } catch (err: any) {
      console.error(err);
      setSintaErrorMsg("Gagal terhubung ke server scraper SINTA");
    } finally {
      setSintaLoading(false);
    }
  }, []);

  // ── GARUDA Scraper Fetcher ──
  const fetchGarudaData = useCallback(async (q: string, pageNum: number) => {
    if (!q.trim()) return;
    setGarudaLoading(true);
    setGarudaErrorMsg(null);
    try {
      const res = await fetch(
        `/api/garuda?q=${encodeURIComponent(q.trim())}&page=${pageNum}`
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        setGarudaItems(data.items || []);
        setGarudaHasMore(data.hasMore ?? (data.items?.length >= 10));
      } else {
        setGarudaErrorMsg(data.error || "Gagal mengambil data dari GARUDA");
      }
    } catch (err: any) {
      console.error(err);
      setGarudaErrorMsg("Gagal terhubung ke portal GARUDA Kemdiktisaintek");
    } finally {
      setGarudaLoading(false);
    }
  }, []);

  // ── Semantic Scholar Fetcher ──
  const fetchSemanticData = useCallback(async (q: string, pageNum: number) => {
    if (!q.trim()) return;
    setSemanticLoading(true);
    setSemanticErrorMsg(null);
    try {
      const res = await fetch(
        `/api/semantic?q=${encodeURIComponent(q.trim())}&page=${pageNum}&count=12`
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        setSemanticItems(data.items || []);
        setSemanticTotalResults(data.totalResults || 0);
      } else {
        setSemanticErrorMsg(data.error || "Gagal mengambil data dari Semantic Scholar API");
      }
    } catch (err: any) {
      console.error(err);
      setSemanticErrorMsg("Gagal terhubung ke Semantic Scholar API");
    } finally {
      setSemanticLoading(false);
    }
  }, []);

  // ── Google Scholar Fetcher ──
  const fetchScholarData = useCallback(async (q: string, pageNum: number) => {
    if (!q.trim()) return;
    setScholarLoading(true);
    setScholarErrorMsg(null);
    try {
      const res = await fetch(
        `/api/scholar?q=${encodeURIComponent(q.trim())}&page=${pageNum}`
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        setScholarItems(data.items || []);
        setScholarHasMore(data.hasMore ?? (data.items?.length >= 10));
      } else {
        setScholarErrorMsg(data.error || "Gagal mengambil pencarian Google Scholar");
      }
    } catch (err: any) {
      console.error(err);
      setScholarErrorMsg("Gagal terhubung ke Google Scholar");
    } finally {
      setScholarLoading(false);
    }
  }, []);

  useEffect(() => {
    if (provider === "scopus") {
      fetchScopusData(activeScopusQuery, scopusSubTab, scopusPage);
    } else if (provider === "sinta") {
      fetchSintaData(activeSintaQuery, sintaLevel, sintaPage);
    } else if (provider === "garuda") {
      fetchGarudaData(activeGarudaQuery, garudaPage);
    } else if (provider === "semantic") {
      fetchSemanticData(activeSemanticQuery, semanticPage);
    } else if (provider === "scholar") {
      fetchScholarData(activeScholarQuery, scholarPage);
    }
  }, [
    provider,
    activeScopusQuery,
    scopusSubTab,
    scopusPage,
    activeSintaQuery,
    sintaLevel,
    sintaPage,
    activeGarudaQuery,
    garudaPage,
    activeSemanticQuery,
    semanticPage,
    activeScholarQuery,
    scholarPage,
    fetchScopusData,
    fetchSintaData,
    fetchGarudaData,
    fetchSemanticData,
    fetchScholarData,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (provider === "scopus") {
      if (!scopusQuery.trim()) return;
      setScopusPage(1);
      setActiveScopusQuery(scopusQuery.trim());
    } else if (provider === "sinta") {
      setSintaPage(1);
      setActiveSintaQuery(sintaQuery.trim());
    } else if (provider === "garuda") {
      setGarudaPage(1);
      setActiveGarudaQuery(garudaQuery.trim());
    } else if (provider === "semantic") {
      setSemanticPage(1);
      setActiveSemanticQuery(semanticQuery.trim());
    } else if (provider === "scholar") {
      setScholarPage(1);
      setActiveScholarQuery(scholarQuery.trim());
    }
  };

  const openSaveModal = (id: string, title: string, url: string, desc: string) => {
    if (
      requireAuth(
        isEn ? "Save Research Item" : "Simpan Referensi Riset",
        isEn
          ? "Sign in to save research papers and journals to your Linkora library."
          : "Masuk untuk menyimpan artikel riset & jurnal langsung ke pustaka Linkora Anda."
      )
    ) {
      return;
    }
    setTargetItem({ id, title, url, desc });
    setSelectedCollectionId("");
    setSaveModalOpen(true);
  };

  const handleSaveToLinkora = async () => {
    if (!targetItem) return;

    try {
      setSavingLink(true);
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetItem.url,
          title: targetItem.title,
          description: targetItem.desc,
          category: "Riset & Jurnal",
          collectionId: selectedCollectionId || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.id) {
        setSavedLinkIds((prev) => ({ ...prev, [targetItem.id]: true }));
        dispatchRefresh(["links", "collections", "dashboard"], false);
        toast.success(
          isEn ? `"${targetItem.title}" saved to Linkora!` : `"${targetItem.title}" berhasil disimpan ke Linkora!`,
          isEn ? "Saved to Library" : "Tersimpan di Linkora"
        );
        setSaveModalOpen(false);
      } else {
        toast.error(data.error || (isEn ? "Failed to save link" : "Gagal menyimpan link"), "Error");
      }
    } catch (err) {
      console.error(err);
      toast.error(isEn ? "Failed to save link" : "Gagal menyimpan link ke Linkora", "Error");
    } finally {
      setSavingLink(false);
    }
  };

  const presets = [
    "Artificial Intelligence",
    "Machine Learning",
    "Renewable Energy",
    "Biotechnology",
    "Data Science",
    "Cybersecurity",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-primary/20 bg-gradient-to-br from-primary/10 via-slate-50 to-primary/5 dark:from-primary/20 dark:via-slate-900 dark:to-slate-900/60 shadow-xl backdrop-blur-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/20 dark:bg-primary/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold shadow-xs">
            <GraduationCap className="w-4 h-4" />
            <span>Pusat Riset Ilmiah Multi-Sumber • Academic Research Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
            Pusat Riset Ilmiah (Scopus, SINTA, GARUDA & Scholar)
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Eksplorasi artikel ilmiah, jurnal bereputasi internasional (Scopus & Semantic Scholar), jurnal terakreditasi nasional (SINTA S1–S6), portal garba rujukan (GARUDA Kemdiktisaintek), dan Google Scholar dalam satu tempat.
          </p>

          {/* Top Provider Selector Tabs (5 Providers) */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setProvider("scopus")}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                provider === "scopus"
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                  : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>🎓 Scopus API</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider("sinta")}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                provider === "sinta"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-102"
                  : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>🇮🇩 SINTA (S1-S6)</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider("garuda")}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                provider === "garuda"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md scale-102"
                  : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Library className="w-4 h-4" />
              <span>📚 GARUDA</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider("semantic")}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                provider === "semantic"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md scale-102"
                  : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground"
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>🧠 Semantic Scholar</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider("scholar")}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                provider === "scholar"
                  ? "bg-amber-600 text-white border-amber-600 shadow-md scale-102"
                  : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📖 Google Scholar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 1. SCOPUS SECTION ── */}
      {provider === "scopus" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono mr-1">
              Topik Scopus:
            </span>
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setScopusQuery(preset);
                  setScopusPage(1);
                  setActiveScopusQuery(preset);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  activeScopusQuery.toLowerCase() === preset.toLowerCase()
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-foreground hover:border-primary/50"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setScopusSubTab("article");
                  setScopusPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  scopusSubTab === "article"
                    ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Artikel & Paper</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setScopusSubTab("journal");
                  setScopusPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  scopusSubTab === "journal"
                    ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Direktori Jurnal</span>
              </button>
            </div>

            {scopusTotalResults > 0 && (
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>Ditemukan {scopusTotalResults.toLocaleString()} hasil Scopus</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-muted-foreground pointer-events-none" />
            <Input
              value={scopusQuery}
              onChange={(e) => setScopusQuery(e.target.value)}
              placeholder={
                scopusSubTab === "article"
                  ? "Cari artikel Scopus berdasarkan judul, DOI, atau penulis..."
                  : "Cari jurnal Scopus berdasarkan nama atau penerbit..."
              }
              className="pl-12 pr-28 h-12 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900 border-primary/20 shadow-md focus:border-primary transition-all"
            />
            <Button
              type="submit"
              disabled={scopusLoading}
              className="absolute right-1.5 h-9.5 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              {scopusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari Scopus"}
            </Button>
          </form>

          {scopusErrorMsg && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm font-medium flex items-center gap-3">
              <Info className="w-5 h-5 shrink-0" />
              <span>{scopusErrorMsg}</span>
            </div>
          )}

          {scopusLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-700/60" />
              ))}
            </div>
          ) : scopusItems.length === 0 && !scopusErrorMsg ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <Library className="w-12 h-12 mx-auto text-muted-foreground/40" />
              <h3 className="text-base font-bold text-foreground">Tidak ada data Scopus ditemukan</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {scopusItems.map((item) => {
                const isSaved = savedLinkIds[item.id];
                return (
                  <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-primary/40 transition-all duration-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider font-mono">
                          {item.subtypeDescription || item.aggregationType || "Scopus Indexed"}
                        </span>
                        {item.openAccess && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            <Globe className="w-3 h-3" />
                            <span>Open Access</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                        <a href={item.doiUrl || item.scopusUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-start gap-1.5">
                          <span>{item.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-primary" />
                        </a>
                      </h3>

                      <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                        {item.creator && (
                          <p className="flex items-center gap-1.5 font-medium truncate">
                            <Quote className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                            <span className="truncate">{item.creator}</span>
                          </p>
                        )}
                        {item.publicationName && (
                          <p className="flex items-center gap-1.5 font-medium truncate text-foreground/80">
                            <BookOpen className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                            <span className="truncate">{item.publicationName}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                        {item.citedByCount !== undefined && (
                          <span className="flex items-center gap-1 text-primary font-bold bg-primary/10 px-2 py-1 rounded-md text-[11px]">
                            <Award className="w-3.5 h-3.5" />
                            <span>{item.citedByCount} Citations</span>
                          </span>
                        )}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant={isSaved ? "outline" : "default"}
                        disabled={isSaved}
                        onClick={() => openSaveModal(item.id, item.title, item.doiUrl || item.scopusUrl, `[Scopus] ${item.publicationName || ''}`)}
                        className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-primary text-primary-foreground"}`}
                      >
                        {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 2. SINTA SECTION ── */}
      {provider === "sinta" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono mr-1">
              Filter Peringkat SINTA:
            </span>
            <button
              type="button"
              onClick={() => { setSintaLevel(""); setSintaPage(1); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${sintaLevel === "" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
            >
              Semua SINTA
            </button>
            {["1", "2", "3", "4", "5", "6"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => { setSintaLevel(lvl); setSintaPage(1); }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${sintaLevel === lvl ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
              >
                SINTA {lvl} (S{lvl})
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-muted-foreground pointer-events-none" />
            <Input
              value={sintaQuery}
              onChange={(e) => setSintaQuery(e.target.value)}
              placeholder="Cari jurnal SINTA berdasarkan nama jurnal, universitas, atau kata kunci..."
              className="pl-12 pr-28 h-12 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900 border-emerald-500/30 shadow-md focus:border-emerald-500 transition-all"
            />
            <Button type="submit" disabled={sintaLoading} className="absolute right-1.5 h-9.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer">
              {sintaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari SINTA"}
            </Button>
          </form>

          {sintaLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-700/60" />)}
            </div>
          ) : sintaItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500/40" />
              <h3 className="text-base font-bold text-foreground">Tidak ada jurnal SINTA ditemukan</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {sintaItems.map((item) => {
                const isSaved = savedLinkIds[item.id];
                return (
                  <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-emerald-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-emerald-500/50 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs tracking-wider border border-emerald-500/30">
                          <ShieldCheck className="w-4 h-4" />
                          <span>{item.sintaRating} Accredited</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono truncate">{item.issnText}</span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-emerald-600 transition-colors">
                        <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-start gap-1.5">
                          <span>{item.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-emerald-600" />
                        </a>
                      </h3>

                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600/70 shrink-0" />
                        <span className="truncate">{item.institution}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-semibold">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-muted-foreground text-[10px] block font-mono">Impact Score</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.impact}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-muted-foreground text-[10px] block font-mono">H5-Index</span>
                          <span className="text-foreground font-bold">{item.h5Index}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <a href={item.sintaProfileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1">
                        <span>Profil SINTA</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button
                        type="button"
                        size="sm"
                        variant={isSaved ? "outline" : "default"}
                        disabled={isSaved}
                        onClick={() => openSaveModal(item.id, item.title, item.websiteUrl || item.sintaProfileUrl, `[Akreditasi ${item.sintaRating}] ${item.institution}`)}
                        className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-emerald-600 text-white"}`}
                      >
                        {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. GARUDA SECTION ── */}
      {provider === "garuda" && (
        <div className="space-y-5">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-muted-foreground pointer-events-none" />
            <Input
              value={garudaQuery}
              onChange={(e) => setGarudaQuery(e.target.value)}
              placeholder="Cari artikel ilmiah di Garba Rujukan Digital (GARUDA Kemdiktisaintek)..."
              className="pl-12 pr-28 h-12 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900 border-blue-500/30 shadow-md focus:border-blue-500 transition-all"
            />
            <Button type="submit" disabled={garudaLoading} className="absolute right-1.5 h-9.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer">
              {garudaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari GARUDA"}
            </Button>
          </form>

          {garudaLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-700/60" />)}
            </div>
          ) : garudaItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <Library className="w-12 h-12 mx-auto text-blue-500/40" />
              <h3 className="text-base font-bold text-foreground">Tidak ada artikel GARUDA ditemukan</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {garudaItems.map((item) => {
                const isSaved = savedLinkIds[item.id];
                return (
                  <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-blue-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-blue-500/50 transition-all">
                    <div className="space-y-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase font-mono">
                        GARUDA Rujukan
                      </span>

                      <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors">
                        <a href={item.doiUrl || item.garudaUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-start gap-1.5">
                          <span>{item.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-blue-600" />
                        </a>
                      </h3>

                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
                        <Quote className="w-3.5 h-3.5 text-blue-600/70 shrink-0" />
                        <span className="truncate">{item.author}</span>
                      </p>

                      {item.journalInfo && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <BookOpen className="w-3.5 h-3.5 shrink-0 text-blue-600/70" />
                          <span className="truncate">{item.journalInfo}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      {item.downloadUrl ? (
                        <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Original</span>
                        </a>
                      ) : <span />}

                      <Button
                        type="button"
                        size="sm"
                        variant={isSaved ? "outline" : "default"}
                        disabled={isSaved}
                        onClick={() => openSaveModal(item.id, item.title, item.doiUrl || item.garudaUrl, `[GARUDA] ${item.author} • ${item.journalInfo}`)}
                        className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-blue-600 text-white"}`}
                      >
                        {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 4. SEMANTIC SCHOLAR SECTION ── */}
      {provider === "semantic" && (
        <div className="space-y-5">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-muted-foreground pointer-events-none" />
            <Input
              value={semanticQuery}
              onChange={(e) => setSemanticQuery(e.target.value)}
              placeholder="Cari riset global di Semantic Scholar (AI Powered Academic Graph)..."
              className="pl-12 pr-28 h-12 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900 border-purple-500/30 shadow-md focus:border-purple-500 transition-all"
            />
            <Button type="submit" disabled={semanticLoading} className="absolute right-1.5 h-9.5 px-5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer">
              {semanticLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari Semantic"}
            </Button>
          </form>

          {semanticLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-700/60" />)}
            </div>
          ) : semanticItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <BrainCircuit className="w-12 h-12 mx-auto text-purple-500/40" />
              <h3 className="text-base font-bold text-foreground">Tidak ada paper Semantic Scholar ditemukan</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {semanticItems.map((item) => {
                const isSaved = savedLinkIds[item.id];
                return (
                  <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-purple-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-purple-500/50 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-bold uppercase font-mono">
                          Semantic Graph
                        </span>
                        {item.year && <span className="text-[11px] font-mono text-muted-foreground">{item.year}</span>}
                      </div>

                      <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-purple-600 transition-colors">
                        <a href={item.doiUrl || item.semanticUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-start gap-1.5">
                          <span>{item.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-purple-600" />
                        </a>
                      </h3>

                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
                        <Quote className="w-3.5 h-3.5 text-purple-600/70 shrink-0" />
                        <span className="truncate">{item.authors}</span>
                      </p>

                      {item.venue && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <BookOpen className="w-3.5 h-3.5 shrink-0 text-purple-600/70" />
                          <span className="truncate">{item.venue}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-purple-600 font-bold bg-purple-500/10 px-2 py-1 rounded-md text-[11px]">
                        <Award className="w-3.5 h-3.5" />
                        <span>{item.citationCount} Citations</span>
                      </span>

                      <Button
                        type="button"
                        size="sm"
                        variant={isSaved ? "outline" : "default"}
                        disabled={isSaved}
                        onClick={() => openSaveModal(item.id, item.title, item.doiUrl || item.semanticUrl, `[Semantic Scholar] ${item.authors} (${item.year})`)}
                        className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-purple-600 text-white"}`}
                      >
                        {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 5. GOOGLE SCHOLAR SECTION ── */}
      {provider === "scholar" && (
        <div className="space-y-5">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-muted-foreground pointer-events-none" />
            <Input
              value={scholarQuery}
              onChange={(e) => setScholarQuery(e.target.value)}
              placeholder="Cari referensi akademik di Google Scholar..."
              className="pl-12 pr-28 h-12 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900 border-amber-500/30 shadow-md focus:border-amber-500 transition-all"
            />
            <Button type="submit" disabled={scholarLoading} className="absolute right-1.5 h-9.5 px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer">
              {scholarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari Scholar"}
            </Button>
          </form>

          {scholarLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-700/60" />)}
            </div>
          ) : scholarItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <BookOpen className="w-12 h-12 mx-auto text-amber-500/40" />
              <h3 className="text-base font-bold text-foreground">Tidak ada hasil Google Scholar ditemukan</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {scholarItems.map((item) => {
                const isSaved = savedLinkIds[item.id];
                return (
                  <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-amber-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-amber-500/50 transition-all">
                    <div className="space-y-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase font-mono">
                        Google Scholar
                      </span>

                      <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-amber-600 transition-colors">
                        <a href={item.scholarUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-start gap-1.5">
                          <span>{item.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-amber-600" />
                        </a>
                      </h3>

                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium line-clamp-2">
                        <Quote className="w-3.5 h-3.5 text-amber-600/70 shrink-0" />
                        <span>{item.authorJournalText}</span>
                      </p>

                      {item.snippetText && (
                        <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                          {item.snippetText}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      {item.citationsCount > 0 ? (
                        <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-500/10 px-2 py-1 rounded-md text-[11px]">
                          <Award className="w-3.5 h-3.5" />
                          <span>Dirujuk {item.citationsCount}×</span>
                        </span>
                      ) : <span />}

                      <Button
                        type="button"
                        size="sm"
                        variant={isSaved ? "outline" : "default"}
                        disabled={isSaved}
                        onClick={() => openSaveModal(item.id, item.title, item.scholarUrl, `[Google Scholar] ${item.authorJournalText}`)}
                        className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-600 text-white"}`}
                      >
                        {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Save to Linkora Modal */}
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-primary/20 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-primary" />
              <span>Simpan Referensi Riset</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Simpan referensi artikel atau jurnal ini ke koleksi Linkora Anda.
            </DialogDescription>
          </DialogHeader>

          {targetItem && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
              <p className="font-bold text-foreground line-clamp-2">{targetItem.title}</p>
              <p className="text-muted-foreground text-[11px] leading-snug line-clamp-2">{targetItem.desc}</p>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-foreground">Pilih Koleksi (Opsional):</label>
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary"
            >
              <option value="">-- Simpan Tanpa Koleksi (Utama) --</option>
              {collections?.map((col: any) => (
                <option key={col.id} value={col.id}>
                  📁 {col.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSaveModalOpen(false)}
              disabled={savingLink}
              className="rounded-xl h-10 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveToLinkora}
              disabled={savingLink}
              className="rounded-xl h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 shadow-xs cursor-pointer"
            >
              {savingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan ke Linkora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
