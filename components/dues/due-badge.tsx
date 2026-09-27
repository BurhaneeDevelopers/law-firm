"use client"
import { CircleCheck, Clock, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate, formatINR } from "@/lib/utils"
import type { DueInfo, DuesSummary } from "@/lib/store"

export function dueStatusLabel(info: DueInfo) {
  switch (info.status) {
    case "Overdue":
      return `${info.daysOverdue} ${info.daysOverdue === 1 ? "day" : "days"} overdue`
    case "Due today":
      return "Due today"
    case "Upcoming":
      return info.daysUntil === 1 ? "Due tomorrow" : info.daysUntil <= 7 ? `Due in ${info.daysUntil} days` : `Due ${formatDate(info.due.due_date, "dd MMM")}`
    case "Paid":
      return "Paid"
    case "Waived":
      return "Waived"
  }
}

export function DueStatusBadge({ info, className }: { info: DueInfo; className?: string }) {
  const tone =
    info.status === "Overdue" ? "danger" : info.status === "Due today" ? "warning" : info.status === "Paid" ? "success" : info.status === "Waived" ? "neutral" : info.daysUntil <= 3 ? "warning" : "info"
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      <Badge tone={tone}>
        {info.status === "Overdue" ? <TriangleAlert /> : info.status === "Paid" ? <CircleCheck /> : <Clock />}
        {dueStatusLabel(info)}
      </Badge>
      {info.partial && <Badge tone="accent">Part paid</Badge>}
    </span>
  )
}

/**
 * Compact fees cell for Cases and Clients tables. Always a button so the dues panel
 * opens from the list without leaving the page.
 */
export function DuesCell({ summary, onOpen, className }: { summary: DuesSummary; onOpen: () => void; className?: string }) {
  const { overdueBalance, maxDaysOverdue, overdueCount, next, openCount } = summary
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
      className={cn(
        "group/due -mx-2 flex min-w-36 flex-col items-start rounded-lg px-2 py-1 text-left transition-colors hover:bg-surface-2 focus-visible:bg-surface-2",
        className
      )}
      aria-label={overdueCount ? `${formatINR(overdueBalance)} overdue, open dues` : "Open dues"}
    >
      {overdueCount > 0 ? (
        <>
          <span className="tabular text-[13px] font-semibold text-danger-soft-foreground">{formatINR(overdueBalance)} overdue</span>
          <span className="text-xs font-medium text-danger-soft-foreground/80">
            {maxDaysOverdue} {maxDaysOverdue === 1 ? "day" : "days"} late{overdueCount > 1 ? ` · ${overdueCount} dues` : ""}
          </span>
        </>
      ) : next ? (
        <>
          <span className={cn("tabular text-[13px] font-medium", next.status === "Due today" ? "text-warning-soft-foreground" : "text-foreground")}>
            {formatINR(next.balance)}
          </span>
          <span className={cn("text-xs", next.status === "Due today" || next.daysUntil <= 3 ? "text-warning-soft-foreground" : "text-subtle-foreground")}>
            {dueStatusLabel(next)}
            {openCount > 1 ? ` · ${openCount} open` : ""}
          </span>
        </>
      ) : (
        <>
          <span className="text-[13px] text-subtle-foreground">No dues</span>
          <span className="text-xs font-medium text-primary">+ Add due</span>
        </>
      )}
    </button>
  )
}
