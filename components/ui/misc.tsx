"use client"
import Link from "next/link"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { ArrowLeft } from "lucide-react"
import { cn, getAvatarTone, getInitials } from "@/lib/utils"
import { toneClasses } from "@/lib/constants"

// ---- Page header -------------------------------------------------------------

interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  back?: { href: string; label: string }
  className?: string
}

export function PageHeader({ title, description, actions, back, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-2 inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> {back.label}
          </Link>
        )}
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-[65ch] text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

// ---- Empty state -------------------------------------------------------------

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({ icon: Icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "px-4 py-8" : "px-6 py-14", className)}>
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-surface-2 text-subtle-foreground">
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-[42ch] text-[13px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ---- Avatar ------------------------------------------------------------------

const avatarSizes = {
  xs: "size-6 rounded-md text-[10px]",
  sm: "size-8 rounded-lg text-xs",
  md: "size-10 rounded-xl text-sm",
  lg: "size-14 rounded-2xl text-lg",
}

export function Avatar({ name, size = "sm", className }: { name: string; size?: keyof typeof avatarSizes; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold ring-1 ring-inset",
        toneClasses[getAvatarTone(name)],
        avatarSizes[size],
        className
      )}
    >
      {getInitials(name)}
    </span>
  )
}

// ---- Segmented control -------------------------------------------------------

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: React.ReactNode; icon?: React.ReactNode; title?: string }[]
  className?: string
  size?: "sm" | "md"
  ariaLabel: string
}

export function Segmented<T extends string>({ value, onChange, options, className, size = "md", ariaLabel }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("inline-flex rounded-[10px] bg-surface-2 p-0.5", className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all [&_svg]:size-4",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
              active ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o.icon}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ---- Filter chips ------------------------------------------------------------

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  count?: number
}

export function Chip({ active, count, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors [&_svg]:size-3.5",
        active
          ? "border-primary/30 bg-primary-soft text-primary-soft-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined && <span className="tabular text-xs opacity-70">{count}</span>}
    </button>
  )
}

// ---- Switch ------------------------------------------------------------------

export function Switch({ className, ...props }: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-surface-3 transition-colors",
        "data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  )
}

// ---- Tooltip -----------------------------------------------------------------

export function Tooltip({ content, children, side = "right" }: { content: React.ReactNode; children: React.ReactNode; side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <TooltipPrimitive.Root delayDuration={200}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={8}
          className="z-(--z-toast) rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-md animate-fade-in"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export const TooltipProvider = TooltipPrimitive.Provider

// ---- Keyboard hint -----------------------------------------------------------

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface px-1 font-mono text-[10px] font-medium text-subtle-foreground",
        className
      )}
    >
      {children}
    </kbd>
  )
}

// ---- Stat tile ---------------------------------------------------------------

interface StatProps {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  href?: string
  tone?: "primary" | "danger" | "warning" | "success" | "neutral"
}

const statIconTone = {
  primary: "bg-primary-soft text-primary-soft-foreground",
  danger: "bg-danger-soft text-danger-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  success: "bg-success-soft text-success-soft-foreground",
  neutral: "bg-surface-2 text-muted-foreground",
}

export function Stat({ label, value, hint, icon: Icon, href, tone = "neutral" }: StatProps) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <span className={cn("flex size-8 items-center justify-center rounded-lg", statIconTone[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="tabular mt-2 text-[26px] font-semibold leading-none tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-2 truncate text-xs text-subtle-foreground">{hint}</p>}
    </>
  )
  const cls =
    "block rounded-2xl border border-border bg-surface p-4 shadow-xs transition-[border-color,box-shadow,transform] duration-200 ease-out-soft"
  return href ? (
    <Link href={href} className={cn(cls, "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
