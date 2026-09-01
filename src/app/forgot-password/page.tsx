"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Mail, CheckCircle2, ShieldQuestion } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

export default function ForgotPasswordPage() {
  const { locale } = useTranslation()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || (locale === "en" ? "An error occurred. Please try again." : "Terjadi kesalahan. Silakan coba lagi."))
      } else {
        setSubmitted(true)
        setMessage(
          data.message ||
            (locale === "en"
              ? "If the email is registered, we have sent instructions to reset your password."
              : "Jika email tersebut terdaftar, kami telah mengirimkan instruksi untuk mengatur ulang password.")
        )
      }
    } catch (_err) {
      setError(locale === "en" ? "Failed to contact server. Please check your internet connection." : "Gagal menghubungi server. Periksa koneksi internet Anda.")
    } finally {
      setLoading(false)
    }
  }

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
              {locale === "en" ? "Recover Your" : "Pemulihan"} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {locale === "en" ? "Account Access" : "Akses Akun"}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-sm lg:text-base"
            >
              {locale === "en" ? "We will help you reset your password with an encrypted security link." : "Kami akan membantu Anda mengatur ulang kata sandi dengan tautan keamanan terenkripsi."}
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
          <div className="glass-panel rounded-3xl p-8 lg:p-10 shadow-2xl">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> {locale === "en" ? "Back to Sign In" : "Kembali ke Halaman Masuk"}
            </Link>

            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
                <ShieldQuestion className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {locale === "en" ? "Forgot Password?" : "Lupa Kata Sandi?"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {locale === "en" ? "Enter the email address registered with your Linkora account." : "Masukkan alamat email yang terdaftar pada akun Linkora Anda."}
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">{locale === "en" ? "Instructions Sent" : "Instruksi Terkirim"}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  {locale === "en" ? "Check your inbox (or spam folder) in a few moments." : "Periksa kotak masuk (atau folder spam) email Anda dalam beberapa saat."}
                </p>

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all text-center"
                  >
                    {locale === "en" ? "Back to Sign In" : "Kembali ke Halaman Masuk"}
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5 ml-1">
                    {locale === "en" ? "Email Address" : "Alamat Email"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 text-sm"
                      placeholder={locale === "en" ? "name@example.com" : "nama@email.com"}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-primary-foreground bg-primary hover:bg-primary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-8 cursor-pointer touch-manipulation select-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{locale === "en" ? "Sending Instructions..." : "Mengirim Instruksi..."}</span>
                    </>
                  ) : (
                    locale === "en" ? "Send Reset Instructions" : "Kirim Instruksi Reset Password"
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 text-center border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                {locale === "en" ? "Remember your password?" : "Ingat kata sandi Anda?"}{" "}
                <Link
                  href="/login"
                  className="font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  {locale === "en" ? "Sign in here" : "Masuk di sini"}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
