"use client"
import { useCallback, useMemo } from "react"
import { useStoredValue, writeStored } from "./use-stored-value"

export const ALERT_PREFS_KEY = "vakilos-alert-prefs"

export type AlertPrefs = {
  /** Where payment alerts are emailed. Usually the advocate or the accounts clerk. */
  adminEmail: string
  /** Daily email listing fees due today and overdue fees. */
  emailDailyDigest: boolean
  /** Include every overdue fee in the email, not just the ones due today. */
  emailIncludeOverdue: boolean
  /** Alert this many days before a fee falls due (0 = on the day only). */
  remindDaysBefore: number
  /** Browser notification once a day when fees are due or overdue. */
  desktopAlerts: boolean
  hearingAlerts: boolean
  deadlineAlerts: boolean
  newCaseAlerts: boolean
}

export const defaultAlertPrefs: AlertPrefs = {
  adminEmail: "",
  emailDailyDigest: true,
  emailIncludeOverdue: true,
  remindDaysBefore: 3,
  desktopAlerts: false,
  hearingAlerts: true,
  deadlineAlerts: true,
  newCaseAlerts: true,
}

function parse(raw: string): AlertPrefs {
  try {
    return { ...defaultAlertPrefs, ...(JSON.parse(raw) as Partial<AlertPrefs>) }
  } catch {
    return defaultAlertPrefs
  }
}

export function readAlertPrefs(): AlertPrefs {
  try {
    return parse(localStorage.getItem(ALERT_PREFS_KEY) ?? "{}")
  } catch {
    return defaultAlertPrefs
  }
}

export function useAlertPrefs(): [AlertPrefs, (patch: Partial<AlertPrefs>) => void] {
  const [raw] = useStoredValue(ALERT_PREFS_KEY, "{}")
  const prefs = useMemo(() => parse(raw), [raw])
  const update = useCallback((patch: Partial<AlertPrefs>) => {
    writeStored(ALERT_PREFS_KEY, JSON.stringify({ ...readAlertPrefs(), ...patch }))
  }, [])
  return [prefs, update]
}
