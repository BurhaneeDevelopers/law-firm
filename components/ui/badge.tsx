import { Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { caseStatusTone, caseTypeTone, toneClasses, toneSolid, type Tone } from "@/lib/constants"
import { getCountdownLabel, getCountdownTone } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  tone?: Tone
  className?: string
  /** Legacy prop name kept for older call sites. */
  variant?: "default" | "success" | "danger" | "warning" | "info"
}

const legacyVariant: Record<NonNullable<BadgeProps["variant"]>, Tone> = {
  default: "neutral",
  success: "success",
  danger: "danger",
  warning: "warning",
  info: "info",
}

export function Badge({ children, tone, variant, className }: BadgeProps) {
  const t = tone ?? (variant ? legacyVariant[variant] : "neutral")
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-md px-2 text-xs font-medium ring-1 ring-inset",
        "[&_svg]:size-3",
        toneClasses[t],
        className
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge tone={caseStatusTone[status] ?? "neutral"} className={className}>
      {status}
    </Badge>
  )
}

/** Case type shown as a colour-coded marker plus label. Colour carries the category. */
export function CaseTypeTag({ type, className }: { type: string; className?: string }) {
  const tone = caseTypeTone[type] ?? "neutral"
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground", className)}>
      <span aria-hidden className={cn("size-2 rounded-[3px]", toneSolid[tone])} />
      {type}
    </span>
  )
}

export function UrgentBadge({ className }: { className?: string }) {
  return (
    <Badge tone="danger" className={className}>
      <Flag /> Urgent
    </Badge>
  )
}

export function CountdownBadge({ days, className }: { days: number; className?: string }) {
  return (
    <Badge tone={getCountdownTone(days)} className={cn("tabular", className)}>
      {getCountdownLabel(days)}
    </Badge>
  )
}
