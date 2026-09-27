import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInCalendarDays, format, formatDistanceToNow, isValid, parseISO } from "date-fns"
import type { Language, Tone } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---- Dates -----------------------------------------------------------------
// Date-only strings ("2026-05-08") must be read as local dates. `new Date("2026-05-08")`
// is UTC midnight, which is 05:30 IST and shifts day math by one near midnight.

export function toDate(value: string | Date) {
  if (value instanceof Date) return value
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseISO(value) : new Date(value)
}

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd")
}

export function toISODate(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function formatDate(value: string | Date, fmt = "dd MMM yyyy") {
  const d = toDate(value)
  return isValid(d) ? format(d, fmt) : String(value)
}

export function formatRelativeTime(value: string | Date) {
  const d = toDate(value)
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : String(value)
}

/** Whole calendar days from today. 0 = today, 1 = tomorrow, -2 = two days ago. */
export function getDaysUntil(value: string | Date) {
  const d = toDate(value)
  return isValid(d) ? differenceInCalendarDays(d, new Date()) : 0
}

export function isUpcoming(value: string | Date) {
  return getDaysUntil(value) >= 0
}

export function getCountdownLabel(days: number) {
  if (days < -1) return `${Math.abs(days)} days overdue`
  if (days === -1) return "1 day overdue"
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  return `In ${days} days`
}

export function getCountdownTone(days: number): Tone {
  if (days <= 1) return "danger"
  if (days <= 3) return "warning"
  return "success"
}

export function getRelativeDayLabel(value: string | Date) {
  const days = getDaysUntil(value)
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  if (days === -1) return "Yesterday"
  return formatDate(value, "EEE, dd MMM")
}

// ---- Time ------------------------------------------------------------------

/** Minutes since midnight. Accepts "14:30", "2:30 PM" and "02:30 PM". */
export function timeToMinutes(time: string) {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return 0
  let h = Number(match[1])
  const m = Number(match[2])
  const meridiem = match[3]?.toUpperCase()
  if (meridiem === "PM" && h !== 12) h += 12
  if (meridiem === "AM" && h === 12) h = 0
  return h * 60 + m
}

export function formatTime(time: string) {
  if (!time) return ""
  const total = timeToMinutes(time)
  const h24 = Math.floor(total / 60)
  const m = total % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`
}

// ---- Money (Indian grouping: 1,25,000) --------------------------------------

const inrFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })

export function formatINR(amount: number) {
  return inrFormatter.format(Math.round(amount || 0))
}

/** Compact form for stat tiles: ₹1.2L, ₹45K, ₹2.3Cr. */
export function formatINRCompact(amount: number) {
  const n = Math.abs(amount || 0)
  if (n >= 1e7) return `₹${(amount / 1e7).toFixed(1).replace(/\.0$/, "")}Cr`
  if (n >= 1e5) return `₹${(amount / 1e5).toFixed(1).replace(/\.0$/, "")}L`
  if (n >= 1e3) return `₹${(amount / 1e3).toFixed(1).replace(/\.0$/, "")}K`
  return formatINR(amount)
}

// ---- People ----------------------------------------------------------------

export function getInitials(name: string) {
  return name
    .replace(/^(Adv\.|Advocate|Shri|Smt\.|Mr\.|Mrs\.|Ms\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const avatarTones: Tone[] = ["primary", "violet", "info", "success", "accent", "danger"]

export function getAvatarTone(name: string): Tone {
  let sum = 0
  for (const c of name) sum += c.charCodeAt(0)
  return avatarTones[sum % avatarTones.length]
}

/** Digits only, with India country code, for wa.me and tel: links. */
export function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) return `91${digits}`
  return digits
}

export function whatsappLink(phone: string, text?: string) {
  const base = `https://wa.me/${phoneDigits(phone)}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function isValidIndianMobile(phone: string) {
  const digits = phone.replace(/\D/g, "")
  const local = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits
  return /^[6-9]\d{9}$/.test(local)
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

export function maskId(value: string) {
  const clean = value.replace(/\s/g, "")
  if (clean.length <= 4) return value
  return `${"•".repeat(Math.max(0, clean.length - 4))}${clean.slice(-4)}`
}

// ---- Messages --------------------------------------------------------------

export function hearingReminderMessage(
  params: {
    clientName: string
    caseNumber: string
    date: string
    time: string
    court: string
    lawyerName: string
  },
  language: Language = "English"
) {
  const date = formatDate(params.date, "dd MMM yyyy (EEEE)")
  const time = formatTime(params.time)
  if (language === "Hindi") {
    return `नमस्ते ${params.clientName} जी,\n\nआपके केस ${params.caseNumber} की सुनवाई ${date} को ${time} बजे ${params.court} में है।\n\nकृपया समय से 30 मिनट पहले पहुँचें और अपना पहचान पत्र साथ लाएँ।\n\nधन्यवाद,\nएडवोकेट ${params.lawyerName}`
  }
  return `Dear ${params.clientName},\n\nThis is a reminder that your hearing in case ${params.caseNumber} is listed on ${date} at ${time} at ${params.court}.\n\nPlease reach 30 minutes early and carry a photo ID.\n\nRegards,\nAdvocate ${params.lawyerName}`
}

export function nextDateMessage(
  params: {
    clientName: string
    caseNumber: string
    outcome: string
    nextDate?: string
    lawyerName: string
  },
  language: Language = "English"
) {
  const next = params.nextDate ? formatDate(params.nextDate, "dd MMM yyyy") : ""
  if (language === "Hindi") {
    return `नमस्ते ${params.clientName} जी,\n\nआज आपके केस ${params.caseNumber} में: ${params.outcome}.${next ? `\nअगली तारीख: ${next}` : ""}\n\nधन्यवाद,\nएडवोकेट ${params.lawyerName}`
  }
  return `Dear ${params.clientName},\n\nUpdate on case ${params.caseNumber}: ${params.outcome}.${next ? `\nNext date of hearing: ${next}` : ""}\n\nRegards,\nAdvocate ${params.lawyerName}`
}

/** Minimal markdown for AI output: **bold** runs inside a line. */
export function splitBold(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part) => ({
    bold: part.startsWith("**") && part.endsWith("**"),
    text: part.replace(/^\*\*|\*\*$/g, ""),
  }))
}

