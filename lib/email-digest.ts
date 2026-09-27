"use client"
import { formatDate, formatINR, todayISO } from "./utils"
import { getDueInfos, isOpenDue, type DB, type DueInfo } from "./store"
import type { AlertPrefs } from "./prefs"
import { writeStored } from "./use-stored-value"

export const DIGEST_STATUS_KEY = "vakilos-digest-status"

export type DigestStatus = { date: string; sent: boolean; reason?: string; count: number; at: string }

export type DigestRow = { info: DueInfo; clientName: string; phone: string; caseNumber: string }

export function collectDigestRows(db: DB, prefs: AlertPrefs): DigestRow[] {
  return getDueInfos(db)
    .filter(isOpenDue)
    .filter((i) => i.status === "Due today" || (prefs.emailIncludeOverdue && i.status === "Overdue"))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .map((info) => {
      const c = db.cases.find((x) => x.id === info.due.case_id)
      const client = c ? db.clients.find((x) => x.id === c.client_id) : undefined
      return { info, clientName: client?.full_name ?? "Unknown client", phone: client?.phone ?? "", caseNumber: c?.case_number ?? "" }
    })
}

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch] as string)

export function buildDigestEmail(rows: DigestRow[], firmName: string, appUrl: string) {
  const today = rows.filter((r) => r.info.status === "Due today")
  const overdue = rows.filter((r) => r.info.status === "Overdue")
  const total = rows.reduce((s, r) => s + r.info.balance, 0)
  const subject = `Fees to collect: ${formatINR(total)} (${today.length} due today, ${overdue.length} overdue)`

  const line = (r: DigestRow) =>
    `${r.clientName} (${r.phone}) · ${r.caseNumber} · ${r.info.due.description} · ${formatINR(r.info.balance)}${
      r.info.status === "Overdue" ? ` · ${r.info.daysOverdue} days overdue` : " · due today"
    }`

  const text = [
    `${firmName}: fees to collect on ${formatDate(new Date(), "EEEE, dd MMM yyyy")}`,
    "",
    today.length ? "DUE TODAY" : "",
    ...today.map(line),
    today.length ? "" : "",
    overdue.length ? "OVERDUE" : "",
    ...overdue.map(line),
    "",
    `Total: ${formatINR(total)}`,
    `Open the Dues screen: ${appUrl}/dues`,
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n")

  const rowHtml = (r: DigestRow) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e3e5ee">
        <strong>${esc(r.clientName)}</strong><br/><span style="color:#525770;font-size:12px">${esc(r.phone)} · ${esc(r.caseNumber)}</span>
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #e3e5ee;color:#525770">${esc(r.info.due.description)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e3e5ee;text-align:right;white-space:nowrap"><strong>${formatINR(r.info.balance)}</strong></td>
      <td style="padding:10px 8px;border-bottom:1px solid #e3e5ee;white-space:nowrap;color:${r.info.status === "Overdue" ? "#a3143a" : "#8a4b06"}">
        ${r.info.status === "Overdue" ? `${r.info.daysOverdue} days overdue` : "Due today"}
      </td>
    </tr>`

  const section = (title: string, list: DigestRow[]) =>
    list.length
      ? `<h3 style="margin:24px 0 8px;font-size:14px">${title}</h3>
         <table style="width:100%;border-collapse:collapse;font-size:13px">${list.map(rowHtml).join("")}</table>`
      : ""

  const html = `<!doctype html><html><body style="margin:0;background:#f6f7fb;font-family:Segoe UI,Arial,sans-serif;color:#14162b">
    <div style="max-width:640px;margin:0 auto;padding:24px">
      <div style="background:#fff;border:1px solid #e3e5ee;border-radius:14px;padding:24px">
        <p style="margin:0;color:#525770;font-size:13px">${esc(firmName)}</p>
        <h2 style="margin:4px 0 0;font-size:20px">Fees to collect: ${formatINR(total)}</h2>
        <p style="margin:6px 0 0;color:#525770;font-size:13px">${formatDate(new Date(), "EEEE, dd MMM yyyy")} · ${today.length} due today · ${overdue.length} overdue</p>
        ${section("Due today", today)}
        ${section("Overdue", overdue)}
        <p style="margin:24px 0 0"><a href="${esc(appUrl)}/dues" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-size:14px">Open Dues</a></p>
      </div>
      <p style="color:#6b7088;font-size:11px;text-align:center;margin-top:16px">Sent by VakilOS. Change this in Settings, Alerts and email.</p>
    </div></body></html>`

  return { subject, text, html, total }
}

export async function sendDigest(db: DB, prefs: AlertPrefs, opts: { force?: boolean } = {}): Promise<DigestStatus> {
  const rows = collectDigestRows(db, prefs)
  const status: DigestStatus = { date: todayISO(), sent: false, count: rows.length, at: new Date().toISOString() }
  if (!prefs.adminEmail) return { ...status, reason: "no_email" }
  if (!rows.length && !opts.force) return { ...status, reason: "nothing_due" }

  const email = rows.length
    ? buildDigestEmail(rows, db.lawyer.firm_name, window.location.origin)
    : {
        subject: "VakilOS test email: payment alerts are working",
        text: "No fees are due today or overdue. You will get a daily email when there are.",
        html: "<p>No fees are due today or overdue. You will get a daily email when there are.</p>",
      }
  try {
    const res = await fetch("/api/notify/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: prefs.adminEmail, subject: email.subject, html: email.html, text: email.text }),
    })
    const data = (await res.json()) as { sent: boolean; reason?: string }
    const result = { ...status, sent: data.sent, reason: data.reason }
    writeStored(DIGEST_STATUS_KEY, JSON.stringify(result))
    return result
  } catch {
    const result = { ...status, reason: "network_error" }
    writeStored(DIGEST_STATUS_KEY, JSON.stringify(result))
    return result
  }
}

export const digestReasonText: Record<string, string> = {
  not_configured: "Email service not set up on the server. Add RESEND_API_KEY to the environment.",
  recipient_not_allowed: "The server only allows mail to the ADMIN_EMAIL address.",
  provider_error: "The email service rejected the message. Check EMAIL_FROM is a verified sender.",
  network_error: "Could not reach the server.",
  no_email: "Add an email address to receive payment alerts.",
  nothing_due: "Nothing due today or overdue, so no email was needed.",
  invalid_request: "The email address looks invalid.",
}
