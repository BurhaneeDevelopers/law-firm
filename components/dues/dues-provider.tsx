"use client"
import { useCallback, useMemo, useState } from "react"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatINR } from "@/lib/utils"
import { deleteDue, deletePayments, getDB, getDueInfo, markDuePaid, reopenDue } from "@/lib/store"
import { DueFormDialog, type DueFormTarget } from "./due-form-dialog"
import { PaymentDialog, type PaymentTarget } from "./payment-dialog"
import { RescheduleDialog, WaiveDialog } from "./reschedule-waive-dialogs"
import { DuesSheet, type DuesSheetTarget } from "./dues-sheet"
import { DuesContext, type DuesActions } from "./dues-context"

export { useDues } from "./dues-context"

/** Hosts every dues dialog once, so any screen can open them without extra wiring. */
export function DuesProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const { confirm, dialogElement } = useConfirmDialog()
  const [dueForm, setDueForm] = useState<DueFormTarget | null>(null)
  const [payment, setPayment] = useState<PaymentTarget | null>(null)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [waiveId, setWaiveId] = useState<string | null>(null)
  const [sheet, setSheet] = useState<DuesSheetTarget | null>(null)

  const markPaid = useCallback(
    (dueId: string) => {
      const due = getDB().dues.find((d) => d.id === dueId)
      if (!due) return
      const balance = getDueInfo(due).balance
      const ids = markDuePaid(dueId)
      if (!ids.length) return
      toast(`${formatINR(balance)} marked as received (UPI, today)`, "success", {
        label: "Undo",
        onClick: () => {
          deletePayments(ids)
          toast("Payment removed", "info")
        },
      })
    },
    [toast]
  )

  const reopen = useCallback(
    (dueId: string) => {
      const due = getDB().dues.find((d) => d.id === dueId)
      if (!due) return
      const info = getDueInfo(due)
      if (info.status === "Waived") {
        reopenDue(dueId)
        toast("Waiver removed. The fee is due again.", "success")
        return
      }
      confirm(
        "Mark as unpaid?",
        `Payments of ${formatINR(info.paid)} recorded against "${due.description}" will be removed from the ledger. Use this if a cheque bounced or the entry was a mistake.`,
        () => {
          reopenDue(dueId)
          toast("Marked as unpaid", "success")
        },
        "Mark unpaid"
      )
    },
    [confirm, toast]
  )

  const remove = useCallback(
    (dueId: string) => {
      const due = getDB().dues.find((d) => d.id === dueId)
      if (!due) return
      confirm(
        "Delete this due?",
        `"${due.description}" (${formatINR(due.amount)}) will be removed from the schedule. Money already received stays in the fee ledger.`,
        () => {
          deleteDue(dueId)
          toast("Due deleted", "success")
        },
        "Delete due"
      )
    },
    [confirm, toast]
  )

  const value = useMemo<DuesActions>(
    () => ({
      addDue: (target) => setDueForm(target ?? {}),
      editDue: (dueId) => setDueForm({ dueId }),
      recordPayment: (target) => setPayment(target ?? {}),
      reschedule: setRescheduleId,
      waive: setWaiveId,
      openDues: setSheet,
      markPaid,
      reopen,
      remove,
    }),
    [markPaid, reopen, remove]
  )

  return (
    <DuesContext.Provider value={value}>
      {children}
      {dialogElement}
      <DuesSheet target={sheet} onClose={() => setSheet(null)} />
      <DueFormDialog target={dueForm} onClose={() => setDueForm(null)} />
      <PaymentDialog target={payment} onClose={() => setPayment(null)} />
      <RescheduleDialog dueId={rescheduleId} onClose={() => setRescheduleId(null)} />
      <WaiveDialog dueId={waiveId} onClose={() => setWaiveId(null)} />
    </DuesContext.Provider>
  )
}
