"use client"
import { useState } from "react"
import { IndianRupee, Plus, Receipt, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, Input, Select } from "@/components/ui/field"
import { EmptyState } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { WhatsAppMenu } from "@/components/practice/whatsapp-menu"
import { PAYMENT_MODES } from "@/lib/constants"
import { formatDate, formatINR, todayISO } from "@/lib/utils"
import { addPayment, deletePayment, getCaseFees, uid, useDB, type Case, type Client } from "@/lib/store"

export function CaseFees({ caseData, client }: { caseData: Case; client?: Client }) {
  const db = useDB()
  const { toast } = useToast()
  const { confirm, dialogElement } = useConfirmDialog()
  const fees = getCaseFees(caseData.id, db)
  const payments = db.payments.filter((p) => p.case_id === caseData.id).sort((a, b) => b.date.localeCompare(a.date))

  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ amount: "", date: todayISO(), mode: "UPI", reference: "" })
  const [error, setError] = useState("")

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0) {
      setError("Enter the amount received")
      return
    }
    addPayment({ id: uid("p"), case_id: caseData.id, amount, mode: form.mode, reference: form.reference.trim(), note: "", date: form.date })
    toast(`${formatINR(amount)} recorded`, "success")
    setForm({ amount: "", date: todayISO(), mode: "UPI", reference: "" })
    setAdding(false)
    setError("")
  }

  return (
    <div className="space-y-5">
      {dialogElement}
      <dl className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border">
        {[
          { label: "Agreed", value: fees.agreed },
          { label: "Received", value: fees.received },
          { label: "Balance", value: fees.balance },
        ].map((s) => (
          <div key={s.label} className="px-4 py-3">
            <dt className="text-xs text-muted-foreground">{s.label}</dt>
            <dd className={`tabular mt-1 text-lg font-semibold ${s.label === "Balance" && s.value > 0 ? "text-warning-soft-foreground" : "text-foreground"}`}>
              {formatINR(s.value)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}><Plus /> Record payment</Button>
        )}
        {client && fees.balance > 0 && (
          <WhatsAppMenu
            size="sm"
            variant="outline"
            label="Fee reminder"
            phone={client.phone}
            preferred={client.preferred_language}
            message={(lang) =>
              lang === "Hindi"
                ? `नमस्ते ${client.full_name} जी,\n\nकेस ${caseData.case_number} में फ़ीस की शेष राशि ${formatINR(fees.balance)} है। सुविधा अनुसार भुगतान करें।\n\nधन्यवाद,\nएडवोकेट ${db.lawyer.name}`
                : `Dear ${client.full_name},\n\nA balance professional fee of ${formatINR(fees.balance)} is pending in case ${caseData.case_number}. Kindly clear it at your convenience.\n\nRegards,\nAdvocate ${db.lawyer.name}`
            }
          />
        )}
      </div>

      {adding && (
        <form onSubmit={save} className="grid gap-3 rounded-xl border border-border bg-surface-2/50 p-4 sm:grid-cols-4 animate-rise">
          <Field label="Amount (₹)" required error={error}>
            <Input autoFocus inputMode="numeric" className="tabular" value={form.amount} onChange={(e) => { setForm((f) => ({ ...f, amount: e.target.value.replace(/[^\d]/g, "") })); setError("") }} placeholder="25000" />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} max={todayISO()} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </Field>
          <Field label="Mode">
            <Select value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}>
              {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Reference">
            <Input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} placeholder="UPI ref / cheque no." />
          </Field>
          <div className="flex justify-end gap-2 sm:col-span-4">
            <Button variant="ghost" size="sm" onClick={() => { setAdding(false); setError("") }}>Cancel</Button>
            <Button type="submit" size="sm"><IndianRupee /> Save payment</Button>
          </div>
        </form>
      )}

      {payments.length === 0 ? (
        <EmptyState compact icon={Receipt} title="No payments recorded" description="Record advances and instalments as you receive them." />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="tabular text-sm font-semibold text-foreground">{formatINR(p.amount)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(p.date)} · {p.mode}
                  {p.reference ? ` · ${p.reference}` : ""}
                  {p.note ? ` · ${p.note}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete payment"
                onClick={() => confirm("Delete this payment?", `${formatINR(p.amount)} received on ${formatDate(p.date)} will be removed from the ledger.`, () => { deletePayment(p.id); toast("Payment removed", "success") })}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
