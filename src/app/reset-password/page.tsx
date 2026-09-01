"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, Lock, ArrowLeft, KeyRound, AlertTriangle } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useTranslation()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isTokenMissing = !token || !email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      setError(locale === "en" ? "New password must be at least 6 characters." : "Kata sandi baru minimal 6 karakter.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError(locale === "en" ? "Password confirmation does not match." : "Konfirmasi kata sandi tidak cocok.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || (locale === "en" ? "Failed to reset password." : "Gagal mengatur ulang kata sandi."))
        setLoading(false)
      } else {
        router.push("/login?reset=true")
      }
    } catch (_err) {
      setError(locale === "en" ? "A network error occurred. Please try again." : "Terjadi kesalahan pada jaringan. Silakan coba lagi.")
      setLoading(false)
    }
  }

  if (isTokenMissing) {
    return (
      <div className="glass-panel rounded-3xl p-8 lg:p-10 shadow-2xl text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {locale === "en" ? "Invalid Link" : "Link Tidak Valid"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "en" ? "This reset password link is incomplete or invalid. Please request a new reset link." : "Tautan atur ulang kata sandi ini tidak lengkap atau tidak valid. Silakan ajukan permintaan reset baru."}
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex justify-center py-3 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all"
        >
          {locale === "en" ? "Request New Reset Link" : "Minta Link Reset Baru"}
        </Link>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-3xl p-8 lg:p-10 shadow-2xl">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> {locale === "en" ? "Back to Sign In" : "Kembali ke Halaman Masuk"}
      </Link>

      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {locale === "en" ? "Create New Password" : "Buat Kata Sandi Baru"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "en" ? "Reset password for account" : "Atur ulang kata sandi untuk akun"} <br />
          <strong className="text-foreground">{email}</strong>
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center font-medium"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5 ml-1">
            {locale === "en" ? "New Password" : "Kata Sandi Baru"}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 text-sm"
              placeholder={locale === "en" ? "At least 6 characters" : "Minimal 6 karakter"}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5 ml-1">
            {locale === "en" ? "Confirm New Password" : "Konfirmasi Kata Sandi Baru"}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 text-sm"
              placeholder={locale === "en" ? "Repeat new password" : "Ulangi kata sandi baru"}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-primary-foreground bg-primary hover:bg-primary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-8 cursor-pointer touch-manipulation select-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{locale === "en" ? "Updating Password..." : "Memperbarui Kata Sandi..."}</span>
            </>
          ) : (
            locale === "en" ? "Save New Password" : "Simpan Kata Sandi Baru"
          )}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  const { locale } = useTranslation()

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Left Section */}
      <div className="lg:w-1/2 w-full p-8 lg:p-12 flex flex-col justify-center items-center relative z-10 border-b lg:border-b-0 lg:border-r border-border bg-card/30 backdrop-blur-sm min-h-[35vh] lg:min-h-screen">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--primary)_5%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--primary)_5%,transparent)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 text-center max-w-md mx-auto space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -15, 0] }}
            transition={{
              scale: { type: "spring", stiffness: 200, damping: 20 },
              opacity: { duration: 0.5 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
            className="mx-auto w-48 lg:w-72 aspect-video rounded-[1.5rem] lg:rounded-[2rem] glass-panel flex items-center justify-center shadow-2xl shadow-primary/25 border border-primary/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-accent/40 blur-xl" />
            <div className="absolute inset-0 z-20">
              <img
                src="/icon.jpg"
                alt="Linkora Logo"
                className="absolute inset-0 w-full h-full object-cover z-30 pointer-events-none"
              />
            </div>
          </motion.div>

          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl lg:text-4xl font-bold font-heading"
            >
              {locale === "en" ? "Your New" : "Kata Sandi"} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {locale === "en" ? "Password" : "Baru Anda"}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-sm lg:text-base"
            >
              {locale === "en" ? "Create a strong and protected password to secure your digital workspace." : "Buat kata sandi yang kuat dan terlindungi untuk mengamankan ruang kerja digital Anda."}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Form Right Section */}
      <div className="lg:w-1/2 w-full flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <Suspense
            fallback={
              <div className="glass-panel rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  )
}
