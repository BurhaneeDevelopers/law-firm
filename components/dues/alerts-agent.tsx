"use client"
import { useEffect } from "react"
import { useToast } from "@/components/ui/toast"
import { useHydrated } from "@/lib/use-hydrated"
import { readAlertPrefs } from "@/lib/prefs"
import { collectDigestRows, DIGEST_STATUS_KEY, sendDigest, type DigestStatus } from "@/lib/email-digest"
import { formatINR, todayISO } from "@/lib/utils"
import { getDB } from "@/lib/store"

const DESKTOP_KEY = "vakilos-desktop-alert-date"

/**
 * Runs once per day when the app opens:
 * - emails the admin a list of fees due today and overdue
 * - shows a browser notification if the advocate turned it on
 *
 * Until the data lives on a server this only happens while someone opens the app.
 * The automation module will move it to a scheduled job.
 */
export function AlertsAgent() {
  const hydrated = useHydrated()
  const { toast } = useToast()

  useEffect(() => {
    if (!hydrated) return
    const db = getDB()
    const stored = readAlertPrefs()
    // Until the advocate sets a separate address, alerts go to the profile email.
    const prefs = { ...stored, adminEmail: stored.adminEmail || db.lawyer.email }
    const today = todayISO()
    const rows = collectDigestRows(db, prefs)
    if (!rows.length) return

    let last: DigestStatus | null = null
    try {
      last = JSON.parse(localStorage.getItem(DIGEST_STATUS_KEY) ?? "null") as DigestStatus | null
    } catch {
      last = null
    }
    if (prefs.emailDailyDigest && prefs.adminEmail && last?.date !== today) {
      sendDigest(db, prefs).then((r) => {
        if (r.sent) toast(`Today's fee alert emailed to ${prefs.adminEmail}`, "info")
      })
    }

    try {
      if (prefs.desktopAlerts && "Notification" in window && Notification.permission === "granted" && localStorage.getItem(DESKTOP_KEY) !== today) {
        const total = rows.reduce((s, r) => s + r.info.balance, 0)
        const overdue = rows.filter((r) => r.info.status === "Overdue").length
        new Notification(`Fees to collect: ${formatINR(total)}`, {
          body: `${rows.length - overdue} due today, ${overdue} overdue. Open Dues to follow up.`,
          tag: "vakilos-dues",
        })
        localStorage.setItem(DESKTOP_KEY, today)
      }
    } catch {
      // Notifications blocked or storage unavailable. The in-app bell still shows everything.
    }
  }, [hydrated, toast])

  return null
}
