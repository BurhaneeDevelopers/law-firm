"use client"
import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Phone, MessageSquare, Sparkles, ChevronRight, Edit2, Save, X, AlertCircle } from "lucide-react"
import { cn, getInitials, getAvatarColor, caseTypeColors, statusColors, formatDate, formatRelativeTime } from "@/lib/utils"
import { getClient, getCases, getDocuments, updateClient } from "@/lib/store"
import { callGemini } from "@/lib/gemini"
import { useToast } from "@/components/ui/toast"

const TABS = ["Profile", "Cases", "Documents", "Communication Log", "AI Brief"]

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("Profile")
  const [editMode, setEditMode] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiBrief, setAiBrief] = useState("")

  const client = getClient(id)
  const [formData, setFormData] = useState(client || {})

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-semibold text-slate-700">Client Not Found</h2>
        <Link href="/clients" className="mt-4 text-sm text-indigo-600 font-medium">← Back to Clients</Link>
      </div>
    )
  }

  const allCases = getCases().filter(c => c.client_id === id)
  const allDocs = getDocuments().filter(d => allCases.some(c => c.id === d.case_id))

  const handleSave = () => {
    updateClient(id, formData as any)
    toast("Client updated", "success")
    setEditMode(false)
  }

  const handleAIBrief = async () => {
    setAiLoading(true)
    const casesSummary = allCases.map(c => `${c.case_number}: ${c.title} (${c.status})`).join(", ")
    const prompt = `Generate a brief client profile for a lawyer's meeting preparation:
Client: ${client.full_name}
Phone: ${client.phone}
Address: ${client.address}
ID Proof: ${client.id_proof_type} - ${client.id_proof_number}
Notes: ${client.notes}
Cases: ${casesSummary || "No cases"}
Added: ${client.created_at}

Generate a concise professional brief paragraph about this client — who they are, case history overview, current status, and what to keep in mind before meeting.`
    const result = await callGemini(prompt)
    setAiBrief(result)
    setAiLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-slate-400">Clients</span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-xs text-slate-500">{client.full_name}</span>
      </div>

      {/* Client Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-5">
        <div className="flex items-start gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl", getAvatarColor(client.full_name))}>
              {getInitials(client.full_name)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{client.full_name}</h1>
              <p className="text-sm text-slate-500">{client.phone}</p>
              {client.email && <p className="text-xs text-slate-400">{client.email}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`tel:${client.phone}`} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
              <Phone className="w-4 h-4" /> Call
            </a>
            <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}`} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors">
              <MessageSquare className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">{allCases.length} Cases</span>
          <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium">{allDocs.length} Documents</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">Since {formatDate(client.created_at, "MMM yyyy")}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 px-2">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                activeTab === tab ? "text-indigo-700 border-indigo-700" : "text-slate-500 hover:text-slate-700 border-transparent")}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile */}
          {activeTab === "Profile" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                {editMode ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditMode(false)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditMode(true)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Full Name", key: "full_name" },
                  { label: "Phone", key: "phone" },
                  { label: "Email", key: "email" },
                  { label: "Address", key: "address" },
                  { label: "ID Proof Type", key: "id_proof_type" },
                  { label: "ID Number", key: "id_proof_number" },
                  { label: "Referred By", key: "referred_by" },
                ].map(f => (
                  <div key={f.key} className={f.key === "address" || f.key === "notes" ? "col-span-2" : ""}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{f.label}</p>
                    {editMode ? (
                      <input value={(formData as any)[f.key] || ""} onChange={e => setFormData((d: any) => ({ ...d, [f.key]: e.target.value }))}
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
                    ) : (
                      <p className="text-sm text-slate-800">{(client as any)[f.key] || "—"}</p>
                    )}
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                  {editMode ? (
                    <textarea value={(formData as any).notes || ""} onChange={e => setFormData((d: any) => ({ ...d, notes: e.target.value }))}
                      rows={3} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 resize-none" />
                  ) : (
                    <p className="text-sm text-slate-700">{client.notes || "—"}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cases */}
          {activeTab === "Cases" && (
            <div className="space-y-3">
              {allCases.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No cases linked to this client</p>
                  <Link href="/cases/new" className="text-xs text-indigo-600 font-medium mt-2 block">+ Create a case</Link>
                </div>
              ) : allCases.map(c => (
                <Link key={c.id} href={`/cases/${c.id}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", caseTypeColors[c.case_type])}>{c.case_type}</span>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusColors[c.status])}>{c.status}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.case_number} · {c.court}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              ))}
            </div>
          )}

          {/* Documents */}
          {activeTab === "Documents" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allDocs.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-slate-400 text-sm">No documents found</div>
              ) : allDocs.map(d => (
                <div key={d.id} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-slate-200 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600 text-sm font-bold">
                    {d.file_type[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">{d.filename}</p>
                    <p className="text-[10px] text-slate-500">{d.doc_category}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(d.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Communication Log */}
          {activeTab === "Communication Log" && (
            <div className="space-y-3">
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 mb-4">No WhatsApp messages or call logs yet. Manually log a communication below.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <textarea rows={2} placeholder="Log a call or communication..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 resize-none bg-white mb-2" />
                <button className="px-4 py-2 bg-indigo-700 text-white text-xs font-medium rounded-lg hover:bg-indigo-800 transition-colors">
                  Add Log
                </button>
              </div>
            </div>
          )}

          {/* AI Brief */}
          {activeTab === "AI Brief" && (
            <div className="space-y-4">
              {!aiBrief ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-indigo-700" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">Client Brief</h3>
                  <p className="text-sm text-slate-500 mb-6">Generate an AI summary of this client's history — useful before a client meeting.</p>
                  <button onClick={handleAIBrief} disabled={aiLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-700 text-white font-medium rounded-xl hover:bg-indigo-800 transition-colors disabled:opacity-60">
                    {aiLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Client Brief</>}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-semibold text-slate-900">Client Brief</h3>
                    </div>
                    <button onClick={() => setAiBrief("")} className="text-xs text-indigo-600 font-medium">Regenerate</button>
                  </div>
                  <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    {aiBrief.split("\n").map((line, i) => (
                      <p key={i} className="text-sm text-slate-700 leading-relaxed mb-2">{line.replace(/\*\*/g, "")}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
