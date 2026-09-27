// Alerts are computed from live data, not stored. An alert stays until the underlying
// condition clears (fee paid, outcome recorded). Read state is tracked by alert id.
import type { AlertPrefs } from "./prefs"
import { formatDate, formatINR, formatTime, getDaysUntil, timeToMinutes, todayISO } from "./utils"
import { getDueInfos, isOpenDue, type DB, type DueInfo } from "./store"

export type AlertCategory = "Payments" | "Hearings" | "Deadlines" | "Cases"
export type AlertSeverity = "danger" | "warning" | "info" | "success"

export type Alert = {
  id: string
  category: AlertCategory
  severity: AlertSeverity
  title: string
  body: string
  href: string
  /** Sort key. Higher = more urgent. */
  rank: number
  /** Date the alert relates to (yyyy-MM-dd). */
  date: string
  dueId?: string
  hearingId?: string
}

export function dueAlertTitle(info: DueInfo, clientName: string) {
  if (info.status === "Overdue") return `${formatINR(info.balance)} overdue from ${clientName}`
  if (info.status === "Due today") return `${formatINR(info.balance)} due today from ${clientName}`
  return `${formatINR(info.balance)} due ${info.daysUntil === 1 ? "tomorrow" : `in ${info.daysUntil} days`} from ${clientName}`
}

export function buildAlerts(db: DB, prefs: AlertPrefs): Alert[] {
  const alerts: Alert[] = []
  const caseById = new Map(db.cases.map((c) => [c.id, c]))
  const clientById = new Map(db.clients.map((c) => [c.id, c]))
  const today = todayISO()

  // Payments
  for (const info of getDueInfos(db).filter(isOpenDue)) {
    const c = caseById.get(info.due.case_id)
    const client = c ? clientById.get(c.client_id) : undefined
    const who = client?.full_name ?? "client"
    const base = { category: "Payments" as const, href: `/dues?due=${info.due.id}`, dueId: info.due.id, date: info.due.due_date }
    // Id includes date and balance so a reschedule or part payment raises a fresh alert.
    const idTail = `${info.due.id}:${info.due.due_date}:${info.balance}`
    const partial = info.partial ? ` Part paid, ${formatINR(info.paid)} received.` : ""
    if (info.status === "Overdue") {
      alerts.push({
        ...base,
        id: `due-overdue:${idTail}`,
        severity: "danger",
        title: dueAlertTitle(info, who),
        body: `${info.due.description} · ${c?.case_number ?? ""} · ${info.daysOverdue} ${info.daysOverdue === 1 ? "day" : "days"} late.${partial}`,
        rank: 300 + Math.min(info.daysOverdue, 365),
      })
    } else if (info.status === "Due today") {
      alerts.push({
        ...base,
        id: `due-today:${idTail}`,
        severity: "warning",
        title: dueAlertTitle(info, who),
        body: `${info.due.description} · ${c?.case_number ?? ""}.${partial}`,
        rank: 290,
      })
    } else if (prefs.remindDaysBefore > 0 && info.daysUntil <= prefs.remindDaysBefore) {
      alerts.push({
        ...base,
        id: `due-soon:${idTail}`,
        severity: "info",
        title: dueAlertTitle(info, who),
        body: `${info.due.description} · due ${formatDate(info.due.due_date, "EEE, dd MMM")}.`,
        rank: 150 - info.daysUntil,
      })
    }
  }

  // Hearings
  if (prefs.hearingAlerts) {
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
    for (const h of db.hearings) {
      const days = getDaysUntil(h.date)
      const c = caseById.get(h.case_id)
      if (!c) continue
      if (days === 0 && timeToMinutes(h.time) + 60 >= nowMin && !h.outcome) {
        alerts.push({
          id: `hearing-today:${h.id}:${h.date}`,
          category: "Hearings",
          severity: "warning",
          title: `${formatTime(h.time)} today: ${c.case_number}`,
          body: `${h.purpose} · ${h.court_room}${h.item_no ? `, item ${h.item_no}` : ""}`,
          href: `/cases/${c.id}`,
          rank: 280,
          date: h.date,
          hearingId: h.id,
        })
      } else if (days === 1) {
        alerts.push({
          id: `hearing-tomorrow:${h.id}:${h.date}`,
          category: "Hearings",
          severity: "info",
          title: `Tomorrow ${formatTime(h.time)}: ${c.case_number}`,
          body: `${h.purpose} · ${h.court_room}${h.reminder_sent ? "" : ". Client not reminded yet."}`,
          href: `/cases/${c.id}`,
          rank: 200,
          date: h.date,
          hearingId: h.id,
        })
      } else if (days < 0 && days >= -30 && !h.outcome) {
        alerts.push({
          id: `outcome-pending:${h.id}`,
          category: "Hearings",
          severity: "warning",
          title: `Record outcome for ${c.case_number}`,
          body: `Hearing on ${formatDate(h.date, "dd MMM")} has no next date recorded.`,
          href: `/cases/${c.id}`,
          rank: 250,
          date: h.date,
          hearingId: h.id,
        })
      }
    }
  }

  // Deadlines
  if (prefs.deadlineAlerts) {
    for (const d of db.deadlines) {
      const days = getDaysUntil(d.due_date)
      if (days > 3) continue
      alerts.push({
        id: `deadline:${d.id}:${d.due_date}`,
        category: "Deadlines",
        severity: days < 0 ? "danger" : days <= 1 ? "warning" : "info",
        title: days < 0 ? `Missed: ${d.title}` : days === 0 ? `Today: ${d.title}` : `${days === 1 ? "Tomorrow" : `In ${days} days`}: ${d.title}`,
        body: `${d.case_number} · ${d.client}`,
        href: `/cases/${d.case_id}`,
        rank: days < 0 ? 270 : 260 - days * 10,
        date: d.due_date,
      })
    }
  }

  // New cases in the last 3 days
  if (prefs.newCaseAlerts) {
    for (const a of db.activity) {
      if (a.action_type !== "case_created") continue
      const age = -getDaysUntil(a.created_at)
      if (age > 3) continue
      const c = caseById.get(a.entity_id)
      if (!c) continue
      alerts.push({
        id: `new-case:${c.id}`,
        category: "Cases",
        severity: "success",
        title: `New case: ${c.case_number}`,
        body: `${c.title}${c.fee_agreed ? `. Agreed fee ${formatINR(c.fee_agreed)}.` : ""}`,
        href: `/cases/${c.id}`,
        rank: 100,
        date: a.created_at.slice(0, 10),
      })
    }
  }

  return alerts.sort((a, b) => b.rank - a.rank || (a.date < b.date ? -1 : 1)).map((a) => ({ ...a, date: a.date || today }))
}
