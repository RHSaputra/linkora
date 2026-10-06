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
  Library,
  Quote,
  ShieldCheck,
  Download,
  Info,
  ChevronLeft,
  ChevronRight,
  User,
  AlignLeft,
  Hash,
  Calendar,
  SlidersHorizontal,
  Folder,
  Brain,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  quartile?: string;
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

interface ScholarItem {
  id: string;
  title: string;
  authorJournalText: string;
  snippetText: string;
  scholarUrl: string;
  pdfUrl: string;
  citationsCount: number;
}

function Liko3DSearchLoading({ providerName, brandColor = "orange" }: { providerName: string; brandColor?: string }) {
  const colorMap: Record<string, { ring1: string; ring2: string; glow: string; text: string }> = {
    orange: {
      ring1: "border-orange-500/60",
      ring2: "border-amber-400/40",
      glow: "from-orange-500/40 via-amber-500/40 to-yellow-500/40",
      text: "text-orange-600 dark:text-orange-400",
    },
    teal: {
      ring1: "border-teal-600/60",
      ring2: "border-emerald-400/40",
      glow: "from-teal-600/40 via-emerald-500/40 to-cyan-500/40",
      text: "text-teal-700 dark:text-teal-400",
    },
    red: {
      ring1: "border-red-600/60",
      ring2: "border-rose-400/40",
      glow: "from-red-600/40 via-rose-500/40 to-orange-500/40",
      text: "text-red-600 dark:text-red-400",
    },
    blue: {
      ring1: "border-blue-600/60",
      ring2: "border-sky-400/40",
      glow: "from-blue-600/40 via-sky-500/40 to-indigo-500/40",
      text: "text-blue-600 dark:text-blue-400",
    },
  };

  const currentTheme = colorMap[brandColor] || colorMap.orange;

  return (
    <div className="py-14 md:py-20 flex flex-col items-center justify-center space-y-6 bg-white/70 dark:bg-slate-900/70 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 md:p-12 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-24 h-24 md:w-44 md:h-44 lg:w-52 lg:h-52 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentTheme.glow} blur-xl md:blur-3xl animate-pulse`} />
        <div className={`absolute -inset-2 md:-inset-4 rounded-full border-2 md:border-3 border-dashed ${currentTheme.ring1} animate-[spin_6s_linear_infinite]`} />
        <div className={`absolute -inset-4 md:-inset-8 rounded-full border md:border-2 ${currentTheme.ring2} animate-[spin_10s_linear_infinite_reverse]`} />
        <div className="relative w-16 h-16 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full p-1.5 md:p-2 bg-white dark:bg-slate-800 shadow-2xl shadow-black/30 animate-[bounce_2s_infinite]">
          <div className="w-full h-full rounded-full overflow-hidden border-2 md:border-3 border-white dark:border-slate-900 bg-white">
            <img
              src="/maskot.jpeg"
              alt="Liko AI Searching"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      <div className="text-center space-y-1.5 pt-2 md:pt-4">
        <div className="flex items-center justify-center gap-2.5 font-extrabold text-sm md:text-lg text-foreground">
          <Loader2 className={`w-4 h-4 md:w-5 md:h-5 animate-spin ${currentTheme.text}`} />
          <span>Liko sedang mencari data {providerName}...</span>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-md mx-auto">
          Eksplorasi referensi ilmiah presisi &amp; metadata akademis terverifikasi
        </p>
      </div>
    </div>
  );
}

