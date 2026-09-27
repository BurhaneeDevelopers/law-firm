"use client"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { endOfMonth, endOfQuarter, startOfMonth, startOfQuarter, subDays, subMonths } from "date-fns"
import {
  CalendarPlus, Check, CircleCheck, Download, HandCoins, IndianRupee, Percent, Receipt, TriangleAlert, Wallet, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Input, SearchInput } from "@/components/ui/field"
import { Avatar, Chip, EmptyState, PageHeader, Stat } from "@/components/ui/misc"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/toast"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useDues } from "@/components/dues/dues-context"
import { DueStatusBadge } from "@/components/dues/due-badge"
import { DueActions, DueRow } from "@/components/dues/due-row"
import { cn, financialYear, formatDate, formatINR, formatINRCompact, toISODate } from "@/lib/utils"
import { deletePayments, getDueInfos, getDuesStats, markDuePaid, useDB, type DateRange, type DueInfo } from "@/lib/store"

type Period = "month" | "last-month" | "quarter" | "fy" | "30d" | "all" | "custom"
type TabKey = "overdue" | "today" | "upcoming" | "paid" | "waived" | "all"

function periodRange(p: Period, custom: DateRange): DateRange | null {
  const now = new Date()
  switch (p) {
    case "month": return { from: toISODate(startOfMonth(now)), to: toISODate(endOfMonth(now)) }
    case "last-month": {
      const d = subMonths(now, 1)
      return { from: toISODate(startOfMonth(d)), to: toISODate(endOfMonth(d)) }
    }
    case "quarter": return { from: toISODate(startOfQuarter(now)), to: toISODate(endOfQuarter(now)) }
    case "fy": return financialYear(now)
    case "30d": return { from: toISODate(subDays(now, 29)), to: toISODate(now) }
    case "custom": return custom.from && custom.to ? custom : null
    case "all": return null
  }
}

const tabMatch: Record<TabKey, (i: DueInfo) => boolean> = {
  overdue: (i) => i.status === "Overdue",
  today: (i) => i.status === "Due today",
  upcoming: (i) => i.status === "Upcoming",
  paid: (i) => i.status === "Paid",
  waived: (i) => i.status === "Waived",
  all: () => true,
}

function readInitial() {
  const p = new URLSearchParams(window.location.search)
  const tab = p.get("tab") as TabKey | null
  return { tab: tab && tab in tabMatch ? tab : null, due: p.get("due"), create: p.get("new") }
}

