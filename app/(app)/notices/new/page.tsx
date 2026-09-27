"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, ArrowRight, Ban, Check, FileSignature, FilePen, Gavel, HeartHandshake, Home, IndianRupee, Printer, Reply, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { PageHeader } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { NoticePaper } from "@/components/practice/notice-paper"
import { noticeTemplates, type NoticeTemplateIcon } from "@/lib/demo-data"
import { cn, formatINR, todayISO } from "@/lib/utils"
import { AI_DRAFT_KEY } from "@/lib/constants"
import { addNotice, uid, useDB } from "@/lib/store"
import { callGemini } from "@/lib/gemini"

const templateIcons: Record<NoticeTemplateIcon, React.ComponentType<{ className?: string }>> = {
  demand: IndianRupee,
  eviction: Home,
  reply: Reply,
  cease: Ban,
  divorce: HeartHandshake,
  bail: Gavel,
  vakalatnama: FileSignature,
  custom: FilePen,
}

const STEPS = ["Template", "Details", "Review"]

function readPrefill() {
  const params = new URLSearchParams(window.location.search)
  let aiText = ""
  if (params.get("from") === "ai") {
    try {
      aiText = sessionStorage.getItem(AI_DRAFT_KEY) ?? ""
    } catch {
      aiText = ""
    }
  }
  return { caseId: params.get("case") ?? "", aiText }
}

function basicNotice(type: string, form: { facts: string; amount: string; due_days: string }) {
  const amountLine = form.amount ? `\n\n3. That a sum of ${formatINR(Number(form.amount))} is due and payable by you to my client.` : ""
  return `Under instructions from and on behalf of my client, I hereby serve upon you the following legal notice:

1. That my client has instructed me to address this notice to you in respect of the matter stated below.

2. That the facts giving rise to this notice are as follows: ${form.facts || "[state the facts]"}${amountLine}

${form.amount ? "4" : "3"}. That you are hereby called upon to comply with the above within ${form.due_days || "15"} days of receipt of this notice, failing which my client shall be constrained to initiate appropriate civil and/or criminal proceedings against you at your risk as to costs and consequences.

${form.amount ? "5" : "4"}. That a copy of this notice has been retained in my office for record and further action.

This ${type.toLowerCase()} is issued without prejudice to the other rights and remedies available to my client.`
}

