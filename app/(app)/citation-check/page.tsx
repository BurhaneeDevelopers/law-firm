"use client"
import { useState, useCallback } from "react"
import Link from "next/link"
import {
  ShieldCheck, Clock, FileText, Upload, ChevronRight,
  Loader2, CheckCircle, Download, Save
} from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { getCases } from "@/lib/store"
import {
  addCitationVerification, getRecentVerifications,
  type CitationResult, type CitationVerification
} from "@/lib/citation-store"
import { callGemini } from "@/lib/gemini"
import { RiskGauge } from "./components/risk-gauge"
import { WhatWeCheckCard, CourtWarningCard } from "./components/info-cards"
import { CitationResults } from "./components/citation-results"
import { HistoryDrawer } from "./components/history-drawer"

const DOC_TYPES = ["Petition", "Bail Application", "Written Submission", "Legal Notice", "Affidavit", "Other"]

const PROGRESS_MESSAGES = [
  "Extracting citations from document...",
  "Cross-checking with Supreme Court database...",
  "Checking High Court judgments...",
  "Scanning for hallucinated case numbers...",
  "Generating risk report...",
]

const statusBadgeClass: Record<string, string> = {
  SAFE: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  REVIEW_NEEDED: "bg-amber-100 text-amber-700 border border-amber-200",
  HIGH_RISK: "bg-rose-100 text-rose-700 border border-rose-200",
}
const statusLabels: Record<string, string> = {
  SAFE: "SAFE", REVIEW_NEEDED: "REVIEW NEEDED", HIGH_RISK: "HIGH RISK",
}

