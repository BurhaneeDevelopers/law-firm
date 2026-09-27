"use client"
// In-memory store (simulates Supabase). Components subscribe with useDB() and re-render on change.
import { useSyncExternalStore } from "react"
import {
  demoLawyer, demoClients, demoCases, demoHearings, demoDocuments, demoNotices,
  demoNotes, demoActivity, demoAIConversation, demoDeadlines, demoPayments, demoCommLogs,
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
export type AIMessage = { role: string; content: string; timestamp: string }

export type DB = {
  lawyer: Lawyer
  clients: Client[]
  cases: Case[]
  hearings: Hearing[]
  documents: Document[]
  notices: Notice[]
  notes: Note[]
  activity: Activity[]
  aiMessages: AIMessage[]
  deadlines: Deadline[]
  payments: Payment[]
  commLogs: CommLog[]
  readActivityIds: string[]
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
  aiMessages: [...demoAIConversation],
  deadlines: [...demoDeadlines],
  payments: [...demoPayments],
  commLogs: [...demoCommLogs],
  readActivityIds: demoActivity.slice(3).map((a) => a.id),
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

// ---- AI ----------------------------------------------------------------------
export const getAIMessages = () => db.aiMessages
export const addAIMessage = (m: AIMessage) => commit({ aiMessages: [...db.aiMessages, m] })
export const clearAIMessages = () => commit({ aiMessages: [] })

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
    pendingOutcomes,
    statusBreakdown,
  }
}
