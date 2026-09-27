"use client"
import Link from "next/link"
import { Briefcase, CalendarClock, Check, CircleDot, IndianRupee, AlarmClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDues } from "@/components/dues/dues-context"
import { cn } from "@/lib/utils"
import { markAlertsRead, markAlertUnread } from "@/lib/store"
import type { Alert } from "@/lib/notifications"

const categoryIcon = {
  Payments: IndianRupee,
  Hearings: CalendarClock,
  Deadlines: AlarmClock,
  Cases: Briefcase,
} as const

const severityIcon = {
  danger: "bg-danger-soft text-danger-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  info: "bg-info-soft text-info-soft-foreground",
  success: "bg-success-soft text-success-soft-foreground",
}

export function AlertItem({ alert, read, onNavigate, compact }: { alert: Alert; read: boolean; onNavigate?: () => void; compact?: boolean }) {
  const dues = useDues()
  const Icon = categoryIcon[alert.category]

  return (
    <div className={cn("group flex items-start gap-3 px-4 py-3 transition-colors", !read && "bg-primary-soft/40")}>
      <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", severityIcon[alert.severity])}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <Link
          href={alert.href}
          onClick={() => {
            markAlertsRead([alert.id])
            onNavigate?.()
          }}
          className="block text-[13px] font-medium leading-snug text-foreground hover:text-primary"
        >
          {alert.title}
        </Link>
        <p className={cn("mt-0.5 text-xs text-muted-foreground", compact && "line-clamp-2")}>{alert.body}</p>
        {alert.dueId && (
          <div className="mt-2 flex gap-1.5">
            <Button size="xs" variant="soft" onClick={() => { dues.markPaid(alert.dueId!); markAlertsRead([alert.id]) }}>
              <Check /> Mark paid
            </Button>
            <Button size="xs" variant="outline" onClick={() => { dues.recordPayment({ dueId: alert.dueId }); markAlertsRead([alert.id]) }}>
              Part payment
            </Button>
            <Button size="xs" variant="ghost" onClick={() => { dues.reschedule(alert.dueId!); markAlertsRead([alert.id]) }}>
              New date
            </Button>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => (read ? markAlertUnread(alert.id) : markAlertsRead([alert.id]))}
        aria-label={read ? "Mark as unread" : "Mark as read"}
        title={read ? "Mark as unread" : "Mark as read"}
        className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-md text-subtle-foreground hover:bg-surface-2 hover:text-foreground"
      >
        {read ? <CircleDot className="size-3.5 opacity-40" /> : <span className="size-2 rounded-full bg-primary" />}
      </button>
    </div>
  )
}
