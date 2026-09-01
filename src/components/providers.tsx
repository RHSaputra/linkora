"use client"

import { SessionProvider } from "next-auth/react"
import { RealtimeProvider } from "@/components/providers/realtime-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastProvider } from "@/components/ui/custom-toast"
import { I18nProvider } from "@/components/providers/i18n-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <ToastProvider>
          <RealtimeProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </RealtimeProvider>
        </ToastProvider>
      </I18nProvider>
    </SessionProvider>
  )
}


