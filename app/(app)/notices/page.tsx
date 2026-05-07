"use client"
import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Eye, Download, MessageSquare, Trash2 } from "lucide-react"
import { cn, formatDate, formatRelativeTime } from "@/lib/utils"
import { getNotices, getCases, deleteNotice } from "@/lib/store"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"

export default function NoticesPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterType, setFilterType] = useState("All")
  const { confirm, dialogElement } = useConfirmDialog()
  const { toast } = useToast()
  const [notices, setNotices] = useState(() => getNotices())
  const cases = getCases()

  const filtered = notices.filter(n => {
    const q = search.toLowerCase()
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.notice_type.toLowerCase().includes(q)
    const matchStatus = filterStatus === "All" || n.status === filterStatus
    const matchType = filterType === "All" || n.notice_type === filterType
    return matchSearch && matchStatus && matchType
  })

  const noticeTypes = ["All", ...Array.from(new Set(notices.map(n => n.notice_type)))]

  const handleDelete = (id: string, title: string) => {
    confirm("Delete Notice", `Permanently delete "${title}"? This cannot be undone.`, () => {
      deleteNotice(id)
      setNotices(getNotices())
      toast("Notice deleted", "success")
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      {dialogElement}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Legal Notices</h1>
          <p className="text-sm text-slate-500">{filtered.length} notices</p>
        </div>
        <Link href="/notices/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors">
          <Plus className="w-4 h-4" /> Generate Notice
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white">
          {noticeTypes.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white">
          {["All", "Draft", "Sent"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Case</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-sm text-slate-400">No notices found</td></tr>
            ) : filtered.map(n => {
              const c = cases.find(c => c.id === n.case_id)
              return (
                <tr key={n.id} className="table-row-hover group">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 text-sm">{n.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium border border-indigo-100">
                      {n.notice_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{c?.case_number || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(n.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                      n.status === "Sent" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600")}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/notices/${n.id}`} className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(n.id, n.title)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
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
    </div>
  )
}
