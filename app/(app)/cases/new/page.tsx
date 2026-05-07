"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, User, FileText, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { addCase, getClients, addClient } from "@/lib/store"
import { useToast } from "@/components/ui/toast"

const STEPS = ["Case Details", "Client", "Documents"]
const CASE_TYPES = ["Criminal", "Divorce", "Property", "Civil"]
const COURTS = [
  "Rohtak District Court", "Punjab & Haryana High Court", "Family Court, Rohtak",
  "Sessions Court, Rohtak", "Magistrate Court, Rohtak", "Consumer Forum, Rohtak",
  "Supreme Court of India", "Delhi High Court", "Delhi District Court"
]

export default function NewCasePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const clients = getClients()

  const [form, setForm] = useState({
    case_number: `CS/${Math.floor(Math.random() * 900) + 100}/${new Date().getFullYear()}`,
    title: "",
    case_type: "Criminal",
    court: "Rohtak District Court",
    judge: "",
    filing_date: new Date().toISOString().split("T")[0],
    opposing_party: "",
    description: "",
    priority: "Normal",
    status: "Active",
  })

  const [clientMode, setClientMode] = useState<"existing" | "new">("existing")
  const [selectedClientId, setSelectedClientId] = useState("")
  const [newClient, setNewClient] = useState({ full_name: "", phone: "+91 ", email: "", address: "" })
  const [clientSearch, setClientSearch] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = "Case title is required"
    if (!form.court.trim()) e.court = "Court name is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    let clientId = selectedClientId
    if (clientMode === "new") {
      if (!newClient.full_name.trim()) { toast("Client name is required", "error"); return }
      const nc = addClient({
        id: `c${Date.now()}`,
        lawyer_id: "lawyer-1",
        ...newClient,
        id_proof_type: "Aadhaar",
        id_proof_number: "",
        referred_by: "",
        notes: "",
        created_at: new Date().toISOString(),
      })
      clientId = nc.id
    }
    const newCase = addCase({
      id: `case-${Date.now()}`,
      lawyer_id: "lawyer-1",
      client_id: clientId,
      ...form,
      created_at: new Date().toISOString(),
    })
    toast("Case created successfully!", "success")
    router.push(`/cases/${newCase.id}`)
  }

  const filteredClients = clients.filter(c => c.full_name.toLowerCase().includes(clientSearch.toLowerCase()))

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">New Case</h1>
          <p className="text-sm text-slate-500">Create a new case file</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all",
              i < step ? "bg-emerald-500 text-white" : i === step ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-400"
            )}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn("text-sm font-medium", i === step ? "text-slate-900" : "text-slate-400")}>{s}</span>
            {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", i < step ? "bg-emerald-300" : "bg-slate-200")} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" /> Case Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Case Number</label>
                <input value={form.case_number} onChange={e => set("case_number", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Case Type *</label>
                <select value={form.case_type} onChange={e => set("case_type", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 bg-white">
                  {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Case Title *</label>
              <input value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="e.g., State vs. John Doe — IPC 420 Cheating"
                className={cn("w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100",
                  errors.title ? "border-rose-400 bg-rose-50" : "border-slate-200")} />
              {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Court *</label>
                <select value={form.court} onChange={e => set("court", e.target.value)}
                  className={cn("w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-indigo-400 bg-white",
                    errors.court ? "border-rose-400 bg-rose-50" : "border-slate-200")}>
                  {COURTS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judge Name</label>
                <input value={form.judge} onChange={e => set("judge", e.target.value)}
                  placeholder="Hon. Judge Name"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Filing Date</label>
                <input type="date" value={form.filing_date} onChange={e => set("filing_date", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Opposing Party</label>
                <input value={form.opposing_party} onChange={e => set("opposing_party", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select value={form.status} onChange={e => set("status", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 bg-white">
                  {["Active", "Hearing Scheduled", "Judgment Awaited", "Closed", "Won"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
                <select value={form.priority} onChange={e => set("priority", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 bg-white">
                  <option>Normal</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                rows={3} placeholder="Brief description of the case..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 resize-none focus:ring-1 focus:ring-indigo-100" />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Link Client
            </h2>
            <div className="flex gap-3">
              <button onClick={() => setClientMode("existing")}
                className={cn("flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors",
                  clientMode === "existing" ? "border-indigo-700 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                Existing Client
              </button>
              <button onClick={() => setClientMode("new")}
                className={cn("flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors",
                  clientMode === "new" ? "border-indigo-700 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                + New Client
              </button>
            </div>

            {clientMode === "existing" && (
              <div className="space-y-3">
                <input value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                  placeholder="Search client by name..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredClients.map(c => (
                    <button key={c.id} onClick={() => setSelectedClientId(c.id)}
                      className={cn("w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left",
                        selectedClientId === c.id ? "border-indigo-700 bg-indigo-50" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50")}>
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                        {c.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.full_name}</p>
                        <p className="text-xs text-slate-500">{c.phone}</p>
                      </div>
                      {selectedClientId === c.id && <Check className="w-4 h-4 text-indigo-600 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {clientMode === "new" && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">New Client Details</p>
                {[
                  { key: "full_name", label: "Full Name *", placeholder: "Client full name" },
                  { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
                  { key: "email", label: "Email", placeholder: "email@example.com" },
                  { key: "address", label: "Address", placeholder: "Complete address" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                    <input
                      value={newClient[f.key as keyof typeof newClient]}
                      onChange={e => setNewClient(n => ({ ...n, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 bg-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Initial Documents
            </h2>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">Drop files here or click to upload</p>
              <p className="text-xs text-slate-400 mt-1">PDF, Word, Images supported</p>
              <button className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-xl hover:bg-indigo-100 transition-colors">
                Choose Files
              </button>
            </div>
            <p className="text-xs text-slate-400 text-center">You can also upload documents later from the case page</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {step === 0 && (
              <button onClick={() => { addCase({ id: `case-${Date.now()}`, lawyer_id: "lawyer-1", client_id: "", ...form, created_at: new Date().toISOString() }); toast("Saved as draft", "info"); router.push("/cases") }}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Save Draft
              </button>
            )}
            {step < 2 ? (
              <button onClick={() => { if (step === 0 && !validateStep1()) return; setStep(s => s + 1) }}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors">
                <Check className="w-4 h-4" /> Create Case
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
