"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Sparkles, Download, MessageSquare, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { noticeTemplates } from "@/lib/demo-data"
import { addNotice, getCases, getClients, getLawyer } from "@/lib/store"
import { callGemini } from "@/lib/gemini"
import { useToast } from "@/components/ui/toast"

const STEPS = ["Select Template", "Fill Details", "Review & Export"]

export default function NewNoticePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [noticeContent, setNoticeContent] = useState("")

  const cases = getCases()
  const clients = getClients()
  const lawyer = getLawyer()

  const [form, setForm] = useState({
    sender_name: lawyer.name,
    recipient_name: "",
    recipient_address: "",
    case_reference: "",
    date: new Date().toISOString().split("T")[0],
    additional_facts: "",
    amount: "",
    due_date: "",
    fir_number: "",
    section: "",
    grounds: "",
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const template = noticeTemplates.find(t => t.id === selectedTemplate)

  const handleGenerateAI = async () => {
    if (!template) return
    setAiLoading(true)
    const prompt = `Draft a formal ${template.title} for Indian court:
Sender: Advocate ${form.sender_name}
Recipient: ${form.recipient_name}
Address: ${form.recipient_address}
Case Reference: ${form.case_reference}
Date: ${form.date}
${form.amount ? `Amount: ₹${form.amount}` : ""}
${form.due_date ? `Due Date: ${form.due_date}` : ""}
${form.fir_number ? `FIR No: ${form.fir_number}` : ""}
${form.section ? `Section: ${form.section}` : ""}
${form.grounds ? `Grounds: ${form.grounds}` : ""}
Additional Facts: ${form.additional_facts}

Draft the complete formal legal notice in proper Indian legal format with numbered paragraphs. Include "For your review - suggested language only" disclaimer.`

    const result = await callGemini(prompt)
    setNoticeContent(result)
    setAiLoading(false)
    setStep(2)
  }

  const handleSave = () => {
    const notice = addNotice({
      id: `n${Date.now()}`,
      case_id: cases.find(c => c.case_number === form.case_reference)?.id || "",
      lawyer_id: "lawyer-1",
      title: `${template?.title} — ${form.recipient_name}`,
      notice_type: template?.title || "Custom",
      content: noticeContent,
      status: "Draft",
      created_at: new Date().toISOString(),
    })
    toast("Notice saved as draft", "success")
    router.push("/notices")
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Generate Legal Notice</h1>
          <p className="text-sm text-slate-500">AI-powered notice generation</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all",
              i < step ? "bg-emerald-500 text-white" : i === step ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-400")}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn("text-sm font-medium hidden sm:block", i === step ? "text-slate-900" : "text-slate-400")}>{s}</span>
            {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", i < step ? "bg-emerald-300" : "bg-slate-200")} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Template */}
      {step === 0 && (
        <div className="animate-fade-in">
          <p className="text-sm text-slate-600 mb-4">Choose a notice template to get started</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {noticeTemplates.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelectedTemplate(t.id); setStep(1) }}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all card-hover",
                  selectedTemplate === t.id ? "border-indigo-700 bg-indigo-50" : "border-slate-100 bg-white hover:border-indigo-200"
                )}
              >
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Fill Details */}
      {step === 1 && template && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{template.icon}</span>
            <h2 className="text-base font-semibold text-slate-900">{template.title}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "sender_name", label: "Sender (Lawyer) Name *" },
                { key: "recipient_name", label: "Recipient Name *" },
                { key: "date", label: "Date", type: "date" },
                { key: "case_reference", label: "Case Reference" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => set(f.key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Recipient Address</label>
              <textarea value={form.recipient_address} onChange={e => set("recipient_address", e.target.value)}
                rows={2} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 resize-none" />
            </div>

            {/* Template-specific fields */}
            {template.fields.includes("amount") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount (₹)</label>
                  <input value={form.amount} onChange={e => set("amount", e.target.value)}
                    placeholder="e.g., 500000" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => set("due_date", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
                </div>
              </div>
            )}

            {template.fields.includes("fir_number") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">FIR Number</label>
                  <input value={form.fir_number} onChange={e => set("fir_number", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">IPC Section</label>
                  <input value={form.section} onChange={e => set("section", e.target.value)}
                    placeholder="e.g., 420, 302" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Additional Facts / Custom Content</label>
              <textarea value={form.additional_facts} onChange={e => set("additional_facts", e.target.value)}
                rows={4} placeholder="Add any specific facts, circumstances, or additional details..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleGenerateAI} disabled={aiLoading || !form.recipient_name}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-indigo-700 text-white font-medium rounded-xl hover:bg-indigo-800 transition-colors disabled:opacity-50">
                {aiLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate with AI</>}
              </button>
              <button onClick={() => { setNoticeContent(generateBasicNotice(template.title, form, lawyer.name)); setStep(2) }}
                className="px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Basic Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Review Notice</h2>
            <div className="flex gap-2">
              <button onClick={handleGenerateAI} disabled={aiLoading} className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-xl hover:bg-indigo-100 transition-colors">
                <Sparkles className="w-3.5 h-3.5" /> Improve Language
              </button>
            </div>
          </div>

          {/* Paper notice */}
          <div className="notice-paper rounded-2xl p-8 min-h-[600px]">
            <div className="text-center mb-6">
              <p className="text-lg font-bold text-slate-900">{lawyer.firm_name}</p>
              <p className="text-xs text-slate-500 mt-1">{lawyer.firm_address}</p>
              <p className="text-xs text-slate-500">Bar Council No: {lawyer.bar_council_no}</p>
              <div className="w-16 h-px bg-slate-300 mx-auto mt-4" />
            </div>
            <div className="text-right mb-4">
              <p className="text-sm text-slate-700">Date: {form.date}</p>
            </div>
            <div className="mb-6">
              <p className="text-sm font-bold text-slate-900">To,</p>
              <p className="text-sm text-slate-800">{form.recipient_name || "[Recipient Name]"}</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{form.recipient_address || "[Address]"}</p>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-4 text-center underline uppercase">
              {template?.title || "Legal Notice"}
            </p>
            <textarea
              value={noticeContent}
              onChange={e => setNoticeContent(e.target.value)}
              className="w-full text-sm text-slate-800 leading-relaxed outline-none resize-none min-h-[300px] bg-transparent"
              placeholder="Notice content will appear here after generation..."
            />
            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-900 font-semibold">Advocate {lawyer.name}</p>
              <p className="text-xs text-slate-500">{lawyer.firm_name}</p>
              <p className="text-xs text-slate-400 mt-4 italic">*For your review — suggested language only. Please verify before filing.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-indigo-700 text-white font-medium rounded-xl hover:bg-indigo-800 transition-colors">
              <Check className="w-4 h-4" /> Save to Case
            </button>
            <button className="px-4 py-3 inline-flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button className="px-4 py-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors">
              <MessageSquare className="w-4 h-4" /> Share WA
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function generateBasicNotice(type: string, form: any, lawyerName: string) {
  return `LEGAL NOTICE — ${type.toUpperCase()}

Under instructions from and on behalf of my client, I hereby issue this legal notice to you as follows:

1. That my client has engaged me to send you this legal notice regarding the matter stated herein.

2. That the facts of the case are as follows: ${form.additional_facts || "[Facts to be added]"}

3. That you are hereby called upon to comply with the demands stated herein within 15 (fifteen) days of receipt of this notice.

4. That in case of failure to comply, my client shall be constrained to take appropriate legal proceedings against you in the competent court of law, at your risk, cost and consequences.

5. All rights of my client are expressly reserved.

This notice is sent without prejudice.

Advocate ${lawyerName}
[Bar Council Registration Number]

*This is a draft notice for your review. Please verify all details before dispatching.*`
}
