"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  ArrowRight, Briefcase, CalendarDays, CornerDownLeft, FileText, Plus, ScrollText, Search, Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDB } from "@/lib/store"
import { Kbd } from "@/components/ui/misc"
import { navGroups, settingsItem } from "./nav-config"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Result = {
  id: string
  group: string
  icon: React.ReactNode
  label: string
  sub?: string
  href: string
}

const iconCls = "size-4"

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const db = useDB()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return [
        { id: "a-case", group: "Create", icon: <Plus className={iconCls} />, label: "New case", href: "/cases/new" },
        { id: "a-client", group: "Create", icon: <Plus className={iconCls} />, label: "New client", href: "/clients/new" },
        { id: "a-notice", group: "Create", icon: <Plus className={iconCls} />, label: "Draft legal notice", href: "/notices/new" },
        ...[...navGroups.flatMap((g) => g.items), settingsItem].map((n) => ({
          id: `nav-${n.href}`,
          group: "Go to",
          icon: <n.icon className={iconCls} />,
          label: n.label,
          href: n.href,
        })),
      ]
    }
    const match = (...fields: (string | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(q))
    const digits = q.replace(/\D/g, "")
    return [
      ...db.cases
        .filter((c) => match(c.title, c.case_number, c.cnr_number, c.opposing_party, c.court))
        .slice(0, 6)
        .map((c) => ({ id: c.id, group: "Cases", icon: <Briefcase className={iconCls} />, label: c.title, sub: `${c.case_number} · ${c.court}`, href: `/cases/${c.id}` })),
      ...db.clients
        .filter((c) => match(c.full_name, c.city) || (digits.length >= 3 && c.phone.replace(/\D/g, "").includes(digits)))
        .slice(0, 5)
        .map((c) => ({ id: c.id, group: "Clients", icon: <Users className={iconCls} />, label: c.full_name, sub: c.phone, href: `/clients/${c.id}` })),
      ...db.notices
        .filter((n) => match(n.title, n.notice_type, n.recipient_name))
        .slice(0, 3)
        .map((n) => ({ id: n.id, group: "Notices", icon: <ScrollText className={iconCls} />, label: n.title, sub: `${n.notice_type} · ${n.status}`, href: `/notices/${n.id}` })),
      ...db.documents
        .filter((d) => match(d.filename, d.doc_category))
        .slice(0, 3)
        .map((d) => ({ id: d.id, group: "Documents", icon: <FileText className={iconCls} />, label: d.filename, sub: d.doc_category, href: `/documents?doc=${d.id}` })),
    ]
  }, [query, db])

  const go = (r: Result | undefined) => {
    if (!r) return
    router.push(r.href)
    onOpenChange(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      go(results[selected])
    }
  }

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: "nearest" })
  }, [selected])

  let lastGroup = ""

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-(--z-overlay) bg-overlay backdrop-blur-[2px] animate-overlay-in" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          className="fixed left-1/2 top-[12vh] z-(--z-overlay) w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg animate-pop focus:outline-none"
        >
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Search cases, clients, notices and documents</DialogPrimitive.Description>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-[18px] shrink-0 text-subtle-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelected(0)
              }}
              placeholder="Case number, CNR, party, client name or phone"
              aria-label="Search"
              className="h-14 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-subtle-foreground"
            />
            <Kbd>Esc</Kbd>
          </div>

          <div ref={listRef} className="max-h-[min(420px,60vh)] overflow-y-auto p-2" role="listbox">
            {results.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-medium text-foreground">No matches for &ldquo;{query}&rdquo;</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Try a case number like CRL/204 or a client&apos;s phone number.</p>
              </div>
            ) : (
              results.map((r, i) => {
                const header = r.group !== lastGroup ? r.group : null
                lastGroup = r.group
                return (
                  <div key={r.id}>
                    {header && <p className="px-2.5 pb-1 pt-2.5 text-xs font-medium text-subtle-foreground">{header}</p>}
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === selected}
                      data-index={i}
                      onMouseMove={() => setSelected(i)}
                      onClick={() => go(r)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left",
                        i === selected ? "bg-surface-2" : ""
                      )}
                    >
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", i === selected ? "bg-primary-soft text-primary-soft-foreground" : "bg-surface-2 text-muted-foreground")}>
                        {r.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{r.label}</span>
                        {r.sub && <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>}
                      </span>
                      {i === selected && <ArrowRight className="size-4 text-subtle-foreground" />}
                    </button>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-xs text-subtle-foreground">
            <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> Move</span>
            <span className="flex items-center gap-1.5"><Kbd><CornerDownLeft className="size-3" /></Kbd> Open</span>
            <span className="ml-auto hidden items-center gap-1.5 sm:flex"><CalendarDays className="size-3.5" /> Tip: search by CNR number</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
