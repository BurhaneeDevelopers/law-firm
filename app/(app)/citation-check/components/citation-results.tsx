"use client"
import { useState } from "react"
import { Check, ChevronDown, CircleHelp, CircleX, Search, Trash2, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Tone } from "@/lib/constants"
import type { CitationResult } from "@/lib/citation-store"

const statusConfig: Record<CitationResult["status"], { label: string; tone: Tone; icon: React.ReactNode }> = {
  VERIFIED: { label: "Verified", tone: "success", icon: <Check /> },
  SUSPICIOUS: { label: "Suspicious", tone: "warning", icon: <TriangleAlert /> },
  HALLUCINATED: { label: "Not found in any court", tone: "danger", icon: <CircleX /> },
  NOT_FOUND: { label: "Could not verify", tone: "neutral", icon: <CircleHelp /> },
}

interface Props {
  results: CitationResult[]
}

export function CitationResults({ results }: Props) {
  const [expanded, setExpanded] = useState<number | null>(() => {
    const firstProblem = results.findIndex((r) => r.status === "HALLUCINATED" || r.status === "SUSPICIOUS")
    return firstProblem >= 0 ? firstProblem : null
  })
  const [decisions, setDecisions] = useState<Record<number, "accepted" | "removed">>({})

  const counts = {
    total: results.length,
    verified: results.filter((r) => r.status === "VERIFIED").length,
    suspicious: results.filter((r) => r.status === "SUSPICIOUS").length,
    hallucinated: results.filter((r) => r.status === "HALLUCINATED").length,
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Citations found", value: counts.total, cls: "bg-surface-2 text-foreground" },
          { label: "Verified", value: counts.verified, cls: "bg-success-soft text-success-soft-foreground" },
          { label: "Suspicious", value: counts.suspicious, cls: "bg-warning-soft text-warning-soft-foreground" },
          { label: "Fabricated", value: counts.hallucinated, cls: "bg-danger-soft text-danger-soft-foreground" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl px-3 py-2.5", s.cls)}>
            <dd className="tabular text-xl font-semibold">{s.value}</dd>
            <dt className="text-xs opacity-85">{s.label}</dt>
          </div>
        ))}
      </dl>

      <ul className="space-y-2">
        {results.map((r, i) => {
          const cfg = statusConfig[r.status] ?? statusConfig.NOT_FOUND
          const open = expanded === i
          const decision = decisions[i]
          return (
            <li key={i} className={cn("overflow-hidden rounded-xl border border-border", decision === "removed" && "opacity-60")}>
              <button
                type="button"
                onClick={() => setExpanded(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-surface-2/60"
              >
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium text-foreground", decision === "removed" && "line-through")}>{r.raw_text}</p>
                  {r.context && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{r.context}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {decision && <Badge tone={decision === "accepted" ? "success" : "neutral"}>{decision === "accepted" ? "Accepted" : "Removed"}</Badge>}
                  <Badge tone={cfg.tone}>{cfg.icon} {cfg.label}</Badge>
                  <span className="tabular hidden text-xs text-subtle-foreground sm:inline">{r.confidence}%</span>
                  <ChevronDown className={cn("size-4 text-subtle-foreground transition-transform", open && "rotate-180")} />
                </div>
              </button>

              {open && (
                <div className="space-y-3 border-t border-border px-4 py-3.5 animate-fade-in">
                  {r.status === "VERIFIED" && (
                    <dl className="space-y-1 text-[13px]">
                      {r.actual_case_name && <div><dt className="inline text-muted-foreground">Case: </dt><dd className="inline text-foreground">{r.actual_case_name}</dd></div>}
                      {r.actual_citation && <div><dt className="inline text-muted-foreground">Citation: </dt><dd className="inline font-mono text-foreground">{r.actual_citation}</dd></div>}
                      {r.court && <div><dt className="inline text-muted-foreground">Court: </dt><dd className="inline text-foreground">{r.court}</dd></div>}
                      {r.brief_summary && <p className="mt-2 rounded-lg bg-success-soft px-3 py-2 text-success-soft-foreground">{r.brief_summary}</p>}
                    </dl>
                  )}
                  {r.status === "SUSPICIOUS" && (
                    <div className="rounded-lg bg-warning-soft px-3 py-2.5 text-[13px] text-warning-soft-foreground">
                      <p>{r.issue || "The case exists but the name, year or citation may be wrong."}</p>
                      {r.actual_citation && <p className="mt-1.5">Likely correct citation: <span className="font-mono font-semibold">{r.actual_citation}</span></p>}
                    </div>
                  )}
                  {r.status === "HALLUCINATED" && (
                    <div className="rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger-soft-foreground">
                      <p className="font-semibold">No matching judgment found in any Indian court database. Do not file with this citation.</p>
                      {r.issue && <p className="mt-1.5">{r.issue}</p>}
                    </div>
                  )}
                  {r.status === "NOT_FOUND" && (
                    <p className="rounded-lg bg-surface-2 px-3 py-2.5 text-[13px] text-muted-foreground">
                      May be unreported or a regional judgment. Check the certified copy or SCC Online before relying on it.
                    </p>
                  )}
                  {r.suggestion && <p className="text-[13px] text-muted-foreground">{r.suggestion}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="xs" variant="outline" onClick={() => setDecisions((d) => ({ ...d, [i]: "accepted" }))}><Check /> Accept</Button>
                    <Button size="xs" variant="outline" onClick={() => setDecisions((d) => ({ ...d, [i]: "removed" }))}><Trash2 /> Remove from draft</Button>
                    <Button asChild size="xs" variant="ghost">
                      <a href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(r.case_name || r.raw_text)}`} target="_blank" rel="noreferrer">
                        <Search /> Search Indian Kanoon
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
