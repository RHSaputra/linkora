"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { ShieldCheck } from "lucide-react"

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string
          theme?: "dark" | "light"
          callback?: (token: string) => void
          "expired-callback"?: () => void
          "error-callback"?: () => void
        }
      ) => number
      reset: (opt_widget_id?: number) => void
      getResponse: (opt_widget_id?: number) => string
    }
    onRecaptchaLoadCallback?: () => void
  }
}

export interface RecaptchaCheckboxRef {
  reset: () => void
}

interface RecaptchaCheckboxProps {
  onVerify: (token: string) => void
  onExpired?: () => void
  theme?: "dark" | "light"
  className?: string
}

export const RecaptchaCheckbox = forwardRef<RecaptchaCheckboxRef, RecaptchaCheckboxProps>(
  function RecaptchaCheckbox({ onVerify, onExpired, theme = "dark", className = "" }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<number | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || ""

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (typeof window !== "undefined" && window.grecaptcha && widgetIdRef.current !== null) {
          try {
            window.grecaptcha.reset(widgetIdRef.current)
          } catch {
            // ignore
          }
        }
      },
    }))

    useEffect(() => {
      // Jika site key belum diatur, jangan load script Google
      if (!siteKey) return

      let isMounted = true

      const renderWidget = () => {
        if (!isMounted || !containerRef.current || !window.grecaptcha?.render) return

        // Mencegah duplicate render di container yang sama
        if (widgetIdRef.current !== null) return

        try {
          const id = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            callback: (token: string) => {
              if (isMounted) onVerify(token)
            },
            "expired-callback": () => {
              if (isMounted && onExpired) onExpired()
            },
            "error-callback": () => {
              if (isMounted && onExpired) onExpired()
            },
          })
          widgetIdRef.current = id
          setIsLoaded(true)
        } catch {
          // Widget mungkin sudah ter-render sebelumnya
        }
      }

      // Check jika script recaptcha sudah pernah dimuat di document
      const existingScript = document.getElementById("google-recaptcha-script")

      if (window.grecaptcha?.render) {
        renderWidget()
      } else if (!existingScript) {
        window.onRecaptchaLoadCallback = () => {
          if (window.grecaptcha) {
            window.grecaptcha.ready(renderWidget)
          }
        }

        const script = document.createElement("script")
        script.id = "google-recaptcha-script"
        script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoadCallback&render=explicit&hl=id"
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      } else {
        // Script sudah ada, tunggu siap
        const checkInterval = setInterval(() => {
          if (window.grecaptcha?.render) {
            clearInterval(checkInterval)
            renderWidget()
          }
        }, 100)

        return () => {
          clearInterval(checkInterval)
          isMounted = false
        }
      }

      return () => {
        isMounted = false
      }
    }, [siteKey, theme, onVerify, onExpired])

    // Jika Site Key belum diisi di environment, tampilkan indikator ramah developer
    if (!siteKey) {
      return (
        <div className={`p-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-500 text-xs flex items-center justify-between gap-2 ${className}`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              <strong>reCAPTCHA Mode Siap:</strong> Masukkan <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> di <code>.env</code> untuk menampilkan checkbox asli.
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className={`flex flex-col items-center justify-center my-3 min-h-[78px] ${className}`}>
        <div ref={containerRef} className="recaptcha-container" />
        {!isLoaded && (
          <div className="text-[11px] text-muted-foreground animate-pulse mt-1">
            Memuat reCAPTCHA...
          </div>
        )}
      </div>
    )
  }
)
