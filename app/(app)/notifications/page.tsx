"use client"
import { useState } from "react"
import Link from "next/link"
import { BellOff, CheckCheck, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Chip, EmptyState, PageHeader } from "@/components/ui/misc"
import { AlertItem } from "@/components/alerts/alert-item"
import { formatINR } from "@/lib/utils"
import { getDueInfo, markAlertsRead, useDB } from "@/lib/store"
import { useAlerts } from "@/lib/use-alerts"
import type { AlertCategory } from "@/lib/notifications"

const FILTERS: ("All" | AlertCategory)[] = ["All", "Payments", "Hearings", "Deadlines", "Cases"]

export default function NotificationsPage() {
  const db = useDB()
  const { alerts, unread, read } = useAlerts()
  const [filter, setFilter] = useState<"All" | AlertCategory>("All")
  const [unreadOnly, setUnreadOnly] = useState(false)

  const list = alerts.filter((a) => (filter === "All" || a.category === filter) && (!unreadOnly || !read.has(a.id)))
  const paymentTotal = alerts
    .filter((a) => a.dueId && a.severity !== "info")
    .reduce((s, a) => {
      const due = db.dues.find((d) => d.id === a.dueId)
      return s + (due ? getDueInfo(due, db).balance : 0)
    }, 0)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Notifications"
        description={
          unread.length
            ? `${unread.length} unread${paymentTotal ? ` · ${formatINR(paymentTotal)} to collect today and overdue` : ""}`
            : "You are up to date."
        }
        actions={
          <>
            <Button variant="outline" asChild><Link href="/settings?section=notifications"><Settings /> Alert settings</Link></Button>
            {unread.length > 0 && <Button onClick={() => markAlertsRead(unread.map((a) => a.id))}><CheckCheck /> Mark all read</Button>}
          </>
        }
      />

      <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)} count={f === "All" ? alerts.length : alerts.filter((a) => a.category === f).length}>
            {f}
          </Chip>
        ))}
        <span className="mx-1 hidden w-px self-stretch bg-border sm:block" />
        <Chip active={unreadOnly} onClick={() => setUnreadOnly((u) => !u)}>Unread only</Chip>
      </div>

      <Card className="overflow-hidden">
        {list.length === 0 ? (
          <EmptyState icon={BellOff} title="Nothing to show" description={unreadOnly ? "No unread notifications." : "Nothing needs your attention in this category."} />
        ) : (
          <div className="divide-y divide-border">
            {list.map((a) => <AlertItem key={a.id} alert={a} read={read.has(a.id)} />)}
          </div>
        )}
      </Card>
      <p className="text-center text-xs text-subtle-foreground">
        Alerts clear on their own once the fee is paid, the outcome is recorded or the deadline passes.
      </p>
    </div>
  )
}
