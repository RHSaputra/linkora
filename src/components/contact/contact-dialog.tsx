"use client"

import { useState, useRef } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, X, MessageSquare, User, Sparkles } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"
import { RecaptchaCheckbox, RecaptchaCheckboxRef } from "@/components/ui/recaptcha-checkbox"

interface ContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const { locale } = useTranslation()
  const isEn = locale === "en"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState("Pertanyaan Umum")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<RecaptchaCheckboxRef>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, message, captchaToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || (isEn ? "Failed to send message" : "Gagal mengirim pesan"))
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
      } else {
        setSuccess(true)
        setName("")
        setEmail("")
        setMessage("")
        setCaptchaToken(null)
      }
    } catch {
      setError(isEn ? "A network error occurred. Please try again." : "Terjadi kesalahan jaringan. Silakan coba lagi.")
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setSuccess(false)
      setError("")
    }, 300)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl sm:rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl focus:outline-none max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <Dialog.Close asChild>
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 sm:right-6 sm:top-6 rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <Dialog.Title className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                  {isEn ? "Contact Linkorian" : "Hubungi Linkorian"}
                </Dialog.Title>
                <Dialog.Description className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {isEn
                    ? "Have questions, feedback, or need help? Message our team directly."
                    : "Punya pertanyaan, kendala, atau saran? Kirim pesan ke tim resmi kami."}
                </Dialog.Description>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-bold text-foreground">
                      {isEn ? "Message Sent Successfully!" : "Pesan Berhasil Terkirim!"}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      {isEn
                        ? "Thank you for reaching out. We will review your message and reply to your email shortly."
                        : "Terima kasih telah menghubungi kami. Pesan Anda telah diteruskan ke tim resmi kami dan akan segera kami balas ke email Anda."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-md"
                  >
                    {isEn ? "Close Window" : "Tutup Jendela"}
                  </button>
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1 ml-1">
                      {isEn ? "Your Full Name" : "Nama Lengkap Anda"} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isEn ? "e.g., Alex Johnson" : "Contoh: Rahmad Saputra"}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background/60 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1 ml-1">
                      {isEn ? "Email Address" : "Alamat Email Anda"} *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background/60 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1 ml-1">
                      {isEn ? "Category" : "Kategori Pesan"}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background/60 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      <option value="Pertanyaan Umum">{isEn ? "General Inquiry" : "Pertanyaan Umum"}</option>
                      <option value="Bantuan Akun & Login">{isEn ? "Account & Login Assistance" : "Bantuan Akun & Login"}</option>
                      <option value="Kendala Teknis / Bug">{isEn ? "Technical Issue / Bug Report" : "Kendala Teknis / Bug"}</option>
                      <option value="Saran & Masukan">{isEn ? "Feedback & Suggestions" : "Saran & Masukan"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground/80 mb-1 ml-1">
                      {isEn ? "Message Content" : "Isi Pesan Anda"} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      minLength={10}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={isEn ? "Write your questions or feedback here..." : "Tuliskan pesan, pertanyaan, atau masukan Anda di sini..."}
                      className="w-full p-3 rounded-xl border border-border bg-background/60 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    />
                  </div>

                  {/* Google reCAPTCHA v2 Checkbox */}
                  <div className="pt-1 flex justify-center">
                    <RecaptchaCheckbox
                      ref={recaptchaRef}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpired={() => setCaptchaToken(null)}
                      theme="dark"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> {isEn ? "Sent to official support team" : "Diteruskan ke tim resmi"}
                    </p>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isEn ? "Sending..." : "Mengirim..."}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{isEn ? "Send Message" : "Kirim Pesan"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
