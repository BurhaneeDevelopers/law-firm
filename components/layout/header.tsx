"use client"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bell, Plus, Search, ChevronRight, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { demoActivity } from "@/lib/demo-data"
import { formatRelativeTime } from "@/lib/utils"
import { CommandPalette } from "./command-palette"
import { useTheme } from "@/lib/theme"

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  cases: "Cases",
  clients: "Clients",
  documents: "Documents",
  calendar: "Calendar",
  notices: "Notices",
  "ai-assistant": "AI Assistant",
  "citation-check": "Citation Check",
  settings: "Settings",
  new: "New",
}

const notificationIcons: Record<string, string> = {
  case_updated: "⚖️",
  document_uploaded: "📄",
  notice_sent: "📬",
  client_added: "👤",
  hearing_added: "📅",
  case_created: "📋",
  note_added: "📝",
}

export function Header() {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [unreadCount] = useState(3)
  const { theme, toggleTheme } = useTheme()

  const segments = pathname.split("/").filter(Boolean)

  return (
    <>
      <header className="sticky top-0 z-30 bg-white h-14 flex items-center px-4 gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-xs text-gray-400">LexFirm</span>
          {segments.map((seg, i) => (
            <span key={seg} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <Link
                href={"/" + segments.slice(0, i + 1).join("/")}
                className={cn(
                  "text-xs font-medium capitalize",
                  i === segments.length - 1 ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {breadcrumbMap[seg] || seg.replace(/-/g, " ")}
              </Link>
            </span>
          ))}
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setShowCommandPalette(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors w-64"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search cases, clients...</span>
          <kbd className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">⌘K</kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="Toggle dark mode"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Quick Add */}
          <div className="relative">
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            {showQuickAdd && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg w-48 py-2 z-50 animate-scale-in">
                {[
                  { label: "+ New Case", href: "/cases/new" },
                  { label: "+ New Client", href: "/clients/new" },
                  { label: "+ Generate Notice", href: "/notices/new" },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowQuickAdd(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl w-80 z-50 animate-scale-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Mark all read</button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {demoActivity.slice(0, 6).map((a, i) => (
                    <div
                      key={a.id}
                      className={cn("flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors", i < 3 && "bg-indigo-50/30")}
                    >
                      <span className="text-base">{notificationIcons[a.action_type] || "📌"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 leading-snug">{a.description}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(a.created_at)}</p>
                      </div>
                      {i < 3 && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1 shrink-0" />}
                    </div>
                  ))}
                </div>

                <div className="p-3">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-full text-xs text-center text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cmd+K handler */}
      {typeof window !== "undefined" && (
        <div
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
              e.preventDefault()
              setShowCommandPalette(true)
            }
          }}
        />
      )}

      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}

      {/* Close dropdowns when clicking outside */}
      {(showNotifications || showQuickAdd) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => { setShowNotifications(false); setShowQuickAdd(false) }}
        />
      )}
    </>
  )
}
