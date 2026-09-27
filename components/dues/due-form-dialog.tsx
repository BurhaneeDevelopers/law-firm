"use client"
import { useMemo, useState } from "react"
import { addDays, addMonths, addWeeks, endOfMonth } from "date-fns"
import { CalendarPlus, Save, TriangleAlert } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { Chip, Segmented, Switch } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { cn, formatDate, formatINR, getDaysUntil, toDate, toISODate, todayISO } from "@/lib/utils"
import {
  addDues, getCaseFees, getCaseDueInfos, getDB, getUnscheduledBalance, isOpenDue, updateDue, useDB,
} from "@/lib/store"

export type DueFormTarget = { dueId?: string; caseId?: string; clientId?: string; amount?: number; description?: string }

const PRESETS = ["Retainer", "Instalment", "Appearance fee", "Drafting fee", "Court fee and expenses", "Final fee"]
type Every = "month" | "fortnight" | "week"

function splitAmounts(total: number, parts: number) {
  const base = Math.floor(total / parts)
  return Array.from({ length: parts }, (_, i) => (i === parts - 1 ? total - base * (parts - 1) : base))
}

function stepDate(start: string, i: number, every: Every) {
  const d = toDate(start)
  return toISODate(every === "month" ? addMonths(d, i) : every === "fortnight" ? addWeeks(d, i * 2) : addWeeks(d, i))
}

export function DueFormDialog({ target, onClose }: { target: DueFormTarget | null; onClose: () => void }) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      {target && <DueFormBody target={target} onClose={onClose} />}
    </Dialog>
  )
}

