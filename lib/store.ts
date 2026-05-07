"use client"
// Simple in-memory store for demo purposes (simulates Supabase)
import {
  demoLawyer, demoClients, demoCases, demoHearings,
  demoDocuments, demoNotices, demoNotes, demoActivity,
  demoAIConversation, demoDeadlines
} from "./demo-data"

let clients = [...demoClients]
let cases = [...demoCases]
let hearings = [...demoHearings]
let documents = [...demoDocuments]
let notices = [...demoNotices]
let notes = [...demoNotes]
let activity = [...demoActivity]
let aiMessages = [...demoAIConversation]
let deadlines = [...demoDeadlines]

// ---- Clients ----
export const getClients = () => clients
export const getClient = (id: string) => clients.find(c => c.id === id)
export const addClient = (client: typeof clients[0]) => { clients = [client, ...clients]; return client }
export const updateClient = (id: string, data: Partial<typeof clients[0]>) => {
  clients = clients.map(c => c.id === id ? { ...c, ...data } : c)
  return clients.find(c => c.id === id)
}
export const deleteClient = (id: string) => { clients = clients.filter(c => c.id !== id) }

// ---- Cases ----
export const getCases = () => cases
export const getCase = (id: string) => cases.find(c => c.id === id)
export const addCase = (c: typeof cases[0]) => { cases = [c, ...cases]; return c }
export const updateCase = (id: string, data: Partial<typeof cases[0]>) => {
  cases = cases.map(c => c.id === id ? { ...c, ...data } : c)
  return cases.find(c => c.id === id)
}
export const deleteCase = (id: string) => { cases = cases.filter(c => c.id !== id) }

// ---- Hearings ----
export const getHearings = () => hearings
export const getHearingsForCase = (caseId: string) => hearings.filter(h => h.case_id === caseId)
export const getTodayHearings = () => {
  const today = new Date().toISOString().split('T')[0]
  return hearings.filter(h => h.date === today)
}
export const addHearing = (h: typeof hearings[0]) => { hearings = [h, ...hearings]; return h }
export const updateHearing = (id: string, data: Partial<typeof hearings[0]>) => {
  hearings = hearings.map(h => h.id === id ? { ...h, ...data } : h)
}
export const deleteHearing = (id: string) => { hearings = hearings.filter(h => h.id !== id) }

// ---- Documents ----
export const getDocuments = () => documents
export const getDocumentsForCase = (caseId: string) => documents.filter(d => d.case_id === caseId)
export const addDocument = (d: typeof documents[0]) => { documents = [d, ...documents]; return d }
export const deleteDocument = (id: string) => { documents = documents.filter(d => d.id !== id) }

// ---- Notices ----
export const getNotices = () => notices
export const getNoticesForCase = (caseId: string) => notices.filter(n => n.case_id === caseId)
export const addNotice = (n: typeof notices[0]) => { notices = [n, ...notices]; return n }
export const updateNotice = (id: string, data: Partial<typeof notices[0]>) => {
  notices = notices.map(n => n.id === id ? { ...n, ...data } : n)
}
export const deleteNotice = (id: string) => { notices = notices.filter(n => n.id !== id) }

// ---- Notes ----
export const getNotesForCase = (caseId: string) => notes.filter(n => n.case_id === caseId)
export const addNote = (n: typeof notes[0]) => { notes = [n, ...notes]; return n }
export const updateNote = (id: string, data: Partial<typeof notes[0]>) => {
  notes = notes.map(n => n.id === id ? { ...n, ...data } : n)
}
export const deleteNote = (id: string) => { notes = notes.filter(n => n.id !== id) }

// ---- Activity ----
export const getActivity = () => activity
export const addActivity = (a: typeof activity[0]) => { activity = [a, ...activity] }

// ---- AI ----
export const getAIMessages = () => aiMessages
export const addAIMessage = (m: { role: string; content: string; timestamp: string }) => {
  aiMessages = [...aiMessages, m]
}

// ---- Deadlines ----
export const getDeadlines = () => deadlines

// ---- Lawyer ----
export const getLawyer = () => demoLawyer

// ---- Stats ----
export const getDashboardStats = () => {
  const today = new Date().toISOString().split('T')[0]
  const activeCases = cases.filter(c => ["Active", "Hearing Scheduled", "Judgment Awaited"].includes(c.status)).length
  const hearingsThisWeek = hearings.filter(h => {
    const hDate = new Date(h.date)
    const now = new Date()
    const weekEnd = new Date()
    weekEnd.setDate(weekEnd.getDate() + 7)
    return hDate >= now && hDate <= weekEnd
  }).length
  const pendingDocs = documents.length
  const clientsThisMonth = clients.filter(c => {
    const d = new Date(c.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const statusBreakdown = {
    Active: cases.filter(c => c.status === "Active").length,
    "Hearing Scheduled": cases.filter(c => c.status === "Hearing Scheduled").length,
    "Judgment Awaited": cases.filter(c => c.status === "Judgment Awaited").length,
    Closed: cases.filter(c => c.status === "Closed").length,
    Won: cases.filter(c => c.status === "Won").length,
  }

  return { activeCases, hearingsThisWeek, pendingDocs, clientsThisMonth, statusBreakdown }
}
