"use client"
import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Flag, Edit2, Save, X, Plus, MessageSquare, Phone,
  FileText, Clock, Paperclip, Sparkles, Pin, Trash2, Download,
  ChevronRight, Calendar, Users, Check, AlertCircle
} from "lucide-react"
import { cn, caseTypeColors, statusColors, formatDate, formatRelativeTime, getDaysUntil, getCountdownClass, getCountdownLabel, getInitials, getAvatarColor } from "@/lib/utils"
import {
  getCase, getClient, getHearingsForCase, getDocumentsForCase,
  getNotesForCase, getNoticesForCase, updateCase, addNote, updateNote, deleteNote,
  addHearing, getCases, getClients
} from "@/lib/store"
import { callGemini } from "@/lib/gemini"
import { useToast } from "@/components/ui/toast"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"

const TABS = ["Overview", "Hearings", "Documents", "Notes", "Notices", "AI Summary"]

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { confirm, dialogElement } = useConfirmDialog()
  const [activeTab, setActiveTab] = useState("Overview")
  const [editMode, setEditMode] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSummary, setAiSummary] = useState("")
  const [showAddHearing, setShowAddHearing] = useState(false)
  const [newNote, setNewNote] = useState("")

  const caseData = getCase(id)
  const [formData, setFormData] = useState(caseData || {})

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-semibold text-slate-700">Case Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">This case does not exist or has been deleted.</p>
        <Link href="/cases" className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">← Back to Cases</Link>
      </div>
    )
  }

  const client = getClient(caseData.client_id)
  const hearings = getHearingsForCase(id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const documents = getDocumentsForCase(id)
  const notes = getNotesForCase(id).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
  const notices = getNoticesForCase(id)

  const nextHearing = hearings.find(h => new Date(h.date) >= new Date())
  const daysToNextHearing = nextHearing ? getDaysUntil(nextHearing.date) : null

  const handleSave = () => {
    updateCase(id, formData as any)
    toast("Case updated", "success")
    setEditMode(false)
  }

  const handleAISummary = async () => {
    setAiLoading(true)
    const prompt = `Summarize this case for Advocate Mahipal Yadav:
Case: ${caseData.title}
Number: ${caseData.case_number}
Type: ${caseData.case_type}
Court: ${caseData.court}
Judge: ${caseData.judge}
Status: ${caseData.status}
Opposing Party: ${caseData.opposing_party}
Filing Date: ${caseData.filing_date}
Description: ${caseData.description}
Hearings: ${hearings.length} total, ${hearings.filter(h => new Date(h.date) >= new Date()).length} upcoming
Documents: ${documents.length} files
Notes: ${notes.map(n => n.content).join("; ")}

Provide a structured summary with: Case Overview, Key Dates, Current Status, Risk Flags, Suggested Next Steps.`
    const result = await callGemini(prompt)
    setAiSummary(result)
    setAiLoading(false)
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    addNote({
      id: `note-${Date.now()}`,
      case_id: id,
      content: newNote,
      is_pinned: false,
      created_by: "Adv. Mahipal Yadav",
      created_at: new Date().toISOString(),
    })
    setNewNote("")
    toast("Note added", "success")
  }

  const [hearingForm, setHearingForm] = useState({ date: "", time: "", court_room: caseData.court, purpose: "Argument", outcome_notes: "" })

  const handleAddHearing = () => {
    if (!hearingForm.date || !hearingForm.time) { toast("Date and time required", "error"); return }
    addHearing({
      id: `h-${Date.now()}`,
      case_id: id,
      ...hearingForm,
      reminder_sent: false,
    })
    setShowAddHearing(false)
    toast("Hearing added", "success")
    setHearingForm({ date: "", time: "", court_room: caseData.court, purpose: "Argument", outcome_notes: "" })
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {dialogElement}

      {/* Back */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-slate-400">Cases</span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-xs text-slate-500 truncate max-w-xs">{caseData.case_number}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Case Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-start gap-4 justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", caseTypeColors[caseData.case_type])}>
                    {caseData.case_type}
                  </span>
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", statusColors[caseData.status])}>
                    {caseData.status}
                  </span>
                  {caseData.priority === "Urgent" && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1">
                      <Flag className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-1">{caseData.title}</h1>
                <p className="text-sm text-slate-500 font-mono">{caseData.case_number}</p>
              </div>
              <div className="flex gap-2">
                {editMode ? (
                  <>
                    <button onClick={handleSave} className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditMode(false)} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-100 px-2">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                    activeTab === tab
                      ? "text-indigo-700 border-indigo-700"
                      : "text-slate-500 hover:text-slate-700 border-transparent"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === "Overview" && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Case Number", key: "case_number" },
                    { label: "Filing Date", key: "filing_date" },
                    { label: "Court", key: "court" },
                    { label: "Judge", key: "judge" },
                    { label: "Opposing Party", key: "opposing_party" },
                    { label: "Priority", key: "priority" },
                  ].map(f => (
                    <div key={f.key}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{f.label}</p>
                      {editMode ? (
                        <input
                          value={(formData as any)[f.key] || ""}
                          onChange={e => setFormData((d: any) => ({ ...d, [f.key]: e.target.value }))}
                          className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
                        />
                      ) : (
                        <p className="text-sm text-slate-800">{(caseData as any)[f.key] || "—"}</p>
                      )}
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                    {editMode ? (
                      <textarea
                        value={(formData as any).description || ""}
                        onChange={e => setFormData((d: any) => ({ ...d, description: e.target.value }))}
                        rows={3}
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 resize-none"
                      />
                    ) : (
                      <p className="text-sm text-slate-700 leading-relaxed">{caseData.description || "No description"}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Hearings Tab */}
              {activeTab === "Hearings" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">{hearings.length} Hearings</h3>
                    <button
                      onClick={() => setShowAddHearing(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 text-white text-xs font-medium rounded-lg hover:bg-indigo-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Hearing
                    </button>
                  </div>

                  {showAddHearing && (
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-3 animate-scale-in">
                      <p className="text-xs font-semibold text-indigo-700">New Hearing</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                          <input type="date" value={hearingForm.date} onChange={e => setHearingForm(f => ({ ...f, date: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
                          <input type="time" value={hearingForm.time} onChange={e => setHearingForm(f => ({ ...f, time: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Court Room</label>
                        <input value={hearingForm.court_room} onChange={e => setHearingForm(f => ({ ...f, court_room: e.target.value }))}
                          className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Purpose</label>
                          <select value={hearingForm.purpose} onChange={e => setHearingForm(f => ({ ...f, purpose: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white">
                            {["Mention", "Argument", "Evidence", "Framing of Charges", "Judgment", "Other"].map(p => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                          <input value={hearingForm.outcome_notes} onChange={e => setHearingForm(f => ({ ...f, outcome_notes: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleAddHearing}
                          className="flex-1 py-2 bg-indigo-700 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-colors">
                          Add Hearing
                        </button>
                        <button onClick={() => setShowAddHearing(false)}
                          className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {hearings.length === 0 ? (
                    <EmptyState icon="📅" title="No hearings yet" desc="Add the first hearing for this case" />
                  ) : (
                    <div className="space-y-3">
                      {hearings.map(h => {
                        const isPast = new Date(h.date) < new Date()
                        const days = getDaysUntil(h.date)
                        return (
                          <div key={h.id} className={cn("p-4 rounded-xl border transition-all", isPast ? "border-slate-100 bg-slate-50/50" : "border-indigo-100 bg-indigo-50/40")}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", isPast ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700")}>
                                    {isPast ? "Completed" : "Upcoming"}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{h.purpose}</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-900">{formatDate(h.date, "dd MMMM yyyy")} at {h.time}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{h.court_room}</p>
                                {h.outcome_notes && <p className="text-xs text-slate-600 mt-2 bg-white rounded-lg p-2 border border-slate-100">{h.outcome_notes}</p>}
                              </div>
                              {!isPast && (
                                <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full", getCountdownClass(days))}>
                                  {getCountdownLabel(days)}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === "Documents" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">{documents.length} Documents</h3>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 text-white text-xs font-medium rounded-lg hover:bg-indigo-800 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Upload
                    </button>
                  </div>

                  {documents.length === 0 ? (
                    <EmptyState icon="📄" title="No documents" desc="Upload the first document for this case" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {documents.map(d => (
                        <div key={d.id} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-white transition-all group">
                          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-rose-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{d.filename}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{d.doc_category} · {d.size}</p>
                            <p className="text-[10px] text-slate-400">{formatDate(d.created_at)}</p>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white transition-all text-slate-400 hover:text-indigo-600">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === "Notes" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Add a case note..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 resize-none"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors disabled:opacity-50"
                    >
                      Add Note
                    </button>
                  </div>

                  {notes.length === 0 ? (
                    <EmptyState icon="📝" title="No notes yet" desc="Add notes about this case" />
                  ) : (
                    <div className="space-y-3">
                      {notes.map(n => (
                        <div key={n.id} className={cn("p-4 rounded-xl border", n.is_pinned ? "border-amber-200 bg-amber-50/50" : "border-slate-100 bg-white")}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              {n.is_pinned && <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1"><Pin className="w-3 h-3" /> Pinned</p>}
                              <p className="text-sm text-slate-800 leading-relaxed">{n.content}</p>
                              <p className="text-[10px] text-slate-400 mt-2">{n.created_by} · {formatRelativeTime(n.created_at)}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => { updateNote(n.id, { is_pinned: !n.is_pinned }); toast(n.is_pinned ? "Unpinned" : "Pinned", "success") }}
                                className="p-1.5 rounded-lg hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition-colors"
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => confirm("Delete Note", "This note will be permanently deleted.", () => { deleteNote(n.id); toast("Note deleted", "success") })}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notices Tab */}
              {activeTab === "Notices" && (
                <div className="space-y-3">
                  {notices.length === 0 ? (
                    <EmptyState icon="📬" title="No notices" desc="Generate a legal notice for this case" />
                  ) : notices.map(n => (
                    <div key={n.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-white transition-all">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.notice_type} · {formatDate(n.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", n.status === "Sent" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600")}>
                          {n.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Summary Tab */}
              {activeTab === "AI Summary" && (
                <div className="space-y-4">
                  {!aiSummary ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-7 h-7 text-indigo-700" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-2">AI Case Summary</h3>
                      <p className="text-sm text-slate-500 mb-6">Get an instant structured summary of this case including risk flags and suggested next steps.</p>
                      <button
                        onClick={handleAISummary}
                        disabled={aiLoading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-700 text-white font-medium rounded-xl hover:bg-indigo-800 transition-colors disabled:opacity-60"
                      >
                        {aiLoading ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Summarize This Case</>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <h3 className="text-sm font-semibold text-slate-900">AI Summary</h3>
                        </div>
                        <button
                          onClick={() => setAiSummary("")}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Regenerate
                        </button>
                      </div>
                      <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                        <div className="prose prose-sm max-w-none text-slate-800">
                          {aiSummary.split("\n").map((line, i) => (
                            <p key={i} className={cn("text-sm leading-relaxed", line.startsWith("**") ? "font-semibold text-slate-900" : "text-slate-700")}>
                              {line.replace(/\*\*/g, "")}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Client Card */}
          {client && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Client</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm", getAvatarColor(client.full_name))}>
                  {getInitials(client.full_name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{client.full_name}</p>
                  <p className="text-xs text-slate-500">{client.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-100"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-100"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
              <Link href={`/clients/${client.id}`} className="mt-3 flex items-center justify-center gap-1 py-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                View Full Profile <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Next Hearing */}
          {nextHearing && (
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-800 rounded-2xl p-5 text-white">
              <h3 className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Next Hearing
              </h3>
              <p className="text-2xl font-bold mb-1">{daysToNextHearing === 0 ? "Today" : daysToNextHearing === 1 ? "Tomorrow" : `${daysToNextHearing} days`}</p>
              <p className="text-indigo-200 text-sm">{formatDate(nextHearing.date, "EEEE, dd MMM yyyy")}</p>
              <p className="text-indigo-200 text-sm">{nextHearing.time} · {nextHearing.purpose}</p>
              <p className="text-indigo-300 text-xs mt-2">{nextHearing.court_room}</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Case Stats</h3>
            <div className="space-y-3">
              {[
                { label: "Hearings", value: hearings.length, icon: <Calendar className="w-4 h-4 text-indigo-600" /> },
                { label: "Documents", value: documents.length, icon: <FileText className="w-4 h-4 text-amber-600" /> },
                { label: "Notes", value: notes.length, icon: <Paperclip className="w-4 h-4 text-blue-600" /> },
                { label: "Notices", value: notices.length, icon: <MessageSquare className="w-4 h-4 text-emerald-600" /> },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  {s.icon}
                  <span className="text-sm text-slate-600 flex-1">{s.label}</span>
                  <span className="text-sm font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="text-3xl mb-3 opacity-60">{icon}</span>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  )
}
