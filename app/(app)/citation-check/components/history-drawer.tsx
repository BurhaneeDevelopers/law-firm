"use client"
import { useState } from "react"
import { X, ChevronDown, ChevronRight, Download, Filter } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { getCitationVerifications, type CitationVerification } from "@/lib/citation-store"
import { getCases } from "@/lib/store"

const statusBadge: Record<string, string> = {
  SAFE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  REVIEW_NEEDED: "bg-amber-50 text-amber-700 border border-amber-200",
  HIGH_RISK: "bg-rose-50 text-rose-700 border border-rose-200",
}
const statusLabel: Record<string, string> = {
  SAFE: "Safe",
  REVIEW_NEEDED: "Review Needed",
  HIGH_RISK: "High Risk",
}

interface Props { open: boolean; onClose: () => void }

export function HistoryDrawer({ open, onClose }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const verifications = getCitationVerifications()
  const cases = getCases()

  const filtered = filterStatus === "all"
    ? verifications
    : verifications.filter(v => v.overall_status === filterStatus)

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[560px] bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Verification History</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {["all", "SAFE", "REVIEW_NEEDED", "HIGH_RISK"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors",
                filterStatus === s ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {s === "all" ? "All" : statusLabel[s]}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-slate-500">No verifications found</p>
            </div>
          )}
          {filtered.map(v => {
            const c = v.case_id ? cases.find(c => c.id === v.case_id) : null
            const expanded = expandedId === v.id
            return (
              <div key={v.id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpandedId(expanded ? null : v.id)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{v.title || v.document_type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">{formatDate(v.created_at)}</span>
                      {c && <span className="text-[10px] text-indigo-600 font-medium">{c.case_number}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusBadge[v.overall_status])}>
                      {statusLabel[v.overall_status]}
                    </span>
                    {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-slate-500">Found: <b>{v.citations_found}</b></span>
                  <span className="text-[10px] text-emerald-600">Verified: <b>{v.citations_verified}</b></span>
                  {v.citations_flagged > 0 && <span className="text-[10px] text-amber-600">Flagged: <b>{v.citations_flagged}</b></span>}
                  {v.citations_hallucinated > 0 && <span className="text-[10px] text-rose-600">Hallucinated: <b>{v.citations_hallucinated}</b></span>}
                </div>

                {/* Expanded citations */}
                {expanded && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {v.results.map((r, i) => (
                      <div key={i} className={cn("p-3 rounded-lg border text-xs",
                        r.status === "VERIFIED" ? "bg-emerald-50/50 border-emerald-100" :
                        r.status === "SUSPICIOUS" ? "bg-amber-50/50 border-amber-100" :
                        r.status === "HALLUCINATED" ? "bg-rose-50/50 border-rose-100" :
                        "bg-slate-50 border-slate-100"
                      )}>
                        <p className="font-semibold text-slate-800">{r.raw_text}</p>
                        <span className={cn("inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                          r.status === "VERIFIED" ? "bg-emerald-100 text-emerald-700" :
                          r.status === "SUSPICIOUS" ? "bg-amber-100 text-amber-700" :
                          r.status === "HALLUCINATED" ? "bg-rose-100 text-rose-700" :
                          "bg-slate-100 text-slate-600"
                        )}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
      `}</style>
    </>
  )
}
