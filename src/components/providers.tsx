"use client"

import { SessionProvider } from "next-auth/react"
import { RealtimeProvider } from "@/components/providers/realtime-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastProvider } from "@/components/ui/custom-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <RealtimeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </RealtimeProvider>
      </ToastProvider>
    </SessionProvider>
  )
}

