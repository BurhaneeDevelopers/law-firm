"use client"
import { useState } from "react"
import Link from "next/link"
import * as Popover from "@radix-ui/react-popover"
import {
  Bell, BellOff, Briefcase, CalendarClock, CalendarPlus, CheckCheck, FileText, HandCoins, IndianRupee, NotebookPen, ScrollText, UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Segmented, EmptyState } from "@/components/ui/misc"
import { AlertItem } from "@/components/alerts/alert-item"
import { cn, formatRelativeTime } from "@/lib/utils"
import { markActivityRead, markAlertsRead, useDB } from "@/lib/store"
import { useAlerts } from "@/lib/use-alerts"
import { useHydrated } from "@/lib/use-hydrated"

export const activityIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  case_updated: Briefcase,
  case_created: Briefcase,
  document_uploaded: FileText,
  notice_sent: ScrollText,
  notice_drafted: ScrollText,
  client_added: UserPlus,
  hearing_added: CalendarPlus,
  note_added: NotebookPen,
  payment_received: IndianRupee,
  due_added: CalendarClock,
  due_rescheduled: CalendarClock,
  due_waived: HandCoins,
}

export function NotificationsBell() {
  const db = useDB()
  const hydrated = useHydrated()
  const { alerts, unread, read } = useAlerts()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<"alerts" | "activity">("alerts")
  const unreadActivity = db.activity.filter((a) => !db.readActivityIds.includes(a.id))
  const urgent = unread.some((a) => a.severity === "danger")

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`} className="relative">
          <Bell />
          {unread.length > 0 && (
            <span
              className={cn(
                "tabular absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                urgent ? "bg-danger text-danger-foreground" : "bg-primary text-primary-foreground"
              )}
            >
              {unread.length > 99 ? "99+" : unread.length}
            </span>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-(--z-popover) flex max-h-[min(560px,80vh)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-lg animate-pop"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <Segmented
              size="sm"
              ariaLabel="Notifications view"
              value={view}
              onChange={setView}
              options={[
                { value: "alerts", label: `Alerts${unread.length ? ` · ${unread.length}` : ""}` },
                { value: "activity", label: "Activity" },
              ]}
            />
            {view === "alerts" && unread.length > 0 && (
              <button type="button" onClick={() => markAlertsRead(unread.map((a) => a.id))} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            )}
            {view === "activity" && unreadActivity.length > 0 && (
              <button type="button" onClick={() => markActivityRead()} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {view === "alerts" ? (
              alerts.length === 0 ? (
                <EmptyState compact icon={BellOff} title="All clear" description="No fees due, hearings or deadlines need attention." />
              ) : (
                <div className="divide-y divide-border">
                  {alerts.slice(0, 12).map((a) => (
                    <AlertItem key={a.id} alert={a} read={read.has(a.id)} onNavigate={() => setOpen(false)} compact />
                  ))}
                </div>
              )
            ) : (
              <div className="divide-y divide-border">
                {db.activity.slice(0, 15).map((a) => {
                  const Icon = activityIcon[a.action_type] ?? Bell
                  const isUnread = !db.readActivityIds.includes(a.id)
                  return (
                    <div key={a.id} className={cn("flex items-start gap-3 px-4 py-3", isUnread && "bg-primary-soft/40")}>
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] leading-snug text-foreground">{a.description}</p>
                        <p className="mt-0.5 text-xs text-subtle-foreground">{hydrated ? formatRelativeTime(a.created_at) : ""}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border p-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-1.5 text-center text-[13px] font-medium text-primary hover:bg-surface-2"
            >
              {alerts.length > 12 ? `See all ${alerts.length} notifications` : "Open notifications"}
            </Link>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
