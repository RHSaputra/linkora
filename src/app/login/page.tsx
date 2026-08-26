"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, Lock, Mail } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get("error")
    const registeredParam = searchParams.get("registered")
    const resetParam = searchParams.get("reset")

    if (registeredParam) {
      setSuccessMessage("Pendaftaran berhasil! Akun Anda telah aktif, silakan masuk.")
    } else if (resetParam) {
      setSuccessMessage("Password berhasil diperbarui! Silakan masuk dengan kata sandi baru.")
    }

    if (errorParam === "OAuthAccountNotLinked") {
      setError("Email ini sudah terdaftar dengan metode login lain.")
    } else if (errorParam === "OAuthSignin" || errorParam === "OAuthCallbackError") {
      setError("Gagal terhubung dengan akun Google. Silakan coba lagi.")
    } else if (errorParam === "Configuration") {
      setError("Konfigurasi Google Auth belum lengkap di server.")
    } else if (errorParam === "AccessDenied") {
      setError("Akses ditolak oleh pengguna.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMessage("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // Clear greeting flag so Liko welcome dialog shows after login
      sessionStorage.removeItem("linkora_session_greeted")
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Email atau kata sandi tidak valid")
        setLoading(false)
      } else {
        window.location.href = "/dashboard"
      }
    } catch (_err) {
      setError("Terjadi kesalahan saat masuk ke sistem")
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      setError("")
      setSuccessMessage("")
      // Clear greeting flag so Liko welcome dialog shows after login
      sessionStorage.removeItem("linkora_session_greeted")
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (_err) {
      setError("Gagal menginisialisasi login Google")
      setGoogleLoading(false)
    }
  }

  return (
    <div className="glass-panel rounded-3xl p-8 lg:p-10 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Masuk ke Akun Anda
        </h2>
        <p className="text-sm text-muted-foreground">Silakan identifikasi diri Anda, Komandan.</p>
      </div>

      <button
        type="button"
        disabled={googleLoading || loading}
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-xl shadow-sm text-sm font-medium text-foreground bg-foreground/5 hover:bg-foreground/10 transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {googleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        <span>{googleLoading ? "Menghubungkan ke Google..." : "Masuk dengan Google"}</span>
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">Atau masuk manual</span>
        </div>
      </div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm text-center font-medium"
        >
          {successMessage}
        </motion.div>
      )}

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
          <label className="block text-sm font-medium text-foreground/80 mb-1.5 ml-1">Alamat Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              name="email"
              type="email"
              required
              disabled={loading || googleLoading}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              placeholder="Masukkan alamat email Anda"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
            <label className="block text-sm font-medium text-foreground/80">Kata Sandi</label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              name="password"
              type="password"
              required
              disabled={loading || googleLoading}
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              placeholder="Masukkan kata sandi Anda"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8 cursor-pointer"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Akses Sistem"}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          Belum punya izin akses?{" "}
          <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Bagian Kiri: Welcome Hero Animasi */}
      <div className="lg:w-1/2 w-full p-8 lg:p-12 flex flex-col justify-center items-center relative z-10 border-b lg:border-b-0 lg:border-r border-border bg-card/30 backdrop-blur-sm min-h-[40vh] lg:min-h-screen">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--primary),0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--primary),0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 text-center max-w-md mx-auto space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -20, 0] }}
            transition={{
              scale: { type: "spring", stiffness: 200, damping: 20 },
              opacity: { duration: 0.5 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="mx-auto w-64 lg:w-96 aspect-video rounded-[1.5rem] lg:rounded-[2rem] glass-panel flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary),0.3)] border border-primary/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-accent/40 blur-xl" />
            <div className="absolute inset-0 z-20">
              <div className="relative w-full h-full">
                <img
                  src="/icon.jpg"
                  alt="Linkora Logo"
                  className="absolute inset-0 w-full h-full object-cover z-30 pointer-events-none"
                />
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-bold font-heading"
            >
              Selamat Datang di <br />
              <LinkoraText />
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-lg"
            >
              Ruang kerja digital imersif yang ditenagai oleh AI untuk mengelola semua tautan Anda.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Bagian Kanan: Form Login */}
      <div className="lg:w-1/2 w-full flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <Suspense fallback={
            <div className="glass-panel rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }>
            <LoginFormContent />
          </Suspense>
        </motion.div>
      </div>
    </div>
  )
}

