"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, Lock, Mail } from "lucide-react"
import { LinkoraText } from "@/components/ui/linkora-text"
import { useTranslation } from "@/components/providers/i18n-provider"

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale } = useTranslation()
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get("error")
    const registeredParam = searchParams.get("registered")
    const resetParam = searchParams.get("reset")

    if (registeredParam) {
      setSuccessMessage(locale === "en" ? "Registration successful! Your account is active, please sign in." : "Pendaftaran berhasil! Akun Anda telah aktif, silakan masuk.")
    } else if (resetParam) {
      setSuccessMessage(locale === "en" ? "Password updated successfully! Please sign in with your new password." : "Password berhasil diperbarui! Silakan masuk dengan kata sandi baru.")
    }

    if (errorParam === "OAuthAccountNotLinked") {
      setError(locale === "en" ? "This email is already registered using another method. Please sign in with your original method." : "Email ini sudah terdaftar dengan metode lain. Silakan masuk menggunakan metode yang Anda gunakan sebelumnya.")
    } else if (errorParam) {
      setError(locale === "en" ? "Failed to sign in. Please check your email and password." : "Gagal masuk. Silakan periksa kembali email dan kata sandi Anda.")
    }
  }, [searchParams, locale])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError(locale === "en" ? "Invalid email or password." : "Email atau kata sandi yang Anda masukkan salah.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (_err) {
      setError(locale === "en" ? "An error occurred. Please try again." : "Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError("")
    setGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (_err) {
      setError(locale === "en" ? "Failed to initialize Google login" : "Gagal menginisialisasi login Google")
      setGoogleLoading(false)
    }
  }

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1.5 sm:mb-2">
          {locale === "en" ? "Sign In to Your Account" : "Masuk ke Akun Anda"}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{locale === "en" ? "Sign in to access your workspace and digital assets." : "Masuk untuk mengakses seluruh ruang kerja dan aset digital Anda."}</p>
      </div>

      <button
        type="button"
        disabled={googleLoading || loading}
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-xl shadow-xs text-sm font-semibold text-foreground bg-foreground/5 hover:bg-foreground/10 active:scale-95 transition-all duration-150 mb-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
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
        <span>{googleLoading ? (locale === "en" ? "Connecting to Google..." : "Menghubungkan ke Google...") : (locale === "en" ? "Continue with Google" : "Masuk dengan Google")}</span>
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">{locale === "en" ? "Or sign in manually" : "Atau masuk manual"}</span>
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

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-foreground/80 mb-1.5 ml-1">{locale === "en" ? "Email Address" : "Alamat Email"}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              name="email"
              type="email"
              required
              disabled={loading || googleLoading}
              className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-border rounded-xl bg-background/50 text-foreground text-base sm:text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              placeholder={locale === "en" ? "name@email.com" : "nama@email.com"}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
            <label className="block text-sm font-medium text-foreground/80">{locale === "en" ? "Password" : "Kata Sandi"}</label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {locale === "en" ? "Forgot password?" : "Lupa kata sandi?"}
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
              className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-border rounded-xl bg-background/50 text-foreground text-base sm:text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              placeholder={locale === "en" ? "Enter your password" : "Masukkan kata sandi Anda"}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-primary-foreground bg-primary hover:bg-primary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-8 cursor-pointer touch-manipulation select-none"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (locale === "en" ? "Sign In" : "Masuk ke Akun")}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          {locale === "en" ? "Don't have an account yet?" : "Belum memiliki akun?"}{" "}
          <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
            {locale === "en" ? "Register Now" : "Daftar Sekarang"}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { locale } = useTranslation();

  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-background overflow-x-hidden lg:overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      {/* Bagian Kiri: Welcome Hero Animasi */}
      <div className="lg:w-1/2 w-full p-4 sm:p-8 lg:p-12 py-6 sm:py-8 lg:py-12 flex flex-col justify-center items-center relative z-10 border-b lg:border-b-0 lg:border-r border-border bg-card/30 backdrop-blur-sm lg:min-h-screen">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--primary)_5%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--primary)_5%,transparent)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 text-center max-w-md mx-auto space-y-4 sm:space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
            transition={{
              scale: { type: "spring", stiffness: 200, damping: 20 },
              opacity: { duration: 0.5 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="mx-auto w-32 sm:w-64 lg:w-96 aspect-video rounded-2xl sm:rounded-[1.5rem] lg:rounded-[2rem] glass-panel flex items-center justify-center shadow-xl sm:shadow-2xl shadow-primary/25 border border-primary/30 relative overflow-hidden"
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

          <div className="space-y-2 sm:space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading"
            >
              {locale === "en" ? "Welcome to" : "Selamat Datang di"} <br />
              <LinkoraText />
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-xs sm:text-base lg:text-lg max-w-xs sm:max-w-none mx-auto"
            >
              {locale === "en" ? "An immersive AI-powered workspace to organize and supercharge all your links and notes." : "Ruang kerja digital imersif yang ditenagai oleh AI untuk mengelola semua tautan Anda."}
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

