"use client"
// In-memory store (simulates Supabase). Components subscribe with useDB() and re-render on change.
import { useSyncExternalStore } from "react"
import {
  demoLawyer, demoClients, demoCases, demoHearings, demoDocuments, demoNotices,
  demoNotes, demoActivity, demoDeadlines, demoPayments, demoCommLogs, demoDues,
} from "./demo-data"
import { OPEN_STATUSES } from "./constants"
import { getDaysUntil, timeToMinutes, todayISO, toDate } from "./utils"

export type Lawyer = typeof demoLawyer
export type Client = (typeof demoClients)[number]
export type Case = (typeof demoCases)[number]
export type Hearing = (typeof demoHearings)[number]
export type Document = (typeof demoDocuments)[number]
export type Notice = (typeof demoNotices)[number]
export type Note = (typeof demoNotes)[number]
export type Activity = (typeof demoActivity)[number]
export type Deadline = (typeof demoDeadlines)[number]
export type Payment = (typeof demoPayments)[number]
export type CommLog = (typeof demoCommLogs)[number]
export type Due = (typeof demoDues)[number]

export type DB = {
  lawyer: Lawyer
  clients: Client[]
  cases: Case[]
  hearings: Hearing[]
  documents: Document[]
  notices: Notice[]
  notes: Note[]
  activity: Activity[]
  deadlines: Deadline[]
  payments: Payment[]
  commLogs: CommLog[]
  dues: Due[]
  readActivityIds: string[]
  readAlertIds: string[]
}

let db: DB = {
  lawyer: { ...demoLawyer },
  clients: [...demoClients],
  cases: [...demoCases],
  hearings: [...demoHearings],
  documents: [...demoDocuments],
  notices: [...demoNotices],
  notes: [...demoNotes],
  activity: [...demoActivity],
  deadlines: [...demoDeadlines],
  payments: [...demoPayments],
  commLogs: [...demoCommLogs],
  dues: [...demoDues],
  readActivityIds: demoActivity.slice(3).map((a) => a.id),
  readAlertIds: [],
}
const initialDB = db

const listeners = new Set<() => void>()

