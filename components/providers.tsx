"use client"

import { ThemeProvider } from "next-themes"

import { WaiverSync } from "@/components/features/auth/waiver-sync"
import { PWAInstallPrompt, PWAUpdateNotification, OnlineStatusIndicator } from "@/components/features/pwa"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      forcedTheme="dark"
    >
      <WaiverSync />
      {children}
      <PWAInstallPrompt />
      <PWAUpdateNotification />
      <OnlineStatusIndicator />
    </ThemeProvider>
  )
}

