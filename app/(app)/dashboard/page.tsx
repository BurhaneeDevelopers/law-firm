"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Briefcase, Calendar, FileText, Users, TrendingUp, TrendingDown,
  Plus, Sparkles, Clock, AlertCircle, ChevronRight, CheckCircle,
  MessageSquare, ArrowUpRight, Bot, ShieldCheck, ShieldAlert, X
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { format } from "date-fns"
import { cn, getCountdownClass, getCountdownLabel, getDaysUntil, formatRelativeTime, caseTypeColors } from "@/lib/utils"
import { getDashboardStats, getTodayHearings, getActivity, getDeadlines, getCases, getClients } from "@/lib/store"
import { demoLawyer } from "@/lib/demo-data"
import { getCitationDashboardStats } from "@/lib/citation-store"

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

const activityIcons: Record<string, React.ReactNode> = {
  case_updated: <Briefcase className="w-3.5 h-3.5 text-indigo-600" />,
  document_uploaded: <FileText className="w-3.5 h-3.5 text-amber-600" />,
  notice_sent: <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />,
  client_added: <Users className="w-3.5 h-3.5 text-purple-600" />,
  hearing_added: <Calendar className="w-3.5 h-3.5 text-blue-600" />,
  case_created: <Briefcase className="w-3.5 h-3.5 text-indigo-600" />,
  note_added: <FileText className="w-3.5 h-3.5 text-slate-600" />,
}

