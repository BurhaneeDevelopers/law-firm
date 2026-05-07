"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import { addClient } from "@/lib/store"
import { useToast } from "@/components/ui/toast"

export default function NewClientPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({
    full_name: "", phone: "+91 ", email: "", address: "",
    id_proof_type: "Aadhaar", id_proof_number: "", referred_by: "", notes: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = "Name is required"
    if (!form.phone.trim() || form.phone === "+91 ") e.phone = "Phone is required"
    setErrors(e)
    if (Object.keys(e).length > 0) return

    const client = addClient({
      id: `c${Date.now()}`,
      lawyer_id: "lawyer-1",
      ...form,
      created_at: new Date().toISOString(),
    })
    toast("Client added successfully!", "success")
    router.push(`/clients/${client.id}`)
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">New Client</h1>
          <p className="text-sm text-slate-500">Add a new client to your practice</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        {[
          { key: "full_name", label: "Full Name *", placeholder: "Client's full legal name", type: "text" },
          { key: "phone", label: "Phone *", placeholder: "+91 98765 43210", type: "tel" },
          { key: "email", label: "Email", placeholder: "client@email.com", type: "email" },
          { key: "address", label: "Address", placeholder: "Complete address with pin code", type: "text" },
          { key: "referred_by", label: "Referred By", placeholder: "Source of referral", type: "text" },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className={`w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 ${errors[f.key] ? "border-rose-400 bg-rose-50" : "border-slate-200"}`}
            />
            {errors[f.key] && <p className="text-xs text-rose-600 mt-1">{errors[f.key]}</p>}
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">ID Proof Type</label>
            <select value={form.id_proof_type} onChange={e => set("id_proof_type", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 bg-white">
              {["Aadhaar", "PAN Card", "Voter ID", "Passport", "Driving Licence"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">ID Number</label>
            <input value={form.id_proof_number} onChange={e => set("id_proof_number", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
            rows={3} placeholder="Any important notes about this client..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 resize-none focus:ring-1 focus:ring-indigo-100" />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()} className="flex-1 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors">
            <Check className="w-4 h-4" /> Add Client
          </button>
        </div>
      </div>
    </div>
  )
}
