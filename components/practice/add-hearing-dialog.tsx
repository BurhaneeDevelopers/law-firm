"use client"
import { useState } from "react"
import { CalendarPlus } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, Input, Select } from "@/components/ui/field"
import { useToast } from "@/components/ui/toast"
import { HEARING_PURPOSES } from "@/lib/constants"
import { formatDate, getDaysUntil } from "@/lib/utils"
import { addHearing, getCase, getCases, uid } from "@/lib/store"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Lock to one case (case page). Leave empty to let the user choose (calendar). */
  caseId?: string
  defaultDate?: string
}

export function AddHearingDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && <AddHearingBody {...props} />}
    </Dialog>
  )
}

/** Mounted only while open, so every open starts with a fresh form. */
function AddHearingBody({ onOpenChange, caseId, defaultDate }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState(() => ({
    case_id: caseId ?? "",
    date: defaultDate ?? "",
    time: "10:00",
    court_room: caseId ? getCase(caseId)?.court ?? "" : "",
    item_no: "",
    purpose: "Argument",
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => {
      const next = { ...f, [k]: v }
      if (k === "case_id" && !f.court_room) next.court_room = getCase(v)?.court ?? ""
      return next
    })
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.case_id) errs.case_id = "Choose a case"
    if (!form.date) errs.date = "Enter the hearing date"
    else if (getDaysUntil(form.date) < 0) errs.date = "Date is in the past. Use Record outcome for past hearings."
    if (!form.time) errs.time = "Enter the time"
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    addHearing({
      id: uid("h"),
      case_id: form.case_id,
      date: form.date,
      time: form.time,
      court_room: form.court_room,
      item_no: form.item_no,
      purpose: form.purpose,
      outcome: "",
      outcome_notes: "",
      reminder_sent: false,
    })
    toast(`Hearing added for ${formatDate(form.date)}`, "success")
    onOpenChange(false)
  }

  const cases = getCases()

  return (
    <DialogContent
      title="Add hearing"
      description="Adds the date to your diary and the case timeline."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="add-hearing-form"><CalendarPlus /> Add hearing</Button>
        </>
      }
    >
      <form id="add-hearing-form" onSubmit={submit} className="space-y-4">
        {!caseId && (
          <Field label="Case" required error={errors.case_id}>
            <Select value={form.case_id} onChange={(e) => set("case_id", e.target.value)}>
              <option value="">Select a case</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.case_number} · {c.title}</option>
              ))}
            </Select>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" required error={errors.date}>
            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Time" required error={errors.time}>
            <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-[1fr_96px] gap-3">
          <Field label="Court / room">
            <Input value={form.court_room} onChange={(e) => set("court_room", e.target.value)} placeholder="Court No. 5" />
          </Field>
          <Field label="Item no.">
            <Input inputMode="numeric" value={form.item_no} onChange={(e) => set("item_no", e.target.value)} placeholder="14" />
          </Field>
        </div>
        <Field label="Listed for">
          <Select value={form.purpose} onChange={(e) => set("purpose", e.target.value)}>
            {HEARING_PURPOSES.map((p) => <option key={p}>{p}</option>)}
          </Select>
        </Field>
      </form>
    </DialogContent>
  )
}
