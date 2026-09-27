"use client"
import { useState } from "react"
import Link from "next/link"
import { ChevronDown, IndianRupee, Plus, Receipt } from "lucide-react"
import { Dialog, SheetContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/misc"
import { cn, formatINR } from "@/lib/utils"
import { getCaseDueInfos, getCaseFees, getClientDueInfos, getClientFees, getUnscheduledBalance, isOpenDue, summariseDues, useDB } from "@/lib/store"
import { DueRow } from "./due-row"
import { useDues } from "./dues-context"

export type DuesSheetTarget = { caseId?: string; clientId?: string }

/** Everything about what a client owes, opened straight from a table row. */
export function DuesSheet({ target, onClose }: { target: DuesSheetTarget | null; onClose: () => void }) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      {target && <DuesSheetBody target={target} onClose={onClose} />}
    </Dialog>
  )
}

function DuesSheetBody({ target, onClose }: { target: DuesSheetTarget; onClose: () => void }) {
  const db = useDB()
  const dues = useDues()
  const [showSettled, setShowSettled] = useState(false)

  const caseData = target.caseId ? db.cases.find((c) => c.id === target.caseId) : undefined
  const clientId = target.clientId ?? caseData?.client_id
  const client = clientId ? db.clients.find((c) => c.id === clientId) : undefined
  const infos = target.caseId ? getCaseDueInfos(target.caseId, db) : clientId ? getClientDueInfos(clientId, db) : []
  const open = infos.filter(isOpenDue).sort((a, b) => b.daysOverdue - a.daysOverdue || a.due.due_date.localeCompare(b.due.due_date))
  const settled = infos.filter((i) => !isOpenDue(i))
  const summary = summariseDues(infos)
  const fees = target.caseId ? getCaseFees(target.caseId, db) : clientId ? getClientFees(clientId, db) : { agreed: 0, received: 0, balance: 0 }
  const unscheduled = target.caseId ? getUnscheduledBalance(target.caseId, db) : 0

  return (
    <SheetContent
      title={target.caseId ? `Dues · ${caseData?.case_number ?? ""}` : `Dues · ${client?.full_name ?? ""}`}
      description={target.caseId ? `${client?.full_name ?? "No client"} · ${caseData?.title ?? ""}` : `${client?.phone ?? ""} · ${db.cases.filter((c) => c.client_id === clientId).length} cases`}
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={() => dues.addDue({ caseId: target.caseId, clientId: target.caseId ? undefined : clientId })}>
            <Plus /> Add due
          </Button>
          <Button onClick={() => dues.recordPayment({ caseId: target.caseId, clientId: target.caseId ? undefined : clientId })}>
            <IndianRupee /> Record payment
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <dl className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border">
          <div className="px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">Overdue</dt>
            <dd className={cn("tabular mt-0.5 text-base font-semibold", summary.overdueBalance ? "text-danger-soft-foreground" : "text-foreground")}>{formatINR(summary.overdueBalance)}</dd>
            {summary.maxDaysOverdue > 0 && <dd className="text-xs text-danger-soft-foreground/80">{summary.maxDaysOverdue} days late</dd>}
          </div>
          <div className="px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">Still to come</dt>
            <dd className="tabular mt-0.5 text-base font-semibold text-foreground">{formatINR(summary.openBalance - summary.overdueBalance)}</dd>
          </div>
          <div className="px-3 py-2.5">
            <dt className="text-xs text-muted-foreground">Received</dt>
            <dd className="tabular mt-0.5 text-base font-semibold text-success-soft-foreground">{formatINR(fees.received)}</dd>
            <dd className="tabular text-xs text-subtle-foreground">of {formatINR(fees.agreed)} agreed</dd>
          </div>
        </dl>

        {unscheduled > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-accent-soft px-4 py-3 text-[13px] text-accent-soft-foreground">
            <span>{formatINR(unscheduled)} of the agreed fee has no due date yet.</span>
            <Button size="xs" variant="outline" onClick={() => dues.addDue({ caseId: target.caseId, amount: unscheduled, description: "Balance fee" })}>Schedule it</Button>
          </div>
        )}

        {open.length === 0 ? (
          <EmptyState compact icon={Receipt} title="Nothing pending" description="Add a due to get reminded when the client should pay." />
        ) : (
          <section>
            <h3 className="mb-2 text-xs font-medium text-subtle-foreground">Pending · {open.length}</h3>
            <div className="divide-y divide-border rounded-xl border border-border">
              {open.map((i) => <DueRow key={i.due.id} info={i} showCase={!target.caseId} />)}
            </div>
          </section>
        )}

        {settled.length > 0 && (
          <section>
            <button type="button" onClick={() => setShowSettled((s) => !s)} className="mb-2 flex items-center gap-1 text-xs font-medium text-subtle-foreground hover:text-foreground">
              <ChevronDown className={cn("size-3.5 transition-transform", !showSettled && "-rotate-90")} /> Paid and waived · {settled.length}
            </button>
            {showSettled && (
              <div className="divide-y divide-border rounded-xl border border-border animate-fade-in">
                {settled.map((i) => <DueRow key={i.due.id} info={i} showCase={!target.caseId} />)}
              </div>
            )}
          </section>
        )}

        <Link
          href={target.caseId ? `/cases/${target.caseId}?tab=fees` : `/clients/${clientId}?tab=dues`}
          onClick={onClose}
          className="block text-center text-[13px] font-medium text-primary hover:underline"
        >
          Open full {target.caseId ? "case" : "client"} page
        </Link>
      </div>
    </SheetContent>
  )
}
