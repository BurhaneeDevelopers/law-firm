"use client"
import { useMemo } from "react"
import { useDB } from "./store"
import { useAlertPrefs } from "./prefs"
import { buildAlerts } from "./notifications"
import { useHydrated } from "./use-hydrated"

/** Live alerts plus read state. Empty until hydrated because alerts depend on the browser clock. */
export function useAlerts() {
  const db = useDB()
  const [prefs] = useAlertPrefs()
  const hydrated = useHydrated()
  const alerts = useMemo(() => (hydrated ? buildAlerts(db, prefs) : []), [db, prefs, hydrated])
  const read = useMemo(() => new Set(db.readAlertIds), [db.readAlertIds])
  const unread = alerts.filter((a) => !read.has(a.id))
  return { alerts, unread, read }
}
