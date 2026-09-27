"use client"
import { useState } from "react"
import { addDays } from "date-fns"
import { Gavel } from "lucide-react"
import { Dialog, SheetContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { useToast } from "@/components/ui/toast"
import { WhatsAppMenu } from "./whatsapp-menu"
import { HEARING_OUTCOMES, HEARING_PURPOSES } from "@/lib/constants"
import { cn, formatDate, formatTime, getDaysUntil, nextDateMessage, toDate, toISODate } from "@/lib/utils"
import { getCase, getClient, getDB, recordHearingOutcome, type Hearing } from "@/lib/store"

interface Props {
  hearing: Hearing | null
  onOpenChange: (open: boolean) => void
}

/**
 * After every appearance the advocate notes what happened and the next date the court gave.
 * One sheet does both, then offers to tell the client on WhatsApp.
 */
export function RecordOutcomeSheet({ hearing, onOpenChange }: Props) {
  return (
    <Dialog open={!!hearing} onOpenChange={onOpenChange}>
      {hearing && <RecordOutcomeBody key={hearing.id} hearing={hearing} onOpenChange={onOpenChange} />}
    </Dialog>
  )
}

/** Mounted per hearing, so the form always starts from that hearing's saved values. */
function RecordOutcomeBody({ hearing, onOpenChange }: { hearing: Hearing; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast()
  const [outcome, setOutcome] = useState<string>(hearing.outcome || HEARING_OUTCOMES[0].value)
  const [notes, setNotes] = useState(hearing.outcome_notes || "")
  const [nextDate, setNextDate] = useState("")
  const [nextTime, setNextTime] = useState(hearing.time || "10:00")
  const [nextPurpose, setNextPurpose] = useState(hearing.purpose)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState<{ outcome: string; nextDate?: string } | null>(null)

  const c = getCase(hearing.case_id)
  const client = c ? getClient(c.client_id) : undefined
  const needsNextDate = HEARING_OUTCOMES.find((o) => o.value === outcome)?.needsNextDate ?? false

  // Courts do not sit on Sundays, so shortcuts roll forward to Monday.
  const quickDates = [7, 14, 30, 60].map((d) => {
    const date = addDays(new Date(), d)
    return { label: `+${d} days`, value: toISODate(date.getDay() === 0 ? addDays(date, 1) : date) }
  })
  const isSunday = nextDate ? toDate(nextDate).getDay() === 0 : false

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (needsNextDate && !nextDate) {
      setError("Enter the next date given by the court")
      return
    }
    if (needsNextDate && getDaysUntil(nextDate) < 0) {
      setError("Next date cannot be in the past")
      return
    }
    recordHearingOutcome(hearing.id, {
      outcome,
      notes,
      nextDate: needsNextDate ? nextDate : undefined,
      nextTime,
      nextPurpose,
    })
    toast(needsNextDate ? `Next date ${formatDate(nextDate)} added to your diary` : "Outcome recorded", "success")
    setSaved({ outcome, nextDate: needsNextDate ? nextDate : undefined })
  }

  return (
    <SheetContent
      title="Record outcome"
      description={c ? `${c.case_number} · ${formatDate(hearing.date, "dd MMM")}, ${formatTime(hearing.time)}` : undefined}
      footer={
        saved ? (
          <Button variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" form="record-outcome-form">
              <Gavel /> Save outcome
            </Button>
          </>
        )
      }
    >
      {saved ? (
        <div className="space-y-4 animate-rise">
          <div className="rounded-xl bg-success-soft p-4 text-success-soft-foreground">
            <p className="text-sm font-semibold">Diary updated</p>
            <p className="mt-1 text-[13px]">
              {saved.outcome}
              {saved.nextDate ? `. Next date ${formatDate(saved.nextDate, "EEEE, dd MMM yyyy")}.` : "."}
            </p>
          </div>
          {client && c && (
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-medium text-foreground">Inform {client.full_name}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Send the outcome and next date to the client.</p>
              <WhatsAppMenu
                className="mt-3"
                label="Send update"
                phone={client.phone}
                preferred={client.preferred_language}
                message={(lang) =>
                  nextDateMessage(
                    { clientName: client.full_name, caseNumber: c.case_number, outcome: saved.outcome, nextDate: saved.nextDate, lawyerName: getDB().lawyer.name },
                    lang
                  )
                }
              />
            </div>
          )}
        </div>
      ) : (
        <form id="record-outcome-form" onSubmit={submit} className="space-y-5">
          {c && (
            <div className="rounded-xl bg-surface-2 px-3.5 py-3">
              <p className="text-sm font-medium text-foreground">{c.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {hearing.court_room}
                {hearing.item_no ? ` · Item ${hearing.item_no}` : ""} · {hearing.purpose}
              </p>
            </div>
          )}

          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-foreground">What happened?</legend>
            <div className="grid grid-cols-2 gap-2">
              {HEARING_OUTCOMES.map((o) => (
                <label
                  key={o.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-colors",
                    outcome === o.value
                      ? "border-primary bg-primary-soft text-primary-soft-foreground"
                      : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                  )}
                >
                  <input
                    type="radio"
                    name="outcome"
                    value={o.value}
                    checked={outcome === o.value}
                    onChange={() => { setOutcome(o.value); setError("") }}
                    className="sr-only"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>

          {needsNextDate && (
            <div className="space-y-3 rounded-xl border border-border p-4">
              <Field label="Next date" required error={error} hint={isSunday ? "This is a Sunday. Check the date on the order sheet." : nextDate ? formatDate(nextDate, "EEEE") : undefined}>
                <Input type="date" value={nextDate} min={toISODate(new Date())} onChange={(e) => { setNextDate(e.target.value); setError("") }} />
              </Field>
              <div className="flex flex-wrap gap-1.5">
                {quickDates.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => { setNextDate(q.value); setError("") }}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                      nextDate === q.value ? "border-primary bg-primary-soft text-primary-soft-foreground" : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Time">
                  <Input type="time" value={nextTime} onChange={(e) => setNextTime(e.target.value)} />
                </Field>
                <Field label="Listed for">
                  <Select value={nextPurpose} onChange={(e) => setNextPurpose(e.target.value)}>
                    {HEARING_PURPOSES.map((p) => <option key={p}>{p}</option>)}
                  </Select>
                </Field>
              </div>
            </div>
          )}

          <Field label="Proceedings / order notes" hint="What the court said, directions given, documents to file.">
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. PW-2 cross-examined. Prosecution sought time. Costs of ₹500 imposed." />
          </Field>
        </form>
      )}
    </SheetContent>
  )
}
