"use client"
import { useState } from "react"
import { Search, FileText, Download, Eye, Sparkles, X, Copy, Check } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { getDocuments, getCases } from "@/lib/store"
import { callGemini } from "@/lib/gemini"
import { useToast } from "@/components/ui/toast"

const DOC_CATEGORIES = ["All", "Petition", "Affidavit", "Evidence", "Notice", "Order", "Other"]
const FILE_ICONS: Record<string, string> = {
  PDF: "📄", Word: "📝", Image: "🖼️", Other: "📁"
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [aiAction, setAiAction] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const documents = getDocuments()
  const cases = getCases()

  const filtered = documents.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q || d.filename.toLowerCase().includes(q) ||
      cases.find(c => c.id === d.case_id)?.case_number.toLowerCase().includes(q)
    const matchCat = filterCategory === "All" || d.doc_category === filterCategory
    return matchSearch && matchCat
  })

  const selectedDocData = selectedDoc ? documents.find(d => d.id === selectedDoc) : null
  const selectedCase = selectedDocData ? cases.find(c => c.id === selectedDocData.case_id) : null

  const handleAI = async (action: string) => {
    if (!selectedDocData) return
    setAiAction(action)
    setAiLoading(true)
    setAiResult("")

    const prompts: Record<string, string> = {
      summarize: `Summarize this legal document in plain English:\nFilename: ${selectedDocData.filename}\nType: ${selectedDocData.doc_category}\nCase: ${selectedCase?.title}\n\nProvide a brief plain-language summary suitable for a lawyer's review.`,
      dates: `Extract all key dates from this legal document:\nFilename: ${selectedDocData.filename}\nType: ${selectedDocData.doc_category}\nCase: ${selectedCase?.title}\n\nList all dates mentioned and what they refer to.`,
      risks: `Flag any legal risk points in this document:\nFilename: ${selectedDocData.filename}\nType: ${selectedDocData.doc_category}\nCase: ${selectedCase?.title}\n\nHighlight any clauses, statements, or facts that may pose legal risks.`,
    }

    const result = await callGemini(prompts[action] || "")
    setAiResult(result)
    setAiLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(aiResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast("Copied to clipboard", "success")
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Documents</h1>
          <p className="text-sm text-slate-500">{filtered.length} files</p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors">
          + Upload
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white text-slate-700">
          {DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Document Grid */}
        <div className={cn("space-y-1", selectedDoc ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(d => {
              const docCase = cases.find(c => c.id === d.case_id)
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDoc(d.id === selectedDoc ? null : d.id)}
                  className={cn(
                    "bg-white rounded-xl border p-4 cursor-pointer card-hover transition-all",
                    selectedDoc === d.id ? "border-indigo-400 bg-indigo-50/40 shadow-md" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{FILE_ICONS[d.file_type] || FILE_ICONS.Other}</span>
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{d.doc_category}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate mb-1">{d.filename}</p>
                  <p className="text-[10px] text-slate-500 truncate">{docCase?.case_number || "No case"}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{formatDate(d.created_at)}</p>
                  {d.size && <p className="text-[10px] text-slate-400">{d.size}</p>}
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation() }}
                      className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="col-span-3 flex flex-col items-center py-16 text-slate-400">
                <FileText className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">No documents found</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Preview / AI Panel */}
        {selectedDoc && selectedDocData && (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Document Details</h3>
                <button onClick={() => setSelectedDoc(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{FILE_ICONS[selectedDocData.file_type] || FILE_ICONS.Other}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedDocData.filename}</p>
                    <p className="text-xs text-slate-500">{selectedDocData.doc_category}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { label: "Case", value: selectedCase?.case_number },
                    { label: "Type", value: selectedDocData.doc_category },
                    { label: "Uploaded By", value: selectedDocData.uploaded_by },
                    { label: "Date", value: formatDate(selectedDocData.created_at) },
                    { label: "Size", value: selectedDocData.size },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-medium text-slate-800 text-right max-w-[140px] truncate">{item.value || "—"}</span>
                    </div>
                  ))}
                </div>

                {/* PDF Preview */}
                <div className="mt-4 h-32 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <Eye className="w-6 h-6 mx-auto mb-1 opacity-40" />
                    <p className="text-[10px]">PDF Preview</p>
                    <p className="text-[9px]">(File on server)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">AI Analysis</h3>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { action: "summarize", label: "Summarize Document", icon: "📋" },
                  { action: "dates", label: "Extract Key Dates", icon: "📅" },
                  { action: "risks", label: "Flag Risk Points", icon: "⚠️" },
                ].map(item => (
                  <button
                    key={item.action}
                    onClick={() => handleAI(item.action)}
                    disabled={aiLoading && aiAction === item.action}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left",
                      aiAction === item.action && aiResult ? "bg-indigo-50 border border-indigo-200 text-indigo-700" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-transparent"
                    )}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                    {aiLoading && aiAction === item.action && (
                      <span className="ml-auto w-3.5 h-3.5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                    )}
                  </button>
                ))}

                {aiResult && !aiLoading && (
                  <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-indigo-600 uppercase">Result</p>
                      <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-700">
                        {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                      {aiResult.split("\n").map((line, i) => (
                        <p key={i} className="mb-1">{line.replace(/\*\*/g, "")}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
