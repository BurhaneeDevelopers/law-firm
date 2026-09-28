"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Menu, PanelLeftClose, PanelLeftOpen, Scale, X } from "lucide-react"
import { cn, todayISO } from "@/lib/utils"
import { DEVELOPER_CREDIT, OPEN_STATUSES } from "@/lib/constants"
import { getOverdueSummary, useDB, type DB } from "@/lib/store"
import { useHydrated } from "@/lib/use-hydrated"
import { useStoredValue } from "@/lib/use-stored-value"
import { SIDEBAR_STORAGE_KEY } from "@/lib/theme"
import { Avatar, Tooltip } from "@/components/ui/misc"
import { isActive, mobileTabs, navGroups, settingsItem, type NavItem } from "./nav-config"
import { QuickAddMenu } from "./quick-add"

function useCounts(db: DB) {
  const hydrated = useHydrated()
  if (!hydrated) return {} as Record<string, number>
  const today = todayISO()
  return {
    hearingsToday: db.hearings.filter((h) => h.date === today).length,
    urgentOpen: db.cases.filter((c) => c.priority === "Urgent" && OPEN_STATUSES.includes(c.status)).length,
    draftNotices: db.notices.filter((n) => n.status === "Draft").length,
    overdueDues: getOverdueSummary(db).overdueCount,
  } as Record<string, number>
}

function NavLink({ item, active, collapsed, count, onNavigate }: { item: NavItem; active: boolean; collapsed?: boolean; count?: number; onNavigate?: () => void }) {
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-[10px] px-2.5 text-sm font-medium transition-colors",
        active ? "bg-primary-soft text-primary-soft-foreground" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <item.icon className={cn("size-[18px] shrink-0", active ? "text-primary" : "text-subtle-foreground group-hover:text-foreground")} strokeWidth={1.9} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && count ? (
        <span
          className={cn(
            "tabular rounded-md px-1.5 text-[11px] font-semibold leading-5",
            item.countKey === "overdueDues" ? "bg-danger-soft text-danger-soft-foreground" : active ? "bg-primary/15" : "bg-surface-3 text-muted-foreground"
          )}
        >
          {count}
        </span>
      ) : null}
      {collapsed && count ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" aria-hidden /> : null}
    </Link>
  )
  return collapsed ? <Tooltip content={count ? `${item.label} (${count})` : item.label}>{link}</Tooltip> : link
}

