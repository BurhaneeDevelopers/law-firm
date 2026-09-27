import {
  Bot, Briefcase, CalendarDays, FileText, LayoutDashboard, ScrollText, Settings, ShieldCheck, Users,
} from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  /** Key used to show a live count next to the item. */
  countKey?: "hearingsToday" | "urgentOpen" | "draftNotices"
}

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Practice",
    items: [
      { href: "/dashboard", label: "Today", icon: LayoutDashboard },
      { href: "/calendar", label: "Diary", icon: CalendarDays, countKey: "hearingsToday" },
      { href: "/cases", label: "Cases", icon: Briefcase, countKey: "urgentOpen" },
      { href: "/clients", label: "Clients", icon: Users },
    ],
  },
  {
    label: "Drafting",
    items: [
      { href: "/documents", label: "Documents", icon: FileText },
      { href: "/notices", label: "Notices", icon: ScrollText, countKey: "draftNotices" },
      { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
      { href: "/citation-check", label: "Citation Check", icon: ShieldCheck },
    ],
  },
]

export const settingsItem: NavItem = { href: "/settings", label: "Settings", icon: Settings }

export const mobileTabs: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/calendar", label: "Diary", icon: CalendarDays },
  { href: "/cases", label: "Cases", icon: Briefcase },
  { href: "/clients", label: "Clients", icon: Users },
]

export const pageTitles: Record<string, string> = {
  dashboard: "Today",
  calendar: "Diary",
  cases: "Cases",
  clients: "Clients",
  documents: "Documents",
  notices: "Notices",
  "ai-assistant": "AI Assistant",
  "citation-check": "Citation Check",
  settings: "Settings",
  new: "New",
}

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
