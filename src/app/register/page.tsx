"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Lock, Mail, User, MapPin, KeyRound, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

interface Region {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter()
  const { locale } = useTranslation()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Multi-step Registration State
  const [step, setStep] = useState<"FORM" | "OTP">("FORM")
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendNotice, setResendNotice] = useState("")

  const [provinces, setProvinces] = useState<Region[]>([])
  const [regencies, setRegencies] = useState<Region[]>([])
  const [districts, setDistricts] = useState<Region[]>([])
  const [villages, setVillages] = useState<Region[]>([])

  const [selProvince, setSelProvince] = useState<{ id: string, name: string } | null>(null)
  const [selRegency, setSelRegency] = useState<{ id: string, name: string } | null>(null)
  const [selDistrict, setSelDistrict] = useState<{ id: string, name: string } | null>(null)
  const [selVillage, setSelVillage] = useState<{ id: string, name: string } | null>(null)

  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then(r => r.json())
      .then(data => setProvinces(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (selProvince) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selProvince.id}.json`)
        .then(r => r.json())
        .then(data => setRegencies(data))
        .catch(console.error)
    } else {
      setRegencies([])
      setDistricts([])
      setVillages([])
    }
  }, [selProvince])

  useEffect(() => {
    if (selRegency) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selRegency.id}.json`)
        .then(r => r.json())
        .then(data => setDistricts(data))
        .catch(console.error)
    } else {
      setDistricts([])
      setVillages([])
    }
  }, [selRegency])

  useEffect(() => {
    if (selDistrict) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selDistrict.id}.json`)
        .then(r => r.json())
        .then(data => setVillages(data))
        .catch(console.error)
    } else {
      setVillages([])
    }
  }, [selDistrict])

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResendNotice("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const postalCode = formData.get("postalCode") as string

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, email, password,
          province: selProvince?.name,
          regency: selRegency?.name,
          district: selDistrict?.name,
          village: selVillage?.name,
          postalCode
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || (locale === "en" ? "An error occurred" : "Terjadi kesalahan"))
        setLoading(false)
      } else {
        setRegisteredEmail(email.toLowerCase().trim())
        setResendCooldown(data.cooldownSeconds || 60)
        setStep("OTP")
        setLoading(false)
      }
    } catch (_err) {
      setError(locale === "en" ? "An unexpected error occurred" : "Terjadi kesalahan yang tidak terduga")
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.trim().length !== 6) {
      setError(locale === "en" ? "Enter the 6-digit verification code accurately." : "Masukkan 6 digit kode verifikasi dengan benar.")
      return
    }

    setOtpLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registeredEmail,
          otp: otp.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || (locale === "en" ? "Invalid verification code" : "Kode verifikasi tidak valid"))
        setOtpLoading(false)
      } else {
        router.push("/login?registered=true")
      }
    } catch (_err) {
      setError(locale === "en" ? "Failed to verify code. Please check your connection." : "Gagal memverifikasi kode. Silakan periksa koneksi Anda.")
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return

    setResendLoading(true)
    setError("")
    setResendNotice("")

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || (locale === "en" ? "Failed to resend code" : "Gagal mengirim ulang kode"))
      } else {
        setResendNotice(locale === "en" ? "A new verification code has been sent to your email." : "Kode verifikasi baru telah dikirim ke email Anda.")
        setResendCooldown(data.cooldownSeconds || 60)
      }
    } catch (_err) {
      setError(locale === "en" ? "An error occurred while requesting a new code" : "Terjadi kesalahan saat meminta kode baru")
    } finally {
      setResendLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      setError("")
      // Clear greeting flag so Liko welcome dialog shows after login
      sessionStorage.removeItem("linkora_session_greeted")
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (_err) {
      setError(locale === "en" ? "Failed to connect with Google" : "Gagal menghubungkan dengan Google")
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background overflow-hidden relative">
      {/* Dekorasi Background Keseluruhan */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* Bagian Kiri: Welcome Hero Animasi */}
      <div className="lg:w-1/3 w-full p-4 sm:p-8 lg:p-12 py-6 sm:py-8 lg:py-12 flex flex-col justify-center items-center relative z-10 border-b lg:border-b-0 lg:border-r border-border bg-card/30 backdrop-blur-sm lg:min-h-screen">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--primary)_5%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--primary)_5%,transparent)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-sm mx-auto space-y-4 sm:space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
            transition={{ 
              scale: { type: "spring", stiffness: 200, damping: 20 },
              opacity: { duration: 0.5 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="mx-auto w-36 sm:w-56 lg:w-80 aspect-video rounded-2xl sm:rounded-[1.5rem] lg:rounded-[2rem] glass-panel flex items-center justify-center shadow-xl sm:shadow-2xl shadow-accent/20 border border-accent/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-accent/40 to-primary/40 blur-xl" />
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
          
          <div className="space-y-2 sm:space-y-3">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading">
              {locale === "en" ? "Start Your" : "Awal Mula"} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">{locale === "en" ? "Journey" : "Perjalanan Anda"}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-muted-foreground text-xs sm:text-sm lg:text-base max-w-xs sm:max-w-none mx-auto">
              {locale === "en" ? "Register now and start managing your links and notes with our intelligent workspace." : "Daftar sekarang dan mulailah mengelola tautan Anda dengan sistem cerdas kami."}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Bagian Kanan: Form Register atau Form OTP */}
      <div className="lg:w-2/3 w-full p-4 sm:p-8 lg:p-12 py-6 sm:py-8 lg:py-12 relative z-10 overflow-y-auto max-h-screen flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-2xl">
            
            <AnimatePresence mode="wait">
              {step === "FORM" ? (
                <motion.div
                  key="form-step"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {locale === "en" ? "Create a New Account" : "Buat Akun Baru"}
                    </h2>
                    <p className="text-sm text-muted-foreground">{locale === "en" ? "Complete the form below to start your personal digital workspace." : "Lengkapi data di bawah ini untuk memulai ruang kerja digital Anda."}</p>
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
                    <span>{googleLoading ? (locale === "en" ? "Connecting to Google..." : "Menghubungkan ke Google...") : (locale === "en" ? "Continue with Google" : "Daftar dengan Google")}</span>
                  </button>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">{locale === "en" ? "Or register manually" : "Atau daftar manual"}</span>
                    </div>
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

                  <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
                    {/* Info Dasar */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" /> {locale === "en" ? "Account Information" : "Informasi Akun"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-foreground/80 mb-1 ml-1">{locale === "en" ? "Full Name" : "Nama Lengkap"}</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <input
                              name="name"
                              type="text"
                              required
                              autoComplete="off"
                              className="block w-full pl-9 pr-3 py-2.5 border border-border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                              placeholder={locale === "en" ? "Enter your full name" : "Masukkan nama lengkap Anda"}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-foreground/80 mb-1 ml-1">{locale === "en" ? "Email Address" : "Alamat Email"}</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <input
                              name="email"
                              type="email"
                              required
                              autoComplete="off"
                              className="block w-full pl-9 pr-3 py-2.5 border border-border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                              placeholder={locale === "en" ? "Enter your email address" : "Masukkan alamat email Anda"}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1 ml-1">{locale === "en" ? "Password" : "Kata Sandi"}</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            autoComplete="new-password"
                            className="block w-full pl-9 pr-3 py-2.5 border border-border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                            placeholder={locale === "en" ? "At least 6 characters" : "Masukkan minimal 6 karakter"}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info Alamat */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" /> {locale === "en" ? "Location / Address Information" : "Informasi Domisili"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1">{locale === "en" ? "Province" : "Provinsi"}</label>
                          <select
                            className="block w-full px-3 py-2.5 border border-border rounded-xl bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                            onChange={(e) => {
                              const opt = e.target.options[e.target.selectedIndex];
                              setSelProvince(opt.value ? { id: opt.value, name: opt.text } : null);
                              setSelRegency(null); setSelDistrict(null); setSelVillage(null);
                            }}
                          >
                            <option value="">{locale === "en" ? "Select Province" : "Pilih Provinsi"}</option>
                            {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1">{locale === "en" ? "City / Regency" : "Kabupaten / Kota"}</label>
                          <select
                            disabled={!selProvince}
                            className="block w-full px-3 py-2.5 border border-border rounded-xl bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm disabled:opacity-50"
                            onChange={(e) => {
                              const opt = e.target.options[e.target.selectedIndex];
                              setSelRegency(opt.value ? { id: opt.value, name: opt.text } : null);
                              setSelDistrict(null); setSelVillage(null);
                            }}
                          >
                            <option value="">{locale === "en" ? "Select City / Regency" : "Pilih Kabupaten/Kota"}</option>
                            {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1">{locale === "en" ? "District" : "Kecamatan"}</label>
                          <select
                            disabled={!selRegency}
                            className="block w-full px-3 py-2.5 border border-border rounded-xl bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm disabled:opacity-50"
                            onChange={(e) => {
                              const opt = e.target.options[e.target.selectedIndex];
                              setSelDistrict(opt.value ? { id: opt.value, name: opt.text } : null);
                              setSelVillage(null);
                            }}
                          >
                            <option value="">{locale === "en" ? "Select District" : "Pilih Kecamatan"}</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1">{locale === "en" ? "Village / Sub-district" : "Desa / Kelurahan"}</label>
                          <select
                            disabled={!selDistrict}
                            className="block w-full px-3 py-2.5 border border-border rounded-xl bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm disabled:opacity-50"
                            onChange={(e) => {
                              const opt = e.target.options[e.target.selectedIndex];
                              setSelVillage(opt.value ? { id: opt.value, name: opt.text } : null);
                            }}
                          >
                            <option value="">{locale === "en" ? "Select Village / Sub-district" : "Pilih Desa/Kelurahan"}</option>
                            {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1">{locale === "en" ? "Postal Code" : "Kode Pos"}</label>
                          <input
                            name="postalCode"
                            type="text"
                            className="block w-full px-3 py-2.5 border border-border rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                            placeholder={locale === "en" ? "Enter postal code" : "Masukkan kode pos Anda"}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-primary-foreground bg-primary hover:bg-primary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-8 cursor-pointer touch-manipulation select-none"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{locale === "en" ? "Sending Verification Code..." : "Mengirim Kode Verifikasi..."}</span>
                        </>
                      ) : (
                        locale === "en" ? "Proceed to Email Verification" : "Lanjutkan ke Verifikasi Email"
                      )}
                    </button>
                  </form>
                  
                  <div className="mt-8 text-center border-t border-border pt-6">
                    <p className="text-sm text-muted-foreground">
                      {locale === "en" ? "Already have an account?" : "Sudah memiliki akun?"}{" "}
                      <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                        {locale === "en" ? "Sign in here" : "Masuk di sini"}
                      </Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* Step OTP */
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setStep("FORM")
                      setError("")
                      setResendNotice("")
                    }}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
                  >
                    <ArrowLeft className="w-4 h-4" /> {locale === "en" ? "Back to Registration Form" : "Kembali ke Form Pendaftaran"}
                  </button>

                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {locale === "en" ? "Verify Your Email" : "Verifikasi Email Anda"}
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {locale === "en" ? "We've sent a 6-digit verification code to:" : "Kami telah mengirimkan 6 digit kode verifikasi ke alamat email:"}
                      <br />
                      <strong className="text-foreground">{registeredEmail}</strong>
                    </p>
                  </div>

                  {resendNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm text-center font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{resendNotice}</span>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-foreground/80 text-center mb-2">
                        {locale === "en" ? "Enter 6-Digit OTP Code" : "Masukkan 6 Digit Kode OTP"}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        required
                        autoFocus
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="••••••"
                        className="block w-full max-w-xs mx-auto py-3 px-4 border-2 border-border focus:border-primary rounded-2xl bg-background/80 text-foreground text-center font-mono text-3xl tracking-[12px] font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading || otp.length !== 6}
                      className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-primary-foreground bg-primary hover:bg-primary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation select-none"
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{locale === "en" ? "Verifying Account..." : "Memverifikasi Akun..."}</span>
                        </>
                      ) : (
                        locale === "en" ? "Verify & Activate Account" : "Verifikasi & Aktifkan Akun"
                      )}
                    </button>
                  </form>

                  <div className="text-center pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">
                      {locale === "en" ? "Didn't receive the verification code?" : "Tidak menerima kode verifikasi?"}
                    </p>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || resendLoading}
                      onClick={handleResendOtp}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
                    >
                      {resendLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>
                        {resendCooldown > 0
                          ? (locale === "en" ? `Resend code in ${resendCooldown}s` : `Kirim ulang kode dalam ${resendCooldown}s`)
                          : (locale === "en" ? "Resend Verification Code" : "Kirim Ulang Kode Verifikasi")}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>
    </div>
  )
}
