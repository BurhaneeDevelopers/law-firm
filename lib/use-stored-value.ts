"use client"
import { useCallback, useSyncExternalStore } from "react"

const EVENT = "lexfirm-storage"

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage blocked: value still applies for this render through the event below.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

/**
 * A localStorage value that is safe to read during render.
 * Server render and hydration see `fallback`; the stored value applies right after.
 */
export function useStoredValue(key: string, fallback: string): [string, (value: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key) ?? fallback,
    () => fallback
  )
  const set = useCallback((v: string) => writeStored(key, v), [key])
  return [value, set]
}
