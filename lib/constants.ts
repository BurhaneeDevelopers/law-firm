// App-wide constants. Pages and components import from here instead of hardcoding lists.

export const APP_NAME = "LexFirm"
export const APP_TAGLINE = "Practice management for Indian advocates"

export const DEVELOPER_CREDIT = {
  label: "Taheri Developers",
  href: "https://wa.me/919003078610?text=Hi%20Taheri%20Developers",
}

// ---- Tones -----------------------------------------------------------------
// A tone maps to a token family in app/globals.css (bg-{tone}-soft, text-{tone}-soft-foreground).
export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info" | "violet" | "accent"

export const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted-foreground ring-border",
  primary: "bg-primary-soft text-primary-soft-foreground ring-primary/20",
  success: "bg-success-soft text-success-soft-foreground ring-success/20",
  warning: "bg-warning-soft text-warning-soft-foreground ring-warning/25",
  danger: "bg-danger-soft text-danger-soft-foreground ring-danger/20",
  info: "bg-info-soft text-info-soft-foreground ring-info/20",
  violet: "bg-violet-soft text-violet-soft-foreground ring-violet/20",
  accent: "bg-accent-soft text-accent-soft-foreground ring-accent/25",
}

export const toneSolid: Record<Tone, string> = {
  neutral: "bg-subtle-foreground",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  violet: "bg-violet",
  accent: "bg-accent",
}

// ---- Cases -----------------------------------------------------------------
export const CASE_TYPES = ["Criminal", "Divorce", "Property", "Civil"] as const
export type CaseType = (typeof CASE_TYPES)[number]

export const caseTypeTone: Record<string, Tone> = {
  Criminal: "danger",
  Divorce: "violet",
  Property: "accent",
  Civil: "info",
}

export const CASE_STATUSES = ["Active", "Hearing Scheduled", "Judgment Awaited", "Closed", "Won"] as const
export type CaseStatus = (typeof CASE_STATUSES)[number]

/** Matters that still need the advocate's attention. */
export const OPEN_STATUSES: readonly string[] = ["Active", "Hearing Scheduled", "Judgment Awaited"]

export const caseStatusTone: Record<string, Tone> = {
  Active: "primary",
  "Hearing Scheduled": "warning",
  "Judgment Awaited": "violet",
  Closed: "neutral",
  Won: "success",
}

export const PRIORITIES = ["Normal", "Urgent"] as const

export const COURTS = [
  "Rohtak District Court",
  "Sessions Court, Rohtak",
  "Magistrate Court, Rohtak",
  "Magistrate Court, Jhajjar",
  "Family Court, Rohtak",
  "District Consumer Forum, Sonipat",
  "Punjab & Haryana High Court",
  "Delhi High Court",
  "Delhi District Court",
  "Supreme Court of India",
]

// ---- Hearings --------------------------------------------------------------
export const HEARING_PURPOSES = [
  "Mention",
  "Argument",
  "Evidence",
  "Cross-examination",
  "Framing of Charges",
  "Bail",
  "Mediation",
  "Order",
  "Judgment",
  "Other",
]

export const purposeTone: Record<string, Tone> = {
  Mention: "info",
  Argument: "primary",
  Evidence: "accent",
  "Cross-examination": "accent",
  "Framing of Charges": "danger",
  Bail: "danger",
  Mediation: "violet",
  Order: "success",
  Judgment: "success",
  "Ex-parte Order": "violet",
  Other: "neutral",
}

/** What happened in court. Drives the "Record outcome" flow. */
export const HEARING_OUTCOMES = [
  { value: "Adjourned", label: "Adjourned", needsNextDate: true },
  { value: "Heard, part-heard", label: "Heard, part-heard", needsNextDate: true },
  { value: "Order reserved", label: "Order reserved", needsNextDate: true },
  { value: "Order passed", label: "Order passed", needsNextDate: false },
  { value: "Disposed", label: "Disposed of", needsNextDate: false },
  { value: "Not reached", label: "Not reached (board did not reach)", needsNextDate: true },
] as const

// ---- Documents -------------------------------------------------------------
export const DOC_CATEGORIES = ["Petition", "Affidavit", "Evidence", "Notice", "Order", "Vakalatnama", "Other"]

// ---- Clients ---------------------------------------------------------------
export const ID_PROOF_TYPES = ["Aadhaar", "PAN Card", "Voter ID", "Passport", "Driving Licence"]
export const LANGUAGES = ["English", "Hindi"] as const
export type Language = (typeof LANGUAGES)[number]

// ---- Notices ---------------------------------------------------------------
export const NOTICE_STATUSES = ["Draft", "Sent"] as const

// ---- Fees ------------------------------------------------------------------
export const PAYMENT_MODES = ["UPI", "Cash", "Cheque", "Bank transfer"]

// ---- Profile ---------------------------------------------------------------
export const SPECIALIZATIONS = [
  "Criminal Law",
  "Property Disputes",
  "Family Law",
  "Civil Law",
  "Consumer Law",
  "Constitutional Law",
  "Tax Law",
  "Corporate Law",
]

// Session key used to hand an AI answer over to the notice drafter.
export const AI_DRAFT_KEY = "lexfirm-ai-draft"
