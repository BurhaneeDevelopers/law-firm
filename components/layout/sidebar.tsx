"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard, Briefcase, Users, FileText, Calendar,
  Bell, Bot, Settings, ChevronLeft, ChevronRight, LogOut,
  Scale, ShieldCheck
} from "lucide-react"
import { cn, getInitials, getAvatarColor } from "@/lib/utils"
import { demoLawyer } from "@/lib/demo-data"

const WHATSAPP_URL = "https://wa.me/919003078610?text=Hi%20Taheri%20Developers"

const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/cases", label: "Cases", icon: Briefcase, badge: 5 },
      { href: "/clients", label: "Clients", icon: Users },
    ]
  },
  {
    label: "Work",
    items: [
      { href: "/documents", label: "Documents", icon: FileText },
      { href: "/calendar", label: "Calendar", icon: Calendar, badge: 3 },
      { href: "/notices", label: "Notices", icon: Bell },
    ]
  },
  {
    label: "Intelligence",
    items: [
      { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
      { href: "/citation-check", label: "Citation Check", icon: ShieldCheck },
      { href: "/settings", label: "Settings", icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const lawyer = demoLawyer

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 h-full bg-white z-40 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center gap-3 px-4 py-5", collapsed && "justify-center px-3")}>
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Yadav & Associates</p>
              <p className="text-xs text-gray-500">Law Management</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "ml-auto w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors",
              collapsed && "ml-0"
            )}
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              {!collapsed && (
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all group relative",
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0", active ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-700")} />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="px-3 pb-1">
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "block rounded-xl bg-indigo-50 px-2 py-1 text-center text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100 transition",
              collapsed && "text-[9px]"
            )}
          >
            Taheri Developers
          </Link>
        </div>

        {/* User */}
        <div className={cn("p-3", collapsed && "px-2")}>
          <div className={cn("flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer", collapsed && "justify-center")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", getAvatarColor(lawyer.name))}>
              {getInitials(lawyer.name)}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">Adv. {lawyer.name}</p>
                  <p className="text-xs text-gray-500 truncate">Senior Advocate</p>
                </div>
                <button className="text-gray-400 hover:text-rose-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-40 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {[
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/cases", label: "Cases", icon: Briefcase },
            { href: "/clients", label: "Clients", icon: Users },
            { href: "/calendar", label: "Calendar", icon: Calendar },
          ].map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors",
                  active ? "text-indigo-600" : "text-gray-500"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          <Link
            href="/ai-assistant"
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors",
              pathname.startsWith("/ai-assistant") ? "text-indigo-600" : "text-gray-500"
            )}
          >
            <Bot className="w-5 h-5" />
            <span className="text-[10px] font-medium">AI</span>
          </Link>
        </div>
        <div className="pb-1 text-center">
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-semibold text-indigo-600"
          >
            Taheri Developers
          </Link>
        </div>
      </nav>
    </>
  )
}
