"use client"
import { CalendarPlus, IndianRupee, Receipt, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { DueRow } from "@/components/dues/due-row"
import { useDues } from "@/components/dues/dues-context"
import { cn, formatDate, formatINR } from "@/lib/utils"
import { deletePayment, getCaseDueInfos, getCaseFees, getUnscheduledBalance, isOpenDue, summariseDues, useDB, type Case } from "@/lib/store"

export function CaseFees({ caseData }: { caseData: Case }) {
  const db = useDB()
  const dues = useDues()
  const { toast } = useToast()
  const { confirm, dialogElement } = useConfirmDialog()

  const fees = getCaseFees(caseData.id, db)
  const infos = getCaseDueInfos(caseData.id, db)
  const summary = summariseDues(infos)
  const unscheduled = getUnscheduledBalance(caseData.id, db)
  const open = infos.filter(isOpenDue).sort((a, b) => b.daysOverdue - a.daysOverdue || a.due.due_date.localeCompare(b.due.due_date))
  const settled = infos.filter((i) => !isOpenDue(i))
  const payments = db.payments.filter((p) => p.case_id === caseData.id).sort((a, b) => b.date.localeCompare(a.date))
  const dueName = (id: string) => db.dues.find((d) => d.id === id)?.description

  return (
    <div className="space-y-6">
      {dialogElement}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {[
          { label: "Agreed", value: fees.agreed, cls: "text-foreground" },
          { label: "Received", value: fees.received, cls: "text-success-soft-foreground" },
          { label: "Overdue", value: summary.overdueBalance, cls: summary.overdueBalance ? "text-danger-soft-foreground" : "text-foreground", hint: summary.maxDaysOverdue ? `${summary.maxDaysOverdue} days late` : undefined },
          { label: "Balance", value: fees.balance, cls: fees.balance ? "text-warning-soft-foreground" : "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-surface px-4 py-3">
            <dt className="text-xs text-muted-foreground">{s.label}</dt>
            <dd className={cn("tabular mt-1 text-lg font-semibold", s.cls)}>{formatINR(s.value)}</dd>
            {s.hint && <dd className="text-xs text-danger-soft-foreground/80">{s.hint}</dd>}
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => dues.recordPayment({ caseId: caseData.id })}><IndianRupee /> Record payment</Button>
        <Button size="sm" variant="outline" onClick={() => dues.addDue({ caseId: caseData.id })}><CalendarPlus /> Add due</Button>
      </div>

      {unscheduled > 0 && (
        <div className="flex flex-col gap-2 rounded-xl bg-accent-soft px-4 py-3 text-[13px] text-accent-soft-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{formatINR(unscheduled)} of the agreed fee has no due date, so you will not be reminded about it.</span>
          <Button size="xs" variant="outline" onClick={() => dues.addDue({ caseId: caseData.id, amount: unscheduled, description: "Balance fee" })}>Schedule it</Button>
        </div>
      )}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Payment schedule</h3>
        {infos.length === 0 ? (
          <EmptyState compact icon={CalendarPlus} title="No dues scheduled" description="Add when the client should pay each part of the fee. You will get alerts and an email on the day." />
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border">
            {[...open, ...settled].map((i) => <DueRow key={i.due.id} info={i} />)}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Money received</h3>
        {payments.length === 0 ? (
          <EmptyState compact icon={Receipt} title="No payments recorded" />
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="tabular text-sm font-semibold text-foreground">{formatINR(p.amount)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(p.date)} · {p.mode}
                    {p.reference ? ` · ${p.reference}` : ""}
                    {p.due_id ? ` · for ${dueName(p.due_id) ?? "a deleted due"}` : " · advance"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete payment"
                  onClick={() =>
                    confirm("Delete this payment?", `${formatINR(p.amount)} received on ${formatDate(p.date)} will be removed. Any due it paid becomes pending again.`, () => {
                      deletePayment(p.id)
                      toast("Payment removed", "success")
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
