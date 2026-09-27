"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutGrid, List, Phone, Plus, TriangleAlert, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SearchInput, Select } from "@/components/ui/field"
import { Avatar, Chip, EmptyState, PageHeader, Segmented } from "@/components/ui/misc"
import { DuesCell } from "@/components/dues/due-badge"
import { useDues } from "@/components/dues/dues-context"
import { WhatsAppMenu } from "@/components/practice/whatsapp-menu"
import { OPEN_STATUSES } from "@/lib/constants"
import { cn, formatINR, getRelativeDayLabel } from "@/lib/utils"
import { getClientDueInfos, getClientFees, getNextHearing, sortHearings, summariseDues, useDB, type Client } from "@/lib/store"

type Sort = "name" | "recent" | "balance" | "overdue" | "next"

export default function ClientsPage() {
  const db = useDB()
  const router = useRouter()
  const [view, setView] = useState<"grid" | "list">("list")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<Sort>(() => {
    const p = new URLSearchParams(window.location.search).get("sort")
    return p === "balance" || p === "overdue" ? p : "name"
  })
  const [overdueOnly, setOverdueOnly] = useState(() => new URLSearchParams(window.location.search).get("overdue") === "1")
  const dues = useDues()

  const rows = useMemo(() => {
    return db.clients.map((client) => {
      const cases = db.cases.filter((c) => c.client_id === client.id)
      const open = cases.filter((c) => OPEN_STATUSES.includes(c.status)).length
      const nexts = cases.map((c) => getNextHearing(c.id, db.hearings)).filter((h): h is NonNullable<typeof h> => Boolean(h))
      const next = sortHearings(nexts)[0]
      const fees = getClientFees(client.id, db)
      const dueSummary = summariseDues(getClientDueInfos(client.id, db))
      return { client, total: cases.length, open, next, balance: fees.balance, dueSummary }
    })
  }, [db])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const digits = q.replace(/\D/g, "")
    return rows
      .filter(({ dueSummary }) => !overdueOnly || dueSummary.overdueCount > 0)
      .filter(({ client }) =>
        !q ||
        client.full_name.toLowerCase().includes(q) ||
        client.city?.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        (digits.length >= 3 && client.phone.replace(/\D/g, "").includes(digits))
      )
      .sort((a, b) => {
        if (sort === "recent") return b.client.created_at.localeCompare(a.client.created_at)
        if (sort === "balance") return b.balance - a.balance
        if (sort === "overdue") return b.dueSummary.overdueBalance - a.dueSummary.overdueBalance || b.dueSummary.maxDaysOverdue - a.dueSummary.maxDaysOverdue
        if (sort === "next") {
          if (a.next && b.next) return a.next.date.localeCompare(b.next.date)
          return a.next ? -1 : b.next ? 1 : 0
        }
        return a.client.full_name.localeCompare(b.client.full_name)
      })
  }, [rows, search, sort, overdueOnly])

  const totalBalance = rows.reduce((s, r) => s + r.balance, 0)
  const overdueClients = rows.filter((r) => r.dueSummary.overdueCount > 0)
  const overdueTotal = overdueClients.reduce((s, r) => s + r.dueSummary.overdueBalance, 0)

  const contact = (client: Client) => (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Button asChild variant="outline" size="icon-sm" aria-label={`Call ${client.full_name}`}>
        <a href={`tel:${client.phone.replace(/\s/g, "")}`}><Phone /></a>
      </Button>
      <WhatsAppMenu
        size="icon-sm"
        variant="outline"
        label=""
        phone={client.phone}
        preferred={client.preferred_language}
        message={(lang) => (lang === "Hindi" ? `नमस्ते ${client.full_name} जी,\n\n` : `Dear ${client.full_name},\n\n`)}
      />
    </div>
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        description={`${db.clients.length} clients · ${formatINR(totalBalance)} fees outstanding${overdueTotal ? ` · ${formatINR(overdueTotal)} overdue` : ""}`}
        actions={<Button asChild><Link href="/clients/new"><Plus /> New client</Link></Button>}
      />

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <SearchInput className="sm:max-w-sm sm:flex-1" value={search} onChange={setSearch} placeholder="Search name, phone, city" />
        <Chip
          active={overdueOnly}
          onClick={() => setOverdueOnly((o) => !o)}
          count={overdueClients.length}
          className={overdueClients.length && !overdueOnly ? "self-start border-danger/30 text-danger-soft-foreground" : "self-start"}
        >
          <TriangleAlert /> Fees overdue
        </Chip>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 w-auto min-w-44">
            <option value="name">Sort: name</option>
            <option value="next">Sort: next hearing</option>
            <option value="overdue">Sort: most overdue</option>
            <option value="balance">Sort: fees outstanding</option>
            <option value="recent">Sort: recently added</option>
          </Select>
          <Segmented
            ariaLabel="View"
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: <span className="sr-only">List</span>, icon: <List />, title: "List view" },
              { value: "grid", label: <span className="sr-only">Cards</span>, icon: <LayoutGrid />, title: "Card view" },
            ]}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={search ? `No client matches "${search}"` : "No clients yet"}
            description={search ? "Check the spelling or search by phone number." : "Add a client to link cases and send reminders."}
            action={<Button asChild size="sm"><Link href="/clients/new"><Plus /> New client</Link></Button>}
          />
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ client, total, open, next, balance, dueSummary }) => (
            <Card key={client.id} className="flex flex-col p-4 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-md">
              <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                <Avatar name={client.full_name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{client.full_name}</p>
                  <p className="text-[13px] text-muted-foreground">{client.phone}</p>
                </div>
              </Link>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-subtle-foreground">Cases</dt>
                  <dd className="tabular mt-0.5 font-medium text-foreground">{open} open / {total}</dd>
                </div>
                <div>
                  <dt className="text-subtle-foreground">Next date</dt>
                  <dd className="mt-0.5 truncate font-medium text-foreground">{next ? getRelativeDayLabel(next.date) : "None"}</dd>
                </div>
                <div>
                  <dt className="text-subtle-foreground">{dueSummary.overdueCount ? "Overdue" : "Balance"}</dt>
                  <dd className={cn("tabular mt-0.5 font-medium", dueSummary.overdueCount ? "text-danger-soft-foreground" : balance ? "text-warning-soft-foreground" : "text-foreground")}>
                    {formatINR(dueSummary.overdueCount ? dueSummary.overdueBalance : balance)}
                  </dd>
                </div>
              </dl>
              {dueSummary.overdueCount > 0 && (
                <button
                  type="button"
                  onClick={() => dues.openDues({ clientId: client.id })}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-danger-soft px-3 py-2 text-left text-xs font-medium text-danger-soft-foreground"
                >
                  <TriangleAlert className="size-3.5" /> {dueSummary.maxDaysOverdue} days overdue
                  <span className="ml-auto underline">Settle</span>
                </button>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-subtle-foreground">{client.city || "City not added"} · {client.preferred_language}</span>
                {contact(client)}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-xs text-muted-foreground">
                  <th scope="col" className="px-5 py-2.5 font-medium">Client</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Cases</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Next hearing</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Fees</th>
                  <th scope="col" className="w-28 px-4 py-2.5"><span className="sr-only">Contact</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(({ client, total, open, next, dueSummary }) => (
                  <tr key={client.id} onClick={() => router.push(`/clients/${client.id}`)} className="cursor-pointer transition-colors hover:bg-surface-2/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={client.full_name} />
                        <div className="min-w-0">
                          <Link href={`/clients/${client.id}`} onClick={(e) => e.stopPropagation()} className="block truncate font-medium text-foreground hover:text-primary">
                            {client.full_name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{client.phone}{client.city ? ` · ${client.city}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="tabular px-4 py-3 text-[13px] text-foreground">{open} open <span className="text-subtle-foreground">/ {total}</span></td>
                    <td className="px-4 py-3 text-[13px] text-foreground">{next ? getRelativeDayLabel(next.date) : <span className="text-subtle-foreground">None</span>}</td>
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      <DuesCell summary={dueSummary} onOpen={() => dues.openDues({ clientId: client.id })} />
                    </td>
                    <td className="px-4 py-3">{contact(client)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-border md:hidden">
            {filtered.map(({ client, open, next, balance, dueSummary }) => (
              <li key={client.id} className="flex items-center gap-3 px-4 py-3">
                <Link href={`/clients/${client.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={client.full_name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{client.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {open} open{next ? ` · next ${getRelativeDayLabel(next.date)}` : ""}{!dueSummary.overdueCount && balance ? ` · ${formatINR(balance)} due` : ""}
                    </p>
                    {dueSummary.overdueCount > 0 && (
                      <p className="text-xs font-medium text-danger-soft-foreground">{formatINR(dueSummary.overdueBalance)} overdue · {dueSummary.maxDaysOverdue} days</p>
                    )}
                  </div>
                </Link>
                {contact(client)}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
