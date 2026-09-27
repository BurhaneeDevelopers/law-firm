"use client"
import { useState } from "react"
import { addDays, addMonths, endOfMonth } from "date-fns"
import { CalendarClock, HandCoins } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, Input, Textarea } from "@/components/ui/field"
import { Chip } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { formatDate, formatINR, getDaysUntil, toISODate } from "@/lib/utils"
import { getDueInfo, rescheduleDue, useDB, waiveDue } from "@/lib/store"

export function RescheduleDialog({ dueId, onClose }: { dueId: string | null; onClose: () => void }) {
  return (
    <Dialog open={!!dueId} onOpenChange={(o) => !o && onClose()}>
      {dueId && <RescheduleBody dueId={dueId} onClose={onClose} />}
    </Dialog>
  )
}

function RescheduleBody({ dueId, onClose }: { dueId: string; onClose: () => void }) {
  const db = useDB()
  const { toast } = useToast()
  const due = db.dues.find((d) => d.id === dueId)
  const [date, setDate] = useState(toISODate(addDays(new Date(), 7)))
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  if (!due) return null
  const info = getDueInfo(due, db)

  const quick = [
    { label: "In 3 days", value: toISODate(addDays(new Date(), 3)) },
    { label: "In 7 days", value: toISODate(addDays(new Date(), 7)) },
    { label: "In 15 days", value: toISODate(addDays(new Date(), 15)) },
    { label: "Month end", value: toISODate(endOfMonth(new Date())) },
    { label: "In 1 month", value: toISODate(addMonths(new Date(), 1)) },
  ]

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return setError("Pick the new date")
    if (getDaysUntil(date) < 0) return setError("Pick today or a later date")
    rescheduleDue(dueId, date, reason.trim())
    toast(`Moved to ${formatDate(date, "dd MMM")}. You will be alerted on that day.`, "success")
    onClose()
  }

  return (
    <DialogContent
      title="Change due date"
      description={`${due.description} · ${formatINR(info.balance)} pending`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="reschedule-form"><CalendarClock /> Move date</Button>
        </>
      }
    >
      <form id="reschedule-form" onSubmit={submit} className="space-y-4">
        {due.original_due_date && (
          <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning-soft-foreground">
            Originally due on {formatDate(due.original_due_date)}. This date has been moved before.
          </p>
        )}
        <Field label="New date" required error={error} hint={date ? formatDate(date, "EEEE") : undefined}>
          <Input type="date" value={date} min={toISODate(new Date())} onChange={(e) => { setDate(e.target.value); setError("") }} autoFocus />
        </Field>
        <div className="-mt-2 flex flex-wrap gap-1.5">
          {quick.map((q) => <Chip key={q.label} className="h-7 text-xs" active={date === q.value} onClick={() => setDate(q.value)}>{q.label}</Chip>)}
        </div>
        <Field label="Reason" hint="Saved in the due's notes">
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Client promised to pay after salary / harvest" />
        </Field>
      </form>
    </DialogContent>
  )
}

export function WaiveDialog({ dueId, onClose }: { dueId: string | null; onClose: () => void }) {
  return (
    <Dialog open={!!dueId} onOpenChange={(o) => !o && onClose()}>
      {dueId && <WaiveBody dueId={dueId} onClose={onClose} />}
    </Dialog>
  )
}

function WaiveBody({ dueId, onClose }: { dueId: string; onClose: () => void }) {
  const db = useDB()
  const { toast } = useToast()
  const due = db.dues.find((d) => d.id === dueId)
  const [reason, setReason] = useState("")
  if (!due) return null
  const info = getDueInfo(due, db)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    waiveDue(dueId, reason.trim() || "Waived")
    toast(`${formatINR(info.balance)} waived. It no longer counts as outstanding.`, "success")
    onClose()
  }

  return (
    <DialogContent
      title="Waive this fee?"
      description={`${due.description} · ${formatINR(info.balance)}${info.paid ? ` (after ${formatINR(info.paid)} received)` : ""}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="waive-form" variant="danger"><HandCoins /> Waive {formatINR(info.balance)}</Button>
        </>
      }
    >
      <form id="waive-form" onSubmit={submit} className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Use this for pro bono work, courtesy waivers or amounts you will not collect. You can undo it later from the due&apos;s menu.
        </p>
        <Field label="Reason">
          <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Courtesy for an old client" autoFocus />
        </Field>
      </form>
    </DialogContent>
  )
}
