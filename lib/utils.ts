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
  Criminal: "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
  Divorce: "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  Property: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  Civil: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
}

export const caseTypeDotColors: Record<string, string> = {
  Criminal: "bg-rose-500 dark:bg-rose-400",
  Divorce: "bg-purple-500 dark:bg-purple-400",
  Property: "bg-amber-500 dark:bg-amber-400",
  Civil: "bg-blue-500 dark:bg-blue-400",
}

export const statusColors: Record<string, string> = {
  Active: "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  "Hearing Scheduled": "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  "Judgment Awaited": "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  Closed: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  Won: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
}

export const statusDotColors: Record<string, string> = {
  Active: "bg-indigo-500 dark:bg-indigo-400",
  "Hearing Scheduled": "bg-amber-500 dark:bg-amber-400",
  "Judgment Awaited": "bg-orange-500 dark:bg-orange-400",
  Closed: "bg-slate-400 dark:bg-slate-500",
  Won: "bg-emerald-500 dark:bg-emerald-400",
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