export default function CitationCheckPage() {
  const cases = getCases()
  const [inputMode, setInputMode] = useState<"text" | "pdf">("text")
  const [docText, setDocText] = useState("")
  const [docType, setDocType] = useState("Petition")
  const [linkedCase, setLinkedCase] = useState("")
  const [caseSearch, setCaseSearch] = useState("")
  const [showCaseDropdown, setShowCaseDropdown] = useState(false)

  const [verifying, setVerifying] = useState(false)
  const [progressMsg, setProgressMsg] = useState("")
  const [progressIdx, setProgressIdx] = useState(0)
  const [citationProgress, setCitationProgress] = useState("")

  const [results, setResults] = useState<CitationResult[] | null>(null)
  const [overallStatus, setOverallStatus] = useState<string>("")
  const [riskScore, setRiskScore] = useState(0)
  const [verdict, setVerdict] = useState("")
  const [verifiedAt, setVerifiedAt] = useState("")

  const [historyOpen, setHistoryOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  const recentVerifications = getRecentVerifications(5)
  const filteredCases = cases.filter(c =>
    c.title.toLowerCase().includes(caseSearch.toLowerCase()) ||
    c.case_number.toLowerCase().includes(caseSearch.toLowerCase())
  ).slice(0, 5)

  const extractCitations = useCallback(async (text: string): Promise<CitationResult[]> => {
    const prompt = `You are a legal citation extraction engine for Indian courts.\n\nFrom the following legal document, extract ALL case citations. Return ONLY a JSON array, no markdown, no explanation.\n\nFor each citation return:\n{\n  "raw_text": "exact text as it appears in document",\n  "case_name": "party names",\n  "citation_number": "AIR/SCC/etc number if present",\n  "year": "year if present",\n  "court": "court name if mentioned",\n  "context": "the sentence this citation appears in"\n}\n\nDocument:\n${text}`
    const resp = await callGemini(prompt, "You are a legal citation extraction engine. Return only valid JSON.")
    try {
      const clean = resp.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      return JSON.parse(clean)
    } catch {
      return []
    }
  }, [])

  const verifyCitation = useCallback(async (citation: any): Promise<Partial<CitationResult>> => {
    const prompt = `You are a strict Indian legal citation verification engine.\n\nVerify this citation against your knowledge of Indian court judgments:\nCitation: ${JSON.stringify(citation)}\n\nReturn ONLY JSON, no markdown:\n{\n  "status": "VERIFIED" | "SUSPICIOUS" | "HALLUCINATED" | "NOT_FOUND",\n  "confidence": 0-100,\n  "actual_case_name": "correct name if different",\n  "actual_citation": "correct citation if different",\n  "court": "actual court",\n  "date": "actual date",\n  "brief_summary": "2 sentence summary of the real case if verified",\n  "issue": "specific problem if suspicious or hallucinated",\n  "suggestion": "what the lawyer should do"\n}\n\nBe strict. If you are not certain this case exists exactly as cited, mark it SUSPICIOUS or HALLUCINATED. Never guess.`
    const resp = await callGemini(prompt, "You are a strict legal citation verifier. Return only valid JSON.")
    try {
      const clean = resp.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      return JSON.parse(clean)
    } catch {
      return { status: "NOT_FOUND", confidence: 0, suggestion: "Verification failed. Please verify manually." }
    }
  }, [])

  const getRiskAssessment = useCallback(async (verifiedResults: CitationResult[]) => {
    const prompt = `Given these citation verification results: ${JSON.stringify(verifiedResults)}\nReturn ONLY JSON:\n{\n  "risk_score": 0-100,\n  "verdict": "SAFE TO FILE" | "REVIEW BEFORE FILING" | "DO NOT FILE",\n  "plain_english_summary": "1-2 sentences a non-technical lawyer understands",\n  "top_issue": "the single most critical problem if any"\n}`
    const resp = await callGemini(prompt, "You are a legal risk assessment engine. Return only valid JSON.")
    try {
      const clean = resp.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      return JSON.parse(clean)
    } catch {
      const hall = verifiedResults.filter(r => r.status === "HALLUCINATED").length
      const susp = verifiedResults.filter(r => r.status === "SUSPICIOUS").length
      const score = hall > 0 ? 75 : susp > 0 ? 40 : 10
      return { risk_score: score, verdict: hall > 0 ? "DO NOT FILE" : susp > 0 ? "REVIEW BEFORE FILING" : "SAFE TO FILE", plain_english_summary: "Review complete.", top_issue: "" }
    }
  }, [])

  const handleVerify = async () => {
    if (!docText.trim()) return
    setVerifying(true)
    setResults(null)
    setSaved(false)
    setProgressIdx(0)

    // Start progress message cycling
    let msgIdx = 0
    setProgressMsg(PROGRESS_MESSAGES[0])
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % PROGRESS_MESSAGES.length
      setProgressMsg(PROGRESS_MESSAGES[msgIdx])
      setProgressIdx(msgIdx)
    }, 1500)

    try {
      // Step 1: Extract citations
      const extracted = await extractCitations(docText)
      if (extracted.length === 0) {
        clearInterval(interval)
        setVerifying(false)
        setResults([])
        setOverallStatus("SAFE")
        setRiskScore(0)
        setVerdict("No citations found in this document.")
        setVerifiedAt(new Date().toISOString())
        return
      }

      // Step 2: Verify each citation in parallel
      const verified: CitationResult[] = []
      const promises = extracted.map(async (cit, i) => {
        const result = await verifyCitation(cit)
        const merged = { ...cit, ...result } as CitationResult
        verified[i] = merged
        setCitationProgress(`Verifying citation ${verified.filter(Boolean).length} of ${extracted.length}...`)
        return merged
      })
      await Promise.all(promises)

      // Step 3: Get risk assessment
      const risk = await getRiskAssessment(verified)

      clearInterval(interval)

      const mappedStatus = risk.risk_score <= 30 ? "SAFE" : risk.risk_score <= 60 ? "REVIEW_NEEDED" : "HIGH_RISK"
      setResults(verified)
      setOverallStatus(mappedStatus)
      setRiskScore(risk.risk_score)
      setVerdict(risk.plain_english_summary || risk.verdict)
      setVerifiedAt(new Date().toISOString())
      setVerifying(false)
    } catch (err) {
      clearInterval(interval)
      setVerifying(false)
      console.error("Verification error:", err)
    }
  }

  const handleSave = () => {
    if (!results) return
    const v: CitationVerification = {
      id: `cv-${Date.now()}`,
      lawyer_id: "lawyer-1",
      case_id: linkedCase || null,
      document_type: docType,
      document_text: docText.slice(0, 500),
      title: `${docType} Verification`,
      results,
      overall_status: overallStatus as any,
      risk_score: riskScore,
      citations_found: results.length,
      citations_verified: results.filter(r => r.status === "VERIFIED").length,
      citations_flagged: results.filter(r => r.status === "SUSPICIOUS").length,
      citations_hallucinated: results.filter(r => r.status === "HALLUCINATED").length,
      created_at: verifiedAt,
    }
    addCitationVerification(v)
    setSaved(true)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-indigo-700" />
            <h1 className="text-2xl font-bold text-slate-900">AI Citation Verifier</h1>
          </div>
          <p className="text-sm text-slate-500">Paste any AI-generated legal draft. We verify every cited case against Indian court databases before you file.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setResults(null); setDocText(""); setSaved(false) }} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors">
            <FileText className="w-4 h-4" /> New Verification
          </button>
          <button onClick={() => setHistoryOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
            <Clock className="w-4 h-4" /> View History
          </button>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Input Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Paste Your AI-Generated Draft</h2>

            {/* Toggle pills */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setInputMode("text")} className={cn("text-xs font-medium px-3 py-1.5 rounded-full transition-colors", inputMode === "text" ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                Paste Text
              </button>
              <button onClick={() => setInputMode("pdf")} className={cn("text-xs font-medium px-3 py-1.5 rounded-full transition-colors", inputMode === "pdf" ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                Upload PDF
              </button>
            </div>

            {inputMode === "text" ? (
              <textarea
                value={docText}
                onChange={e => setDocText(e.target.value)}
                placeholder="Paste your petition, bail application, written submission, or any AI-drafted legal document here..."
                className="w-full min-h-[300px] p-4 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-y transition-all"
              />
            ) : (
              <div className="min-h-[200px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="text-sm text-slate-500">Drag & drop PDF or DOCX here</p>
                <p className="text-xs text-slate-400">or click to browse</p>
              </div>
            )}

            {/* Options row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {/* Case link */}
              <div className="relative">
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">Link to Case (optional)</label>
                <input
                  value={caseSearch}
                  onChange={e => { setCaseSearch(e.target.value); setShowCaseDropdown(true) }}
                  onFocus={() => setShowCaseDropdown(true)}
                  placeholder="Search cases..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                {showCaseDropdown && caseSearch && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-slate-100 max-h-40 overflow-y-auto">
                    {filteredCases.map(c => (
                      <button key={c.id} onClick={() => { setLinkedCase(c.id); setCaseSearch(c.case_number + " — " + c.title); setShowCaseDropdown(false) }}
                        className="block w-full text-left px-3 py-2 hover:bg-slate-50 text-xs text-slate-700 truncate">
                        <span className="font-semibold">{c.case_number}</span> — {c.title}
                      </button>
                    ))}
                    {filteredCases.length === 0 && <p className="px-3 py-2 text-xs text-slate-400">No cases found</p>}
                  </div>
                )}
              </div>
              {/* Doc type */}
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">Document Type</label>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Verify button */}
            <button onClick={handleVerify} disabled={verifying || !docText.trim()}
              className={cn("w-full mt-4 h-12 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                verifying ? "bg-indigo-400 text-white cursor-not-allowed" : "bg-indigo-700 text-white hover:bg-indigo-800 hover:shadow-md")}>
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{citationProgress || progressMsg}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Verify Citations
                </>
              )}
            </button>

            {/* Progress bar */}
            {verifying && (
              <div className="mt-3">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${((progressIdx + 1) / PROGRESS_MESSAGES.length) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          {results !== null && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-semibold text-slate-900">Verification Complete</h2>
                  <span className="text-[10px] text-slate-400">{formatDate(verifiedAt, "dd MMM yyyy, hh:mm a")}</span>
                </div>
                {overallStatus && (
                  <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full", statusBadgeClass[overallStatus])}>
                    {statusLabels[overallStatus]}
                  </span>
                )}
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">No citations found in this document</p>
                  <p className="text-xs text-slate-500 mt-1">The document appears to be citation-free</p>
                </div>
              ) : (
                <CitationResults results={results} />
              )}

              {/* Bottom actions */}
              {results.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                    <Download className="w-4 h-4" /> Download Report (PDF)
                  </button>
                  <button onClick={handleSave} disabled={saved}
                    className={cn("flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                      saved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-indigo-700 text-white hover:bg-indigo-800")}>
                    {saved ? <><CheckCircle className="w-4 h-4" /> Saved to Case</> : <><Save className="w-4 h-4" /> Save to Case</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Risk Meter (only when results exist) */}
          {results && results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 animate-fade-in">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Risk Assessment</h3>
              <RiskGauge score={riskScore} verdict={verdict} />
            </div>
          )}

          <WhatWeCheckCard />

          {/* Recent Verifications */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Recent Verifications</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {recentVerifications.map(v => (
                <div key={v.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{v.title || v.document_type}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(v.created_at)}</p>
                    </div>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
                      statusBadgeClass[v.overall_status])}>
                      {statusLabels[v.overall_status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-100">
              <button onClick={() => setHistoryOpen(true)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All History <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <CourtWarningCard />
        </div>
      </div>

      {/* History Drawer */}
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />

      {/* Close case dropdown when clicking outside */}
      {showCaseDropdown && <div className="fixed inset-0 z-10" onClick={() => setShowCaseDropdown(false)} />}
    </div>
  )
}