function commit(next: Partial<DB>) {
  db = { ...db, ...next }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getDB = () => db

/** Subscribe a component to the store. Returns a new snapshot after every mutation. */
export function useDB() {
  return useSyncExternalStore(subscribe, getDB, () => initialDB)
}

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function log(action_type: string, entity_type: string, entity_id: string, description: string) {
  const entry: Activity = {
    id: uid("a"),
    lawyer_id: db.lawyer.id,
    action_type,
    entity_type,
    entity_id,
    description,
    created_at: new Date().toISOString(),
  }
  return [entry, ...db.activity]
}

// ---- Lawyer ------------------------------------------------------------------
export const getLawyer = () => db.lawyer
export const updateLawyer = (data: Partial<Lawyer>) => commit({ lawyer: { ...db.lawyer, ...data } })

// ---- Clients -----------------------------------------------------------------
export const getClients = () => db.clients
export const getClient = (id: string) => db.clients.find((c) => c.id === id)
export const addClient = (client: Client) => {
  commit({ clients: [client, ...db.clients], activity: log("client_added", "client", client.id, `New client ${client.full_name} onboarded`) })
  return client
}
export const updateClient = (id: string, data: Partial<Client>) => {
  commit({ clients: db.clients.map((c) => (c.id === id ? { ...c, ...data } : c)) })
  return getClient(id)
}
export const deleteClient = (id: string) => commit({ clients: db.clients.filter((c) => c.id !== id) })

// ---- Cases -------------------------------------------------------------------
export const getCases = () => db.cases
export const getCase = (id: string) => db.cases.find((c) => c.id === id)
export const addCase = (c: Case) => {
  commit({ cases: [c, ...db.cases], activity: log("case_created", "case", c.id, `New case ${c.case_number}: ${c.title}`) })
  return c
}
export const updateCase = (id: string, data: Partial<Case>) => {
  commit({ cases: db.cases.map((c) => (c.id === id ? { ...c, ...data } : c)) })
  return getCase(id)
}
export const deleteCase = (id: string) => {
  commit({
    cases: db.cases.filter((c) => c.id !== id),
    hearings: db.hearings.filter((h) => h.case_id !== id),
    notes: db.notes.filter((n) => n.case_id !== id),
    deadlines: db.deadlines.filter((d) => d.case_id !== id),
  })
}

// ---- Hearings ----------------------------------------------------------------
export const sortHearings = (list: Hearing[], dir: "asc" | "desc" = "asc") =>
  [...list].sort((a, b) => {
    const d = toDate(a.date).getTime() - toDate(b.date).getTime()
    const t = timeToMinutes(a.time) - timeToMinutes(b.time)
    const v = d !== 0 ? d : t
    return dir === "asc" ? v : -v
  })

export const getHearings = () => db.hearings
export const getHearingsForCase = (caseId: string) => db.hearings.filter((h) => h.case_id === caseId)
export const getHearingsOn = (date: string) => sortHearings(db.hearings.filter((h) => h.date === date))
export const getTodayHearings = () => getHearingsOn(todayISO())

/** Next listed date for a case (today counts). */
export const getNextHearing = (caseId: string, hearings = db.hearings) =>
  sortHearings(hearings.filter((h) => h.case_id === caseId && getDaysUntil(h.date) >= 0))[0]

export const addHearing = (h: Hearing) => {
  const c = getCase(h.case_id)
  commit({
    hearings: [h, ...db.hearings],
    activity: log("hearing_added", "hearing", h.id, `Hearing listed in ${c?.case_number ?? "case"} for ${h.date}`),
  })
  return h
}
export const updateHearing = (id: string, data: Partial<Hearing>) =>
  commit({ hearings: db.hearings.map((h) => (h.id === id ? { ...h, ...data } : h)) })
export const deleteHearing = (id: string) => commit({ hearings: db.hearings.filter((h) => h.id !== id) })

/**
 * The core daily workflow: record what happened in court and fix the next date.
 * Creates the next hearing and moves the case status along.
 */
export const recordHearingOutcome = (
  hearingId: string,
  input: { outcome: string; notes: string; nextDate?: string; nextTime?: string; nextPurpose?: string }
) => {
  const hearing = db.hearings.find((h) => h.id === hearingId)
  if (!hearing) return
  const c = getCase(hearing.case_id)
  let hearings = db.hearings.map((h) =>
    h.id === hearingId ? { ...h, outcome: input.outcome, outcome_notes: input.notes } : h
  )
  let cases = db.cases
  if (input.nextDate) {
    const next: Hearing = {
      id: uid("h"),
      case_id: hearing.case_id,
      date: input.nextDate,
      time: input.nextTime || hearing.time,
      court_room: hearing.court_room,
      item_no: "",
      purpose: input.nextPurpose || hearing.purpose,
      outcome: "",
      outcome_notes: "",
      reminder_sent: false,
    }
    hearings = [next, ...hearings]
    cases = cases.map((x) => (x.id === hearing.case_id ? { ...x, status: "Hearing Scheduled" } : x))
  }
  if (input.outcome === "Disposed") {
    cases = cases.map((x) => (x.id === hearing.case_id ? { ...x, status: "Closed" } : x))
  }
  if (input.outcome === "Order reserved") {
    cases = cases.map((x) => (x.id === hearing.case_id ? { ...x, status: "Judgment Awaited" } : x))
  }
  commit({
    hearings,
    cases,
    activity: log(
      "case_updated",
      "hearing",
      hearingId,
      `${c?.case_number ?? "Case"}: ${input.outcome}${input.nextDate ? `, next date ${input.nextDate}` : ""}`
    ),
  })
}

// ---- Documents ---------------------------------------------------------------
export const getDocuments = () => db.documents
export const getDocumentsForCase = (caseId: string) => db.documents.filter((d) => d.case_id === caseId)
export const addDocument = (d: Document) => {
  const c = getCase(d.case_id)
  commit({
    documents: [d, ...db.documents],
    activity: log("document_uploaded", "document", d.id, `Uploaded ${d.filename}${c ? ` in ${c.case_number}` : ""}`),
  })
  return d
}
export const deleteDocument = (id: string) => commit({ documents: db.documents.filter((d) => d.id !== id) })

// ---- Notices -----------------------------------------------------------------
export const getNotices = () => db.notices
export const getNotice = (id: string) => db.notices.find((n) => n.id === id)
export const getNoticesForCase = (caseId: string) => db.notices.filter((n) => n.case_id === caseId)
export const addNotice = (n: Notice) => {
  commit({ notices: [n, ...db.notices], activity: log("notice_drafted", "notice", n.id, `Drafted ${n.title}`) })
  return n
}
export const updateNotice = (id: string, data: Partial<Notice>) => {
  const n = getNotice(id)
  commit({
    notices: db.notices.map((x) => (x.id === id ? { ...x, ...data } : x)),
    activity: data.status === "Sent" && n ? log("notice_sent", "notice", id, `Marked ${n.title} as sent`) : db.activity,
  })
}
export const deleteNotice = (id: string) => commit({ notices: db.notices.filter((n) => n.id !== id) })

// ---- Notes -------------------------------------------------------------------
export const getNotesForCase = (caseId: string) => db.notes.filter((n) => n.case_id === caseId)
export const addNote = (n: Note) => {
  const c = getCase(n.case_id)
  commit({ notes: [n, ...db.notes], activity: log("note_added", "note", n.id, `Added note to ${c?.case_number ?? "case"}`) })
  return n
}
export const updateNote = (id: string, data: Partial<Note>) =>
  commit({ notes: db.notes.map((n) => (n.id === id ? { ...n, ...data } : n)) })
export const deleteNote = (id: string) => commit({ notes: db.notes.filter((n) => n.id !== id) })

// ---- Fees --------------------------------------------------------------------
export const getPaymentsForCase = (caseId: string) => db.payments.filter((p) => p.case_id === caseId)
export const addPayment = (p: Payment) => {
  const c = getCase(p.case_id)
  const client = c ? getClient(c.client_id) : undefined
  commit({
    payments: [p, ...db.payments],
    activity: log("payment_received", "payment", p.id, `Received ₹${p.amount.toLocaleString("en-IN")}${client ? ` from ${client.full_name}` : ""}`),
  })
  return p
}
export const deletePayment = (id: string) => commit({ payments: db.payments.filter((p) => p.id !== id) })
export const deletePayments = (ids: string[]) => commit({ payments: db.payments.filter((p) => !ids.includes(p.id)) })

export function getCaseFees(caseId: string, data: DB = db) {
  const c = data.cases.find((x) => x.id === caseId)
  const agreed = c?.fee_agreed ?? 0
  const received = data.payments.filter((p) => p.case_id === caseId).reduce((s, p) => s + p.amount, 0)
  return { agreed, received, balance: Math.max(0, agreed - received) }
}

export function getClientFees(clientId: string, data: DB = db) {
  return data.cases
    .filter((c) => c.client_id === clientId)
    .reduce(
      (acc, c) => {
        const f = getCaseFees(c.id, data)
        return { agreed: acc.agreed + f.agreed, received: acc.received + f.received, balance: acc.balance + f.balance }
      },
      { agreed: 0, received: 0, balance: 0 }
    )
}

// ---- Communication log -------------------------------------------------------
export const getCommLogsForClient = (clientId: string) => db.commLogs.filter((l) => l.client_id === clientId)
export const addCommLog = (l: CommLog) => commit({ commLogs: [l, ...db.commLogs] })

// ---- Activity / notifications -----------------------------------------------
export const getActivity = () => db.activity
export const addActivity = (a: Activity) => commit({ activity: [a, ...db.activity] })
export const markActivityRead = (ids?: string[]) =>
  commit({ readActivityIds: Array.from(new Set([...db.readActivityIds, ...(ids ?? db.activity.map((a) => a.id))])) })
export const markAlertsRead = (ids: string[]) => commit({ readAlertIds: Array.from(new Set([...db.readAlertIds, ...ids])) })
export const markAlertUnread = (id: string) => commit({ readAlertIds: db.readAlertIds.filter((x) => x !== id) })

// ---- Deadlines ---------------------------------------------------------------
export const getDeadlines = () => db.deadlines
export const addDeadline = (d: Deadline) => commit({ deadlines: [...db.deadlines, d] })
export const deleteDeadline = (id: string) => commit({ deadlines: db.deadlines.filter((d) => d.id !== id) })

// ---- Stats -------------------------------------------------------------------
export function getDashboardStats(data: DB = db) {
  const today = todayISO()
  const openCases = data.cases.filter((c) => OPEN_STATUSES.includes(c.status))
  const hearingsToday = data.hearings.filter((h) => h.date === today).length
  const hearingsThisWeek = data.hearings.filter((h) => {
    const d = getDaysUntil(h.date)
    return d >= 0 && d <= 6
  }).length
  const urgentOpen = openCases.filter((c) => c.priority === "Urgent").length
  const feesOutstanding = data.cases.reduce((s, c) => s + getCaseFees(c.id, data).balance, 0)
  const overdue = getOverdueSummary(data)
  const pendingOutcomes = data.hearings.filter((h) => getDaysUntil(h.date) < 0 && !h.outcome).length

  const statusBreakdown = {
    Active: data.cases.filter((c) => c.status === "Active").length,
    "Hearing Scheduled": data.cases.filter((c) => c.status === "Hearing Scheduled").length,
    "Judgment Awaited": data.cases.filter((c) => c.status === "Judgment Awaited").length,
    Won: data.cases.filter((c) => c.status === "Won").length,
    Closed: data.cases.filter((c) => c.status === "Closed").length,
  }

  return {
    activeCases: openCases.length,
    hearingsToday,
    hearingsThisWeek,
    urgentOpen,
    feesOutstanding,
    overdue,
    pendingOutcomes,
    statusBreakdown,
  }
}

// ---- Dues (fee schedule) -----------------------------------------------------
// A due is an amount the client should pay by a date. Payments link to a due via due_id.
// Status is never stored: it is derived from payments, the waiver flag and today's date.

export type DueStatus = "Overdue" | "Due today" | "Upcoming" | "Paid" | "Waived"

export type DueInfo = {
  due: Due
  paid: number
  balance: number
  status: DueStatus
  /** Some money received but not all. */
  partial: boolean
  /** Positive when late, 0 otherwise. */
  daysOverdue: number
  daysUntil: number
  lastPaymentDate: string
}

export function getDueInfo(due: Due, data: DB = db): DueInfo {
  const payments = data.payments.filter((p) => p.due_id === due.id)
  const paid = payments.reduce((s, p) => s + p.amount, 0)
  const balance = Math.max(0, due.amount - paid)
  const daysUntil = getDaysUntil(due.due_date)
  let status: DueStatus
  if (due.waived) status = "Waived"
  else if (balance === 0) status = "Paid"
  else if (daysUntil < 0) status = "Overdue"
  else if (daysUntil === 0) status = "Due today"
  else status = "Upcoming"
  const lastPaymentDate = payments.map((p) => p.date).sort().pop() ?? ""
  return {
    due,
    paid,
    balance: due.waived ? 0 : balance,
    status,
    partial: paid > 0 && balance > 0 && !due.waived,
    daysOverdue: status === "Overdue" ? -daysUntil : 0,
    daysUntil,
    lastPaymentDate,
  }
}

export const isOpenDue = (i: DueInfo) => i.status === "Overdue" || i.status === "Due today" || i.status === "Upcoming"

export const getDueInfos = (data: DB = db, filter?: (d: Due) => boolean) =>
  data.dues.filter((d) => (filter ? filter(d) : true)).map((d) => getDueInfo(d, data))

export const getCaseDueInfos = (caseId: string, data: DB = db) =>
  getDueInfos(data, (d) => d.case_id === caseId).sort((a, b) => a.due.due_date.localeCompare(b.due.due_date))

export function getClientDueInfos(clientId: string, data: DB = db) {
  const caseIds = new Set(data.cases.filter((c) => c.client_id === clientId).map((c) => c.id))
  return getDueInfos(data, (d) => caseIds.has(d.case_id)).sort((a, b) => a.due.due_date.localeCompare(b.due.due_date))
}

export type DuesSummary = ReturnType<typeof summariseDues>

/** Roll-up used by table cells, banners and cards. */
export function summariseDues(infos: DueInfo[]) {
  const open = infos.filter(isOpenDue)
  const overdue = open.filter((i) => i.status === "Overdue").sort((a, b) => b.daysOverdue - a.daysOverdue)
  const next = open.filter((i) => i.status !== "Overdue").sort((a, b) => a.due.due_date.localeCompare(b.due.due_date))[0]
  return {
    openCount: open.length,
    openBalance: open.reduce((s, i) => s + i.balance, 0),
    overdueCount: overdue.length,
    overdueBalance: overdue.reduce((s, i) => s + i.balance, 0),
    maxDaysOverdue: overdue[0]?.daysOverdue ?? 0,
    oldestOverdue: overdue[0] as DueInfo | undefined,
    dueToday: open.filter((i) => i.status === "Due today"),
    next: next as DueInfo | undefined,
  }
}

export function getOverdueSummary(data: DB = db) {
  const infos = getDueInfos(data)
  const s = summariseDues(infos)
  const clients = new Set(
    infos.filter((i) => i.status === "Overdue").map((i) => data.cases.find((c) => c.id === i.due.case_id)?.client_id)
  )
  return { ...s, clientCount: clients.size }
}

/** Agreed fee not covered by payments or an open due. Prompts the advocate to schedule it. */
export function getUnscheduledBalance(caseId: string, data: DB = db) {
  const fees = getCaseFees(caseId, data)
  const scheduledOpen = getCaseDueInfos(caseId, data).filter(isOpenDue).reduce((s, i) => s + i.balance, 0)
  return Math.max(0, fees.balance - scheduledOpen)
}

export type NewDue = { case_id: string; description: string; amount: number; due_date: string; notes?: string }

export function addDues(items: NewDue[]) {
  const created: Due[] = items.map((d) => ({
    id: uid("due"),
    case_id: d.case_id,
    description: d.description,
    amount: d.amount,
    due_date: d.due_date,
    notes: d.notes ?? "",
    waived: false,
    waive_reason: "",
    original_due_date: "",
    reminder_count: 0,
    last_reminded_at: "",
    created_at: new Date().toISOString(),
  }))
  const c = getCase(items[0]?.case_id ?? "")
  const total = items.reduce((s, d) => s + d.amount, 0)
  commit({
    dues: [...db.dues, ...created],
    activity: log(
      "due_added",
      "due",
      created[0]?.id ?? "",
      created.length > 1
        ? `Scheduled ${created.length} fee instalments in ${c?.case_number ?? "case"} (₹${total.toLocaleString("en-IN")})`
        : `Fee of ₹${total.toLocaleString("en-IN")} due on ${items[0]?.due_date} in ${c?.case_number ?? "case"}`
    ),
  })
  return created
}

export const updateDue = (id: string, data: Partial<Due>) =>
  commit({ dues: db.dues.map((d) => (d.id === id ? { ...d, ...data } : d)) })

/** Removes the due. Money already received stays in the ledger, unlinked. */
export const deleteDue = (id: string) =>
  commit({
    dues: db.dues.filter((d) => d.id !== id),
    payments: db.payments.map((p) => (p.due_id === id ? { ...p, due_id: "" } : p)),
  })

export function rescheduleDue(id: string, newDate: string, note: string) {
  const due = db.dues.find((d) => d.id === id)
  if (!due) return
  const c = getCase(due.case_id)
  const line = `Moved from ${due.due_date} to ${newDate}${note ? `: ${note}` : ""}`
  commit({
    dues: db.dues.map((d) =>
      d.id === id
        ? { ...d, due_date: newDate, original_due_date: d.original_due_date || d.due_date, notes: [d.notes, line].filter(Boolean).join("\n") }
        : d
    ),
    activity: log("due_rescheduled", "due", id, `${c?.case_number ?? "Fee"}: ${due.description} moved to ${newDate}`),
  })
}

export function waiveDue(id: string, reason: string) {
  const due = db.dues.find((d) => d.id === id)
  if (!due) return
  commit({
    dues: db.dues.map((d) => (d.id === id ? { ...d, waived: true, waive_reason: reason } : d)),
    activity: log("due_waived", "due", id, `Waived ${due.description} (₹${due.amount.toLocaleString("en-IN")})`),
  })
}

/** Undo "paid" or "waived": removes payments linked to this due and clears the waiver. */
export function reopenDue(id: string) {
  commit({
    dues: db.dues.map((d) => (d.id === id ? { ...d, waived: false, waive_reason: "" } : d)),
    payments: db.payments.filter((p) => p.due_id !== id),
  })
}

export function logDueReminder(id: string) {
  commit({
    dues: db.dues.map((d) =>
      d.id === id ? { ...d, reminder_count: d.reminder_count + 1, last_reminded_at: new Date().toISOString() } : d
    ),
  })
}

/**
 * Records money received for a case. Fills the chosen due first, then the oldest
 * open dues of that case. Anything left over is kept as an advance (no due).
 * Returns the payment ids so the caller can offer Undo.
 */
export function recordCasePayment(input: {
  case_id: string
  amount: number
  date: string
  mode: string
  reference?: string
  note?: string
  due_id?: string
}) {
  let remaining = Math.round(input.amount)
  const open = getCaseDueInfos(input.case_id).filter((i) => i.balance > 0)
  const ordered = input.due_id
    ? [...open.filter((i) => i.due.id === input.due_id), ...open.filter((i) => i.due.id !== input.due_id)]
    : open
  const rows: Payment[] = []
  for (const info of ordered) {
    if (remaining <= 0) break
    const take = Math.min(remaining, info.balance)
    rows.push({ id: uid("p"), case_id: input.case_id, due_id: info.due.id, amount: take, mode: input.mode, reference: input.reference ?? "", note: input.note ?? "", date: input.date })
    remaining -= take
  }
  if (remaining > 0) {
    rows.push({ id: uid("p"), case_id: input.case_id, due_id: "", amount: remaining, mode: input.mode, reference: input.reference ?? "", note: input.note || "Advance", date: input.date })
  }
  const c = getCase(input.case_id)
  const client = c ? getClient(c.client_id) : undefined
  commit({
    payments: [...rows, ...db.payments],
    activity: log(
      "payment_received",
      "payment",
      rows[0]?.id ?? "",
      `Received ₹${Math.round(input.amount).toLocaleString("en-IN")}${client ? ` from ${client.full_name}` : ""} (${input.mode})`
    ),
  })
  return rows.map((r) => r.id)
}

/** One-tap settle: records the full balance of a due. */
export function markDuePaid(id: string, mode = "UPI", date = todayISO()) {
  const due = db.dues.find((d) => d.id === id)
  if (!due) return []
  const info = getDueInfo(due)
  if (info.balance <= 0) return []
  return recordCasePayment({ case_id: due.case_id, amount: info.balance, date, mode, due_id: id })
}

// ---- Dues stats for a date range ---------------------------------------------

export type DateRange = { from: string; to: string }

export function getDuesStats(range: DateRange | null, data: DB = db) {
  const inRange = (date: string) => !range || (date >= range.from && date <= range.to)
  const all = getDueInfos(data)
  const infos = all.filter((i) => !i.due.waived)
  const periodDues = infos.filter((i) => inRange(i.due.due_date))
  const expected = periodDues.reduce((s, i) => s + i.due.amount, 0)
  const collectedAgainst = periodDues.reduce((s, i) => s + Math.min(i.paid, i.due.amount), 0)
  const pending = periodDues.reduce((s, i) => s + i.balance, 0)
  const receivedRows = data.payments.filter((p) => inRange(p.date))
  const received = receivedRows.reduce((s, p) => s + p.amount, 0)
  const waived = all.filter((i) => i.due.waived && inRange(i.due.due_date)).reduce((s, i) => s + i.due.amount, 0)

  const overdue = infos.filter((i) => i.status === "Overdue")
  const bucket = (min: number, max: number) => {
    const list = overdue.filter((i) => i.daysOverdue >= min && i.daysOverdue <= max)
    return { count: list.length, amount: list.reduce((s, i) => s + i.balance, 0) }
  }

  return {
    expected,
    received,
    receivedCount: receivedRows.length,
    pending,
    waived,
    collectionRate: expected ? Math.round((collectedAgainst / expected) * 100) : 0,
    overdueAmount: overdue.reduce((s, i) => s + i.balance, 0),
    overdueCount: overdue.length,
    aging: [
      { label: "1-30 days", ...bucket(1, 30) },
      { label: "31-60 days", ...bucket(31, 60) },
      { label: "61-90 days", ...bucket(61, 90) },
      { label: "Over 90 days", ...bucket(91, Infinity) },
    ],
  }
}
