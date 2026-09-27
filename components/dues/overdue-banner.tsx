"use client"
import { Check, IndianRupee, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatINR } from "@/lib/utils"

interface OverdueBannerProps {
  amount: number
  days: number
  /** What is overdue, e.g. "Second instalment" or "3 dues". */
  label: string
  onMarkPaid?: () => void
  onRecord: () => void
  onView: () => void
}

/** Shown at the top of case and client pages so pending money is never missed. */
export function OverdueBanner({ amount, days, label, onMarkPaid, onRecord, onView }: OverdueBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-danger/25 bg-danger-soft px-4 py-3.5 sm:flex-row sm:items-center">
      <TriangleAlert className="size-5 shrink-0 text-danger" />
      <p className="flex-1 text-sm text-danger-soft-foreground">
        <span className="font-semibold">{formatINR(amount)} overdue</span> for {days} {days === 1 ? "day" : "days"} ({label}).
      </p>
      <div className="flex flex-wrap gap-2">
        {onMarkPaid && <Button size="sm" variant="outline" onClick={onMarkPaid}><Check /> Mark paid</Button>}
        <Button size="sm" variant="outline" onClick={onRecord}><IndianRupee /> Record payment</Button>
        <Button size="sm" variant="ghost" onClick={onView}>View dues</Button>
      </div>
    </div>
  )
}