export function paymentReminderMessage(
  params: {
    clientName: string
    amount: number
    description: string
    caseNumber: string
    dueDate: string
    daysOverdue: number
    upiId?: string
    lawyerName: string
  },
  language: Language = "English"
) {
  const amount = formatINR(params.amount)
  const date = formatDate(params.dueDate, "dd MMM yyyy")
  if (language === "Hindi") {
    const when = params.daysOverdue > 0 ? `${date} को देय थी (${params.daysOverdue} दिन बीत चुके हैं)` : `${date} तक देय है`
    return `नमस्ते ${params.clientName} जी,\n\nकेस ${params.caseNumber} में "${params.description}" की फ़ीस ${amount} ${when}।${params.upiId ? `\n\nUPI से भुगतान करें: ${params.upiId}` : ""}\n\nभुगतान हो जाने पर कृपया सूचित करें।\n\nधन्यवाद,\nएडवोकेट ${params.lawyerName}`
  }
  const when = params.daysOverdue > 0 ? `was due on ${date} (${params.daysOverdue} days ago)` : `is due on ${date}`
  return `Dear ${params.clientName},\n\nA professional fee of ${amount} for "${params.description}" in case ${params.caseNumber} ${when}.${params.upiId ? `\n\nYou can pay by UPI to ${params.upiId}.` : ""}\n\nPlease let us know once paid. Kindly ignore if already paid.\n\nRegards,\nAdvocate ${params.lawyerName}`
}

/** Indian financial year (April to March) containing the date. */
export function financialYear(date = new Date()) {
  const y = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1
  return { from: `${y}-04-01`, to: `${y + 1}-03-31`, label: `FY ${y}-${String(y + 1).slice(2)}` }
}
