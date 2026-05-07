"use client"
import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Filter, LayoutGrid, List, Eye, Edit2, Calendar, StickyNote, Trash2, Flag, ChevronDown } from "lucide-react"
import { cn, caseTypeColors, statusColors, statusDotColors, caseTypeDotColors, formatDate } from "@/lib/utils"
import { getCases, getClients, deleteCase } from "@/lib/store"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"

const CASE_TYPES = ["All", "Criminal", "Divorce", "Property", "Civil"]
const STATUSES = ["All", "Active", "Hearing Scheduled", "Judgment Awaited", "Closed", "Won"]

export default function CasesPage() {
  const [view, setView] = useState<"table" | "kanban">("table")
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const { confirm, dialogElement } = useConfirmDialog()
  const { toast } = useToast()

  const [cases, setCases] = useState(() => getCases())
  const clients = getClients()

  const filtered = cases.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.case_number.toLowerCase().includes(q) ||
      clients.find(cl => cl.id === c.client_id)?.full_name.toLowerCase().includes(q)
    const matchType = filterType === "All" || c.case_type === filterType
    const matchStatus = filterStatus === "All" || c.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const handleDelete = (id: string, title: string) => {
    confirm(
      "Delete Case",
      `This will permanently delete "${title}" and all its associated data. This cannot be undone.`,
      () => {
        deleteCase(id)
        setCases(getCases())
        toast("Case deleted successfully", "success")
      }
    )
  }

  const kanbanCols = [
    { status: "Active", label: "Active", color: "border-indigo-300 bg-indigo-50" },
    { status: "Hearing Scheduled", label: "Hearing Scheduled", color: "border-amber-300 bg-amber-50" },
    { status: "Judgment Awaited", label: "Judgment Awaited", color: "border-orange-300 bg-orange-50" },
    { status: "Closed", label: "Closed", color: "border-slate-300 bg-slate-50" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      {dialogElement}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Case Management</h1>
          <p className="text-sm text-slate-500">{filtered.length} cases found</p>
        </div>
        <Link href="/cases/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors">
          <Plus className="w-4 h-4" /> New Case
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search cases..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
          />
        </div>

        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white text-slate-700"
        >
          {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white text-slate-700"
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setView("table")}
            className={cn("p-2 rounded-lg transition-colors", view === "table" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("kanban")}
            className={cn("p-2 rounded-lg transition-colors", view === "kanban" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kanbanCols.map(col => {
            const colCases = cases.filter(c => c.status === col.status)
            return (
              <div key={col.status} className={cn("rounded-xl border-2 p-3", col.color)}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{col.label}</h3>
                  <span className="bg-white text-slate-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {colCases.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colCases.map(c => {
                    const client = clients.find(cl => cl.id === c.client_id)
                    return (
                      <Link
                        key={c.id}
                        href={`/cases/${c.id}`}
                        className="block bg-white rounded-xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", caseTypeColors[c.case_type])}>
                            {c.case_type}
                          </span>
                          {c.priority === "Urgent" && <Flag className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-2 mb-1">{c.title}</p>
                        <p className="text-[10px] text-slate-500">{client?.full_name}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{c.case_number}</p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Case No.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Case Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Court</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center text-slate-400">
                        <Briefcase className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">No cases found</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map(c => {
                  const client = clients.find(cl => cl.id === c.client_id)
                  return (
                    <tr key={c.id} className="table-row-hover group">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-500">{c.case_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/cases/${c.id}`} className="font-medium text-slate-900 hover:text-indigo-700 transition-colors line-clamp-2 max-w-xs">
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{client?.full_name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", caseTypeColors[c.case_type])}>
                          <span className={cn("status-dot", caseTypeDotColors[c.case_type])} />
                          {c.case_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">{c.court}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", statusColors[c.status])}>
                          <span className={cn("status-dot", statusDotColors[c.status])} />
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.priority === "Urgent" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                            <Flag className="w-3 h-3" /> Urgent
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Normal</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/cases/${c.id}`} className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/cases/${c.id}?edit=true`} className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id, c.title)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn("w-7 h-7 rounded-lg text-xs font-medium transition-colors", page === i + 1 ? "bg-indigo-700 text-white" : "text-slate-600 hover:bg-slate-100")}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Briefcase(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  )
}
