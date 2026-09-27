"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase, CalendarPlus, Columns3, Ellipsis, Eye, Flag, IndianRupee, List, Plus, Trash2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CaseTypeTag, StatusBadge, UrgentBadge } from "@/components/ui/badge"
import { SearchInput, Select } from "@/components/ui/field"
import { Chip, EmptyState, PageHeader, Segmented } from "@/components/ui/misc"
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { CASE_STATUSES, CASE_TYPES, OPEN_STATUSES, caseStatusTone, toneSolid } from "@/lib/constants"
import { cn, formatDate, formatINR, getDaysUntil, getRelativeDayLabel } from "@/lib/utils"
import { deleteCase, getCaseDueInfos, getNextHearing, summariseDues, useDB, type Case } from "@/lib/store"
import { useDues } from "@/components/dues/dues-context"
import { DuesCell } from "@/components/dues/due-badge"

const PER_PAGE = 15
type Sort = "next" | "recent" | "number"

function readParams() {
  const p = new URLSearchParams(window.location.search)
  return { status: p.get("status") ?? "Open", urgent: p.get("urgent") === "1", overdue: p.get("overdue") === "1" }
}

export default function CasesPage() {
  const db = useDB()
  const router = useRouter()
  const { confirm, dialogElement } = useConfirmDialog()
  const { toast } = useToast()

  const [initial] = useState(readParams)
  const [view, setView] = useState<"list" | "board">("list")
  const [search, setSearch] = useState("")
  const [type, setType] = useState("All")
  const [status, setStatus] = useState(initial.status)
  const [urgentOnly, setUrgentOnly] = useState(initial.urgent)
  const [overdueOnly, setOverdueOnly] = useState(initial.overdue)
  const dues = useDues()
  const [sort, setSort] = useState<Sort>("next")
  const [page, setPage] = useState(1)

  const clientById = useMemo(() => new Map(db.clients.map((c) => [c.id, c])), [db.clients])
  const nextById = useMemo(() => {
    const m = new Map<string, ReturnType<typeof getNextHearing>>()
    db.cases.forEach((c) => m.set(c.id, getNextHearing(c.id, db.hearings)))
    return m
  }, [db.cases, db.hearings])

  const duesById = useMemo(() => {
    const m = new Map<string, ReturnType<typeof summariseDues>>()
    db.cases.forEach((c) => m.set(c.id, summariseDues(getCaseDueInfos(c.id, db))))
    return m
  }, [db])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = db.cases.filter((c) => {
      const client = clientById.get(c.client_id)
      const matchSearch =
        !q ||
        [c.title, c.case_number, c.cnr_number, c.court, c.opposing_party, client?.full_name].some((f) => f?.toLowerCase().includes(q))
      const matchType = type === "All" || c.case_type === type
      const matchStatus = status === "All" || (status === "Open" ? OPEN_STATUSES.includes(c.status) : c.status === status)
      const matchUrgent = !urgentOnly || c.priority === "Urgent"
      const matchOverdue = !overdueOnly || (duesById.get(c.id)?.overdueCount ?? 0) > 0
      return matchSearch && matchType && matchStatus && matchUrgent && matchOverdue
    })
    return list.sort((a, b) => {
      if (overdueOnly) return (duesById.get(b.id)?.maxDaysOverdue ?? 0) - (duesById.get(a.id)?.maxDaysOverdue ?? 0)
      if (sort === "number") return a.case_number.localeCompare(b.case_number)
      if (sort === "recent") return b.filing_date.localeCompare(a.filing_date)
      const na = nextById.get(a.id)?.date
      const nb = nextById.get(b.id)?.date
      if (na && nb) return na.localeCompare(nb)
      if (na) return -1
      if (nb) return 1
      return b.filing_date.localeCompare(a.filing_date)
    })
  }, [db.cases, search, type, status, urgentOnly, overdueOnly, sort, clientById, nextById, duesById])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, totalPages)
  const paginated = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const openCount = db.cases.filter((c) => OPEN_STATUSES.includes(c.status)).length
  const urgentCount = db.cases.filter((c) => OPEN_STATUSES.includes(c.status) && c.priority === "Urgent").length
  const hasFilters = search || type !== "All" || status !== "Open" || urgentOnly || overdueOnly
  const overdueCases = db.cases.filter((c) => (duesById.get(c.id)?.overdueCount ?? 0) > 0).length

  const resetFilters = () => {
    setSearch("")
    setType("All")
    setStatus("Open")
    setUrgentOnly(false)
    setOverdueOnly(false)
    setPage(1)
  }

  const handleDelete = (c: Case) => {
    confirm(
      "Delete this case?",
      `${c.case_number} and its hearings, notes and deadlines will be removed. Documents and fee records stay. This cannot be undone.`,
      () => {
        deleteCase(c.id)
        toast(`${c.case_number} deleted`, "success")
      },
      "Delete case"
    )
  }

  const rowMenu = (c: Case) => (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${c.case_number}`} onClick={(e) => e.stopPropagation()}>
          <Ellipsis />
        </Button>
      </DropdownTrigger>
      <DropdownContent className="w-44">
        <DropdownItem onSelect={() => router.push(`/cases/${c.id}`)}><Eye /> Open case</DropdownItem>
        <DropdownItem onSelect={() => dues.recordPayment({ caseId: c.id })}><IndianRupee /> Record payment</DropdownItem>
        <DropdownItem onSelect={() => dues.addDue({ caseId: c.id })}><CalendarPlus /> Add fee due</DropdownItem>
        <DropdownSeparator />
        <DropdownItem onSelect={() => handleDelete(c)} className="text-danger-soft-foreground [&_svg]:text-danger">
          <Trash2 /> Delete
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  )

  const nextDateCell = (c: Case) => {
    const next = nextById.get(c.id)
    if (!next) return <span className="text-[13px] text-subtle-foreground">Not listed</span>
    const days = getDaysUntil(next.date)
    return (
      <div>
        <p className={cn("tabular text-[13px] font-medium", days <= 1 ? "text-danger-soft-foreground" : "text-foreground")}>
          {getRelativeDayLabel(next.date)}
        </p>
        <p className="text-xs text-subtle-foreground">{days > 1 ? formatDate(next.date, "dd MMM yyyy") : next.purpose}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {dialogElement}
      <PageHeader
        title="Cases"
        description={`${openCount} open matters · ${urgentCount} urgent`}
        actions={
          <Button asChild>
            <Link href="/cases/new"><Plus /> New case</Link>
          </Button>
        }
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <SearchInput
            className="sm:max-w-sm sm:flex-1"
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Search title, case no., CNR, party, client"
          />
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="h-9 w-auto min-w-40">
              <option value="Open">Open matters</option>
              <option value="All">All statuses</option>
              {CASE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 w-auto min-w-40">
              <option value="next">Sort: next date</option>
              <option value="recent">Sort: recently filed</option>
              <option value="number">Sort: case number</option>
            </Select>
            <Segmented
              ariaLabel="View"
              value={view}
              onChange={setView}
              options={[
                { value: "list", label: <span className="sr-only sm:not-sr-only">List</span>, icon: <List />, title: "List view" },
                { value: "board", label: <span className="sr-only sm:not-sr-only">Board</span>, icon: <Columns3 />, title: "Board view" },
              ]}
            />
          </div>
        </div>
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={type === "All"} onClick={() => { setType("All"); setPage(1) }}>All types</Chip>
          {CASE_TYPES.map((t) => (
            <Chip key={t} active={type === t} onClick={() => { setType(type === t ? "All" : t); setPage(1) }} count={db.cases.filter((c) => c.case_type === t).length}>
              {t}
            </Chip>
          ))}
          <span className="mx-1 hidden w-px self-stretch bg-border sm:block" />
          <Chip active={urgentOnly} onClick={() => { setUrgentOnly(!urgentOnly); setPage(1) }}>
            <Flag /> Urgent only
          </Chip>
          <Chip
            active={overdueOnly}
            onClick={() => { setOverdueOnly(!overdueOnly); setPage(1) }}
            count={overdueCases}
            className={overdueCases && !overdueOnly ? "border-danger/30 text-danger-soft-foreground" : undefined}
          >
            <TriangleAlert /> Fees overdue
          </Chip>
          {hasFilters && (
            <button type="button" onClick={resetFilters} className="shrink-0 px-2 text-[13px] font-medium text-primary hover:underline">
              Reset
            </button>
          )}
        </div>
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(["Active", "Hearing Scheduled", "Judgment Awaited", "Disposed"] as const).map((col) => {
            const colCases = filtered.filter((c) =>
              col === "Disposed" ? c.status === "Closed" || c.status === "Won" : c.status === col
            )
            const tone = col === "Disposed" ? "neutral" : caseStatusTone[col]
            return (
              <section key={col} className="flex min-h-40 flex-col rounded-2xl bg-surface-2/70 p-2.5">
                <header className="flex items-center gap-2 px-1.5 pb-2.5 pt-1">
                  <span className={cn("size-2 rounded-[3px]", toneSolid[tone])} aria-hidden />
                  <h2 className="flex-1 text-[13px] font-semibold text-foreground">{col}</h2>
                  <span className="tabular text-xs font-medium text-subtle-foreground">{colCases.length}</span>
                </header>
                <div className="space-y-2">
                  {colCases.length === 0 && <p className="px-2 py-6 text-center text-xs text-subtle-foreground">No matters</p>}
                  {colCases.map((c) => {
                    const next = nextById.get(c.id)
                    return (
                      <Link
                        key={c.id}
                        href={`/cases/${c.id}`}
                        className="block rounded-xl border border-border bg-surface p-3 shadow-xs transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-md"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <CaseTypeTag type={c.case_type} />
                          {c.priority === "Urgent" && <Flag className="size-3.5 text-danger" aria-label="Urgent" />}
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug text-foreground">{c.title}</p>
                        <p className="mt-1 font-mono text-[11px] text-subtle-foreground">{c.case_number}</p>
                        {next && (
                          <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                            Next: <span className="font-medium text-foreground">{getRelativeDayLabel(next.date)}</span> · {next.purpose}
                          </p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={hasFilters ? "No cases match these filters" : "No cases yet"}
              description={hasFilters ? "Try a different search or reset the filters." : "Add your first matter to start tracking dates and fees."}
              action={
                hasFilters ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>Reset filters</Button>
                ) : (
                  <Button asChild size="sm"><Link href="/cases/new"><Plus /> New case</Link></Button>
                )
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-2/60 text-xs font-medium text-muted-foreground">
                      <th scope="col" className="px-5 py-2.5 font-medium">Matter</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Court</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Next date</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Fees</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                      <th scope="col" className="w-12 px-3 py-2.5"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginated.map((c) => {
                      const client = clientById.get(c.client_id)
                      return (
                        <tr
                          key={c.id}
                          onClick={() => router.push(`/cases/${c.id}`)}
                          className="cursor-pointer transition-colors hover:bg-surface-2/60"
                        >
                          <td className="max-w-md px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">{c.case_number}</span>
                              <CaseTypeTag type={c.case_type} />
                              {c.priority === "Urgent" && <UrgentBadge className="h-5" />}
                            </div>
                            <Link
                              href={`/cases/${c.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 block truncate font-medium text-foreground hover:text-primary"
                            >
                              {c.title}
                            </Link>
                            <p className="truncate text-xs text-subtle-foreground">{client?.full_name ?? "No client linked"}</p>
                          </td>
                          <td className="max-w-52 px-4 py-3">
                            <p className="truncate text-[13px] text-foreground">{c.court}</p>
                            <p className="truncate text-xs text-subtle-foreground">{c.judge}</p>
                          </td>
                          <td className="px-4 py-3">{nextDateCell(c)}</td>
                          <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                            <DuesCell summary={duesById.get(c.id)!} onOpen={() => dues.openDues({ caseId: c.id })} />
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                          <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>{rowMenu(c)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <ul className="divide-y divide-border md:hidden">
                {paginated.map((c) => {
                  const client = clientById.get(c.client_id)
                  const next = nextById.get(c.id)
                  return (
                    <li key={c.id}>
                      <Link href={`/cases/${c.id}`} className="block px-4 py-3.5 active:bg-surface-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{c.case_number}</span>
                          {c.priority === "Urgent" && <Flag className="size-3.5 text-danger" aria-label="Urgent" />}
                          <StatusBadge status={c.status} className="ml-auto" />
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm font-medium text-foreground">{c.title}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {client?.full_name} · {c.court}
                        </p>
                        {next && (
                          <p className="mt-1.5 text-xs font-medium text-foreground">
                            Next: {getRelativeDayLabel(next.date)} · {next.purpose}
                          </p>
                        )}
                      </Link>
                      {(duesById.get(c.id)?.overdueCount ?? 0) > 0 && (
                        <button
                          type="button"
                          onClick={() => dues.openDues({ caseId: c.id })}
                          className="mx-4 mb-3 -mt-1 flex w-[calc(100%-2rem)] items-center gap-2 rounded-lg bg-danger-soft px-3 py-2 text-left text-xs font-medium text-danger-soft-foreground"
                        >
                          <TriangleAlert className="size-3.5" />
                          {formatINR(duesById.get(c.id)!.overdueBalance)} overdue · {duesById.get(c.id)!.maxDaysOverdue} days
                          <span className="ml-auto underline">Settle</span>
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>

              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
                  <p className="tabular text-xs text-muted-foreground">
                    {(current - 1) * PER_PAGE + 1}-{Math.min(current * PER_PAGE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-1.5">
                    <Button size="xs" variant="outline" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</Button>
                    <Button size="xs" variant="outline" disabled={current === totalPages} onClick={() => setPage(current + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  )
}