function DueFormBody({ target, onClose }: { target: DueFormTarget; onClose: () => void }) {
  const db = useDB()
  const { toast } = useToast()
  const editing = target.dueId ? db.dues.find((d) => d.id === target.dueId) : undefined

  const [caseId, setCaseId] = useState(editing?.case_id ?? target.caseId ?? "")
  const [description, setDescription] = useState(editing?.description ?? target.description ?? "")
  const [amount, setAmount] = useState(String(editing?.amount ?? target.amount ?? ""))
  const [dueDate, setDueDate] = useState(editing?.due_date ?? toISODate(addDays(new Date(), 7)))
  const [notes, setNotes] = useState(editing?.notes ?? "")
  const [split, setSplit] = useState(false)
  const [parts, setParts] = useState("3")
  const [every, setEvery] = useState<Every>("month")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const cases = useMemo(() => {
    const list = target.clientId ? db.cases.filter((c) => c.client_id === target.clientId) : db.cases
    return [...list].sort((a, b) => a.case_number.localeCompare(b.case_number))
  }, [db.cases, target.clientId])

  const selectedCase = db.cases.find((c) => c.id === caseId)
  const client = selectedCase ? db.clients.find((c) => c.id === selectedCase.client_id) : undefined
  const fees = caseId ? getCaseFees(caseId, db) : null
  const scheduled = caseId ? getCaseDueInfos(caseId, db).filter(isOpenDue).reduce((s, i) => s + i.balance, 0) : 0
  const unscheduled = caseId ? getUnscheduledBalance(caseId, db) : 0

  const total = Number(amount) || 0
  const count = Math.min(24, Math.max(2, Number(parts) || 2))
  const plan = split && !editing && total > 0 && dueDate
    ? splitAmounts(total, count).map((a, i) => ({ amount: a, date: stepDate(dueDate, i, every), label: `${description || "Instalment"} (${i + 1} of ${count})` }))
    : []

  const quickDates = [
    { label: "Today", value: todayISO() },
    { label: "In 7 days", value: toISODate(addDays(new Date(), 7)) },
    { label: "In 15 days", value: toISODate(addDays(new Date(), 15)) },
    { label: "Month end", value: toISODate(endOfMonth(new Date())) },
    { label: "In 1 month", value: toISODate(addMonths(new Date(), 1)) },
  ]

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!caseId) errs.case = "Choose the case this fee belongs to"
    if (!description.trim()) errs.description = "What is this fee for?"
    if (!total || total <= 0) errs.amount = "Enter the amount in rupees"
    if (!dueDate) errs.date = "Pick the date it should be paid by"
    setErrors(errs)
    if (Object.keys(errs).length) return

    if (editing) {
      updateDue(editing.id, { description: description.trim(), amount: total, due_date: dueDate, notes: notes.trim() })
      toast("Due updated", "success")
    } else if (plan.length) {
      addDues(plan.map((p) => ({ case_id: caseId, description: p.label, amount: p.amount, due_date: p.date, notes: notes.trim() })))
      toast(`${plan.length} instalments scheduled`, "success")
    } else {
      addDues([{ case_id: caseId, description: description.trim(), amount: total, due_date: dueDate, notes: notes.trim() }])
      toast(`${formatINR(total)} due on ${formatDate(dueDate)} added`, "success")
    }
    onClose()
  }

  const past = dueDate && getDaysUntil(dueDate) < 0

  return (
    <DialogContent
      title={editing ? "Edit due" : "Add fee due"}
      description={editing ? `${selectedCase?.case_number ?? ""} · ${client?.full_name ?? ""}` : "When should the client pay, and how much?"}
      className="max-w-xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="due-form">
            {editing ? <Save /> : <CalendarPlus />}
            {editing ? "Save changes" : plan.length ? `Schedule ${plan.length} instalments` : "Add due"}
          </Button>
        </>
      }
    >
      <form id="due-form" onSubmit={submit} className="space-y-4">
        {!editing && !target.caseId && (
          <Field label="Case" required error={errors.case}>
            <Select value={caseId} onChange={(e) => { setCaseId(e.target.value); setErrors((x) => ({ ...x, case: "" })) }}>
              <option value="">Select a case</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number} · {getDB().clients.find((x) => x.id === c.client_id)?.full_name ?? "No client"}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {fees && !editing && (
          <div className="rounded-xl bg-surface-2 px-4 py-3 text-[13px]">
            {(target.caseId || target.clientId) && selectedCase && (
              <p className="mb-1 font-medium text-foreground">{selectedCase.case_number} · {client?.full_name}</p>
            )}
            <p className="text-muted-foreground">
              Agreed {formatINR(fees.agreed)} · received {formatINR(fees.received)} · already scheduled {formatINR(scheduled)}
            </p>
            {unscheduled > 0 ? (
              <button type="button" onClick={() => setAmount(String(unscheduled))} className="mt-1 font-medium text-primary hover:underline">
                Use the unscheduled balance of {formatINR(unscheduled)}
              </button>
            ) : (
              <p className="mt-1 text-subtle-foreground">The agreed fee is fully scheduled or paid. This will be an additional fee.</p>
            )}
          </div>
        )}

        <Field label="For" required error={errors.description}>
          <Input value={description} onChange={(e) => { setDescription(e.target.value); setErrors((x) => ({ ...x, description: "" })) }} placeholder="e.g. Second instalment, appearance fee for 3 dates" autoFocus={!!target.caseId || !!editing} />
        </Field>
        {!editing && (
          <div className="-mt-2 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <Chip key={p} active={description === p} onClick={() => setDescription(p)} className="h-7 text-xs">{p}</Chip>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={plan.length ? "Total amount (₹)" : "Amount (₹)"} required error={errors.amount} hint={total ? formatINR(total) : undefined}>
            <Input inputMode="numeric" className="tabular" value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^\d]/g, "")); setErrors((x) => ({ ...x, amount: "" })) }} placeholder="25000" />
          </Field>
          <Field label={plan.length ? "First instalment on" : "Due on"} required error={errors.date} hint={past ? "This date has passed. It will show as overdue." : dueDate ? formatDate(dueDate, "EEEE") : undefined}>
            <Input type="date" value={dueDate} onChange={(e) => { setDueDate(e.target.value); setErrors((x) => ({ ...x, date: "" })) }} />
          </Field>
        </div>
        <div className="-mt-2 flex flex-wrap gap-1.5">
          {quickDates.map((q) => (
            <Chip key={q.label} active={dueDate === q.value} onClick={() => setDueDate(q.value)} className="h-7 text-xs">{q.label}</Chip>
          ))}
        </div>

        {!editing && (
          <div className="rounded-xl border border-border">
            <label className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-foreground">Split into instalments</span>
                <span className="block text-xs text-muted-foreground">Common for trials and long matters</span>
              </span>
              <Switch checked={split} onCheckedChange={setSplit} aria-label="Split into instalments" />
            </label>
            {split && (
              <div className="space-y-3 border-t border-border px-4 py-3 animate-fade-in">
                <div className="flex flex-wrap items-end gap-3">
                  <Field label="Instalments" className="w-28">
                    <Select value={parts} onChange={(e) => setParts(e.target.value)}>
                      {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => <option key={n}>{n}</option>)}
                    </Select>
                  </Field>
                  <Segmented
                    ariaLabel="Frequency"
                    value={every}
                    onChange={setEvery}
                    options={[{ value: "week", label: "Weekly" }, { value: "fortnight", label: "Every 2 weeks" }, { value: "month", label: "Monthly" }]}
                  />
                </div>
                {plan.length > 0 && (
                  <ol className="divide-y divide-border rounded-lg bg-surface-2/60 text-[13px]">
                    {plan.map((p, i) => (
                      <li key={i} className="flex justify-between px-3 py-1.5">
                        <span className="text-muted-foreground">{i + 1}. {formatDate(p.date, "EEE, dd MMM yyyy")}</span>
                        <span className={cn("tabular font-medium text-foreground", toDate(p.date).getDay() === 0 && "text-warning-soft-foreground")}>{formatINR(p.amount)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        )}

        <Field label="Note" hint="Visible only to you. e.g. promised after harvest, pays through son">
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        {editing && getCaseDueInfos(editing.case_id, db).find((i) => i.due.id === editing.id)?.paid ? (
          <p className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning-soft-foreground">
            <TriangleAlert className="mt-px size-3.5 shrink-0" /> Payments are already recorded against this due. Lowering the amount below what was received marks it paid.
          </p>
        ) : null}
      </form>
    </DialogContent>
  )
}
