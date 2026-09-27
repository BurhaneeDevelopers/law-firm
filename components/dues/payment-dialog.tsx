"use client"
import { useMemo, useState } from "react"
import { IndianRupee } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, Input, Select } from "@/components/ui/field"
import { Chip } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { PAYMENT_MODES } from "@/lib/constants"
import { cn, formatDate, formatINR, todayISO } from "@/lib/utils"
import { deletePayments, getCaseDueInfos, getClientDueInfos, recordCasePayment, useDB } from "@/lib/store"
import { DueStatusBadge } from "./due-badge"

export type PaymentTarget = { caseId?: string; dueId?: string; clientId?: string }

const referenceHint: Record<string, string> = {
  UPI: "UPI reference (12 digits)",
  Cash: "Receipt no. (optional)",
  Cheque: "Cheque no. and bank",
  "Bank transfer": "NEFT / IMPS / RTGS ref.",
}

export function PaymentDialog({ target, onClose }: { target: PaymentTarget | null; onClose: () => void }) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      {target && <PaymentBody target={target} onClose={onClose} />}
    </Dialog>
  )
}

function PaymentBody({ target, onClose }: { target: PaymentTarget; onClose: () => void }) {
  const db = useDB()
  const { toast } = useToast()

  const initialCase = target.caseId ?? (target.dueId ? db.dues.find((d) => d.id === target.dueId)?.case_id : undefined) ?? (() => {
    // From a client: pick the case with the oldest open due.
    if (!target.clientId) return ""
    const open = getClientDueInfos(target.clientId, db).filter((i) => i.balance > 0)
    return open[0]?.due.case_id ?? db.cases.find((c) => c.client_id === target.clientId)?.id ?? ""
  })()

  const [caseId, setCaseId] = useState(initialCase)
  const openDues = useMemo(() => (caseId ? getCaseDueInfos(caseId, db).filter((i) => i.balance > 0) : []), [caseId, db])
  const [dueId, setDueId] = useState(target.dueId ?? openDues[0]?.due.id ?? "")
  const selected = openDues.find((i) => i.due.id === dueId)
  const [amount, setAmount] = useState(String(selected?.balance ?? ""))
  const [date, setDate] = useState(todayISO())
  const [mode, setMode] = useState("UPI")
  const [reference, setReference] = useState("")
  const [error, setError] = useState("")

  const caseOptions = useMemo(() => {
    const list = target.clientId ? db.cases.filter((c) => c.client_id === target.clientId) : db.cases
    return [...list].sort((a, b) => a.case_number.localeCompare(b.case_number))
  }, [db.cases, target.clientId])

  const selectedCase = db.cases.find((c) => c.id === caseId)
  const client = selectedCase ? db.clients.find((c) => c.id === selectedCase.client_id) : undefined
  const value = Number(amount) || 0

  // Preview how the money will be applied: chosen due first, then oldest open dues, rest as advance.
  const allocation = useMemo(() => {
    let left = value
    const ordered = dueId ? [...openDues.filter((i) => i.due.id === dueId), ...openDues.filter((i) => i.due.id !== dueId)] : openDues
    const rows: { label: string; amount: number; settles: boolean }[] = []
    for (const i of ordered) {
      if (left <= 0) break
      const take = Math.min(left, i.balance)
      rows.push({ label: i.due.description, amount: take, settles: take === i.balance })
      left -= take
    }
    if (left > 0) rows.push({ label: "Advance (no due yet)", amount: left, settles: false })
    return rows
  }, [value, dueId, openDues])

  const pickCase = (id: string) => {
    setCaseId(id)
    const first = getCaseDueInfos(id, db).filter((i) => i.balance > 0)[0]
    setDueId(first?.due.id ?? "")
    setAmount(first ? String(first.balance) : "")
  }

  const pickDue = (id: string) => {
    setDueId(id)
    const d = openDues.find((i) => i.due.id === id)
    if (d) setAmount(String(d.balance))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!caseId) return setError("Choose the case")
    if (!value || value <= 0) return setError("Enter the amount received")
    const ids = recordCasePayment({ case_id: caseId, amount: value, date, mode, reference: reference.trim(), due_id: dueId || undefined })
    toast(`${formatINR(value)} received${client ? ` from ${client.full_name}` : ""}`, "success", {
      label: "Undo",
      onClick: () => {
        deletePayments(ids)
        toast("Payment removed", "info")
      },
    })
    onClose()
  }

  return (
    <DialogContent
      title="Record payment"
      description={client ? `${client.full_name} · ${selectedCase?.case_number}` : "Money received from a client"}
      className="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="payment-form"><IndianRupee /> Save {value ? formatINR(value) : "payment"}</Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={submit} className="space-y-4">
        {!target.dueId && !target.caseId && (
          <Field label="Case" required>
            <Select value={caseId} onChange={(e) => pickCase(e.target.value)}>
              <option value="">Select a case</option>
              {caseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number} · {db.clients.find((x) => x.id === c.client_id)?.full_name ?? ""}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {openDues.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-foreground">Against</legend>
            <div className="space-y-1.5">
              {openDues.map((i) => (
                <label
                  key={i.due.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                    dueId === i.due.id ? "border-primary bg-primary-soft/60" : "border-border hover:border-border-strong"
                  )}
                >
                  <input type="radio" name="due" className="accent-(--primary)" checked={dueId === i.due.id} onChange={() => pickDue(i.due.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{i.due.description}</span>
                    <span className="block text-xs text-muted-foreground">Due {formatDate(i.due.due_date)}</span>
                  </span>
                  <span className="text-right">
                    <span className="tabular block text-sm font-semibold text-foreground">{formatINR(i.balance)}</span>
                    <DueStatusBadge info={i} className="justify-end" />
                  </span>
                </label>
              ))}
              <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm", !dueId ? "border-primary bg-primary-soft/60" : "border-border")}>
                <input type="radio" name="due" className="accent-(--primary)" checked={!dueId} onChange={() => setDueId("")} />
                Advance, not against a due
              </label>
            </div>
          </fieldset>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount (₹)" required error={error}>
            <Input autoFocus inputMode="numeric" className="tabular text-base font-semibold" value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, "")); setError("") }} />
          </Field>
          <Field label="Received on">
            <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        {selected && (
          <div className="-mt-2 flex gap-1.5">
            <Chip className="h-7 text-xs" active={value === selected.balance} onClick={() => setAmount(String(selected.balance))}>Full {formatINR(selected.balance)}</Chip>
            <Chip className="h-7 text-xs" active={value === Math.round(selected.balance / 2)} onClick={() => setAmount(String(Math.round(selected.balance / 2)))}>Half</Chip>
          </div>
        )}

        <fieldset>
          <legend className="mb-2 text-[13px] font-medium text-foreground">Mode</legend>
          <div className="flex flex-wrap gap-1.5">
            {PAYMENT_MODES.map((m) => <Chip key={m} active={mode === m} onClick={() => setMode(m)}>{m}</Chip>)}
          </div>
        </fieldset>
        <Field label="Reference">
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder={referenceHint[mode]} />
        </Field>

        {value > 0 && allocation.length > 1 && (
          <div className="rounded-xl bg-surface-2 px-4 py-3 text-[13px]">
            <p className="font-medium text-foreground">This payment will be applied as:</p>
            <ul className="mt-1 space-y-0.5 text-muted-foreground">
              {allocation.map((a, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="truncate">{a.label}{a.settles ? " (settled)" : ""}</span>
                  <span className="tabular shrink-0 font-medium text-foreground">{formatINR(a.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {mode === "Cheque" && (
          <p className="text-xs text-subtle-foreground">If the cheque bounces, open the due and choose Mark unpaid.</p>
        )}
      </form>
    </DialogContent>
  )
}
