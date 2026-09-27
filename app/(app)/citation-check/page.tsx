"use client"
import { useCallback, useRef, useState } from "react"
import { Check, CircleCheck, FileText, History, Printer, RotateCcw, Save, ShieldCheck, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Field, Select, Textarea } from "@/components/ui/field"
import { PageHeader, Segmented } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { cn, formatDate } from "@/lib/utils"
import { useDB } from "@/lib/store"
import {
  addCitationVerification, getRecentVerifications, type CitationResult, type CitationVerification,
} from "@/lib/citation-store"
import { callGemini } from "@/lib/gemini"
import { RiskGauge } from "./components/risk-gauge"
import { CourtWarningCard, WhatWeCheckCard } from "./components/info-cards"
import { CitationResults } from "./components/citation-results"
import { HistoryDrawer, verificationLabel, verificationTone } from "./components/history-drawer"

const DOC_TYPES = ["Petition", "Bail Application", "Written Submission", "Legal Notice", "Affidavit", "Other"]

const STAGES = [
  "Reading citations from the draft",
  "Checking Supreme Court judgments",
  "Checking High Court judgments",
  "Looking for fabricated case numbers",
  "Preparing the risk report",
]

const SAMPLE = `IN THE HIGH COURT OF PUNJAB AND HARYANA AT CHANDIGARH

CRM-M No. 4120 of 2024

Dharam Singh Nain ... Petitioner
Versus
Narcotics Control Bureau ... Respondent

PETITION UNDER SECTION 483 BNSS FOR GRANT OF REGULAR BAIL

1. That the petitioner has been in custody since 30.05.2024 and the trial is unlikely to conclude in the near future.

2. That as held in Tofan Singh vs State of Tamil Nadu (2021) 4 SCC 1, a statement recorded under Section 67 of the NDPS Act is inadmissible as a confession.

3. That in Union of India vs Ram Samujh AIR 1999 SC 2020, the Hon'ble Supreme Court considered the relevance of quantity for bail.

4. That the recent ruling in Dharampal vs State of Haryana AIR 2023 SC 4567 establishes that prolonged custody alone justifies bail in commercial quantity cases.`

function parseJSON<T>(resp: string, fallback: T): T {
  try {
    return JSON.parse(resp.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()) as T
  } catch {
    return fallback
  }
}

