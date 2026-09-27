"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Ellipsis, Eye, MailCheck, Plus, ScrollText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/ui/field"
import { EmptyState, PageHeader, Segmented } from "@/components/ui/misc"
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import { deleteNotice, updateNotice, useDB, type Notice } from "@/lib/store"

type StatusFilter = "All" | "Draft" | "Sent"

export default function NoticesPage() {
  const db = useDB()
  const router = useRouter()
  const { confirm, dialogElement } = useConfirmDialog()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("All")

  const caseById = useMemo(() => new Map(db.cases.map((c) => [c.id, c])), [db.cases])
  const drafts = db.notices.filter((n) => n.status === "Draft").length

  const filtered = db.notices
    .filter((n) => {
      const q = search.trim().toLowerCase()
      const c = caseById.get(n.case_id)
      const matchQ = !q || [n.title, n.notice_type, n.recipient_name, c?.case_number].some((f) => f?.toLowerCase().includes(q))
      return matchQ && (status === "All" || n.status === status)
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const remove = (n: Notice) =>
    confirm("Delete notice?", `"${n.title}" will be permanently deleted.`, () => {
      deleteNotice(n.id)
      toast("Notice deleted", "success")
    })

  const markSent = (n: Notice) => {
    updateNotice(n.id, { status: "Sent" })
    toast("Marked as sent", "success")
  }

  return (
    <div className="space-y-5">
      {dialogElement}
      <PageHeader
        title="Notices"
        description={`${db.notices.length} notices${drafts ? ` · ${drafts} ${drafts === 1 ? "draft" : "drafts"} waiting to be sent` : ""}`}
        actions={<Button asChild><Link href="/notices/new"><Plus /> Draft notice</Link></Button>}
      />

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <SearchInput className="sm:max-w-sm sm:flex-1" value={search} onChange={setSearch} placeholder="Search title, recipient, case" />
        <Segmented
          className="sm:ml-auto"
          ariaLabel="Status"
          value={status}
          onChange={setStatus}
          options={(["All", "Draft", "Sent"] as const).map((s) => ({
            value: s,
            label: `${s}${s === "All" ? "" : ` · ${db.notices.filter((n) => n.status === s).length}`}`,
          }))}
        />
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title={db.notices.length ? "No notices match" : "No notices yet"}
            description="Draft demand notices, Section 138 notices, replies and vakalatnamas from templates."
            action={<Button asChild size="sm"><Link href="/notices/new"><Plus /> Draft notice</Link></Button>}
          />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((n) => {
              const c = caseById.get(n.case_id)
              return (
                <li key={n.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2/60">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                    <ScrollText className="size-4" />
                  </span>
                  <Link href={`/notices/${n.id}`} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground hover:text-primary">{n.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {n.notice_type}
                      {c ? <> · <span className="font-mono">{c.case_number}</span></> : null} · {formatDate(n.created_at)}
                    </span>
                  </Link>
                  <Badge tone={n.status === "Sent" ? "success" : "warning"}>{n.status}</Badge>
                  <Dropdown>
                    <DropdownTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${n.title}`}><Ellipsis /></Button>
                    </DropdownTrigger>
                    <DropdownContent className="w-44">
                      <DropdownItem onSelect={() => router.push(`/notices/${n.id}`)}><Eye /> Open</DropdownItem>
                      {n.status === "Draft" && <DropdownItem onSelect={() => markSent(n)}><MailCheck /> Mark as sent</DropdownItem>}
                      <DropdownSeparator />
                      <DropdownItem onSelect={() => remove(n)} className="text-danger-soft-foreground [&_svg]:text-danger"><Trash2 /> Delete</DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
