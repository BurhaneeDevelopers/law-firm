import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-surface shadow-xs", className)}
      {...props}
    />
  )
}

interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  divider?: boolean
}

export function CardHeader({ title, description, icon, action, divider = false, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 px-5 pt-4",
        divider ? "border-b border-border pb-3.5" : "pb-1",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {icon && <span className="mt-0.5 text-muted-foreground [&_svg]:size-[18px]">{icon}</span>}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-1.5">{action}</div>}
    </div>
  )
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />
}

/** Label/value row used in detail panels. */
export function DetailRow({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-2 text-[13px]", className)}>
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-foreground">{children}</dd>
    </div>
  )
}