export function ScopusPage() {
  const { locale } = useTranslation();
  const isEn = locale === "en";
  const { requireAuth } = useRequireAuth();
  const { collections } = useCollections();

  // Provider Tab: "scopus" | "sinta" | "garuda" | "scholar" | "semantic"
  const [provider, setProvider] = useState<"scopus" | "sinta" | "garuda" | "scholar" | "semantic">("scopus");

  // Scopus State (Default query empty "")
  const [scopusSubTab, setScopusSubTab] = useState<"article" | "journal">("article");
  const [scopusQuartile, setScopusQuartile] = useState<string>(""); // "" | "Q1" | "Q2" | "Q3" | "Q4"
  const [scopusQuery, setScopusQuery] = useState("");
  const [activeScopusQuery, setActiveScopusQuery] = useState("");
  const [scopusPage, setScopusPage] = useState(1);
  const [scopusLoading, setScopusLoading] = useState(false);
  const [scopusItems, setScopusItems] = useState<ScopusItem[]>([]);
  const [scopusTotalResults, setScopusTotalResults] = useState(0);
  const [scopusErrorMsg, setScopusErrorMsg] = useState<string | null>(null);

  // SINTA State (Default query empty "")
  const [sintaSubTab, setSintaSubTab] = useState<"article" | "journal">("journal");
  const [sintaQuery, setSintaQuery] = useState("");
  const [activeSintaQuery, setActiveSintaQuery] = useState("");
  const [sintaLevel, setSintaLevel] = useState<string>("");
  const [sintaPage, setSintaPage] = useState(1);
  const [sintaLoading, setSintaLoading] = useState(false);
  const [sintaItems, setSintaItems] = useState<any[]>([]);
  const [sintaErrorMsg, setSintaErrorMsg] = useState<string | null>(null);

  // GARUDA State (Default query empty "")
  const [garudaSubTab, setGarudaSubTab] = useState<"article" | "journal">("article");
  const [garudaSelect, setGarudaSelect] = useState<"title" | "author" | "doi">("title");
  const [garudaQuery, setGarudaQuery] = useState("");
  const [garudaPublisher, setGarudaPublisher] = useState("");
  const [garudaYearFrom, setGarudaYearFrom] = useState("");
  const [garudaYearTo, setGarudaYearTo] = useState("");

  const [activeGarudaQuery, setActiveGarudaQuery] = useState("");
  const [activeGarudaSelect, setActiveGarudaSelect] = useState<"title" | "author" | "doi">("title");
  const [activeGarudaPublisher, setActiveGarudaPublisher] = useState("");
  const [activeGarudaYearFrom, setActiveGarudaYearFrom] = useState("");
  const [activeGarudaYearTo, setActiveGarudaYearTo] = useState("");

  const [garudaPage, setGarudaPage] = useState(1);
  const [garudaLoading, setGarudaLoading] = useState(false);
  const [garudaItems, setGarudaItems] = useState<any[]>([]);
  const [garudaTotalResults, setGarudaTotalResults] = useState(0);
  const [garudaErrorMsg, setGarudaErrorMsg] = useState<string | null>(null);

  // Google Scholar State (Default query empty "")
  const [scholarSubTab, setScholarSubTab] = useState<"article" | "journal">("article");
  const [scholarQuery, setScholarQuery] = useState("");
  const [activeScholarQuery, setActiveScholarQuery] = useState("");
  const [scholarPage, setScholarPage] = useState(1);
  const [scholarLoading, setScholarLoading] = useState(false);
  const [scholarItems, setScholarItems] = useState<ScholarItem[]>([]);
  const [scholarErrorMsg, setScholarErrorMsg] = useState<string | null>(null);

  // Semantic Scholar State (Default query empty "")
  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticYearFrom, setSemanticYearFrom] = useState("");
  const [semanticYearTo, setSemanticYearTo] = useState("");
  const [semanticOpenAccess, setSemanticOpenAccess] = useState(false);

  const [activeSemanticQuery, setActiveSemanticQuery] = useState("");
  const [activeSemanticYearFrom, setActiveSemanticYearFrom] = useState("");
  const [activeSemanticYearTo, setActiveSemanticYearTo] = useState("");
  const [activeSemanticOpenAccess, setActiveSemanticOpenAccess] = useState(false);

  const [semanticPage, setSemanticPage] = useState(1);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticItems, setSemanticItems] = useState<any[]>([]);
  const [semanticTotalResults, setSemanticTotalResults] = useState(0);
  const [semanticErrorMsg, setSemanticErrorMsg] = useState<string | null>(null);

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

  // ── Scopus Data Fetcher (30 items per page) ──
  const fetchScopusData = useCallback(
    async (q: string, activeTab: "article" | "journal", quartile: string, pageNum: number) => {
      setScopusLoading(true);
      setScopusErrorMsg(null);
      try {
        const res = await fetch(
          `/api/scopus?q=${encodeURIComponent(q.trim())}&type=${activeTab}&quartile=${quartile}&page=${pageNum}&count=30`
        );
        const data = await res.json();
        if (res.ok && data.ok) {
          setScopusItems(data.items || []);
          setScopusTotalResults(data.totalResults || 0);
        } else {
          setScopusErrorMsg(data.error || "Gagal mengambil data dari Elsevier Scopus API");
          setScopusItems([]);
        }
      } catch (err: any) {
        console.error(err);
        setScopusErrorMsg("Gagal terhubung ke layanan Elsevier Scopus API");
      } finally {
        setScopusLoading(false);
      }
    },
    []
  );

  // ── SINTA Scraper Fetcher (30 items per page with strict level filtering) ──
  const fetchSintaData = useCallback(async (q: string, activeTab: "article" | "journal", level: string, pageNum: number) => {
    setSintaLoading(true);
    setSintaErrorMsg(null);
    try {
      const res = await fetch(
        `/api/sinta?q=${encodeURIComponent(q.trim())}&type=${activeTab}&sinta=${level}&page=${pageNum}`
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        setSintaItems(data.items || []);
      } else {
        setSintaErrorMsg(data.error || "Gagal mengambil data jurnal SINTA");
      }
    } catch (err: any) {
      console.error(err);
      setSintaErrorMsg("Gagal terhubung ke server SINTA Kemdiktisaintek");
    } finally {
      setSintaLoading(false);
    }
  }, []);

  // ── GARUDA Scraper Fetcher (30 items per page) ──
  const fetchGarudaData = useCallback(
    async (
      q: string,
      activeTab: "article" | "journal",
      select: string,
      publisher: string,
      yearFrom: string,
      yearTo: string,
      pageNum: number
    ) => {
      setGarudaLoading(true);
      setGarudaErrorMsg(null);
      try {
        const params = new URLSearchParams({
          q: q.trim(),
          type: activeTab,
          select,
          publisher: publisher.trim(),
          year_from: yearFrom.trim(),
          year_to: yearTo.trim(),
          page: pageNum.toString(),
        });
        const res = await fetch(`/api/garuda?${params.toString()}`);
        const data = await res.json();
        if (res.ok && data.ok) {
          setGarudaItems(data.items || []);
          setGarudaTotalResults(data.totalResults || 0);
        } else {
          setGarudaErrorMsg(data.error || "Gagal mengambil data dari GARUDA");
          setGarudaItems([]);
          setGarudaTotalResults(0);
        }
      } catch (err: any) {
        console.error(err);
        setGarudaErrorMsg("Gagal terhubung ke portal GARUDA Kemdiktisaintek");
      } finally {
        setGarudaLoading(false);
      }
    },
    []
  );

  // ── Google Scholar Fetcher (30 items per page) ──
  const fetchScholarData = useCallback(async (q: string, activeTab: "article" | "journal", pageNum: number) => {
    setScholarLoading(true);
    setScholarErrorMsg(null);
    try {
      const res = await fetch(
        `/api/scholar?q=${encodeURIComponent(q.trim())}&type=${activeTab}&page=${pageNum}`
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        setScholarItems(data.items || []);
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

  // ── Semantic Scholar Data Fetcher (30 items per page) ──
  const fetchSemanticData = useCallback(
    async (q: string, yearFrom: string, yearTo: string, openAccess: boolean, pageNum: number) => {
      setSemanticLoading(true);
      setSemanticErrorMsg(null);
      try {
        const params = new URLSearchParams({
          q: q.trim(),
          year_from: yearFrom.trim(),
          year_to: yearTo.trim(),
          open_access: openAccess ? "true" : "false",
          page: pageNum.toString(),
        });
        const res = await fetch(`/api/semantic-scholar?${params.toString()}`);
        const data = await res.json();
        if (res.ok && data.ok) {
          setSemanticItems(data.items || []);
          setSemanticTotalResults(data.totalResults || 0);
        } else {
          setSemanticItems([]);
          setSemanticTotalResults(0);
          setSemanticErrorMsg(data.error || "Gagal mengambil data Semantic Scholar");
        }
      } catch (err: any) {
        console.error(err);
        setSemanticItems([]);
        setSemanticTotalResults(0);
        setSemanticErrorMsg("Terjadi kesalahan jaringan saat menghubungi Semantic Scholar.");
      } finally {
        setSemanticLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (provider === "scopus") {
      fetchScopusData(activeScopusQuery, scopusSubTab, scopusQuartile, scopusPage);
    } else if (provider === "sinta") {
      fetchSintaData(activeSintaQuery, sintaSubTab, sintaLevel, sintaPage);
    } else if (provider === "garuda") {
      fetchGarudaData(
        activeGarudaQuery,
        garudaSubTab,
        activeGarudaSelect,
        activeGarudaPublisher,
        activeGarudaYearFrom,
        activeGarudaYearTo,
        garudaPage
      );
    } else if (provider === "scholar") {
      fetchScholarData(activeScholarQuery, scholarSubTab, scholarPage);
    } else if (provider === "semantic") {
      fetchSemanticData(
        activeSemanticQuery,
        activeSemanticYearFrom,
        activeSemanticYearTo,
        activeSemanticOpenAccess,
        semanticPage
      );
    }
  }, [
    provider,
    activeScopusQuery,
    scopusSubTab,
    scopusQuartile,
    scopusPage,
    activeSintaQuery,
    sintaSubTab,
    sintaLevel,
    sintaPage,
    activeGarudaQuery,
    garudaSubTab,
    activeGarudaSelect,
    activeGarudaPublisher,
    activeGarudaYearFrom,
    activeGarudaYearTo,
    garudaPage,
    activeScholarQuery,
    scholarSubTab,
    scholarPage,
    activeSemanticQuery,
    activeSemanticYearFrom,
    activeSemanticYearTo,
    activeSemanticOpenAccess,
    semanticPage,
    fetchScopusData,
    fetchSintaData,
    fetchGarudaData,
    fetchScholarData,
    fetchSemanticData,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (provider === "scopus") {
      setScopusPage(1);
      setActiveScopusQuery(scopusQuery.trim());
    } else if (provider === "sinta") {
      setSintaPage(1);
      setActiveSintaQuery(sintaQuery.trim());
    } else if (provider === "garuda") {
      setGarudaPage(1);
      setActiveGarudaQuery(garudaQuery.trim());
      setActiveGarudaSelect(garudaSelect);
      setActiveGarudaPublisher(garudaPublisher.trim());
      setActiveGarudaYearFrom(garudaYearFrom.trim());
      setActiveGarudaYearTo(garudaYearTo.trim());
    } else if (provider === "scholar") {
      setScholarPage(1);
      setActiveScholarQuery(scholarQuery.trim());
    } else if (provider === "semantic") {
      setSemanticPage(1);
      setActiveSemanticQuery(semanticQuery.trim());
      setActiveSemanticYearFrom(semanticYearFrom.trim());
      setActiveSemanticYearTo(semanticYearTo.trim());
      setActiveSemanticOpenAccess(semanticOpenAccess);
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

  const handleSafeOpenUrl = (e: React.MouseEvent, targetUrl: string | undefined, title: string) => {
    e.preventDefault();
    const url = (targetUrl || "").trim();
    if (!url || url === "#" || url === "undefined" || url === "null") {
      toast.error(
        isEn
          ? `Publisher website for "${title.slice(0, 35)}..." is not accessible.`
          : `Web penerbit "${title.slice(0, 35)}..." tidak dapat diakses atau tautan DOI tidak ditemukan.`
      );
      return;
    }

    try {
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) {
        toast.error(
          isEn
            ? "Pop-up blocked by browser. Failed to open publisher website."
            : "Browser memblokir jendela baru. Gagal membuka web penerbit."
        );
      }
    } catch (err) {
      toast.error(
        isEn
          ? "Publisher website cannot be accessed currently."
          : "Web penerbit tidak dapat diakses saat ini."
      );
    }
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
          title: targetItem.title.replace(/\*/g, ""),
          description: targetItem.desc.replace(/\*/g, ""),
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
        toast.error(data.error || (isEn ? "Gagal menyimpan link" : "Gagal menyimpan link"), "Error");
      }
    } catch (err) {
      console.error(err);
      toast.error(isEn ? "Failed to save link" : "Gagal menyimpan link ke Linkora", "Error");
    } finally {
      setSavingLink(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-1 sm:px-0">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-8 border border-primary/20 bg-gradient-to-br from-primary/10 via-slate-50 to-primary/5 dark:from-primary/20 dark:via-slate-900 dark:to-slate-900/60 shadow-xl backdrop-blur-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/20 dark:bg-primary/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Column: Title, description, 4 tab buttons */}
          <div className="space-y-4 flex-1">
            <h1 className="text-xl sm:text-3xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
              Pusat Penelusuran Riset Ilmiah
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Eksplorasi referensi ilmiah dari 5 sumber utama: Elsevier Scopus, SINTA, GARUDA, Google Scholar, dan Semantic Scholar secara profesional dan transparan.
            </p>

            {/* 5 Provider Selector Buttons */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setProvider("scopus")}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  provider === "scopus"
                    ? "bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-500/30"
                    : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground hover:bg-white"
                }`}
              >
                <span>Elsevier Scopus</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider("sinta")}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  provider === "sinta"
                    ? "bg-teal-700 text-white border-teal-700 shadow-md ring-2 ring-teal-600/30"
                    : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground hover:bg-white"
                }`}
              >
                <span>SINTA Indonesia</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider("garuda")}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  provider === "garuda"
                    ? "bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-500/30"
                    : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground hover:bg-white"
                }`}
              >
                <span>GARUDA Portal</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider("scholar")}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  provider === "scholar"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30"
                    : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground hover:bg-white"
                }`}
              >
                <span>Google Scholar</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider("semantic")}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  provider === "semantic"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30"
                    : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-muted-foreground hover:text-foreground hover:bg-white"
                }`}
              >
                <span>Semantic Scholar</span>
              </button>
            </div>
          </div>

          {/* Right Column: Big Display Logo Badge in right empty space (Full Image, No Text) */}
          <div className="hidden md:flex items-center justify-center p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-2xl backdrop-blur-xl shrink-0 md:w-64 md:h-64 lg:w-72 lg:h-72 transition-all duration-300">
            {provider === "scopus" && (
              <div className="w-full h-full rounded-2xl bg-white p-3 border border-orange-500/20 shadow-sm flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                <img src="/scopus.jpeg" alt="Elsevier Scopus" className="w-full h-full object-contain" />
              </div>
            )}
            {provider === "sinta" && (
              <div className="w-full h-full rounded-2xl bg-white p-3 border border-teal-500/20 shadow-sm flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                <img src="/sinta.jpeg" alt="SINTA Kemdiktisaintek" className="w-full h-full object-contain" />
              </div>
            )}
            {provider === "garuda" && (
              <div className="w-full h-full rounded-2xl bg-white p-3 border border-red-500/20 shadow-sm flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                <img src="/garuda01.jpeg" alt="GARUDA Kemdiktisaintek" className="w-full h-full object-contain" />
              </div>
            )}
            {provider === "scholar" && (
              <div className="w-full h-full rounded-2xl bg-white p-3 border border-blue-500/20 shadow-sm flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                <img src="/google scholar.jpeg" alt="Google Scholar" className="w-full h-full object-contain" />
              </div>
            )}
            {provider === "semantic" && (
              <div className="w-full h-full rounded-2xl bg-white p-3 border border-indigo-500/20 shadow-sm flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                <img src="/Semantic scholar.png" alt="Semantic Scholar" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 1. SCOPUS SECTION ── */}
      {provider === "scopus" && (
        <div className="space-y-5">
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
                    ? "bg-white dark:bg-slate-900 text-orange-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Judul Artikel</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setScopusSubTab("journal");
                  setScopusPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  scopusSubTab === "journal"
                    ? "bg-white dark:bg-slate-900 text-orange-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Judul Jurnal</span>
              </button>
            </div>

            {scopusTotalResults > 0 && (
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 shrink-0 sm:ml-auto">
                <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                <span>Total Metadata: {scopusTotalResults.toLocaleString()} Publikasi Scopus</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">Menampilkan {scopusItems.length} card</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono mr-1">
              Indeks Scopus:
            </span>
            <button
              type="button"
              onClick={() => { setScopusQuartile(""); setScopusPage(1); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${scopusQuartile === "" ? "bg-orange-600 text-white border-orange-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
            >
              Semua Quartile
            </button>
            {["Q1", "Q2", "Q3", "Q4"].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => { setScopusQuartile(q); setScopusPage(1); }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${scopusQuartile === q ? "bg-orange-600 text-white border-orange-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-muted-foreground pointer-events-none" />
            <Input
              value={scopusQuery}
              onChange={(e) => setScopusQuery(e.target.value)}
              placeholder={
                scopusSubTab === "article"
                  ? "Ketik judul artikel, DOI, atau topik penelitian Scopus..."
                  : "Ketik nama jurnal atau penerbit bereputasi Scopus..."
              }
              className="pl-12 pr-28 h-12 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900 border-orange-500/30 shadow-md focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-orange-500 focus:border-orange-500 transition-all"
            />
            <Button
              type="submit"
              disabled={scopusLoading}
              className="absolute right-1.5 h-9.5 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
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
            <Liko3DSearchLoading providerName="Scopus" brandColor="orange" />
          ) : scopusItems.length === 0 && !scopusErrorMsg ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <Library className="w-12 h-12 mx-auto text-orange-500/40" />
              <h3 className="text-base font-bold text-foreground">Tidak ada data Scopus ditemukan untuk "{activeScopusQuery}"</h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {scopusItems.map((item) => {
                  const isSaved = savedLinkIds[item.id];
                  const cleanTitle = (item.title || "").replace(/\*/g, "").trim();
                  return (
                    <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-orange-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-orange-500/50 transition-all duration-200">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold uppercase tracking-wider font-mono">
                              {item.subtypeDescription || item.aggregationType || "Scopus Indexed"}
                            </span>
                            {item.quartile && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-black tracking-wide font-mono">
                                {item.quartile}
                              </span>
                            )}
                          </div>
                          {item.openAccess && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              <Globe className="w-3 h-3" />
                              <span>Open Access</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-orange-600 transition-colors">
                          <a
                            href={item.doiUrl || item.scopusUrl}
                            onClick={(e) => handleSafeOpenUrl(e, item.doiUrl || item.scopusUrl, cleanTitle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-start gap-2"
                          >
                            <div className="w-6 h-6 rounded-md bg-white border border-orange-500/30 p-0.5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <img src="/scopus.jpeg" alt="Scopus Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="flex-1">{cleanTitle}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-orange-600" />
                          </a>
                        </h3>

                        <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                          {item.creator && (
                            <p className="flex items-center gap-1.5 font-medium truncate">
                              <Quote className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                              <span className="truncate">{item.creator.replace(/\*/g, "")}</span>
                            </p>
                          )}
                          {item.publicationName && (
                            <p className="flex items-center gap-1.5 font-medium truncate text-foreground/80">
                              <BookOpen className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                              <span className="truncate">{item.publicationName.replace(/\*/g, "")}</span>
                            </p>
                          )}
                          {item.publisher && (
                            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                              <Building2 className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                              <span className="truncate">{item.publisher.replace(/\*/g, "")}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          {item.citedByCount !== undefined && (
                            <span className="flex items-center gap-1 text-orange-600 font-bold bg-orange-500/10 px-2 py-1 rounded-md text-[11px]">
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
                          onClick={() => openSaveModal(item.id, cleanTitle, item.doiUrl || item.scopusUrl, `[Scopus] ${item.publicationName || ''}`)}
                          className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white"}`}
                        >
                          {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scopus Pagination Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  disabled={scopusPage <= 1 || scopusLoading}
                  onClick={() => setScopusPage((prev) => Math.max(1, prev - 1))}
                  className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Halaman Sebelumnya</span>
                </Button>
                <span className="text-xs font-semibold text-muted-foreground font-mono">
                  Halaman {scopusPage} {scopusTotalResults > 0 ? `dari ${Math.ceil(scopusTotalResults / 30).toLocaleString()}` : ""}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={scopusLoading || scopusItems.length < 30}
                  onClick={() => setScopusPage((prev) => prev + 1)}
                  className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Halaman Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. SINTA SECTION ── */}
      {provider === "sinta" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setSintaSubTab("journal");
                  setSintaPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  sintaSubTab === "journal"
                    ? "bg-white dark:bg-slate-900 text-teal-700 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Nama Jurnal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSintaSubTab("article");
                  setSintaPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  sintaSubTab === "article"
                    ? "bg-white dark:bg-slate-900 text-teal-700 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Judul Artikel</span>
              </button>
            </div>

            {sintaItems.length > 0 && (
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 shrink-0 sm:ml-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>
                  Total Metadata: {sintaLevel === "1" ? "1.260" : sintaLevel === "2" ? "2.590" : sintaLevel === "3" ? "2.750" : sintaLevel === "4" ? "2.400" : sintaLevel === "5" ? "1.500" : sintaLevel === "6" ? "1.350" : "16.772"} {sintaSubTab === "journal" ? "Jurnal SINTA" : "Artikel Terindeks SINTA"}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-bold text-teal-700 dark:text-teal-400">Menampilkan {sintaItems.length} card</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono mr-1">
              Indeks SINTA:
            </span>
            <button
              type="button"
              onClick={() => { setSintaLevel(""); setSintaPage(1); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${sintaLevel === "" ? "bg-teal-700 text-white border-teal-700" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
            >
              Semua
            </button>
            {["1", "2", "3", "4", "5", "6"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => { setSintaLevel(lvl); setSintaPage(1); }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${sintaLevel === lvl ? "bg-teal-700 text-white border-teal-700" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
              >
                S{lvl}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-muted-foreground pointer-events-none" />
            <Input
              value={sintaQuery}
              onChange={(e) => setSintaQuery(e.target.value)}
              placeholder={
                sintaSubTab === "journal"
                  ? "Ketik nama jurnal SINTA, universitas, atau kata kunci terbitan..."
                  : "Ketik judul artikel ilmiah terindeks SINTA..."
              }
              className="pl-12 pr-28 h-12 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900 border-teal-500/30 shadow-md focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-teal-600 focus:border-teal-600 transition-all"
            />
            <Button type="submit" disabled={sintaLoading} className="absolute right-1.5 h-9.5 px-5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl cursor-pointer">
              {sintaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari SINTA"}
            </Button>
          </form>

          {sintaLoading ? (
            <Liko3DSearchLoading providerName="SINTA Kemdiktisaintek" brandColor="teal" />
          ) : sintaItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <ShieldCheck className="w-12 h-12 mx-auto text-teal-500/40" />
              <h3 className="text-base font-bold text-foreground">Tidak ada {sintaSubTab === "journal" ? "jurnal" : "artikel"} SINTA ditemukan</h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {sintaItems.map((item) => {
                  const isSaved = savedLinkIds[item.id];
                  const cleanTitle = (item.title || "").replace(/\*/g, "").trim();

                  // Render Article Card
                  if (item.isArticle || sintaSubTab === "article") {
                    return (
                      <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-teal-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-teal-500/50 transition-all">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-400 text-[11px] font-bold uppercase font-mono">
                              {item.quartile || "SINTA Indexed"}
                            </span>
                            {item.coverDate && (
                              <span className="text-[10px] text-muted-foreground font-mono">{item.coverDate}</span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-teal-700 transition-colors">
                            <a
                              href={item.scopusUrl || item.websiteUrl}
                              onClick={(e) => handleSafeOpenUrl(e, item.scopusUrl || item.websiteUrl, cleanTitle)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-start gap-2"
                            >
                              <div className="w-6 h-6 rounded-md bg-white border border-teal-500/30 p-0.5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                <img src="/sinta.jpeg" alt="SINTA Logo" className="w-full h-full object-contain" />
                              </div>
                              <span className="flex-1">{cleanTitle}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-teal-700" />
                            </a>
                          </h3>

                          {item.creator && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
                              <Quote className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                              <span className="truncate">{item.creator.replace(/\*/g, "")}</span>
                            </p>
                          )}

                          {item.publicationName && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                              <BookOpen className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                              <span className="truncate">{item.publicationName.replace(/\*/g, "")}</span>
                            </p>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                            {item.citedByCount !== undefined && (
                              <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-bold bg-teal-500/10 px-2 py-1 rounded-md text-[11px]">
                                <Award className="w-3.5 h-3.5" />
                                <span>{item.citedByCount} Sitasi</span>
                              </span>
                            )}
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={isSaved ? "outline" : "default"}
                            disabled={isSaved}
                            onClick={() => openSaveModal(item.id, cleanTitle, item.scopusUrl || item.websiteUrl, `[SINTA] ${item.publicationName || ''}`)}
                            className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white"}`}
                          >
                            {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  // Render Journal Card
                  return (
                    <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-teal-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-teal-500/50 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-teal-700 dark:text-teal-400 font-extrabold text-xs whitespace-nowrap shrink-0">
                            {item.sintaRating} Accredited
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate">{item.issnText}</span>
                        </div>

                        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-teal-700 transition-colors">
                          <a
                            href={item.websiteUrl}
                            onClick={(e) => handleSafeOpenUrl(e, item.websiteUrl, cleanTitle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-start gap-2"
                          >
                            <div className="w-6 h-6 rounded-md bg-white border border-teal-500/30 p-0.5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <img src="/sinta.jpeg" alt="SINTA Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="flex-1">{cleanTitle}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-teal-700" />
                          </a>
                        </h3>

                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
                          <Building2 className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                          <span className="truncate">{item.institution?.replace(/\*/g, "") || "Institusi Pendidikan"}</span>
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-semibold">
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-muted-foreground text-[10px] block font-mono">Impact Score</span>
                            <span className="text-teal-700 dark:text-teal-400 font-bold">{item.impact || "-"}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-muted-foreground text-[10px] block font-mono">H5-Index</span>
                            <span className="text-foreground font-bold">{item.h5Index || "-"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <a href={item.sintaProfileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-teal-700 font-bold hover:underline flex items-center gap-1">
                          <span>Profil SINTA</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant={isSaved ? "outline" : "default"}
                          disabled={isSaved}
                          onClick={() => openSaveModal(item.id, cleanTitle, item.websiteUrl || item.sintaProfileUrl, `[Akreditasi ${item.sintaRating}] ${item.institution}`)}
                          className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white"}`}
                        >
                          {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SINTA Pagination Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  disabled={sintaPage <= 1 || sintaLoading}
                  onClick={() => setSintaPage((prev) => Math.max(1, prev - 1))}
                  className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Halaman Sebelumnya</span>
                </Button>
                <span className="text-xs font-semibold text-muted-foreground font-mono">
                  Halaman {sintaPage} dari {sintaLevel === "1" ? "42" : sintaLevel === "2" ? "86" : sintaLevel === "3" ? "92" : sintaLevel === "4" ? "80" : sintaLevel === "5" ? "50" : sintaLevel === "6" ? "45" : "559"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={sintaLoading || sintaItems.length < 30}
                  onClick={() => setSintaPage((prev) => prev + 1)}
                  className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Halaman Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. GARUDA SECTION ── */}
      {provider === "garuda" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setGarudaSubTab("article");
                  setGarudaPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  garudaSubTab === "article"
                    ? "bg-white dark:bg-slate-900 text-red-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Judul Artikel</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setGarudaSubTab("journal");
                  setGarudaPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  garudaSubTab === "journal"
                    ? "bg-white dark:bg-slate-900 text-red-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Nama Jurnal</span>
              </button>
            </div>

            {garudaTotalResults > 0 && (
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 shrink-0 sm:ml-auto">
                <BookOpen className="w-3.5 h-3.5 text-red-600" />
                <span>Total Metadata: {garudaTotalResults.toLocaleString()} {garudaSubTab === "journal" ? "Jurnal GARUDA" : "Artikel GARUDA"}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-bold text-red-600 dark:text-red-400">Menampilkan {garudaItems.length} card</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-red-500/20 shadow-xl shadow-red-500/5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
              {/* Cari Berdasarkan */}
              <div className="lg:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
                  <span>Cari Berdasarkan</span>
                </label>
                <Select
                  value={garudaSelect}
                  onValueChange={(value) => setGarudaSelect(value as any)}
                >
                  <SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-foreground font-semibold focus:ring-2 focus:ring-red-500/30 focus:border-red-500 cursor-pointer transition-all">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-1.5 z-50">
                    <SelectItem value="title" className="py-2.5 pl-8 pr-3 text-xs font-semibold rounded-xl cursor-pointer transition-colors focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 data-[state=checked]:bg-red-500/10 data-[state=checked]:text-red-600 dark:data-[state=checked]:text-red-400 font-sans">
                      Judul
                    </SelectItem>
                    <SelectItem value="author" className="py-2.5 pl-8 pr-3 text-xs font-semibold rounded-xl cursor-pointer transition-colors focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 data-[state=checked]:bg-red-500/10 data-[state=checked]:text-red-600 dark:data-[state=checked]:text-red-400 font-sans">
                      Pengarang
                    </SelectItem>
                    <SelectItem value="doi" className="py-2.5 pl-8 pr-3 text-xs font-semibold rounded-xl cursor-pointer transition-colors focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 data-[state=checked]:bg-red-500/10 data-[state=checked]:text-red-600 dark:data-[state=checked]:text-red-400 font-sans">
                      DOI
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Kata kunci */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-red-500" />
                  <span>Kata kunci</span>
                </label>
                <Input
                  value={garudaQuery}
                  onChange={(e) => setGarudaQuery(e.target.value)}
                  placeholder="sistem informasi"
                  className="h-10 text-xs sm:text-sm rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:border-red-600 transition-all font-medium"
                />
              </div>

              {/* Penerbit */}
              <div className="lg:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Penerbit</span>
                </label>
                <Input
                  value={garudaPublisher}
                  onChange={(e) => setGarudaPublisher(e.target.value)}
                  placeholder="Nama Penerbit"
                  className="h-10 text-xs sm:text-sm rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:border-red-600 transition-all font-medium"
                />
              </div>

              {/* Filter Tahun */}
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-500" />
                  <span>Filter Tahun</span>
                </label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={garudaYearFrom}
                    onChange={(e) => setGarudaYearFrom(e.target.value)}
                    placeholder="Awal"
                    className="h-10 text-xs rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 px-2 text-center focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:border-red-600 transition-all font-mono"
                  />
                  <span className="text-xs text-muted-foreground font-bold">-</span>
                  <Input
                    type="number"
                    value={garudaYearTo}
                    onChange={(e) => setGarudaYearTo(e.target.value)}
                    placeholder="Akhir"
                    className="h-10 text-xs rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 px-2 text-center focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:border-red-600 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <Button
                type="submit"
                disabled={garudaLoading}
                className="h-10 px-7 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-500/25 transition-all cursor-pointer flex items-center gap-2"
              >
                {garudaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Mencari</span>
              </Button>
            </div>
          </form>

          {garudaLoading ? (
            <Liko3DSearchLoading providerName="GARUDA Portal" brandColor="red" />
          ) : garudaItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <Library className="w-12 h-12 mx-auto text-red-500/40" />
              <h3 className="text-base font-bold text-foreground">Tidak ada {garudaSubTab === "journal" ? "jurnal" : "artikel"} GARUDA ditemukan untuk "{activeGarudaQuery}"</h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {garudaItems.map((item) => {
                  const isSaved = savedLinkIds[item.id];
                  const cleanTitle = (item.title || "").replace(/\*/g, "").trim();

                  // Render GARUDA Journal Card
                  if (item.isJournal || garudaSubTab === "journal") {
                    return (
                      <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-red-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-red-500/50 transition-all">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase font-mono">
                              GARUDA Journal
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate">{item.issnText}</span>
                          </div>

                          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-red-600 transition-colors">
                            <a
                              href={item.garudaUrl}
                              onClick={(e) => handleSafeOpenUrl(e, item.garudaUrl, cleanTitle)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-start gap-2"
                            >
                              <div className="w-6 h-6 rounded-md bg-white border border-red-500/30 p-0.5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                <img src="/garuda01.jpeg" alt="GARUDA Logo" className="w-full h-full object-contain" />
                              </div>
                              <span className="flex-1">{cleanTitle}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-red-600" />
                            </a>
                          </h3>

                          {item.publisher && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
                              <Building2 className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                              <span className="truncate">{item.publisher.replace(/\*/g, "")}</span>
                            </p>
                          )}

                          {item.subjectAreas && item.subjectAreas.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.subjectAreas.map((sa: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-muted-foreground font-medium truncate">
                                  {sa}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <a href={item.garudaUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                            <span>Detail Jurnal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <Button
                            type="button"
                            size="sm"
                            variant={isSaved ? "outline" : "default"}
                            disabled={isSaved}
                            onClick={() => openSaveModal(item.id, cleanTitle, item.garudaUrl, `[GARUDA Journal] ${item.publisher}`)}
                            className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"}`}
                          >
                            {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  // Render GARUDA Article Card
                  return (
                    <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-red-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-red-500/50 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase font-mono">
                              GARUDA Rujukan
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              activeGarudaSelect === "author" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" :
                              activeGarudaSelect === "doi" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" :
                              "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            }`}>
                              Filter: {activeGarudaSelect === "author" ? "Pengarang" : activeGarudaSelect === "doi" ? "DOI" : "Judul"}
                            </span>
                          </div>
                          {item.downloadUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-bold shrink-0">
                              <Download className="w-3 h-3" />
                              <span>PDF Direct</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-red-600 transition-colors">
                          <a
                            href={item.doiUrl || item.garudaUrl}
                            onClick={(e) => handleSafeOpenUrl(e, item.doiUrl || item.garudaUrl, cleanTitle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-start gap-2"
                          >
                            <div className="w-6 h-6 rounded-md bg-white border border-red-500/30 p-0.5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <img src="/garuda01.jpeg" alt="GARUDA Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="flex-1">{cleanTitle}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-red-600" />
                          </a>
                        </h3>

                        {/* Dynamic Field Highlight based on Active Filter */}
                        {activeGarudaSelect === "author" && item.author && (
                          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                              <User className="w-3 h-3 shrink-0" />
                              <span>Hasil Pencarian Pengarang:</span>
                            </div>
                            <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                              {item.author.replace(/\*/g, "")}
                            </p>
                          </div>
                        )}

                        {activeGarudaSelect === "doi" && (
                          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                              <Hash className="w-3 h-3 shrink-0" />
                              <span>Hasil Pencarian DOI:</span>
                            </div>
                            {item.doiUrl ? (
                              <a
                                href={item.doiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline break-all block"
                              >
                                {item.doiUrl}
                              </a>
                            ) : (
                              <p className="text-xs font-mono font-medium text-foreground truncate">
                                DOI: {item.doi || "Terdaftar di GARUDA Portal"}
                              </p>
                            )}
                          </div>
                        )}

                        {activeGarudaSelect !== "author" && item.author && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium line-clamp-2">
                            <Quote className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                            <span className="line-clamp-2">{item.author.replace(/\*/g, "")}</span>
                          </p>
                        )}

                        {item.journalInfo && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                            <BookOpen className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                            <span className="truncate">{item.journalInfo.replace(/\*/g, "")}</span>
                          </p>
                        )}
                        {item.publisher && (
                          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                            <Building2 className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                            <span className="truncate">{item.publisher.replace(/\*/g, "")}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        {item.downloadUrl ? (
                          <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF Original</span>
                          </a>
                        ) : <span className="text-[11px] text-muted-foreground font-mono">Tautan Resmi</span>}

                        <Button
                          type="button"
                          size="sm"
                          variant={isSaved ? "outline" : "default"}
                          disabled={isSaved}
                          onClick={() => openSaveModal(item.id, cleanTitle, item.doiUrl || item.garudaUrl, `[GARUDA] ${item.author || ''} • ${item.journalInfo || ''}`)}
                          className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"}`}
                        >
                          {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* GARUDA Pagination Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  disabled={garudaPage <= 1 || garudaLoading}
                  onClick={() => setGarudaPage((prev) => Math.max(1, prev - 1))}
                  className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Halaman Sebelumnya</span>
                </Button>
                <span className="text-xs font-semibold text-muted-foreground font-mono">
                  Halaman {garudaPage} {garudaTotalResults > 0 ? `dari ${Math.ceil(garudaTotalResults / 30).toLocaleString()}` : ""}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={garudaLoading || garudaItems.length < 30}
                  onClick={() => setGarudaPage((prev) => prev + 1)}
                  className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Halaman Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4. GOOGLE SCHOLAR SECTION ── */}
      {provider === "scholar" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setScholarSubTab("article");
                  setScholarPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  scholarSubTab === "article"
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Judul Artikel</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setScholarSubTab("journal");
                  setScholarPage(1);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  scholarSubTab === "journal"
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Nama Jurnal</span>
              </button>
            </div>

            {scholarItems.length > 0 && (
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 shrink-0 sm:ml-auto">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Total Metadata: &gt;100.000.000 Karya Ilmiah Global</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">Menampilkan {scholarItems.length} card</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-muted-foreground pointer-events-none" />
            <Input
              value={scholarQuery}
              onChange={(e) => setScholarQuery(e.target.value)}
              placeholder={
                scholarSubTab === "article"
                  ? "Ketik judul artikel ilmiah di Google Scholar..."
                  : "Ketik nama jurnal atau terbitan ilmiah di Google Scholar..."
              }
              className="pl-12 pr-28 h-12 text-sm sm:text-base rounded-2xl bg-white dark:bg-slate-900 border-blue-500/30 shadow-md focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500 focus:border-blue-500 transition-all"
            />
            <Button type="submit" disabled={scholarLoading} className="absolute right-1.5 h-9.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer">
              {scholarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari Scholar"}
            </Button>
          </form>

          {scholarLoading ? (
            <Liko3DSearchLoading providerName="Google Scholar" brandColor="blue" />
          ) : scholarItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <BookOpen className="w-12 h-12 mx-auto text-blue-500/40" />
              <h3 className="text-base font-bold text-foreground">Tidak ada hasil Google Scholar ditemukan untuk "{activeScholarQuery}"</h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {scholarItems.map((item) => {
                  const isSaved = savedLinkIds[item.id];
                  const cleanTitle = (item.title || "").replace(/\*/g, "").trim();
                  return (
                    <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-blue-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-blue-500/50 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold uppercase font-mono">
                            Google Scholar
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors">
                          <a
                            href={item.pdfUrl || item.scholarUrl}
                            onClick={(e) => handleSafeOpenUrl(e, item.pdfUrl || item.scholarUrl, cleanTitle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-start gap-2"
                          >
                            <div className="w-6 h-6 rounded-md bg-white border border-blue-500/30 p-0.5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <img src="/google scholar.jpeg" alt="Google Scholar Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="flex-1">{cleanTitle}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-blue-600" />
                          </a>
                        </h3>

                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium line-clamp-2">
                          <Quote className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                          <span>{item.authorJournalText.replace(/\*/g, "")}</span>
                        </p>

                        {item.snippetText && (
                          <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                            {item.snippetText.replace(/\*/g, "")}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        {item.citationsCount > 0 ? (
                          <span className="flex items-center gap-1 text-blue-600 font-bold bg-blue-500/10 px-2 py-1 rounded-md text-[11px]">
                            <Award className="w-3.5 h-3.5" />
                            <span>Dirujuk {item.citationsCount}×</span>
                          </span>
                        ) : <span className="text-[11px] text-muted-foreground font-mono">Google Index</span>}

                        <Button
                          type="button"
                          size="sm"
                          variant={isSaved ? "outline" : "default"}
                          disabled={isSaved}
                          onClick={() => openSaveModal(item.id, cleanTitle, item.scholarUrl, `[Google Scholar] ${item.authorJournalText}`)}
                          className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"}`}
                        >
                          {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scholar Pagination Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  disabled={scholarPage <= 1 || scholarLoading}
                  onClick={() => setScholarPage((prev) => Math.max(1, prev - 1))}
                  className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Halaman Sebelumnya</span>
                </Button>
                <span className="text-xs font-semibold text-muted-foreground font-mono">
                  Halaman {scholarPage} dari &gt;3.300.000
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={scholarLoading || scholarItems.length === 0}
                  onClick={() => setScholarPage((prev) => prev + 1)}
                  className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Halaman Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. SEMANTIC SCHOLAR SECTION ── */}
      {provider === "semantic" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <div className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 text-indigo-600 shadow-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>Publikasi & Paper Riset Global</span>
              </div>
            </div>

            {semanticTotalResults > 0 && (
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 shrink-0 sm:ml-auto">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Total Metadata: {semanticTotalResults.toLocaleString()} Paper AI Engine</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Menampilkan {semanticItems.length} card</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-indigo-500/20 shadow-xl shadow-indigo-500/5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
              {/* Kata kunci */}
              <div className="lg:col-span-6 space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Kata kunci Pencarian AI</span>
                </label>
                <Input
                  value={semanticQuery}
                  onChange={(e) => setSemanticQuery(e.target.value)}
                  placeholder="Ketik topik riset atau kata kunci (contoh: machine learning in healthcare)"
                  className="h-10 text-xs sm:text-sm rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-600 transition-all font-medium"
                />
              </div>

              {/* Filter Tahun */}
              <div className="lg:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Filter Tahun Publikasi</span>
                </label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={semanticYearFrom}
                    onChange={(e) => setSemanticYearFrom(e.target.value)}
                    placeholder="Awal (2020)"
                    className="h-10 text-xs rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 px-2 text-center focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-600 transition-all font-mono"
                  />
                  <span className="text-xs text-muted-foreground font-bold">-</span>
                  <Input
                    type="number"
                    value={semanticYearTo}
                    onChange={(e) => setSemanticYearTo(e.target.value)}
                    placeholder="Akhir (2025)"
                    className="h-10 text-xs rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 px-2 text-center focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-600 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Direct PDF Access Option */}
              <div className="lg:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Filter PDF Direct</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSemanticOpenAccess(!semanticOpenAccess)}
                  className={`w-full h-10 px-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    semanticOpenAccess
                      ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/40 dark:text-indigo-400"
                      : "bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-muted-foreground"
                  }`}
                >
                  <span>Hanya Paper PDF Gratis</span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${semanticOpenAccess ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-400"}`}>
                    {semanticOpenAccess && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <Button
                type="submit"
                disabled={semanticLoading}
                className="h-10 px-7 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center gap-2"
              >
                {semanticLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Cari Semantic Scholar</span>
              </Button>
            </div>
          </form>

          {semanticLoading ? (
            <Liko3DSearchLoading providerName="Semantic Scholar Engine" brandColor="blue" />
          ) : semanticItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <Brain className="w-12 h-12 mx-auto text-indigo-500/40" />
              <h3 className="text-base font-bold text-foreground">Tidak ada hasil Semantic Scholar ditemukan untuk "{activeSemanticQuery}"</h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {semanticItems.map((item) => {
                  const isSaved = savedLinkIds[item.id];
                  const cleanTitle = (item.title || "").replace(/\*/g, "").trim();
                  return (
                    <div key={item.id} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-indigo-500/20 bg-white dark:bg-slate-900/90 shadow-md hover:shadow-xl hover:border-indigo-500/50 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase font-mono">
                            Semantic Scholar
                          </span>
                          {item.pdfUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              <Download className="w-3 h-3" />
                              <span>PDF Direct</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-indigo-600 transition-colors">
                          <a
                            href={item.doi || item.semanticScholarUrl}
                            onClick={(e) => handleSafeOpenUrl(e, item.doi || item.semanticScholarUrl, cleanTitle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-start gap-2"
                          >
                            <div className="w-6 h-6 rounded-md bg-white border border-indigo-500/30 p-0.5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <img src="/Semantic scholar.png" alt="Semantic Scholar Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="flex-1">{cleanTitle}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-indigo-600" />
                          </a>
                        </h3>

                        {item.authors && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium line-clamp-2">
                            <Quote className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                            <span className="line-clamp-2">{item.authors.replace(/\*/g, "")}</span>
                          </p>
                        )}

                        {(item.venue || item.year) && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                            <BookOpen className="w-3.5 h-3.5 text-foreground dark:text-slate-200 shrink-0" />
                            <span className="truncate">{item.venue} {item.year ? `(${item.year})` : ""}</span>
                          </p>
                        )}

                        {item.abstract && (
                          <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                            {item.abstract.replace(/\*/g, "")}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        {item.citationCount > 0 ? (
                          <span className="flex items-center gap-1 text-indigo-600 font-bold bg-indigo-500/10 px-2 py-1 rounded-md text-[11px]">
                            <Award className="w-3.5 h-3.5" />
                            <span>{item.citationCount.toLocaleString()} Sitasi</span>
                          </span>
                        ) : item.pdfUrl ? (
                          <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF Original</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-mono">Semantic Index</span>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          variant={isSaved ? "outline" : "default"}
                          disabled={isSaved}
                          onClick={() => openSaveModal(item.id, cleanTitle, item.semanticScholarUrl, `[Semantic Scholar] ${item.authors || ""} • ${item.venue || ""}`)}
                          className={`h-8 px-3 text-xs font-bold rounded-xl gap-1.5 cursor-pointer ${isSaved ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white"}`}
                        >
                          {isSaved ? <><Check className="w-3.5 h-3.5" /><span>Tersimpan</span></> : <><BookmarkPlus className="w-3.5 h-3.5" /><span>Simpan</span></>}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Semantic Scholar Pagination Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  disabled={semanticPage <= 1 || semanticLoading}
                  onClick={() => setSemanticPage((prev) => Math.max(1, prev - 1))}
                  className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Halaman Sebelumnya</span>
                </Button>
                <span className="text-xs font-semibold text-muted-foreground font-mono">
                  Halaman {semanticPage} {semanticTotalResults > 0 ? `dari ${Math.ceil(semanticTotalResults / 30).toLocaleString()}` : ""}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={semanticLoading || semanticItems.length < 30}
                  onClick={() => setSemanticPage((prev) => prev + 1)}
                  className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Halaman Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
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
            <Select
              value={selectedCollectionId || "default"}
              onValueChange={(val) => setSelectedCollectionId(val === "default" ? "" : val)}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-foreground font-medium focus:ring-2 focus:ring-primary/30">
                <SelectValue placeholder="-- Simpan Tanpa Koleksi (Utama) --" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-1.5 z-50">
                <SelectItem value="default" className="py-2 pl-8 pr-3 text-xs font-medium rounded-xl cursor-pointer">
                  <div className="flex items-center gap-2">
                    <BookmarkPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>-- Simpan Tanpa Koleksi (Utama) --</span>
                  </div>
                </SelectItem>
                {collections?.map((col: any) => (
                  <SelectItem key={col.id} value={col.id} className="py-2 pl-8 pr-3 text-xs font-medium rounded-xl cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Folder className="w-3.5 h-3.5 text-primary" />
                      <span>{col.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
