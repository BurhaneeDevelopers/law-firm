"use client"
import { useMemo, useState } from "react"
import {
  addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth,
  startOfMonth, startOfWeek, subMonths, subWeeks,
} from "date-fns"
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { EmptyState, PageHeader, Segmented } from "@/components/ui/misc"
import { HearingRow } from "@/components/practice/hearing-row"
import { RecordOutcomeSheet } from "@/components/practice/record-outcome-sheet"
import { AddHearingDialog } from "@/components/practice/add-hearing-dialog"
import { purposeTone, toneClasses, toneSolid } from "@/lib/constants"
import { cn, formatDate, formatTime, getDaysUntil, toISODate } from "@/lib/utils"
import { sortHearings, useDB, type Hearing } from "@/lib/store"

type View = "month" | "week" | "agenda"
const WEEK_OPTS = { weekStartsOn: 1 as const }

export default function CalendarPage() {
  const db = useDB()
  const [view, setView] = useState<View>("month")
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState(() => new Date())
  const [outcomeFor, setOutcomeFor] = useState<Hearing | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const caseById = useMemo(() => new Map(db.cases.map((c) => [c.id, c])), [db.cases])
  const clientById = useMemo(() => new Map(db.clients.map((c) => [c.id, c])), [db.clients])
  const byDate = useMemo(() => {
    const m = new Map<string, Hearing[]>()
    sortHearings(db.hearings).forEach((h) => m.set(h.date, [...(m.get(h.date) ?? []), h]))
    return m
  }, [db.hearings])

  const selectedISO = toISODate(selected)
  const selectedHearings = byDate.get(selectedISO) ?? []
  const upcomingCount = db.hearings.filter((h) => getDaysUntil(h.date) >= 0).length
  const pendingReminders = db.hearings.filter((h) => {
    const d = getDaysUntil(h.date)
    return d >= 0 && d <= 1 && !h.reminder_sent
  }).length

  const monthDays = eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor), WEEK_OPTS), end: endOfWeek(endOfMonth(cursor), WEEK_OPTS) })
  const weekDays = eachDayOfInterval({ start: startOfWeek(cursor, WEEK_OPTS), end: endOfWeek(cursor, WEEK_OPTS) })
  const agendaDays = eachDayOfInterval({ start: new Date(), end: addDays(new Date(), 45) })
    .map((d) => ({ date: d, list: byDate.get(toISODate(d)) ?? [] }))
    .filter((d) => d.list.length > 0)

  const title = view === "month"
    ? format(cursor, "MMMM yyyy")
    : view === "week"
      ? `${format(weekDays[0], "dd MMM")} - ${format(weekDays[6], "dd MMM yyyy")}`
      : "Next 45 days"

  const step = (dir: 1 | -1) => {
    if (view === "month") setCursor((c) => (dir === 1 ? addMonths(c, 1) : subMonths(c, 1)))
    if (view === "week") setCursor((c) => (dir === 1 ? addWeeks(c, 1) : subWeeks(c, 1)))
  }

  const goToday = () => {
    setCursor(new Date())
    setSelected(new Date())
  }

  const pick = (d: Date) => {
    setSelected(d)
    if (!isSameMonth(d, cursor) && view === "month") setCursor(d)
  }

  const row = (h: Hearing, compact = false) => {
    const c = caseById.get(h.case_id)
    return <HearingRow key={h.id} compact={compact} hearing={h} caseData={c} client={c ? clientById.get(c.client_id) : undefined} onRecordOutcome={setOutcomeFor} />
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Diary"
        description={`${upcomingCount} upcoming dates${pendingReminders ? ` · ${pendingReminders} client reminders pending for today and tomorrow` : ""}`}
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()} disabled={selectedHearings.length === 0} title="Print the selected day's list">
              <Printer /> Print day list
            </Button>
            <Button onClick={() => setAddOpen(true)}><CalendarPlus /> Add hearing</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" aria-label="Previous" onClick={() => step(-1)} disabled={view === "agenda"}><ChevronLeft /></Button>
          <Button variant="outline" size="icon-sm" aria-label="Next" onClick={() => step(1)} disabled={view === "agenda"}><ChevronRight /></Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
        <h2 className="ml-1 text-base font-semibold text-foreground">{title}</h2>
        <Segmented
          className="ml-auto"
          ariaLabel="Calendar view"
          value={view}
          onChange={setView}
          options={[
            { value: "month", label: "Month" },
            { value: "week", label: "Week" },
            { value: "agenda", label: "Agenda" },
          ]}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        {view === "month" && (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border bg-surface-2/60">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className={cn("py-2 text-center text-xs font-medium", d === "Sun" ? "text-subtle-foreground" : "text-muted-foreground")}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const iso = toISODate(day)
                const list = byDate.get(iso) ?? []
                const inMonth = isSameMonth(day, cursor)
                const isSel = isSameDay(day, selected)
                const isTodayCell = isSameDay(day, new Date())
                const sunday = day.getDay() === 0
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => pick(day)}
                    aria-pressed={isSel}
                    aria-label={`${format(day, "EEEE d MMMM")}, ${list.length} hearings`}
                    className={cn(
                      "group relative flex min-h-[72px] flex-col items-stretch gap-1 border-b border-r border-border p-1.5 text-left transition-colors sm:min-h-[104px] sm:p-2 [&:nth-child(7n)]:border-r-0",
                      !inMonth && "bg-surface-2/40",
                      sunday && inMonth && "bg-surface-2/30",
                      isSel ? "bg-primary-soft/60" : "hover:bg-surface-2/70"
                    )}
                  >
                    <span
                      className={cn(
                        "tabular flex size-6 items-center justify-center rounded-md text-xs font-medium",
                        isTodayCell ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-subtle-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {/* Phone: dots. Larger screens: time and case number. */}
                    <span className="flex flex-wrap gap-0.5 sm:hidden">
                      {list.slice(0, 4).map((h) => (
                        <span key={h.id} className={cn("size-1.5 rounded-full", toneSolid[purposeTone[h.purpose] ?? "neutral"])} />
                      ))}
                    </span>
                    <span className="hidden space-y-0.5 sm:block">
                      {list.slice(0, 3).map((h) => (
                        <span key={h.id} className={cn("block truncate rounded px-1.5 py-0.5 text-[11px] font-medium", toneClasses[purposeTone[h.purpose] ?? "neutral"])}>
                          <span className="tabular">{formatTime(h.time).replace(" ", "").toLowerCase()}</span> {caseById.get(h.case_id)?.case_number.split("/").slice(0, 2).join("/")}
                        </span>
                      ))}
                      {list.length > 3 && <span className="block px-1.5 text-[11px] font-medium text-subtle-foreground">+{list.length - 3} more</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>
        )}

        {view === "week" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
            {weekDays.map((day) => {
              const list = byDate.get(toISODate(day)) ?? []
              const isSel = isSameDay(day, selected)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pick(day)}
                  aria-pressed={isSel}
                  className={cn(
                    "rounded-2xl border bg-surface p-3 text-left transition-colors",
                    isSel ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-border-strong"
                  )}
                >
                  <div className="flex items-baseline justify-between">
                    <p className={cn("text-sm font-semibold", isSameDay(day, new Date()) ? "text-primary" : "text-foreground")}>{format(day, "EEEE")}</p>
                    <p className="tabular text-xs text-muted-foreground">{format(day, "dd MMM")}</p>
                  </div>
                  {list.length === 0 ? (
                    <p className="mt-3 text-xs text-subtle-foreground">{day.getDay() === 0 ? "Sunday" : "No hearings"}</p>
                  ) : (
                    <ul className="mt-2.5 space-y-1.5">
                      {list.map((h) => {
                        const c = caseById.get(h.case_id)
                        return (
                          <li key={h.id} className="flex items-start gap-2 text-xs">
                            <span className={cn("mt-1 size-2 shrink-0 rounded-[3px]", toneSolid[purposeTone[h.purpose] ?? "neutral"])} />
                            <span className="min-w-0">
                              <span className="tabular font-medium text-foreground">{formatTime(h.time)}</span>{" "}
                              <span className="font-mono text-muted-foreground">{c?.case_number}</span>
                              <span className="block truncate text-muted-foreground">{h.purpose} · {h.court_room}</span>
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {view === "agenda" && (
          <Card className="overflow-hidden">
            {agendaDays.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Nothing listed in the next 45 days" action={<Button size="sm" onClick={() => setAddOpen(true)}><CalendarPlus /> Add hearing</Button>} />
            ) : (
              agendaDays.map(({ date, list }) => (
                <section key={date.toISOString()}>
                  <h3 className="sticky top-14 z-10 border-y border-border bg-surface-2/95 px-5 py-2 text-xs font-semibold text-foreground backdrop-blur first:border-t-0 md:top-16">
                    {formatDate(date, "EEEE, dd MMMM")}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {getDaysUntil(date) === 0 ? "Today" : getDaysUntil(date) === 1 ? "Tomorrow" : `In ${getDaysUntil(date)} days`}
                    </span>
                  </h3>
                  <div className="divide-y divide-border">{list.map((h) => row(h))}</div>
                </section>
              ))
            )}
          </Card>
        )}

        {view !== "agenda" && (
          <Card className="h-fit overflow-hidden xl:sticky xl:top-24">
            <CardHeader
              title={formatDate(selected, "EEEE, dd MMM")}
              description={
                getDaysUntil(selected) === 0 ? "Today" : getDaysUntil(selected) === 1 ? "Tomorrow" : `${selectedHearings.length} ${selectedHearings.length === 1 ? "hearing" : "hearings"}`
              }
              divider
              action={<Button size="xs" variant="outline" onClick={() => setAddOpen(true)}><CalendarPlus /> Add</Button>}
            />
            {selectedHearings.length === 0 ? (
              <EmptyState compact icon={CalendarDays} title={selected.getDay() === 0 ? "Sunday, courts closed" : "No hearings on this day"} />
            ) : (
              <div className="divide-y divide-border">{selectedHearings.map((h) => row(h, true))}</div>
            )}
          </Card>
        )}
      </div>

      {/* Printable cause list for the selected day */}
      <div className="print-area hidden print:block">
        <h1 style={{ fontSize: 16, fontWeight: 600 }}>{db.lawyer.firm_name}: cause list for {formatDate(selected, "EEEE, dd MMMM yyyy")}</h1>
        <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {["Time", "Item", "Court", "Case no.", "Title", "Client", "Purpose", "Next date"].map((h) => (
                <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #999", padding: "6px 4px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedHearings.map((h) => {
              const c = caseById.get(h.case_id)
              return (
                <tr key={h.id}>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #ddd" }}>{formatTime(h.time)}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #ddd" }}>{h.item_no}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #ddd" }}>{h.court_room}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #ddd" }}>{c?.case_number}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #ddd" }}>{c?.title}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #ddd" }}>{c ? clientById.get(c.client_id)?.full_name : ""}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #ddd" }}>{h.purpose}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #ddd", width: 90 }}>&nbsp;</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <RecordOutcomeSheet hearing={outcomeFor} onOpenChange={(o) => !o && setOutcomeFor(null)} />
      <AddHearingDialog open={addOpen} onOpenChange={setAddOpen} defaultDate={getDaysUntil(selected) >= 0 ? selectedISO : undefined} />
    </div>
  )
}

