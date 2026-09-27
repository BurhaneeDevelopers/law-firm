"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell, Briefcase, CalendarPlus, CheckCheck, FileText, IndianRupee, Monitor, Moon, NotebookPen, ScrollText, Search, Sun, UserPlus,
} from "lucide-react"
import { format } from "date-fns"
import { cn, formatRelativeTime } from "@/lib/utils"
import { markActivityRead, useDB } from "@/lib/store"
import { useTheme, type ThemePreference } from "@/lib/theme"
import { useHydrated } from "@/lib/use-hydrated"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/misc"
import {
  Dropdown, DropdownCheckItem, DropdownContent, DropdownLabel, DropdownTrigger,
} from "@/components/ui/dropdown"
import * as Popover from "@radix-ui/react-popover"
import { CommandPalette } from "./command-palette"
import { QuickAddMenu } from "./quick-add"
import { pageTitles } from "./nav-config"

const activityIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  case_updated: Briefcase,
  case_created: Briefcase,
  document_uploaded: FileText,
  notice_sent: ScrollText,
  notice_drafted: ScrollText,
  client_added: UserPlus,
  hearing_added: CalendarPlus,
  note_added: NotebookPen,
  payment_received: IndianRupee,
}

const themeOptions: { value: ThemePreference; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Match device", icon: Monitor },
]

export function Header() {
  const pathname = usePathname()
  const db = useDB()
  const hydrated = useHydrated()
  const { theme, preference, setPreference } = useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      } else if (e.key === "/" && !typing) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const segments = pathname.split("/").filter(Boolean)
  const section = pageTitles[segments[0]] ?? "LexFirm"
  const unread = db.activity.filter((a) => !db.readActivityIds.includes(a.id))
  const ThemeIcon = theme === "dark" ? Moon : Sun

  return (
    <>
      <header className="sticky top-0 z-(--z-sticky) border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 md:h-16 md:px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-foreground md:hidden">{section}</p>
            <p className="hidden text-[13px] text-muted-foreground md:block" suppressHydrationWarning>
              {hydrated ? format(new Date(), "EEEE, d MMMM yyyy") : " "}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden h-9 w-72 items-center gap-2.5 rounded-[10px] border border-border bg-surface px-3 text-sm text-subtle-foreground shadow-xs transition-colors hover:border-border-strong md:flex lg:w-80"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Search cases, clients, CNR</span>
            <Kbd>Ctrl K</Kbd>
          </button>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" onClick={() => setPaletteOpen(true)}>
              <Search />
            </Button>

            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Change theme">
                  <ThemeIcon />
                </Button>
              </DropdownTrigger>
              <DropdownContent className="w-48">
                <DropdownLabel>Appearance</DropdownLabel>
                {themeOptions.map((o) => (
                  <DropdownCheckItem key={o.value} checked={preference === o.value} onSelect={() => setPreference(o.value)}>
                    <o.icon /> {o.label}
                  </DropdownCheckItem>
                ))}
              </DropdownContent>
            </Dropdown>

            <Popover.Root>
              <Popover.Trigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`} className="relative">
                  <Bell />
                  {unread.length > 0 && (
                    <span className="tabular absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground">
                      {unread.length}
                    </span>
                  )}
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  align="end"
                  sideOffset={8}
                  className="z-(--z-popover) w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-lg animate-pop"
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">Activity</p>
                    {unread.length > 0 && (
                      <button type="button" onClick={() => markActivityRead()} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        <CheckCheck className="size-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {db.activity.slice(0, 12).map((a) => {
                      const Icon = activityIcon[a.action_type] ?? Bell
                      const isUnread = !db.readActivityIds.includes(a.id)
                      return (
                        <div key={a.id} className={cn("flex items-start gap-3 px-4 py-3", isUnread && "bg-primary-soft/50")}>
                          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                            <Icon className="size-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] leading-snug text-foreground">{a.description}</p>
                            <p className="mt-0.5 text-xs text-subtle-foreground" suppressHydrationWarning>
                              {hydrated ? formatRelativeTime(a.created_at) : ""}
                            </p>
                          </div>
                          {isUnread && <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                        </div>
                      )
                    })}
                  </div>
                  <div className="border-t border-border p-2">
                    <Link href="/dashboard#activity" className="block rounded-lg px-2 py-1.5 text-center text-[13px] font-medium text-primary hover:bg-surface-2">
                      Open activity log
                    </Link>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <div className="hidden md:block">
              <QuickAddMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Remounts on each open so the search starts empty */}
      <CommandPalette key={paletteOpen ? "open" : "closed"} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  )
}
