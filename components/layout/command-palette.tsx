"use client"
import { useState, useEffect, useRef } from "react"
import { Search, Briefcase, Users, FileText, ArrowRight, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { demoCases, demoClients, demoDocuments } from "@/lib/demo-data"

interface CommandPaletteProps {
  onClose: () => void
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowDown") setSelected(s => Math.min(s + 1, results.length - 1))
      if (e.key === "ArrowUp") setSelected(s => Math.max(s - 1, 0))
      if (e.key === "Enter" && results[selected]) {
        router.push(results[selected].href)
        onClose()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  })

  const q = query.toLowerCase()

  const results = q ? [
    ...demoCases.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.case_number.toLowerCase().includes(q)
    ).slice(0, 3).map(c => ({
      id: c.id, icon: <Briefcase className="w-4 h-4 text-indigo-600" />,
      label: c.title, sub: c.case_number, href: `/cases/${c.id}`
    })),
    ...demoClients.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      c.phone.includes(q)
    ).slice(0, 3).map(c => ({
      id: c.id, icon: <Users className="w-4 h-4 text-purple-600" />,
      label: c.full_name, sub: c.phone, href: `/clients/${c.id}`
    })),
    ...demoDocuments.filter(d =>
      d.filename.toLowerCase().includes(q)
    ).slice(0, 2).map(d => ({
      id: d.id, icon: <FileText className="w-4 h-4 text-amber-600" />,
      label: d.filename, sub: d.doc_category, href: `/documents`
    })),
  ] : [
    { id: "go-cases", icon: <Briefcase className="w-4 h-4 text-indigo-600" />, label: "Go to Cases", sub: "View all cases", href: "/cases" },
    { id: "go-clients", icon: <Users className="w-4 h-4 text-purple-600" />, label: "Go to Clients", sub: "View all clients", href: "/clients" },
    { id: "go-docs", icon: <FileText className="w-4 h-4 text-amber-600" />, label: "Go to Documents", sub: "View all documents", href: "/documents" },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-start justify-center pt-[15vh] px-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            placeholder="Search cases, clients, documents..."
            className="flex-1 text-sm outline-none text-slate-900 placeholder-slate-400"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="py-2 max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No results found</div>
          ) : (
            results.map((item, i) => (
              <button
                key={item.id}
                onClick={() => { router.push(item.href); onClose() }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  i === selected ? "bg-indigo-50" : "hover:bg-slate-50"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", i === selected ? "bg-white" : "bg-slate-100")}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.label}</p>
                  <p className="text-xs text-slate-500 truncate">{item.sub}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-slate-100 flex gap-3 text-[10px] text-slate-400">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
