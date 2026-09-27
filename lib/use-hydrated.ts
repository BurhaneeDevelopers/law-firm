"use client"
import { useSyncExternalStore } from "react"

const noopSubscribe = () => () => {}

/**
 * False during server render and hydration, true afterwards.
 * Demo data and "today" depend on the browser's clock and timezone, so date-driven
 * UI renders only on the client to avoid hydration mismatches (server may run in UTC).
 */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

export function Hydrated({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return useHydrated() ? children : fallback
}