export default function NewNoticePage() {
  const router = useRouter()
  const db = useDB()
  const { toast } = useToast()
  const [prefill] = useState(readPrefill)
  const prefillCase = db.cases.find((c) => c.id === prefill.caseId)

  const [step, setStep] = useState(0)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [content, setContent] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    case_id: prefillCase?.id ?? "",
    recipient_name: prefillCase?.opposing_party && prefillCase.opposing_party !== "N/A" ? prefillCase.opposing_party : "",
    recipient_address: "",
    date: todayISO(),
    amount: "",
    due_days: "15",
    cheque: "",
    fir_number: "",
    section: "",
    property_address: "",
    grounds: "",
    facts: prefill.aiText,
  })

  const template = noticeTemplates.find((t) => t.id === templateId)
  const selectedCase = db.cases.find((c) => c.id === form.case_id)
  const client = selectedCase ? db.clients.find((c) => c.id === selectedCase.client_id) : undefined

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => {
      const next = { ...f, [k]: v }
      if (k === "case_id") {
        const c = db.cases.find((x) => x.id === v)
        if (c && !f.recipient_name && c.opposing_party !== "N/A") next.recipient_name = c.opposing_party
      }
      return next
    })
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const validateDetails = () => {
    const e: Record<string, string> = {}
    if (!form.recipient_name.trim()) e.recipient_name = "Who is this notice addressed to?"
    if (template?.fields.includes("amount") && form.amount && isNaN(Number(form.amount))) e.amount = "Enter a number"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const generateAI = async () => {
    if (!template || !validateDetails()) return
    setAiLoading(true)
    const prompt = `Draft the body of a formal ${template.title} in Indian legal format with numbered paragraphs.
Advocate: ${db.lawyer.name}, ${db.lawyer.firm_name}
Client: ${client?.full_name ?? "[client]"}
Recipient: ${form.recipient_name}, ${form.recipient_address}
Case reference: ${selectedCase ? `${selectedCase.case_number}, ${selectedCase.title}` : "none"}
${form.amount ? `Amount: ₹${form.amount}` : ""}
${form.cheque ? `Cheque details: ${form.cheque}` : ""}
${form.fir_number ? `FIR: ${form.fir_number}, sections ${form.section}` : ""}
${form.property_address ? `Property: ${form.property_address}` : ""}
${form.grounds ? `Grounds: ${form.grounds}` : ""}
Compliance period: ${form.due_days} days
Facts: ${form.facts}

Return only the numbered body. Do not repeat the letterhead, date, recipient or signature.`
    const result = await callGemini(prompt)
    setContent(result)
    setAiLoading(false)
    setStep(2)
  }

  const applyStandardFormat = () => {
    if (!template || !validateDetails()) return
    setContent(basicNotice(template.title, form))
    setStep(2)
  }

  const save = (status: "Draft" | "Sent") => {
    if (!template) return
    const n = addNotice({
      id: uid("n"),
      case_id: form.case_id,
      lawyer_id: db.lawyer.id,
      title: `${template.title} to ${form.recipient_name}`,
      notice_type: template.title,
      recipient_name: form.recipient_name + (form.recipient_address ? `\n${form.recipient_address}` : ""),
      content,
      status,
      created_at: new Date(`${form.date}T10:00:00`).toISOString(),
    })
    try { sessionStorage.removeItem(AI_DRAFT_KEY) } catch { /* ignore */ }
    toast(status === "Sent" ? "Notice saved and marked as sent" : "Notice saved as draft", "success")
    router.push(`/notices/${n.id}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        className="no-print"
        back={{ href: "/notices", label: "Notices" }}
        title="Draft a notice"
        description={template ? template.title : "Pick a format. You can edit every word before saving."}
      />

      <ol className="no-print flex items-center gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i < step ? "bg-success text-success-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-surface-3 text-muted-foreground"
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("text-[13px] font-medium", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
            {i < STEPS.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-success/50" : "bg-border")} />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {noticeTemplates.map((t) => {
            const Icon = templateIcons[t.icon]
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTemplateId(t.id); setStep(1) }}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-2xl border bg-surface p-4 text-left shadow-xs transition-[border-color,box-shadow]",
                  templateId === t.id ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-border-strong hover:shadow-md"
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground"><Icon className="size-[18px]" /></span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{t.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{t.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {step === 1 && template && (
        <Card className="p-5 sm:p-6 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Case (optional)" hint="Fills in the reference and opposite party" className="sm:col-span-2">
              <Select value={form.case_id} onChange={(e) => set("case_id", e.target.value)}>
                <option value="">Not linked to a case</option>
                {db.cases.map((c) => <option key={c.id} value={c.id}>{c.case_number} · {c.title}</option>)}
              </Select>
            </Field>
            <Field label="Addressed to" required error={errors.recipient_name}>
              <Input value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} placeholder="M/s Kapoor Industries Ltd." />
            </Field>
            <Field label="Date of notice">
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Recipient address" className="sm:col-span-2">
              <Textarea rows={2} value={form.recipient_address} onChange={(e) => set("recipient_address", e.target.value)} placeholder="Registered office / residence, with PIN" />
            </Field>

            {(template.fields.includes("amount")) && (
              <>
                <Field label="Amount claimed (₹)" error={errors.amount} hint={form.amount ? formatINR(Number(form.amount)) : undefined}>
                  <Input inputMode="numeric" className="tabular" value={form.amount} onChange={(e) => set("amount", e.target.value.replace(/[^\d]/g, ""))} />
                </Field>
                <Field label="Time to comply (days)">
                  <Select value={form.due_days} onChange={(e) => set("due_days", e.target.value)}>
                    {["7", "15", "30"].map((d) => <option key={d}>{d}</option>)}
                  </Select>
                </Field>
              </>
            )}
            {template.fields.includes("cheque") && (
              <Field label="Cheque details" hint="Number, date, bank, return memo date" className="sm:col-span-2">
                <Input value={form.cheque} onChange={(e) => set("cheque", e.target.value)} placeholder="Chq 004512 dt 02.03.2024, SBI Rohtak, returned 20.03.2024" />
              </Field>
            )}
            {template.fields.includes("fir_number") && (
              <>
                <Field label="FIR number and police station">
                  <Input value={form.fir_number} onChange={(e) => set("fir_number", e.target.value)} placeholder="FIR 234/2024, PS City Rohtak" />
                </Field>
                <Field label="Sections">
                  <Input value={form.section} onChange={(e) => set("section", e.target.value)} placeholder="BNS 318(4), 61" />
                </Field>
              </>
            )}
            {template.fields.includes("property_address") && (
              <Field label="Property" className="sm:col-span-2">
                <Input value={form.property_address} onChange={(e) => set("property_address", e.target.value)} placeholder="Shop No. 12, Main Market, Rohtak" />
              </Field>
            )}
            {template.fields.includes("grounds") && (
              <Field label="Grounds" className="sm:col-span-2">
                <Textarea rows={3} value={form.grounds} onChange={(e) => set("grounds", e.target.value)} />
              </Field>
            )}
            <Field label="Facts and instructions" hint="Plain language is fine. AI turns it into numbered paragraphs." className="sm:col-span-2">
              <Textarea rows={5} value={form.facts} onChange={(e) => set("facts", e.target.value)} placeholder="Who, what, when, how much, what the client wants" />
            </Field>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
            <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft /> Templates</Button>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={applyStandardFormat}>Use standard format <ArrowRight /></Button>
              <Button onClick={generateAI} loading={aiLoading}>{!aiLoading && <Sparkles />} {aiLoading ? "Drafting" : "Draft with AI"}</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 2 && template && (
        <div className="space-y-4 animate-fade-in">
          <div className="no-print flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft /> Edit details</Button>
            <Button variant="outline" onClick={generateAI} loading={aiLoading}>{!aiLoading && <Sparkles />} Redraft</Button>
            <p className="ml-auto text-xs text-subtle-foreground">Click the text on the page to edit it.</p>
          </div>

          <NoticePaper
            lawyer={db.lawyer}
            date={form.date}
            recipientName={form.recipient_name}
            recipientAddress={form.recipient_address}
            subject={template.title}
            reference={selectedCase?.case_number}
          >
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={Math.max(14, content.split("\n").length + 2)}
              aria-label="Notice text"
              className="resize-none border-transparent bg-transparent p-0 font-serif text-[14.5px] leading-[1.8] text-[#1b1b22] shadow-none hover:border-transparent focus:border-[#1b1b22]/20 focus:ring-0 print:hidden"
            />
            <div className="hidden whitespace-pre-line print:block">{content}</div>
          </NoticePaper>

          <p className="no-print text-xs text-subtle-foreground">Suggested language for your review. Verify facts, dates and provisions before signing.</p>

          <div className="no-print flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => window.print()}><Printer /> Print / PDF</Button>
            <Button variant="outline" onClick={() => save("Draft")}>Save draft</Button>
            <Button onClick={() => save("Sent")}><Check /> Save and mark sent</Button>
          </div>
        </div>
      )}
    </div>
  )
}
