"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Mail,
  Smartphone,
  Monitor,
  KeyRound,
  Sparkles,
  Lock,
  ArrowLeft,
  FileText,
  Eye,
  Check,
  Copy,
} from "lucide-react"

type EmailType = "otp" | "welcome" | "reset"
type Viewport = "desktop" | "mobile"

export default function EmailPreviewPage() {
  const [selectedType, setSelectedType] = useState<EmailType>("otp")
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const [viewMode, setViewMode] = useState<"visual" | "text">("visual")
  const [emailData, setEmailData] = useState<{
    subject: string
    html: string
    text: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/email-preview?type=${selectedType}`)
      .then((res) => res.json())
      .then((data) => {
        setEmailData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load email preview:", err)
        setLoading(false)
      })
  }, [selectedType])

  const copyText = () => {
    if (emailData?.text) {
      navigator.clipboard.writeText(emailData.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const templates = [
    {
      id: "otp" as EmailType,
      title: "1. OTP Register Manual",
      desc: "Kode verifikasi 6-digit pendaftaran",
      icon: KeyRound,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "welcome" as EmailType,
      title: "2. Welcome Email",
      desc: "Email sambutan akun baru terverifikasi",
      icon: Sparkles,
      color: "from-indigo-500 to-purple-600",
    },
    {
      id: "reset" as EmailType,
      title: "3. Reset Password",
      desc: "Instruksi atur ulang kata sandi",
      icon: Lock,
      color: "from-violet-500 to-pink-600",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="p-2 rounded-xl border border-border hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight font-heading">
                  Linkora
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-full border border-primary/20">
                  Email Studio QA
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Pratinjau visual & kompatibilitas sistem email autentikasi Resend
              </p>
            </div>
          </div>

          {/* Viewport & View Mode Toggles */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs">
              <button
                onClick={() => setViewMode("visual")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === "visual"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Visual HTML</span>
              </button>
              <button
                onClick={() => setViewMode("text")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === "text"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Plain Text</span>
              </button>
            </div>

            {viewMode === "visual" && (
              <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs">
                <button
                  onClick={() => setViewport("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewport === "desktop"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Desktop View (540px container)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setViewport("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewport === "mobile"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Mobile View (375px container)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar: Template Selection */}
        <div className="lg:w-80 w-full shrink-0 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Pilih Template Email
          </div>

          <div className="space-y-2">
            {templates.map((tpl) => {
              const Icon = tpl.icon
              const isSelected = selectedType === tpl.id

              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedType(tpl.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground shadow-md ring-1 ring-primary/30"
                      : "bg-card/40 border-border hover:bg-card/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isSelected ? "text-foreground" : "text-foreground/90"
                      }`}
                    >
                      {tpl.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tpl.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Quick Specifications Card */}
          <div className="glass-panel p-5 rounded-2xl border border-border/80 text-xs space-y-3 bg-card/20">
            <p className="font-bold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> Info Resend & Deployment
            </p>
            <div className="space-y-1.5 text-muted-foreground text-[11px] leading-relaxed">
              <p>
                • <strong>Penyedia:</strong> Resend API
              </p>
              <p>
                • <strong>Dev Mode:</strong> Simulasi aman & testing lokal
              </p>
              <p>
                • <strong>Keamanan:</strong> SHA-256 Hashed OTP & Token
              </p>
              <p>
                • <strong>Domain:</strong> Siap beralih saat verified domain tersedia
              </p>
            </div>
          </div>
        </div>

        {/* Right Preview Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Email Header Metadata Simulator */}
          <div className="glass-panel rounded-2xl p-4 mb-4 border border-border bg-card/40 shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
              <span className="text-xs text-muted-foreground">Subject:</span>
              <span className="text-sm font-semibold text-foreground truncate">
                {emailData?.subject || "Memuat subject..."}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Dari: <strong>Linkora &lt;onboarding@resend.dev&gt;</strong></span>
              <span>Ke: <strong>komandan@linkora.id</strong></span>
            </div>
          </div>

          {/* Email View Frame */}
          <div className="flex-1 flex items-center justify-center bg-slate-900/10 dark:bg-black/30 rounded-3xl p-4 sm:p-8 border border-border/80 overflow-hidden min-h-[600px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Memuat render template...</span>
              </div>
            ) : viewMode === "visual" ? (
              <motion.div
                key={`${selectedType}-${viewport}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: viewport === "mobile" ? "375px" : "100%",
                  maxWidth: viewport === "mobile" ? "375px" : "640px",
                }}
                className={`transition-all duration-300 rounded-2xl shadow-2xl overflow-hidden border border-border bg-white ${
                  viewport === "mobile" ? "ring-8 ring-slate-800" : ""
                }`}
              >
                <iframe
                  src={`/api/email-preview?type=${selectedType}&format=html`}
                  title="Email Preview"
                  className="w-full border-none h-[640px] bg-[#f8fafc]"
                />
              </motion.div>
            ) : (
              <div className="w-full max-w-2xl bg-card rounded-2xl border border-border p-6 shadow-xl relative font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                <button
                  onClick={copyText}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-sans"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Teks</span>
                    </>
                  )}
                </button>
                {emailData?.text}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
