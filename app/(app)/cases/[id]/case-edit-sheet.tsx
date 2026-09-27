"use client"
import { useState } from "react"
import { Save } from "lucide-react"
import { Dialog, SheetContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { useToast } from "@/components/ui/toast"
import { CASE_STATUSES, CASE_TYPES } from "@/lib/constants"
import { updateCase, type Case } from "@/lib/store"

type Props = { caseData: Case; open: boolean; onOpenChange: (o: boolean) => void }

export function CaseEditSheet(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && <CaseEditBody {...props} />}
    </Dialog>
  )
}

function CaseEditBody({ caseData, onOpenChange }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState(caseData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = <K extends keyof Case>(k: K, v: Case[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = "Title is required"
    if (!form.case_number.trim()) errs.case_number = "Case number is required"
    if (form.cnr_number && !/^[A-Z]{4}\d{12}$/i.test(form.cnr_number)) errs.cnr_number = "CNR is 4 letters and 12 digits"
    setErrors(errs)
    if (Object.keys(errs).length) return
    updateCase(caseData.id, { ...form, cnr_number: form.cnr_number.toUpperCase() })
    toast("Case details saved", "success")
    onOpenChange(false)
  }

  return (
    <SheetContent
      title="Edit case"
      description={caseData.case_number}
      className="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="case-edit-form"><Save /> Save changes</Button>
        </>
      }
    >
      <form id="case-edit-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required error={errors.title} className="sm:col-span-2">
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Case number" required error={errors.case_number}>
          <Input value={form.case_number} onChange={(e) => set("case_number", e.target.value)} className="font-mono" />
        </Field>
        <Field label="CNR number" error={errors.cnr_number}>
          <Input value={form.cnr_number} onChange={(e) => set("cnr_number", e.target.value.toUpperCase())} className="font-mono" maxLength={16} />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
            {CASE_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            <option>Normal</option>
            <option>Urgent</option>
          </Select>
        </Field>
        <Field label="Case type">
          <Select value={form.case_type} onChange={(e) => set("case_type", e.target.value)}>
            {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Filing date">
          <Input type="date" value={form.filing_date} onChange={(e) => set("filing_date", e.target.value)} />
        </Field>
        <Field label="Court" className="sm:col-span-2">
          <Input value={form.court} onChange={(e) => set("court", e.target.value)} />
        </Field>
        <Field label="Presiding officer">
          <Input value={form.judge} onChange={(e) => set("judge", e.target.value)} />
        </Field>
        <Field label="Opposite party">
          <Input value={form.opposing_party} onChange={(e) => set("opposing_party", e.target.value)} />
        </Field>
        <Field label="Agreed fee (₹)">
          <Input inputMode="numeric" className="tabular" value={String(form.fee_agreed || "")} onChange={(e) => set("fee_agreed", Number(e.target.value.replace(/[^\d]/g, "")) || 0)} />
        </Field>
        <Field label="Brief facts" className="sm:col-span-2">
          <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
      </form>
    </SheetContent>
  )
}
