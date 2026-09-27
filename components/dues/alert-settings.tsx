"use client"
import { useState } from "react"
import { Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, Input, Select } from "@/components/ui/field"
import { Switch } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { cn, formatINR, formatRelativeTime, isValidEmail } from "@/lib/utils"
import { useAlertPrefs, type AlertPrefs } from "@/lib/prefs"
import { collectDigestRows, digestReasonText, DIGEST_STATUS_KEY, sendDigest, type DigestStatus } from "@/lib/email-digest"
import { useStoredValue } from "@/lib/use-stored-value"
import { useDB } from "@/lib/store"

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-1 py-2.5">
      <span>
        <span className="block text-sm text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  )
}

export function AlertSettings({ fallbackEmail }: { fallbackEmail: string }) {
  const db = useDB()
  const { toast } = useToast()
  const [prefs, update] = useAlertPrefs()
  const [statusRaw] = useStoredValue(DIGEST_STATUS_KEY, "")
  const [email, setEmail] = useState(prefs.adminEmail || fallbackEmail)
  const [emailError, setEmailError] = useState("")
  const [sending, setSending] = useState(false)
  const [permission, setPermission] = useState<string>(() => ("Notification" in window ? Notification.permission : "unsupported"))

  let status: DigestStatus | null = null
  try {
    status = statusRaw ? (JSON.parse(statusRaw) as DigestStatus) : null
  } catch {
    status = null
  }

  const rows = collectDigestRows(db, prefs)
  const total = rows.reduce((s, r) => s + r.info.balance, 0)
  const set = (patch: Partial<AlertPrefs>) => update(patch)

  const saveEmail = () => {
    if (email && !isValidEmail(email)) {
      setEmailError("Enter a valid email address")
      return
    }
    setEmailError("")
    set({ adminEmail: email.trim() })
    toast(email ? `Payment alerts will go to ${email}` : "Email alerts turned off", "success")
  }

  const sendNow = async () => {
    const target = email.trim()
    if (!isValidEmail(target)) {
      setEmailError("Enter a valid email address first")
      return
    }
    set({ adminEmail: target })
    setSending(true)
    const result = await sendDigest(db, { ...prefs, adminEmail: target }, { force: true })
    setSending(false)
    if (result.sent) toast(`Sent to ${target}`, "success")
    else toast(digestReasonText[result.reason ?? ""] ?? "Could not send the email", "error")
  }

  const enableDesktop = async (on: boolean) => {
    if (!on) return set({ desktopAlerts: false })
    if (!("Notification" in window)) {
      toast("This browser does not support notifications", "error")
      return
    }
    const p = await Notification.requestPermission()
    setPermission(p)
    if (p === "granted") {
      set({ desktopAlerts: true })
      new Notification("VakilOS alerts are on", { body: "You will get one alert a day when fees are due." })
    } else {
      toast("Notifications are blocked. Allow them in the browser's site settings.", "warning")
    }
  }

  return (
    <div className="divide-y divide-border animate-fade-in">
      <section className="space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Payment alerts by email</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">One email a day listing fees due today and overdue, with client phone numbers.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <Field label="Send alerts to" error={emailError} hint="You, or the clerk who follows up on fees" className="sm:flex-1">
            <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError("") }} onBlur={saveEmail} placeholder="accounts@yourchamber.in" />
          </Field>
          <Button variant="outline" className="sm:mt-[26px]" onClick={sendNow} loading={sending}>
            {!sending && <Send />} {rows.length ? "Send today's email now" : "Send a test email"}
          </Button>
        </div>
        <div className="rounded-xl bg-surface-2 px-4 py-3 text-[13px]">
          <p className="text-foreground">
            Today: {rows.length ? <><span className="font-semibold">{rows.length} fees</span> worth <span className="font-semibold">{formatINR(total)}</span> would be in the email.</> : "nothing due, so no email goes out."}
          </p>
          {status && (
            <p className={cn("mt-1 flex items-start gap-1.5", status.sent ? "text-success-soft-foreground" : "text-warning-soft-foreground")}>
              <Mail className="mt-0.5 size-3.5 shrink-0" />
              {status.sent ? `Last sent ${formatRelativeTime(status.at)}.` : `Last attempt ${formatRelativeTime(status.at)}: ${digestReasonText[status.reason ?? ""] ?? "not sent."}`}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Toggle label="Email me every day fees are due" hint="Sent the first time the app is opened that day" checked={prefs.emailDailyDigest} onChange={(v) => set({ emailDailyDigest: v })} />
          <Toggle label="Include all overdue fees" hint="Otherwise only fees due that day" checked={prefs.emailIncludeOverdue} onChange={(v) => set({ emailIncludeOverdue: v })} />
        </div>
      </section>

      <section className="space-y-3 p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">In-app alerts</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Shown on the bell and the Notifications page.</p>
        </div>
        <Field label="Warn me before a fee falls due" className="sm:max-w-xs">
          <Select value={String(prefs.remindDaysBefore)} onChange={(e) => set({ remindDaysBefore: Number(e.target.value) })}>
            <option value="0">Only on the day</option>
            <option value="1">1 day before</option>
            <option value="3">3 days before</option>
            <option value="7">7 days before</option>
          </Select>
        </Field>
        <div className="space-y-1">
          <Toggle label="Hearings today and tomorrow" checked={prefs.hearingAlerts} onChange={(v) => set({ hearingAlerts: v })} />
          <Toggle label="Deadlines within 3 days" checked={prefs.deadlineAlerts} onChange={(v) => set({ deadlineAlerts: v })} />
          <Toggle label="New cases added" checked={prefs.newCaseAlerts} onChange={(v) => set({ newCaseAlerts: v })} />
          <Toggle
            label="Desktop notification"
            hint={permission === "denied" ? "Blocked in this browser. Allow notifications in site settings." : "One pop-up a day when fees are due, even if this tab is in the background"}
            checked={prefs.desktopAlerts && permission === "granted"}
            onChange={enableDesktop}
          />
        </div>
      </section>
      <p className="px-5 py-4 text-xs text-subtle-foreground sm:px-6">
        Settings are saved on this device. Emails need RESEND_API_KEY on the server.
      </p>
    </div>
  )
}