export default function DuesPage() {
  const db = useDB()
  const dues = useDues()
  const { toast } = useToast()
  const { confirm, dialogElement } = useConfirmDialog()
  const [initial] = useState(readInitial)

  const [period, setPeriod] = useState<Period>("month")
  const [custom, setCustom] = useState<DateRange>({ from: "", to: "" })
  const [search, setSearch] = useState("")
  const [aging, setAging] = useState<[number, number] | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  const all = useMemo(() => getDueInfos(db), [db])
  const counts = useMemo(() => ({
    overdue: all.filter(tabMatch.overdue).length,
    today: all.filter(tabMatch.today).length,
  }), [all])
  const [tab, setTab] = useState<TabKey>(initial.tab ?? (counts.overdue ? "overdue" : counts.today ? "today" : "upcoming"))

  // Deep links from alerts, emails and the command palette.
  useEffect(() => {
    if (initial.create === "due") dues.addDue()
    if (initial.create === "payment") dues.recordPayment()
    if (initial.due) {
      const d = db.dues.find((x) => x.id === initial.due)
      if (d) dues.openDues({ caseId: d.case_id })
    }
    // Run once on arrival only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const range = periodRange(period, custom)
  const stats = getDuesStats(range, db)
  const periodLabel = range ? `${formatDate(range.from, "dd MMM yy")} to ${formatDate(range.to, "dd MMM yy")}` : "All dates"

  const caseById = useMemo(() => new Map(db.cases.map((c) => [c.id, c])), [db.cases])
  const clientById = useMemo(() => new Map(db.clients.map((c) => [c.id, c])), [db.clients])

  const inRange = (i: DueInfo) => !range || (i.due.due_date >= range.from && i.due.due_date <= range.to)

  const tabCounts: Record<TabKey, number> = {
    overdue: counts.overdue,
    today: counts.today,
    upcoming: all.filter((i) => tabMatch.upcoming(i) && inRange(i)).length,
    paid: all.filter((i) => tabMatch.paid(i) && inRange(i)).length,
    waived: all.filter((i) => tabMatch.waived(i) && inRange(i)).length,
    all: all.filter(inRange).length,
  }

  const q = search.trim().toLowerCase()
  const rows = all
      .filter(tabMatch[tab])
      // Overdue and due-today always show everything: old unpaid fees must never hide behind a date filter.
      .filter((i) => tab === "overdue" || tab === "today" || inRange(i))
      .filter((i) => !aging || (i.daysOverdue >= aging[0] && i.daysOverdue <= aging[1]))
      .filter((i) => {
        if (!q) return true
        const c = caseById.get(i.due.case_id)
        const cl = c ? clientById.get(c.client_id) : undefined
        return [i.due.description, c?.case_number, c?.title, cl?.full_name, cl?.phone].some((f) => f?.toLowerCase().includes(q))
      })
      .sort((a, b) => (tab === "overdue" ? b.daysOverdue - a.daysOverdue : tab === "paid" ? b.lastPaymentDate.localeCompare(a.lastPaymentDate) : a.due.due_date.localeCompare(b.due.due_date)))

  const rowsTotal = rows.reduce((s, i) => s + (i.status === "Paid" || i.status === "Waived" ? i.due.amount : i.balance), 0)

  // Who owes the most right now
  const debtors = useMemo(() => {
    const m = new Map<string, { clientId: string; amount: number; days: number; count: number }>()
    for (const i of all.filter(tabMatch.overdue)) {
      const clientId = caseById.get(i.due.case_id)?.client_id
      if (!clientId) continue
      const e = m.get(clientId) ?? { clientId, amount: 0, days: 0, count: 0 }
      e.amount += i.balance
      e.days = Math.max(e.days, i.daysOverdue)
      e.count += 1
      m.set(clientId, e)
    }
    return [...m.values()].sort((a, b) => b.amount - a.amount).slice(0, 5)
  }, [all, caseById])

  const selectedInfos = rows.filter((i) => selected.includes(i.due.id) && i.balance > 0)
  const selectedTotal = selectedInfos.reduce((s, i) => s + i.balance, 0)

  const bulkMarkPaid = () => {
    if (!selectedInfos.length) return
    confirm(
      `Mark ${selectedInfos.length} dues as paid?`,
      `${formatINR(selectedTotal)} will be recorded as received today by UPI. Change the mode later from each case's fee ledger if needed.`,
      () => {
        const ids = selectedInfos.flatMap((i) => markDuePaid(i.due.id))
        setSelected([])
        toast(`${formatINR(selectedTotal)} recorded`, "success", { label: "Undo", onClick: () => deletePayments(ids) })
      },
      "Mark paid"
    )
  }

  const exportCsv = () => {
    const list = selected.length ? rows.filter((i) => selected.includes(i.due.id)) : rows
    const header = ["Client", "Phone", "Case number", "For", "Due date", "Amount", "Received", "Balance", "Status", "Days overdue", "Reminders sent"]
    const lines = list.map((i) => {
      const c = caseById.get(i.due.case_id)
      const cl = c ? clientById.get(c.client_id) : undefined
      return [cl?.full_name ?? "", cl?.phone ?? "", c?.case_number ?? "", i.due.description, i.due.due_date, i.due.amount, i.paid, i.balance, i.status, i.daysOverdue, i.due.reminder_count]
    })
    const csv = [header, ...lines].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `dues-${tab}-${toISODate(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast(`Exported ${list.length} rows`, "success")
  }

  const fy = financialYear()
  const periods: { value: Period; label: string }[] = [
    { value: "month", label: "This month" },
    { value: "last-month", label: "Last month" },
    { value: "quarter", label: "This quarter" },
    { value: "fy", label: fy.label },
    { value: "30d", label: "Last 30 days" },
    { value: "all", label: "All time" },
    { value: "custom", label: "Custom" },
  ]

  const toggleAll = () => setSelected(selected.length === rows.length ? [] : rows.map((i) => i.due.id))

  return (
    <div className="space-y-6">
      {dialogElement}
      <PageHeader
        title="Dues"
        description="Fees your clients owe, when they fall due, and what came in."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}><Download /> Export</Button>
            <Button variant="outline" onClick={() => dues.recordPayment()}><IndianRupee /> Record payment</Button>
            <Button onClick={() => dues.addDue()}><CalendarPlus /> Add due</Button>
          </>
        }
      />

      <div className="space-y-3">
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {periods.map((p) => (
            <Chip key={p.value} active={period === p.value} onClick={() => setPeriod(p.value)}>{p.label}</Chip>
          ))}
        </div>
        {period === "custom" && (
          <div className="flex flex-wrap items-center gap-2 animate-fade-in">
            <Input type="date" aria-label="From" value={custom.from} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} className="h-9 w-44" />
            <span className="text-sm text-muted-foreground">to</span>
            <Input type="date" aria-label="To" value={custom.to} min={custom.from} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} className="h-9 w-44" />
          </div>
        )}
        <p className="text-xs text-subtle-foreground">Stats for {periodLabel}. Overdue always counts every unpaid fee, whatever its date.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Overdue now" value={formatINRCompact(stats.overdueAmount)} icon={TriangleAlert} tone={stats.overdueAmount ? "danger" : "success"} hint={`${stats.overdueCount} dues · all dates`} />
        <Stat label="Expected" value={formatINRCompact(stats.expected)} icon={Wallet} hint="Fees falling due in period" />
        <Stat label="Received" value={formatINRCompact(stats.received)} icon={CircleCheck} tone="success" hint={`${stats.receivedCount} payments in period`} />
        <Stat label="Still pending" value={formatINRCompact(stats.pending)} icon={Receipt} tone={stats.pending ? "warning" : "neutral"} hint={stats.waived ? `${formatINR(stats.waived)} waived` : "Of fees due in period"} />
        <Stat label="Collected" value={`${stats.collectionRate}%`} icon={Percent} tone={stats.collectionRate >= 80 ? "success" : stats.collectionRate >= 50 ? "warning" : "danger"} hint="Of fees due in period" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 overflow-hidden">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as TabKey); setSelected([]); setAging(null) }}>
            <TabsList>
              <TabsTrigger value="overdue" count={tabCounts.overdue} className={tabCounts.overdue ? "[&>span]:bg-danger-soft! [&>span]:text-danger-soft-foreground!" : undefined}>Overdue</TabsTrigger>
              <TabsTrigger value="today" count={tabCounts.today}>Due today</TabsTrigger>
              <TabsTrigger value="upcoming" count={tabCounts.upcoming}>Upcoming</TabsTrigger>
              <TabsTrigger value="paid" count={tabCounts.paid}>Paid</TabsTrigger>
              <TabsTrigger value="waived" count={tabCounts.waived}>Waived</TabsTrigger>
              <TabsTrigger value="all" count={tabCounts.all}>All</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center">
            <SearchInput className="sm:max-w-xs sm:flex-1" value={search} onChange={setSearch} placeholder="Client, phone, case no." />
            {aging && (
              <Chip active onClick={() => setAging(null)}>
                {aging[1] === Infinity ? `Over ${aging[0] - 1} days` : `${aging[0]}-${aging[1]} days`} <X />
              </Chip>
            )}
            <p className="tabular text-[13px] text-muted-foreground sm:ml-auto">
              {rows.length} {rows.length === 1 ? "due" : "dues"} · <span className="font-semibold text-foreground">{formatINR(rowsTotal)}</span>
            </p>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-primary-soft/50 px-4 py-2.5 animate-fade-in">
              <p className="text-[13px] font-medium text-foreground">{selected.length} selected{selectedTotal ? ` · ${formatINR(selectedTotal)} pending` : ""}</p>
              <div className="ml-auto flex gap-2">
                {selectedInfos.length > 0 && <Button size="xs" onClick={bulkMarkPaid}><Check /> Mark paid</Button>}
                <Button size="xs" variant="outline" onClick={exportCsv}><Download /> Export</Button>
                <Button size="xs" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
              </div>
            </div>
          )}

          {rows.length === 0 ? (
            <EmptyState
              icon={tab === "overdue" ? CircleCheck : Receipt}
              title={tab === "overdue" ? "No overdue fees" : tab === "today" ? "Nothing due today" : "Nothing here for this period"}
              description={tab === "overdue" ? "Every fee that fell due has been paid or waived." : "Try another period, or add a due."}
              action={<Button size="sm" variant="outline" onClick={() => dues.addDue()}><CalendarPlus /> Add due</Button>}
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-2/60 text-xs text-muted-foreground">
                      <th scope="col" className="w-10 px-4 py-2.5">
                        <input type="checkbox" aria-label="Select all" className="size-4 accent-(--primary)" checked={selected.length === rows.length && rows.length > 0} onChange={toggleAll} />
                      </th>
                      <th scope="col" className="px-2 py-2.5 font-medium">Client and case</th>
                      <th scope="col" className="px-3 py-2.5 font-medium">For</th>
                      <th scope="col" className="px-3 py-2.5 font-medium">Due date</th>
                      <th scope="col" className="px-3 py-2.5 text-right font-medium">{tab === "paid" || tab === "waived" ? "Amount" : "Balance"}</th>
                      <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                      <th scope="col" className="px-3 py-2.5"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((i) => {
                      const c = caseById.get(i.due.case_id)
                      const cl = c ? clientById.get(c.client_id) : undefined
                      const checked = selected.includes(i.due.id)
                      return (
                        <tr key={i.due.id} className={cn("transition-colors hover:bg-surface-2/60", checked && "bg-primary-soft/40")}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              aria-label={`Select ${i.due.description}`}
                              className="size-4 accent-(--primary)"
                              checked={checked}
                              onChange={() => setSelected((s) => (checked ? s.filter((x) => x !== i.due.id) : [...s, i.due.id]))}
                            />
                          </td>
                          <td className="max-w-60 px-2 py-3">
                            {cl ? (
                              <Link href={`/clients/${cl.id}?tab=dues`} className="block truncate font-medium text-foreground hover:text-primary">{cl.full_name}</Link>
                            ) : (
                              <span className="text-muted-foreground">No client</span>
                            )}
                            {c && <Link href={`/cases/${c.id}?tab=fees`} className="block truncate font-mono text-xs text-muted-foreground hover:text-primary">{c.case_number}</Link>}
                          </td>
                          <td className="max-w-52 px-3 py-3">
                            <p className="truncate text-[13px] text-foreground">{i.due.description}</p>
                            {i.due.reminder_count > 0 && i.balance > 0 && <p className="text-xs text-subtle-foreground">Reminded {i.due.reminder_count}x</p>}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-[13px] text-foreground">
                            {formatDate(i.due.due_date)}
                            {i.due.original_due_date && <p className="text-xs text-subtle-foreground">was {formatDate(i.due.original_due_date, "dd MMM")}</p>}
                          </td>
                          <td className="tabular whitespace-nowrap px-3 py-3 text-right">
                            <p className={cn("font-semibold", i.status === "Overdue" ? "text-danger-soft-foreground" : "text-foreground")}>
                              {formatINR(i.status === "Paid" || i.status === "Waived" ? i.due.amount : i.balance)}
                            </p>
                            {i.partial && <p className="text-xs text-subtle-foreground">of {formatINR(i.due.amount)}</p>}
                          </td>
                          <td className="px-3 py-3"><DueStatusBadge info={i} /></td>
                          <td className="px-3 py-3"><div className="flex justify-end"><DueActions info={i} client={cl} caseData={c} /></div></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-border md:hidden">
                {rows.map((i) => <DueRow key={i.due.id} info={i} showCase showClient />)}
              </div>
            </>
          )}
        </Card>

        <aside className="space-y-5">
          <Card>
            <CardHeader title="How late" description="Overdue fees by age" divider />
            <ul className="p-2">
              {stats.aging.map((b, idx) => {
                const r: [number, number] = [[1, 30], [31, 60], [61, 90], [91, Infinity]][idx] as [number, number]
                const active = aging?.[0] === r[0]
                const max = Math.max(...stats.aging.map((x) => x.amount), 1)
                return (
                  <li key={b.label}>
                    <button
                      type="button"
                      disabled={!b.count}
                      onClick={() => { setTab("overdue"); setAging(active ? null : r) }}
                      className={cn("w-full rounded-lg px-3 py-2 text-left transition-colors disabled:opacity-50", active ? "bg-danger-soft" : "hover:bg-surface-2")}
                    >
                      <span className="flex items-baseline justify-between gap-2 text-[13px]">
                        <span className="text-muted-foreground">{b.label}</span>
                        <span className="tabular font-semibold text-foreground">{formatINR(b.amount)}</span>
                      </span>
                      <span className="mt-1.5 block h-1.5 rounded-full bg-danger/70" style={{ width: `${Math.max(2, (b.amount / max) * 100)}%`, opacity: 0.4 + idx * 0.2 }} />
                      <span className="mt-1 block text-xs text-subtle-foreground">{b.count} {b.count === 1 ? "due" : "dues"}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Follow up first" description="Clients with the most overdue" divider />
            {debtors.length === 0 ? (
              <EmptyState compact icon={HandCoins} title="Nobody is overdue" />
            ) : (
              <ul className="divide-y divide-border">
                {debtors.map((d) => {
                  const cl = clientById.get(d.clientId)
                  if (!cl) return null
                  return (
                    <li key={d.clientId}>
                      <button type="button" onClick={() => dues.openDues({ clientId: d.clientId })} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-surface-2/60">
                        <Avatar name={cl.full_name} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{cl.full_name}</span>
                          <span className="block text-xs text-danger-soft-foreground">{d.days} days late{d.count > 1 ? ` · ${d.count} dues` : ""}</span>
                        </span>
                        <span className="tabular text-sm font-semibold text-foreground">{formatINR(d.amount)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </div>
  )
}
