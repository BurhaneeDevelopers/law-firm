"use client"
import { createContext, useContext } from "react"
import type { DueFormTarget } from "./due-form-dialog"
import type { PaymentTarget } from "./payment-dialog"
import type { DuesSheetTarget } from "./dues-sheet"

export type DuesActions = {
  addDue: (target?: DueFormTarget) => void
  editDue: (dueId: string) => void
  recordPayment: (target?: PaymentTarget) => void
  reschedule: (dueId: string) => void
  waive: (dueId: string) => void
  openDues: (target: DuesSheetTarget) => void
  /** One tap: records the full balance as received today by UPI, with Undo. */
  markPaid: (dueId: string) => void
  reopen: (dueId: string) => void
  remove: (dueId: string) => void
}

export const DuesContext = createContext<DuesActions | null>(null)

export function useDues() {
  const ctx = useContext(DuesContext)
  if (!ctx) throw new Error("useDues must be used inside DuesProvider")
  return ctx
}
