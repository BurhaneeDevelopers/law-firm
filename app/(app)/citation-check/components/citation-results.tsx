"use client"
import { useState } from "react"
import { ChevronDown, ChevronRight, Check, AlertTriangle, XCircle, HelpCircle, ExternalLink, Trash2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CitationResult } from "@/lib/citation-store"

const statusConfig = {
  VERIFIED: { label: "Verified", color: "bg-emerald-100 text-emerald-700 border-emerald-200", barColor: "bg-emerald-500", icon: <Check className="w-3.5 h-3.5" /> },
  SUSPICIOUS: { label: "Suspicious", color: "bg-amber-100 text-amber-700 border-amber-200", barColor: "bg-amber-500", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  HALLUCINATED: { label: "Hallucinated", color: "bg-rose-100 text-rose-700 border-rose-200", barColor: "bg-rose-500", icon: <XCircle className="w-3.5 h-3.5" /> },
  NOT_FOUND: { label: "Not Found", color: "bg-slate-100 text-slate-600 border-slate-200", barColor: "bg-slate-400", icon: <HelpCircle className="w-3.5 h-3.5" /> },
}

interface Props {
  results: CitationResult[]
  onAccept?: (index: number) => void
  onRemove?: (index: number) => void
}

export function CitationResults({ results, onAccept, onRemove }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const verified = results.filter(r => r.status === "VERIFIED").length
  const flagged = results.filter(r => r.status === "SUSPICIOUS").length
  const hallucinated = results.filter(r => r.status === "HALLUCINATED").length

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-slate-900">{results.length}</p>
          <p className="text-[10px] text-slate-500">Total Found</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-emerald-700">{verified}</p>
          <p className="text-[10px] text-emerald-600">Verified ✓</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-amber-700">{flagged}</p>
          <p className="text-[10px] text-amber-600">Flagged ⚠</p>
        </div>
        <div className="bg-rose-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-rose-700">{hallucinated}</p>
          <p className="text-[10px] text-rose-600">Hallucinated ✗</p>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Citation cards */}
      <div className="space-y-3">
        {results.map((r, i) => {
          const cfg = statusConfig[r.status]
          const expanded = expandedIdx === i
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setExpandedIdx(expanded ? null : i)}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{r.raw_text}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{r.context}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn("inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border", cfg.color)}>
                      {cfg.icon} {cfg.label}
                    </span>
                    {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
                {/* Confidence bar */}
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", cfg.barColor)} style={{ width: `${r.confidence}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{r.confidence}%</span>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div className="border-t border-slate-100 p-4 animate-fade-in">
                  {r.status === "VERIFIED" && (
                    <div className="space-y-2 text-xs text-slate-700">
                      {r.actual_case_name && <p><span className="font-semibold">Case:</span> {r.actual_case_name}</p>}
                      {r.court && <p><span className="font-semibold">Court:</span> {r.court}</p>}
                      {r.date && <p><span className="font-semibold">Date:</span> {r.date}</p>}
                      {r.brief_summary && <p className="bg-emerald-50 rounded-lg p-3 text-emerald-800 leading-relaxed">{r.brief_summary}</p>}
                    </div>
                  )}
                  {r.status === "SUSPICIOUS" && (
                    <div className="space-y-2">
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs text-amber-800">{r.issue || "This citation exists but the case name/year may be incorrect."}</p>
                        {r.actual_citation && (
                          <p className="text-xs mt-2"><span className="font-semibold text-amber-900">Suggested match:</span> <span className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">{r.actual_citation}</span></p>
                        )}
                      </div>
                      {r.suggestion && <p className="text-xs text-slate-600 italic">{r.suggestion}</p>}
                    </div>
                  )}
                  {r.status === "HALLUCINATED" && (
                    <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                      <p className="text-xs text-rose-800 font-semibold">⚠ This case does not exist in any Indian court database. Do not use in filing.</p>
                      {r.issue && <p className="text-xs text-rose-700 mt-1.5">{r.issue}</p>}
                      {r.suggestion && <p className="text-xs text-rose-600 mt-2 italic">{r.suggestion}</p>}
                    </div>
                  )}
                  {r.status === "NOT_FOUND" && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="text-xs text-slate-700">Could not verify. May be unreported or regional court judgment. Manual verification recommended.</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => onAccept?.(i)} className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors">
                      <Check className="w-3 h-3" /> Accept
                    </button>
                    <button onClick={() => onRemove?.(i)} className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors">
                      <Trash2 className="w-3 h-3" /> Remove from Draft
                    </button>
                    <button className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors">
                      <Search className="w-3 h-3" /> Find Alternative
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
