"use client"
import { useState } from "react"
import Link from "next/link"
import {
  AlarmClock, ArrowRight, Briefcase, CalendarDays, CalendarPlus, CircleAlert, Flag, Gavel, IndianRupee,
  Scale, ShieldAlert, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { CountdownBadge } from "@/components/ui/badge"
import { EmptyState, PageHeader, Segmented, Stat } from "@/components/ui/misc"
import { HearingRow } from "@/components/practice/hearing-row"
import { RecordOutcomeSheet } from "@/components/practice/record-outcome-sheet"
import { AddHearingDialog } from "@/components/practice/add-hearing-dialog"
import { caseStatusTone, toneSolid } from "@/lib/constants"
import {
  cn, formatDate, formatINR, formatINRCompact, formatRelativeTime, formatTime, getDaysUntil, timeToMinutes, toISODate,
} from "@/lib/utils"
import { getDashboardStats, getDueInfos, sortHearings, useDB, type Hearing } from "@/lib/store"
import { useDues } from "@/components/dues/dues-context"
import { DueActions } from "@/components/dues/due-row"
import { getCitationDashboardStats } from "@/lib/citation-store"
import { addDays } from "date-fns"

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

const BANNER_KEY = "lexfirm-citation-banner-dismissed"

export default function DashboardPage() {
  const db = useDB()
  const stats = getDashboardStats(db)
  const citation = getCitationDashboardStats()

  const dues = useDues()
  const [board, setBoard] = useState<"today" | "tomorrow">("today")
  const [outcomeFor, setOutcomeFor] = useState<Hearing | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(BANNER_KEY) === "1"
    } catch {
      return false
    }
  })

  const caseById = new Map(db.cases.map((c) => [c.id, c]))
  const clientById = new Map(db.clients.map((c) => [c.id, c]))

  const todayISO = toISODate(new Date())
  const tomorrowISO = toISODate(addDays(new Date(), 1))
  const boardDate = board === "today" ? todayISO : tomorrowISO
  const boardHearings = sortHearings(db.hearings.filter((h) => h.date === boardDate))
  const todayHearings = sortHearings(db.hearings.filter((h) => h.date === todayISO))
  const tomorrowCount = db.hearings.filter((h) => h.date === tomorrowISO).length

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const nextToday = todayHearings.find((h) => timeToMinutes(h.time) >= nowMin - 30 && !h.outcome)

  const pendingOutcomes = sortHearings(
    db.hearings.filter((h) => {
      const d = getDaysUntil(h.date)
      return d < 0 && d >= -30 && !h.outcome
    }),
    "desc"
  )

  const collect = getDueInfos(db)
    .filter((i) => i.status === "Overdue" || i.status === "Due today")
    .sort((a, b) => (a.status === "Due today" ? -1 : 0) - (b.status === "Due today" ? -1 : 0) || b.daysOverdue - a.daysOverdue)

  const deadlines = [...db.deadlines].sort((a, b) => getDaysUntil(a.due_date) - getDaysUntil(b.due_date))

  const pipeline = (Object.entries(stats.statusBreakdown) as [string, number][]).filter(([, v]) => v > 0)
  const pipelineTotal = pipeline.reduce((s, [, v]) => s + v, 0)

  const summary =
    todayHearings.length === 0
      ? "No matters listed today. A good day for drafting."
      : `${todayHearings.length} ${todayHearings.length === 1 ? "matter" : "matters"} listed today${
          nextToday ? `. Next: ${formatTime(nextToday.time)}, ${nextToday.court_room}.` : ". All appearances done."
        }`

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, Adv. ${db.lawyer.name.split(" ")[0]}`}
        description={summary}
        actions={
          <>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <CalendarPlus /> Add hearing
            </Button>
            <Button asChild>
              <Link href="/cases/new"><Briefcase /> New case</Link>
            </Button>
          </>
        }
      />

      {pendingOutcomes.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3.5 sm:flex-row sm:items-center">
          <CircleAlert className="size-5 shrink-0 text-warning" />
          <p className="flex-1 text-sm text-warning-soft-foreground">
            <span className="font-semibold">
              {pendingOutcomes.length} past {pendingOutcomes.length === 1 ? "hearing has" : "hearings have"} no outcome recorded.
            </span>{" "}
            Record the next date so nothing drops off your diary.
          </p>
          <Button size="sm" variant="outline" onClick={() => setOutcomeFor(pendingOutcomes[0])}>
            <Gavel /> Update now
          </Button>
        </div>
      )}

      {citation.hasUnverifiedDocs && !bannerDismissed && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger/25 bg-danger-soft px-4 py-3.5">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-danger" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-danger-soft-foreground">
              {citation.unverifiedCount} AI-drafted {citation.unverifiedCount === 1 ? "document has" : "documents have"} citations that need review
            </p>
            <p className="mt-0.5 text-[13px] text-danger-soft-foreground/85">
              Courts have imposed costs for fabricated case law. Check every citation before filing.
            </p>
            <Link href="/citation-check" className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-danger-soft-foreground hover:underline">
              Review citations <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              setBannerDismissed(true)
              try { sessionStorage.setItem(BANNER_KEY, "1") } catch { /* storage blocked */ }
            }}
            className="flex size-7 items-center justify-center rounded-md text-danger-soft-foreground/70 hover:bg-danger/10"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Hearings today"
          value={stats.hearingsToday}
          icon={Gavel}
          tone="primary"
          href="/calendar"
          hint={nextToday ? `Next at ${formatTime(nextToday.time)}` : stats.hearingsToday ? "All done for today" : "Clear board"}
        />
        <Stat label="Next 7 days" value={stats.hearingsThisWeek} icon={CalendarDays} href="/calendar" hint={`${tomorrowCount} tomorrow`} />
        <Stat label="Urgent matters" value={stats.urgentOpen} icon={Flag} tone={stats.urgentOpen ? "danger" : "neutral"} href="/cases?urgent=1" hint={`${stats.activeCases} open cases`} />
        <Stat
          label="Fees overdue"
          value={formatINRCompact(stats.overdue.overdueBalance)}
          icon={IndianRupee}
          tone={stats.overdue.overdueBalance ? "danger" : "success"}
          href="/dues?tab=overdue"
          hint={
            stats.overdue.overdueCount
              ? `${stats.overdue.clientCount} clients · oldest ${stats.overdue.maxDaysOverdue} days`
              : `${formatINRCompact(stats.feesOutstanding)} outstanding, none late`
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader
              title={board === "today" ? "Today's board" : "Tomorrow's board"}
              description={formatDate(boardDate, "EEEE, dd MMMM")}
              divider
              action={
                <Segmented
                  size="sm"
                  ariaLabel="Board day"
                  value={board}
                  onChange={setBoard}
                  options={[
                    { value: "today", label: `Today · ${todayHearings.length}` },
                    { value: "tomorrow", label: `Tomorrow · ${tomorrowCount}` },
                  ]}
                />
              }
            />
            {boardHearings.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title={board === "today" ? "Nothing listed today" : "Nothing listed tomorrow"}
                description="Add dates as courts give them so reminders and your diary stay accurate."
                action={<Button size="sm" variant="outline" onClick={() => setAddOpen(true)}><CalendarPlus /> Add hearing</Button>}
              />
            ) : (
              <div className="divide-y divide-border">
                {boardHearings.map((h) => {
                  const c = caseById.get(h.case_id)
                  return (
                    <HearingRow
                      key={h.id}
                      hearing={h}
                      caseData={c}
                      client={c ? clientById.get(c.client_id) : undefined}
                      onRecordOutcome={setOutcomeFor}
                    />
                  )
                })}
              </div>
            )}
          </Card>

          {pendingOutcomes.length > 0 && (
            <Card>
              <CardHeader
                icon={<Gavel />}
                title="Awaiting outcome"
                description="Past appearances with no next date recorded"
                divider
              />
              <ul className="divide-y divide-border">
                {pendingOutcomes.slice(0, 5).map((h) => {
                  const c = caseById.get(h.case_id)
                  return (
                    <li key={h.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{c?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-mono">{c?.case_number}</span> · {formatDate(h.date, "dd MMM")} · {h.purpose}
                        </p>
                      </div>
                      <Button size="xs" variant="soft" onClick={() => setOutcomeFor(h)}>Record</Button>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}

          <Card id="activity" className="scroll-mt-24">
            <CardHeader title="Recent activity" divider />
            <ul className="divide-y divide-border">
              {db.activity.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-2.5">
                  <p className="min-w-0 flex-1 truncate text-[13px] text-foreground">{a.description}</p>
                  <span className="shrink-0 text-xs text-subtle-foreground">{formatRelativeTime(a.created_at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader
              icon={<IndianRupee />}
              title="Collect"
              description={collect.length ? `${formatINR(collect.reduce((s, i) => s + i.balance, 0))} due today and overdue` : "Nothing due today"}
              divider
              action={<Button asChild variant="ghost" size="xs"><Link href="/dues">All dues</Link></Button>}
            />
            {collect.length === 0 ? (
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <p className="text-[13px] text-muted-foreground">No fees fall due today.</p>
                <Button size="xs" variant="outline" onClick={() => dues.recordPayment()}>Record payment</Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {collect.slice(0, 5).map((i) => {
                  const c = caseById.get(i.due.case_id)
                  const cl = c ? clientById.get(c.client_id) : undefined
                  return (
                    <li key={i.due.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <button type="button" onClick={() => dues.openDues({ caseId: i.due.case_id })} className="min-w-0 text-left">
                          <span className="block truncate text-[13px] font-medium text-foreground hover:text-primary">{cl?.full_name ?? "Client"}</span>
                          <span className="block truncate text-xs text-muted-foreground">{i.due.description} · {c?.case_number}</span>
                        </button>
                        <span className="shrink-0 text-right">
                          <span className="tabular block text-[13px] font-semibold text-foreground">{formatINR(i.balance)}</span>
                          <span className={cn("block text-xs", i.status === "Overdue" ? "text-danger-soft-foreground" : "text-warning-soft-foreground")}>
                            {i.status === "Overdue" ? `${i.daysOverdue}d late` : "Today"}
                          </span>
                        </span>
                      </div>
                      <div className="mt-2">
                        <DueActions info={i} client={cl} caseData={c} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {collect.length > 5 && (
              <Link href="/dues?tab=overdue" className="block border-t border-border px-5 py-2.5 text-center text-[13px] font-medium text-primary hover:bg-surface-2">
                {collect.length - 5} more
              </Link>
            )}
          </Card>

          <Card>
            <CardHeader icon={<AlarmClock />} title="Deadlines" description="Filing, compliance and limitation" divider />
            {deadlines.length === 0 ? (
              <EmptyState compact icon={AlarmClock} title="No deadlines" />
            ) : (
              <ul className="divide-y divide-border">
                {deadlines.map((d) => {
                  const days = getDaysUntil(d.due_date)
                  return (
                    <li key={d.id}>
                      <Link href={`/cases/${d.case_id}`} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface-2/60">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium leading-snug text-foreground">{d.title}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            <span className="font-mono">{d.case_number}</span> · {d.client}
                          </p>
                        </div>
                        <CountdownBadge days={days} className="shrink-0" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader icon={<Scale />} title="Case pipeline" description={`${pipelineTotal} matters on file`} />
            <div className="px-5 pb-5 pt-3">
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Cases by status">
                {pipeline.map(([status, count]) => (
                  <span
                    key={status}
                    className={cn("h-full first:rounded-l-full last:rounded-r-full", toneSolid[caseStatusTone[status] ?? "neutral"])}
                    style={{ width: `${(count / pipelineTotal) * 100}%` }}
                  />
                ))}
              </div>
              <ul className="mt-4 space-y-2">
                {pipeline.map(([status, count]) => (
                  <li key={status}>
                    <Link href={`/cases?status=${encodeURIComponent(status)}`} className="flex items-center gap-2.5 rounded-md text-[13px] hover:text-primary">
                      <span className={cn("size-2 rounded-[3px]", toneSolid[caseStatusTone[status] ?? "neutral"])} aria-hidden />
                      <span className="flex-1 text-muted-foreground">{status}</span>
                      <span className="tabular font-semibold text-foreground">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

        </div>
      </div>

      <RecordOutcomeSheet hearing={outcomeFor} onOpenChange={(o) => !o && setOutcomeFor(null)} />
      <AddHearingDialog open={addOpen} onOpenChange={setAddOpen} defaultDate={boardDate} />
    </div>
  )
}
