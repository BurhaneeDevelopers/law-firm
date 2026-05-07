"use client"
import { useState } from "react"
import Link from "next/link"
import { Plus, Search, List, LayoutGrid, Phone, MessageSquare, Eye } from "lucide-react"
import { cn, getInitials, getAvatarColor, formatRelativeTime } from "@/lib/utils"
import { getClients, getCases } from "@/lib/store"

export default function ClientsPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [filterActive, setFilterActive] = useState("All")

  const clients = getClients()
  const cases = getCases()

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.full_name.toLowerCase().includes(q) || c.phone.includes(q)
    return matchSearch
  })

  const getClientCases = (clientId: string) => cases.filter(c => c.client_id === clientId)

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500">{filtered.length} clients</p>
        </div>
        <Link href="/clients/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors">
          <Plus className="w-4 h-4" /> New Client
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setView("grid")} className={cn("p-2 rounded-lg", view === "grid" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={cn("p-2 rounded-lg", view === "list" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(client => {
            const clientCases = getClientCases(client.id)
            const activeCases = clientCases.filter(c => ["Active", "Hearing Scheduled", "Judgment Awaited"].includes(c.status)).length
            return (
              <div key={client.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 card-hover group">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm", getAvatarColor(client.full_name))}>
                    {getInitials(client.full_name)}
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", activeCases > 0 ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-500")}>
                    {activeCases} active
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{client.full_name}</h3>
                <p className="text-xs text-slate-500 mb-1">{client.phone}</p>
                <p className="text-xs text-slate-400 mb-4">{clientCases.length} cases total</p>
                <div className="text-[10px] text-slate-400 mb-4">{formatRelativeTime(client.created_at)}</div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/clients/${client.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                  <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}`} target="_blank"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" /> WA
                  </a>
                  <a href={`tel:${client.phone}`}
                    className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Cases</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Added</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(client => {
                const clientCases = getClientCases(client.id)
                return (
                  <tr key={client.id} className="table-row-hover group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", getAvatarColor(client.full_name))}>
                          {getInitials(client.full_name)}
                        </div>
                        <span className="font-medium text-slate-900">{client.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{client.phone}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{client.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{clientCases.length}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatRelativeTime(client.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/clients/${client.id}`} className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}`} target="_blank" className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <a href={`tel:${client.phone}`} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
