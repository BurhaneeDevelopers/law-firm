"use client"

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react"
import { useStoredValue } from "./use-stored-value"
import { useHydrated } from "./use-hydrated"

export type ThemePreference = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
  /** What the user picked (light, dark or follow the device). */
  preference: ThemePreference
  /** What is on screen right now. */
  theme: ResolvedTheme
  setPreference: (p: ThemePreference) => void
  toggleTheme: () => void
}

export const THEME_STORAGE_KEY = "lexfirm-theme"
export const SIDEBAR_STORAGE_KEY = "lexfirm-sidebar-collapsed"

/**
 * Runs in <head> before first paint so the page never flashes the wrong theme
 * or sidebar width. Keep in sync with applyTheme below.
 */
export const themeInitScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.dataset.theme=d?"dark":"light";if(localStorage.getItem("${SIDEBAR_STORAGE_KEY}")==="1")r.style.setProperty("--sidebar-width","72px");}catch(e){}})();`

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const DARK_QUERY = "(prefers-color-scheme: dark)"

function subscribeSystem(callback: () => void) {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.dataset.theme = theme
}

function toPreference(value: string): ThemePreference {
  return value === "light" || value === "dark" ? value : "system"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated()
  const [stored, setStored] = useStoredValue(THEME_STORAGE_KEY, "system")
  const systemDark = useSyncExternalStore(subscribeSystem, () => window.matchMedia(DARK_QUERY).matches, () => false)

  const preference = toPreference(stored)
  const theme: ResolvedTheme = preference === "system" ? (systemDark ? "dark" : "light") : preference

  useEffect(() => {
    // The <head> script painted the correct theme already; wait for client values before touching it.
    if (hydrated) applyTheme(theme)
  }, [theme, hydrated])

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      theme,
      setPreference: (p) => setStored(p),
      toggleTheme: () => setStored(theme === "dark" ? "light" : "dark"),
    }),
    [preference, theme, setStored]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
