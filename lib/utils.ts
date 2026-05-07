import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format, differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

export function formatDate(dateStr: string, fmt = "dd MMM yyyy") {
  try {
    return format(new Date(dateStr), fmt)
  } catch {
    return dateStr
  }
}

export function getDaysUntil(dateStr: string) {
  try {
    return differenceInDays(new Date(dateStr), new Date())
  } catch {
    return 0
  }
}

export function getCountdownClass(daysUntil: number) {
  if (daysUntil <= 1) return "countdown-danger"
  if (daysUntil <= 3) return "countdown-warning"
  return "countdown-safe"
}

export function getCountdownLabel(daysUntil: number) {
  if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`
  if (daysUntil === 0) return "Today"
  if (daysUntil === 1) return "Tomorrow"
  return `${daysUntil} days left`
}

export const caseTypeColors: Record<string, string> = {
  Criminal: "bg-rose-100 text-rose-700 border border-rose-200",
  Divorce: "bg-purple-100 text-purple-700 border border-purple-200",
  Property: "bg-amber-100 text-amber-700 border border-amber-200",
  Civil: "bg-blue-100 text-blue-700 border border-blue-200",
}

export const caseTypeDotColors: Record<string, string> = {
  Criminal: "bg-rose-500",
  Divorce: "bg-purple-500",
  Property: "bg-amber-500",
  Civil: "bg-blue-500",
}

export const statusColors: Record<string, string> = {
  Active: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  "Hearing Scheduled": "bg-amber-50 text-amber-700 border border-amber-200",
  "Judgment Awaited": "bg-orange-50 text-orange-700 border border-orange-200",
  Closed: "bg-slate-100 text-slate-600 border border-slate-200",
  Won: "bg-emerald-50 text-emerald-700 border border-emerald-200",
}

export const statusDotColors: Record<string, string> = {
  Active: "bg-indigo-500",
  "Hearing Scheduled": "bg-amber-500",
  "Judgment Awaited": "bg-orange-500",
  Closed: "bg-slate-400",
  Won: "bg-emerald-500",
}

export function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
}

export const avatarColors = [
  "bg-indigo-500", "bg-purple-500", "bg-rose-500", "bg-amber-500",
  "bg-emerald-500", "bg-blue-500", "bg-pink-500", "bg-teal-500",
]

export function getAvatarColor(name: string) {
  let sum = 0
  for (const c of name) sum += c.charCodeAt(0)
  return avatarColors[sum % avatarColors.length]
}

export function generateWhatsAppMessage(params: {
  clientName: string
  caseNumber: string
  date: string
  time: string
  court: string
  lawyerName: string
}) {
  return encodeURIComponent(
    `Dear ${params.clientName},\n\nThis is a reminder that your hearing for case ${params.caseNumber} is scheduled on ${params.date} at ${params.time} at ${params.court}.\n\nPlease ensure you are present on time.\n\nRegards,\nAdvocate ${params.lawyerName}`
  )
}