function NavList({ pathname, collapsed, counts, onNavigate }: { pathname: string; collapsed?: boolean; counts: Record<string, number>; onNavigate?: () => void }) {
  return (
    <>
      {navGroups.map((group) => (
        <div key={group.label} className="mb-5">
          {!collapsed ? (
            <p className="mb-1.5 px-2.5 text-xs font-medium text-subtle-foreground">{group.label}</p>
          ) : (
            <div className="mx-auto mb-2 h-px w-6 bg-border" />
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(pathname, item.href)}
                collapsed={collapsed}
                count={item.countKey ? counts[item.countKey] : undefined}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

function Brand({ collapsed, firm }: { collapsed?: boolean; firm: string }) {
  return (
    <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5" aria-label="Go to Today">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Scale className="size-[18px]" strokeWidth={2} />
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold leading-tight text-foreground">{firm}</span>
          <span className="block text-xs text-subtle-foreground">VakilOS</span>
        </span>
      )}
    </Link>
  )
}

function UserCard({ collapsed, name, title, onNavigate }: { collapsed?: boolean; name: string; title: string; onNavigate?: () => void }) {
  return (
    <Link
      href="/settings"
      onClick={onNavigate}
      className={cn("flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-surface-2", collapsed && "justify-center")}
    >
      <Avatar name={name} size="sm" />
      {!collapsed && (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">Adv. {name}</span>
          <span className="block truncate text-xs text-subtle-foreground">{title}</span>
        </span>
      )}
    </Link>
  )
}

function Credit({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-[11px] font-medium text-subtle-foreground", className)}>
      Crafted with <span role="img" aria-label="love">❤️</span> by{" "}
      <a href={DEVELOPER_CREDIT.href} target="_blank" rel="noreferrer" className="font-semibold text-foreground hover:text-primary hover:underline">
        {DEVELOPER_CREDIT.label}
      </a>
    </p>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const db = useDB()
  const counts = useCounts(db)
  const [collapsedValue, setCollapsedValue] = useStoredValue(SIDEBAR_STORAGE_KEY, "0")
  const collapsed = collapsedValue === "1"
  const hydrated = useHydrated()
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    if (hydrated) document.documentElement.style.setProperty("--sidebar-width", collapsed ? "72px" : "248px")
  }, [collapsed, hydrated])

  const toggle = () => setCollapsedValue(collapsed ? "0" : "1")

  const { lawyer } = db

  return (
    <>
      {/* Desktop */}
      <aside
        aria-label="Main navigation"
        className={cn(
          // Width comes from --sidebar-width, which the <head> script sets before paint.
          "fixed inset-y-0 left-0 z-(--z-nav) hidden w-(--sidebar-width) flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-300 ease-out-soft md:flex"
        )}
      >
        <div className={cn("flex h-16 items-center gap-2 px-4", collapsed && "justify-center px-0")}>
          <Brand collapsed={collapsed} firm={lawyer.firm_name} />
        </div>

        <nav className={cn("flex-1 overflow-y-auto px-3 pt-2", collapsed && "px-3")}>
          <NavList pathname={pathname} collapsed={collapsed} counts={counts} />
        </nav>

        <div className="space-y-1 border-t border-border p-3">
          <NavLink item={settingsItem} active={isActive(pathname, settingsItem.href)} collapsed={collapsed} />
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-[10px] px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
            {!collapsed && "Collapse"}
          </button>
          <UserCard collapsed={collapsed} name={lawyer.name} title={lawyer.title} />
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-(--z-nav) border-t border-border bg-surface/95 backdrop-blur-md md:hidden"
      >
        <div className="grid grid-cols-5 items-end px-1 pb-safe pt-1.5">
          {mobileTabs.slice(0, 2).map((item) => (
            <MobileTab key={item.href} item={item} active={isActive(pathname, item.href)} count={item.href === "/calendar" ? counts.hearingsToday : undefined} />
          ))}
          <div className="flex justify-center pb-1">
            <QuickAddMenu variant="fab" />
          </div>
          <MobileTab item={mobileTabs[2]} active={isActive(pathname, mobileTabs[2].href)} />
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium text-muted-foreground"
          >
            <span className="relative">
              <Menu className="size-[22px]" strokeWidth={1.8} />
              {counts.overdueDues ? <span className="absolute -right-1 -top-0.5 size-2 rounded-full bg-danger ring-2 ring-surface" aria-label="Overdue fees" /> : null}
            </span>
            More
          </button>
        </div>
      </nav>

      {/* Mobile "More" drawer: every module stays reachable on a phone */}
      <DialogPrimitive.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-(--z-overlay) bg-overlay animate-overlay-in md:hidden" />
          <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-(--z-overlay) max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-surface px-4 pb-safe pt-3 shadow-lg animate-rise md:hidden">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-surface-3" />
            <div className="mb-4 flex items-center justify-between">
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">All modules</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">Navigate to any section</DialogPrimitive.Description>
              <DialogPrimitive.Close aria-label="Close" className="flex size-8 items-center justify-center rounded-lg text-subtle-foreground hover:bg-surface-2">
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>
            <NavList pathname={pathname} counts={counts} onNavigate={() => setMoreOpen(false)} />
            <div className="space-y-1 border-t border-border pt-3">
              <NavLink item={settingsItem} active={isActive(pathname, settingsItem.href)} onNavigate={() => setMoreOpen(false)} />
              <UserCard name={lawyer.name} title={lawyer.title} onNavigate={() => setMoreOpen(false)} />
              <Credit className="py-3" />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}

function MobileTab({ item, active, count }: { item: NavItem; active: boolean; count?: number }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn("relative flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")}
    >
      <item.icon className="size-[22px]" strokeWidth={active ? 2.1 : 1.8} />
      {item.label}
      {count ? (
        <span className="tabular absolute right-[22%] top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  )
}

