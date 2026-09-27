"use client"
import Link from "next/link"
import { CalendarClock, Check, Ellipsis, HandCoins, IndianRupee, Pencil, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown"
import { WhatsAppMenu } from "@/components/practice/whatsapp-menu"
import { cn, formatDate, formatINR, formatRelativeTime, paymentReminderMessage } from "@/lib/utils"
import { getDB, isOpenDue, logDueReminder, type Case, type Client, type DueInfo } from "@/lib/store"
import { DueStatusBadge } from "./due-badge"
import { useDues } from "./dues-context"

/** Mark paid, remind, and a menu with every other change. Shared by lists, tables and alerts. */
export function DueActions({ info, client, caseData, size = "xs" }: { info: DueInfo; client?: Client; caseData?: Case; size?: "xs" | "sm" }) {
  const dues = useDues()
  const open = isOpenDue(info)
  const iconSize = size === "xs" ? "icon-xs" : "icon-sm"

  return (
    <div className="flex items-center gap-1.5">
      {open && (
        <Button size={size} variant="soft" onClick={() => dues.markPaid(info.due.id)} title="Record the full balance as received today">
          <Check /> Mark paid
        </Button>
      )}
      {open && client && (
        <WhatsAppMenu
          size={iconSize}
          variant="outline"
          label=""
          phone={client.phone}
          preferred={client.preferred_language}
          onSent={() => logDueReminder(info.due.id)}
          message={(lang) =>
            paymentReminderMessage(
              {
                clientName: client.full_name,
                amount: info.balance,
                description: info.due.description,
                caseNumber: caseData?.case_number ?? "",
                dueDate: info.due.due_date,
                daysOverdue: info.daysOverdue,
                upiId: getDB().lawyer.upi_id,
                lawyerName: getDB().lawyer.name,
              },
              lang
            )
          }
        />
      )}
      <Dropdown>
        <DropdownTrigger asChild>
          <Button variant="ghost" size={iconSize} aria-label={`More actions for ${info.due.description}`}><Ellipsis /></Button>
        </DropdownTrigger>
        <DropdownContent className="w-52">
          {open && (
            <>
              <DropdownItem onSelect={() => dues.recordPayment({ dueId: info.due.id })}><IndianRupee /> Record part payment</DropdownItem>
              <DropdownItem onSelect={() => dues.reschedule(info.due.id)}><CalendarClock /> Change due date</DropdownItem>
            </>
          )}
          <DropdownItem onSelect={() => dues.editDue(info.due.id)}><Pencil /> Edit</DropdownItem>
          {open && <DropdownItem onSelect={() => dues.waive(info.due.id)}><HandCoins /> Waive</DropdownItem>}
          {(info.status === "Paid" || info.status === "Waived" || info.partial) && (
            <DropdownItem onSelect={() => dues.reopen(info.due.id)}><RotateCcw /> {info.status === "Waived" ? "Remove waiver" : "Mark unpaid"}</DropdownItem>
          )}
          <DropdownSeparator />
          <DropdownItem onSelect={() => dues.remove(info.due.id)} className="text-danger-soft-foreground [&_svg]:text-danger"><Trash2 /> Delete</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  )
}

interface DueRowProps {
  info: DueInfo
  /** Show the case number (client view, dues page). */
  showCase?: boolean
  showClient?: boolean
  className?: string
}

export function DueRow({ info, showCase, showClient, className }: DueRowProps) {
  const db = getDB()
  const caseData = db.cases.find((c) => c.id === info.due.case_id)
  const client = caseData ? db.clients.find((c) => c.id === caseData.client_id) : undefined
  const settled = info.status === "Paid" || info.status === "Waived"

  return (
    <div className={cn("flex flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center", settled && "opacity-75", className)}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate text-sm font-medium text-foreground">{info.due.description}</p>
          <DueStatusBadge info={info} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {showClient && client && <>{client.full_name} · </>}
          {showCase && caseData && (
            <>
              <Link href={`/cases/${caseData.id}`} className="font-mono hover:text-primary">{caseData.case_number}</Link> ·{" "}
            </>
          )}
          Due {formatDate(info.due.due_date)}
          {info.due.original_due_date && ` (moved from ${formatDate(info.due.original_due_date, "dd MMM")})`}
          {info.paid > 0 && ` · ${formatINR(info.paid)} received`}
          {info.due.reminder_count > 0 && !settled && ` · reminded ${info.due.reminder_count}x, last ${formatRelativeTime(info.due.last_reminded_at)}`}
          {info.status === "Waived" && info.due.waive_reason && ` · ${info.due.waive_reason}`}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="text-right">
          <p className={cn("tabular text-sm font-semibold", info.status === "Overdue" ? "text-danger-soft-foreground" : "text-foreground")}>
            {formatINR(settled ? info.due.amount : info.balance)}
          </p>
          {info.partial && <p className="tabular text-xs text-subtle-foreground">of {formatINR(info.due.amount)}</p>}
        </div>
        <DueActions info={info} client={client} caseData={caseData} />
      </div>
    </div>
  )
}
