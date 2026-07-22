"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()

  useEffect(() => setMounted(true), [])

  // ponytail: avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
