"use client"

import { ThemeProvider } from "next-themes"

import { WaiverSync } from "@/components/features/auth/waiver-sync"

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
    </ThemeProvider>
  )
}

