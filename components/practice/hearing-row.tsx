"use client"
import Link from "next/link"
import { CircleCheck, Gavel, Phone } from "lucide-react"
import { Badge, UrgentBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WhatsAppMenu } from "./whatsapp-menu"
import { purposeTone } from "@/lib/constants"
import { cn, formatTime, getDaysUntil, hearingReminderMessage, timeToMinutes } from "@/lib/utils"
import { getDB, updateHearing, type Case, type Client, type Hearing } from "@/lib/store"

interface HearingRowProps {
  hearing: Hearing
  caseData?: Case
  client?: Client
  onRecordOutcome?: (h: Hearing) => void
  /** Stack actions under the details for narrow side panels. */
  compact?: boolean
  className?: string
}

/** One line in the court diary: time, matter, where, and what to do next. */
export function HearingRow({ hearing, caseData, client, onRecordOutcome, compact, className }: HearingRowProps) {
  const days = getDaysUntil(hearing.date)
  const isToday = days === 0
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()
  const isPast = days < 0 || (isToday && timeToMinutes(hearing.time) + 60 < nowMinutes)
  const done = Boolean(hearing.outcome)

  return (
    <div
      className={cn(
        "group grid grid-cols-[64px_1fr] gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-surface-2/60",
        !compact && "sm:grid-cols-[72px_1fr_auto]",
        className
      )}
    >
      <div className="pt-0.5">
        <p className={cn("tabular text-sm font-semibold", done ? "text-subtle-foreground line-through decoration-1" : "text-foreground")}>
          {formatTime(hearing.time)}
        </p>
        {hearing.item_no && <p className="tabular mt-0.5 text-xs text-subtle-foreground">Item {hearing.item_no}</p>}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={purposeTone[hearing.purpose] ?? "neutral"}>{hearing.purpose}</Badge>
          {caseData?.priority === "Urgent" && <UrgentBadge />}
          {done && (
            <Badge tone="success">
              <CircleCheck /> {hearing.outcome}
            </Badge>
          )}
        </div>
        {caseData ? (
          <Link href={`/cases/${caseData.id}`} className={cn("mt-1.5 block text-sm font-medium text-foreground hover:text-primary", compact ? "line-clamp-2" : "truncate")}>
            {caseData.title}
          </Link>
        ) : (
          <p className="mt-1.5 text-sm font-medium text-foreground">Case removed</p>
        )}
        <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
          <span className="font-mono text-xs">{caseData?.case_number}</span>
          {client && <> · {client.full_name}</>} · {hearing.court_room}
        </p>
      </div>

      <div className={cn("col-span-2 flex flex-wrap items-center gap-1.5", compact ? "col-start-2 col-span-1" : "sm:col-span-1 sm:justify-end")}>
        {client && !isPast && (
          <WhatsAppMenu
            size="xs"
            variant={hearing.reminder_sent ? "outline" : "whatsapp"}
            label={hearing.reminder_sent ? "Remind again" : "Remind"}
            phone={client.phone}
            preferred={client.preferred_language}
            onSent={() => updateHearing(hearing.id, { reminder_sent: true })}
            message={(lang) =>
              hearingReminderMessage(
                {
                  clientName: client.full_name,
                  caseNumber: caseData?.case_number ?? "",
                  date: hearing.date,
                  time: hearing.time,
                  court: hearing.court_room,
                  lawyerName: getDB().lawyer.name,
                },
                lang
              )
            }
          />
        )}
        {client && (
          <Button asChild size="icon-xs" variant="outline" aria-label={`Call ${client.full_name}`}>
            <a href={`tel:${client.phone.replace(/\s/g, "")}`}><Phone /></a>
          </Button>
        )}
        {onRecordOutcome && (isPast || isToday) && (
          <Button size="xs" variant={done ? "ghost" : "soft"} onClick={() => onRecordOutcome(hearing)}>
            <Gavel /> {done ? "Edit outcome" : "Record outcome"}
          </Button>
        )}
      </div>
    </div>
  )
}