export default function CitationCheckPage() {
  const db = useDB()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [inputMode, setInputMode] = useState<"text" | "file">("text")
  const [docText, setDocText] = useState("")
  const [docType, setDocType] = useState("Petition")
  const [linkedCase, setLinkedCase] = useState("")

  const [verifying, setVerifying] = useState(false)
  const [stage, setStage] = useState(0)
  const [citationProgress, setCitationProgress] = useState("")

  const [results, setResults] = useState<CitationResult[] | null>(null)
  const [overallStatus, setOverallStatus] = useState<"SAFE" | "REVIEW_NEEDED" | "HIGH_RISK">("SAFE")
  const [riskScore, setRiskScore] = useState(0)
  const [verdict, setVerdict] = useState("")
  const [verifiedAt, setVerifiedAt] = useState("")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  const recent = getRecentVerifications(5)

  const extractCitations = useCallback(async (text: string): Promise<CitationResult[]> => {
    const prompt = `You are a legal citation extraction engine for Indian courts.\n\nFrom the following legal document, extract ALL case citations. Return ONLY a JSON array, no markdown, no explanation.\n\nFor each citation return:\n{\n  "raw_text": "exact text as it appears in document",\n  "case_name": "party names",\n  "citation_number": "AIR/SCC/etc number if present",\n  "year": "year if present",\n  "court": "court name if mentioned",\n  "context": "the sentence this citation appears in"\n}\n\nDocument:\n${text}`
    const resp = await callGemini(prompt, "You are a legal citation extraction engine. Return only valid JSON.")
    const parsed = parseJSON<CitationResult[]>(resp, [])
    return Array.isArray(parsed) ? parsed : []
  }, [])

  const verifyCitation = useCallback(async (citation: Partial<CitationResult>): Promise<Partial<CitationResult>> => {
    const prompt = `You are a strict Indian legal citation verification engine.\n\nVerify this citation against your knowledge of Indian court judgments:\nCitation: ${JSON.stringify(citation)}\n\nReturn ONLY JSON, no markdown:\n{\n  "status": "VERIFIED" | "SUSPICIOUS" | "HALLUCINATED" | "NOT_FOUND",\n  "confidence": 0-100,\n  "actual_case_name": "correct name if different",\n  "actual_citation": "correct citation if different",\n  "court": "actual court",\n  "date": "actual date",\n  "brief_summary": "2 sentence summary of the real case if verified",\n  "issue": "specific problem if suspicious or hallucinated",\n  "suggestion": "what the lawyer should do"\n}\n\nBe strict. If you are not certain this case exists exactly as cited, mark it SUSPICIOUS or HALLUCINATED. Never guess.`
    const resp = await callGemini(prompt, "You are a strict legal citation verifier. Return only valid JSON.")
    return parseJSON<Partial<CitationResult>>(resp, { status: "NOT_FOUND", confidence: 0, suggestion: "Automatic check failed. Verify manually." })
  }, [])

  const assessRisk = useCallback(async (verified: CitationResult[]) => {
    const prompt = `Given these citation verification results: ${JSON.stringify(verified)}\nReturn ONLY JSON:\n{\n  "risk_score": 0-100,\n  "verdict": "SAFE TO FILE" | "REVIEW BEFORE FILING" | "DO NOT FILE",\n  "plain_english_summary": "1-2 sentences a non-technical lawyer understands",\n  "top_issue": "the single most critical problem if any"\n}`
    const hall = verified.filter((r) => r.status === "HALLUCINATED").length
    const susp = verified.filter((r) => r.status === "SUSPICIOUS").length
    const fallback = {
      risk_score: hall > 0 ? 75 : susp > 0 ? 40 : 10,
      verdict: hall > 0 ? "DO NOT FILE" : susp > 0 ? "REVIEW BEFORE FILING" : "SAFE TO FILE",
      plain_english_summary: hall > 0 ? "At least one citation could not be found in any court. Remove it before filing." : susp > 0 ? "Some citations need correction before filing." : "All citations checked out.",
    }
    const resp = await callGemini(prompt, "You are a legal risk assessment engine. Return only valid JSON.")
    const parsed = parseJSON<typeof fallback>(resp, fallback)
    return typeof parsed.risk_score === "number" ? parsed : fallback
  }, [])

  const handleVerify = async () => {
    if (!docText.trim()) return
    setVerifying(true)
    setResults(null)
    setSaved(false)
    setStage(0)
    setCitationProgress("")
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 1400)
    try {
      const extracted = await extractCitations(docText)
      if (extracted.length === 0) {
        setResults([])
        setOverallStatus("SAFE")
        setRiskScore(0)
        setVerdict("No case citations were found in this draft.")
        setVerifiedAt(new Date().toISOString())
        return
      }
      let done = 0
      const verified = await Promise.all(
        extracted.map(async (cit) => {
          const merged = { ...cit, ...(await verifyCitation(cit)) } as CitationResult
          done += 1
          setCitationProgress(`Checked ${done} of ${extracted.length} citations`)
          return merged
        })
      )
      const risk = await assessRisk(verified)
      setResults(verified)
      setOverallStatus(risk.risk_score <= 30 ? "SAFE" : risk.risk_score <= 60 ? "REVIEW_NEEDED" : "HIGH_RISK")
      setRiskScore(risk.risk_score)
      setVerdict(risk.plain_english_summary || risk.verdict)
      setVerifiedAt(new Date().toISOString())
    } catch {
      toast("Verification failed. Check your connection and try again.", "error")
    } finally {
      clearInterval(timer)
      setVerifying(false)
    }
  }

  const handleSave = () => {
    if (!results) return
    const v: CitationVerification = {
      id: `cv-${Date.now()}`,
      lawyer_id: db.lawyer.id,
      case_id: linkedCase || null,
      document_type: docType,
      document_text: docText.slice(0, 500),
      title: `${docType}${linkedCase ? `, ${db.cases.find((c) => c.id === linkedCase)?.case_number}` : ""}`,
      results,
      overall_status: overallStatus,
      risk_score: riskScore,
      citations_found: results.length,
      citations_verified: results.filter((r) => r.status === "VERIFIED").length,
      citations_flagged: results.filter((r) => r.status === "SUSPICIOUS").length,
      citations_hallucinated: results.filter((r) => r.status === "HALLUCINATED").length,
      created_at: verifiedAt,
    }
    addCitationVerification(v)
    setSaved(true)
    toast("Report saved to history", "success")
  }

  const onFile = async (file?: File) => {
    if (!file) return
    if (file.type.startsWith("text/") || file.name.endsWith(".txt")) {
      setDocText(await file.text())
      setInputMode("text")
      toast(`Loaded ${file.name}`, "success")
    } else {
      toast("PDF and Word reading needs cloud processing. Paste the text for now.", "warning")
    }
  }

  const reset = () => {
    setResults(null)
    setDocText("")
    setSaved(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Citation check"
        description="Paste an AI-assisted draft. Every case citation is checked before you file."
        actions={
          <>
            <Button variant="outline" onClick={() => setHistoryOpen(true)}><History /> History</Button>
            {results && <Button variant="outline" onClick={reset}><RotateCcw /> New check</Button>}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader
              title="Draft to check"
              divider
              action={
                <Segmented
                  size="sm"
                  ariaLabel="Input"
                  value={inputMode}
                  onChange={setInputMode}
                  options={[{ value: "text", label: "Paste text" }, { value: "file", label: "Upload" }]}
                />
              }
            />
            <div className="space-y-4 p-5">
              {inputMode === "text" ? (
                <div className="relative">
                  <Textarea
                    value={docText}
                    onChange={(e) => setDocText(e.target.value)}
                    placeholder="Paste the petition, bail application or written submission here"
                    aria-label="Draft text"
                    className="min-h-72 font-serif text-[14px] leading-relaxed"
                  />
                  {!docText && (
                    <button type="button" onClick={() => setDocText(SAMPLE)} className="absolute bottom-3 right-3 rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-primary hover:bg-surface-3">
                      Try a sample draft
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex min-h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong text-center transition-colors hover:border-primary hover:bg-surface-2"
                >
                  <Upload className="size-6 text-subtle-foreground" />
                  <span className="text-sm font-medium text-foreground">Choose a .txt file</span>
                  <span className="text-xs text-subtle-foreground">PDF and Word support arrives with cloud processing</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = "" }} />

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Link to case">
                  <Select value={linkedCase} onChange={(e) => setLinkedCase(e.target.value)}>
                    <option value="">Not linked</option>
                    {db.cases.map((c) => <option key={c.id} value={c.id}>{c.case_number} · {c.title}</option>)}
                  </Select>
                </Field>
                <Field label="Document type">
                  <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
                    {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </Field>
              </div>

              <Button size="lg" className="w-full" onClick={handleVerify} disabled={!docText.trim() || verifying} loading={verifying}>
                {!verifying && <ShieldCheck />} {verifying ? citationProgress || STAGES[stage] : "Check citations"}
              </Button>

              {verifying && (
                <ol className="space-y-1.5 rounded-xl bg-surface-2/70 p-3.5" aria-live="polite">
                  {STAGES.map((s, i) => (
                    <li key={s} className={cn("flex items-center gap-2 text-[13px]", i < stage ? "text-foreground" : i === stage ? "font-medium text-foreground" : "text-subtle-foreground")}>
                      {i < stage ? (
                        <Check className="size-3.5 text-success" />
                      ) : i === stage ? (
                        <span className="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <span className="size-3.5 rounded-full border border-border-strong" />
                      )}
                      {s}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Card>

          {results !== null && (
            <Card className="print-area animate-rise">
              <CardHeader
                icon={<CircleCheck />}
                title="Report"
                description={`Checked ${formatDate(verifiedAt, "dd MMM yyyy, h:mm a")}`}
                divider
                action={<Badge tone={verificationTone[overallStatus]}>{verificationLabel[overallStatus]}</Badge>}
              />
              <div className="p-5">
                {results.length === 0 ? (
                  <div className="py-6 text-center">
                    <FileText className="mx-auto size-8 text-subtle-foreground" />
                    <p className="mt-2 text-sm font-medium text-foreground">No case citations found</p>
                    <p className="text-[13px] text-muted-foreground">Nothing to verify in this draft.</p>
                  </div>
                ) : (
                  <CitationResults results={results} />
                )}
              </div>
              {results.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={() => window.print()}><Printer /> Print report</Button>
                  <Button onClick={handleSave} disabled={saved}>{saved ? <><Check /> Saved</> : <><Save /> Save to history</>}</Button>
                </div>
              )}
            </Card>
          )}
        </div>

        <aside className="space-y-5">
          {results && results.length > 0 && (
            <Card className="p-5 animate-rise">
              <RiskGauge score={riskScore} verdict={verdict} />
            </Card>
          )}
          <Card>
            <CardHeader title="Recent checks" divider action={<Button variant="ghost" size="xs" onClick={() => setHistoryOpen(true)}>All</Button>} />
            <ul className="divide-y divide-border">
              {recent.map((v) => (
                <li key={v.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">{v.title || v.document_type}</p>
                    <p className="text-xs text-subtle-foreground">{formatDate(v.created_at)} · {v.citations_found} citations</p>
                  </div>
                  <Badge tone={verificationTone[v.overall_status]}>{verificationLabel[v.overall_status]}</Badge>
                </li>
              ))}
            </ul>
          </Card>
          <WhatWeCheckCard />
          <CourtWarningCard />
        </aside>
      </div>

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  )
}