export default function DashboardPage() {
  const stats = getDashboardStats()
  const todayHearings = getTodayHearings()
  const activity = getActivity().slice(0, 10)
  const deadlines = getDeadlines()
  const allCases = getCases()
  const allClients = getClients()
  const citationStats = getCitationDashboardStats()

  const [bannerDismissed, setBannerDismissed] = useState(false)
  useEffect(() => {
    const dismissed = sessionStorage.getItem("citation_banner_dismissed")
    if (dismissed) setBannerDismissed(true)
  }, [])
  const dismissBanner = () => {
    setBannerDismissed(true)
    sessionStorage.setItem("citation_banner_dismissed", "true")
  }

  const now = new Date()
  const todayStr = format(now, "EEEE, dd MMMM yyyy")

  const pieData = [
    { name: "Active", value: stats.statusBreakdown.Active, color: "#4F46E5" },
    { name: "Hearing", value: stats.statusBreakdown["Hearing Scheduled"], color: "#F59E0B" },
    { name: "Judgment", value: stats.statusBreakdown["Judgment Awaited"], color: "#F97316" },
    { name: "Won", value: stats.statusBreakdown.Won, color: "#10B981" },
    { name: "Closed", value: stats.statusBreakdown.Closed, color: "#94A3B8" },
  ]

  const statCards = [
    {
      label: "Active Cases",
      value: stats.activeCases,
      icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50",
      trend: "+2 this month",
      up: true,
      href: "/cases"
    },
    {
      label: "Hearings This Week",
      value: stats.hearingsThisWeek,
      icon: <Calendar className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50",
      trend: "3 today",
      up: true,
      href: "/calendar"
    },
    {
      label: "Documents",
      value: stats.pendingDocs,
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
      trend: "+3 this week",
      up: true,
      href: "/documents"
    },
    {
      label: "Citation Health",
      value: citationStats.totalVerifiedThisMonth,
      icon: citationStats.totalFlaggedThisWeek > 0
        ? <ShieldAlert className="w-5 h-5 text-rose-600" />
        : <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      bg: citationStats.totalFlaggedThisWeek > 0 ? "bg-rose-50" : "bg-emerald-50",
      trend: citationStats.totalFlaggedThisWeek > 0
        ? `${citationStats.totalFlaggedThisWeek} flagged this week`
        : "All clear",
      up: citationStats.totalFlaggedThisWeek === 0,
      href: "/citation-check"
    },
  ]

  // Determine hearing status
  const getHearingStatus = (time: string) => {
    const now = new Date()
    const [h, m] = time.replace(/\s*(AM|PM)/i, "").split(":").map(Number)
    const isPM = time.toUpperCase().includes("PM")
    const hour = isPM && h !== 12 ? h + 12 : (!isPM && h === 12 ? 0 : h)
    const hearingTime = new Date()
    hearingTime.setHours(hour, m || 0, 0)
    if (now < hearingTime) return "upcoming"
    if (now.getTime() - hearingTime.getTime() < 2 * 60 * 60 * 1000) return "done"
    return "done"
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Citation Risk Banner */}
      {citationStats.hasUnverifiedDocs && !bannerDismissed && (
        <div className="relative rounded-xl border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950 px-5 py-4 shadow-sm animate-fade-in">
          <button onClick={dismissBanner} className="absolute top-3 right-3 text-amber-400 dark:text-amber-600 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"><X className="w-4 h-4" /></button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">⚠️ {citationStats.unverifiedCount} AI-drafted document{citationStats.unverifiedCount > 1 ? 's have' : ' has'} unverified citations.</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Courts are now sanctioning lawyers ₹80L+ for hallucinated case citations. Verify before filing.</p>
            </div>
            <Link href="/citation-check" className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors whitespace-nowrap flex-shrink-0">Verify Now →</Link>
          </div>
        </div>
      )}

      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, Advocate {demoLawyer.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-600 mt-1">{todayStr} · {allCases.length} total cases · {allClients.length} clients</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Link href="/cases/new" className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Case
          </Link>
          <Link href="/ai-assistant" className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors shadow-sm">
            <Bot className="w-4 h-4" /> Ask AI
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl p-5 shadow-sm card-hover border border-gray-100 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.bg)}>
                {card.icon}
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-600 mt-1">{card.label}</p>
            <div className="flex items-center gap-1 mt-2">
              {card.up ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
              <span className="text-[11px] text-gray-500">{card.trend}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Hearings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-gray-900">Today's Hearings</h2>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{todayHearings.length}</span>
              </div>
              <Link href="/calendar" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {todayHearings.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-3 opacity-40">
                  <circle cx="32" cy="32" r="30" fill="currentColor" className="text-indigo-50 dark:text-indigo-950"/>
                  <path d="M20 28h24M20 34h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-600 dark:text-indigo-400"/>
                  <rect x="20" y="20" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" className="text-indigo-600 dark:text-indigo-400"/>
                  <path d="M26 20v-4M38 20v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-600 dark:text-indigo-400"/>
                </svg>
                <p className="text-sm font-medium text-muted-foreground">No hearings today</p>
                <p className="text-xs text-muted-foreground mt-1">Enjoy your clear schedule</p>
              </div>
            ) : (
              <div className="p-5">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {todayHearings.map((h) => {
                      const c = getCases().find(c => c.id === h.case_id)
                      const client = getClients().find(cl => cl.id === c?.client_id)
                      const status = getHearingStatus(h.time)
                      return (
                        <div key={h.id} className="flex gap-4 pl-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full mt-1.5 z-10 flex-shrink-0 ml-[-2px]",
                            status === "upcoming" ? "bg-indigo-500 dark:bg-indigo-400" : "bg-emerald-500 dark:bg-emerald-400"
                          )} />
                          <div className={cn(
                            "flex-1 p-3 rounded-xl border transition-all hover:shadow-sm",
                            status === "upcoming" 
                              ? "border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/50" 
                              : "border-emerald-100 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/30"
                          )}>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-foreground line-clamp-1">{c?.title || "Unknown Case"}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{client?.full_name || "Unknown"} · {h.court_room}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className={cn("text-sm font-bold", status === "upcoming" ? "text-indigo-700 dark:text-indigo-300" : "text-emerald-700 dark:text-emerald-300")}>{h.time}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{h.purpose}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "+ New Case", href: "/cases/new", color: "bg-indigo-700 text-white hover:bg-indigo-800" },
              { label: "+ New Client", href: "/clients/new", color: "bg-purple-600 text-white hover:bg-purple-700" },
              { label: "Generate Notice", href: "/notices/new", color: "bg-amber-500 text-white hover:bg-amber-600" },
              { label: "Ask AI", href: "/ai-assistant", color: "bg-emerald-600 text-white hover:bg-emerald-700" },
              { label: "Verify Citations", href: "/citation-check", color: "bg-rose-600 text-white hover:bg-rose-700" },
            ].map(a => (
              <Link
                key={a.href}
                href={a.href}
                className={cn("text-center py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5", a.color)}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Case Status Donut */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Case Status Overview</h2>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} cases`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, background: "var(--card)", color: "var(--foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground truncate">{d.name}</span>
                  <span className="text-xs font-bold text-foreground ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deadlines */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <h2 className="text-sm font-semibold text-foreground">Upcoming Deadlines</h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              {deadlines.map(d => {
                const days = getDaysUntil(d.due_date)
                return (
                  <div key={d.id} className="px-4 py-3 hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-2">{d.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{d.case_number} · {d.client}</p>
                      </div>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0", getCountdownClass(days))}>
                        {getCountdownLabel(days)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          <span className="text-xs text-muted-foreground">Last 10 actions</span>
        </div>
        <div className="divide-y divide-border">
          {activity.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                {activityIcons[a.action_type] || <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
              <p className="text-xs text-foreground flex-1">{a.description}</p>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatRelativeTime(a.created_at)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Widget */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold">AI Legal Assistant</h2>
            </div>
            <p className="text-indigo-200 text-xs mb-4">Ask anything about your cases, drafts, or legal research</p>
            <div className="flex flex-wrap gap-2">
              {["Summarize today's hearings", "What documents are pending?", "Draft a reminder for Ramesh"].map(p => (
                <Link
                  key={p}
                  href={`/ai-assistant?prompt=${encodeURIComponent(p)}`}
                  className="text-[11px] bg-white/15 hover:bg-white/25 transition-colors px-3 py-1.5 rounded-full font-medium"
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/ai-assistant"
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            Open AI →
          </Link>
        </div>
      </div>
    </div>
  )
}
