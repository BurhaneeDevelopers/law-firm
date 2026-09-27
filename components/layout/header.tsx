"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Monitor, Moon, Search, Sun } from "lucide-react"
import { format } from "date-fns"
import { useTheme, type ThemePreference } from "@/lib/theme"
import { useHydrated } from "@/lib/use-hydrated"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/misc"
import {
  Dropdown, DropdownCheckItem, DropdownContent, DropdownLabel, DropdownTrigger,
} from "@/components/ui/dropdown"
import { CommandPalette } from "./command-palette"
import { NotificationsBell } from "./notifications-bell"
import { QuickAddMenu } from "./quick-add"
import { pageTitles } from "./nav-config"

const themeOptions: { value: ThemePreference; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Match device", icon: Monitor },
]

export function Header() {
  const pathname = usePathname()
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

            <NotificationsBell />

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
