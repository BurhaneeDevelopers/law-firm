"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Dialog, SheetContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Chip, EmptyState } from "@/components/ui/misc"
import { cn, formatDate } from "@/lib/utils"
import { getCitationVerifications } from "@/lib/citation-store"
import { useDB } from "@/lib/store"
import { History } from "lucide-react"
import type { Tone } from "@/lib/constants"

export const verificationTone: Record<string, Tone> = { SAFE: "success", REVIEW_NEEDED: "warning", HIGH_RISK: "danger" }
export const verificationLabel: Record<string, string> = { SAFE: "Safe to file", REVIEW_NEEDED: "Review needed", HIGH_RISK: "High risk" }
const resultTone: Record<string, Tone> = { VERIFIED: "success", SUSPICIOUS: "warning", HALLUCINATED: "danger", NOT_FOUND: "neutral" }

interface Props { open: boolean; onClose: () => void }

export function HistoryDrawer({ open, onClose }: Props) {
  const db = useDB()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const all = getCitationVerifications()
  const list = filter === "all" ? all : all.filter((v) => v.overall_status === filter)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent title="Verification history" description={`${all.length} documents checked`} className="max-w-xl">
        <div className="scrollbar-hide -mx-5 mb-4 flex gap-2 overflow-x-auto px-5">
          {["all", "SAFE", "REVIEW_NEEDED", "HIGH_RISK"].map((s) => (
            <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>{s === "all" ? "All" : verificationLabel[s]}</Chip>
          ))}
        </div>
        {list.length === 0 ? (
          <EmptyState compact icon={History} title="Nothing here yet" />
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {list.map((v) => {
              const c = v.case_id ? db.cases.find((x) => x.id === v.case_id) : undefined
              const open = expandedId === v.id
              return (
                <li key={v.id}>
                  <button type="button" onClick={() => setExpandedId(open ? null : v.id)} aria-expanded={open} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-2/60">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{v.title || v.document_type}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(v.created_at)}
                        {c && <> · <span className="font-mono">{c.case_number}</span></>} · {v.citations_verified}/{v.citations_found} verified
                      </p>
                    </div>
                    <Badge tone={verificationTone[v.overall_status]}>{verificationLabel[v.overall_status]}</Badge>
                    <ChevronDown className={cn("mt-0.5 size-4 shrink-0 text-subtle-foreground transition-transform", open && "rotate-180")} />
                  </button>
                  {open && (
                    <ul className="space-y-1.5 px-4 pb-4 animate-fade-in">
                      {v.results.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 rounded-lg bg-surface-2/70 px-3 py-2 text-[13px]">
                          <span className="min-w-0 flex-1 text-foreground">{r.raw_text}</span>
                          <Badge tone={resultTone[r.status] ?? "neutral"}>{r.status === "HALLUCINATED" ? "Fabricated" : r.status.replace("_", " ").toLowerCase()}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </SheetContent>
    </Dialog>
  )
}
