"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, MessageSquare, ExternalLink } from "lucide-react"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  isToday, addMonths, subMonths, startOfWeek, endOfWeek
} from "date-fns"
import { cn, caseTypeColors, formatDate, generateWhatsAppMessage, getDaysUntil, getCountdownLabel } from "@/lib/utils"
import { getHearings, getCases, getClients } from "@/lib/store"
import { demoLawyer } from "@/lib/demo-data"

type ViewType = "month" | "week" | "agenda"

const purposeColors: Record<string, string> = {
  Argument: "bg-indigo-500",
  Mention: "bg-blue-500",
  Evidence: "bg-amber-500",
  Judgment: "bg-emerald-500",
  "Framing of Charges": "bg-rose-500",
  Other: "bg-slate-500",
  Mediation: "bg-purple-500",
}

export default function CalendarPage() {
  const [view, setView] = useState<ViewType>("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedHearing, setSelectedHearing] = useState<string | null>(null)

  const hearings = getHearings()
  const cases = getCases()
  const clients = getClients()

  const getHearingsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return hearings.filter(h => h.date === dateStr)
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

  const upcomingHearings = hearings
    .filter(h => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const selectedHearingData = selectedHearing ? hearings.find(h => h.id === selectedHearing) : null
  const selectedCase = selectedHearingData ? cases.find(c => c.id === selectedHearingData.case_id) : null
  const selectedClient = selectedCase ? clients.find(c => c.id === selectedCase.client_id) : null

  const handleWhatsApp = (hearingId: string) => {
    const h = hearings.find(x => x.id === hearingId)
    if (!h || !selectedClient) return
    const msg = generateWhatsAppMessage({
      clientName: selectedClient.full_name,
      caseNumber: selectedCase?.case_number || "",
      date: formatDate(h.date),
      time: h.time,
      court: h.court_room,
      lawyerName: demoLawyer.name,
    })
    window.open(`https://wa.me/${selectedClient.phone.replace(/\D/g, "")}?text=${msg}`, "_blank")
  }

  const groupedAgenda = upcomingHearings.reduce<Record<string, typeof hearings>>((acc, h) => {
    if (!acc[h.date]) acc[h.date] = []
    acc[h.date].push(h)
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500">{upcomingHearings.length} upcoming hearings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {(["month", "week", "agenda"] as ViewType[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                  view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Main */}
        <div className="lg:col-span-2">
          {/* Month/Week View */}
          {(view === "month" || view === "week") && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Nav */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-bold text-slate-900">{format(currentDate, "MMMM yyyy")}</h2>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center py-2 text-xs font-semibold text-slate-500">{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7">
                {calDays.map((day, i) => {
                  const dayHearings = getHearingsForDay(day)
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const today = isToday(day)
                  return (
                    <div key={i} className={cn(
                      "min-h-[90px] p-2 border-b border-r border-slate-50 transition-colors hover:bg-slate-50/50",
                      !isCurrentMonth && "opacity-40",
                      today && "bg-indigo-50/30"
                    )}>
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-colors",
                        today ? "bg-indigo-700 text-white" : "text-slate-700 hover:bg-slate-100"
                      )}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-0.5">
                        {dayHearings.slice(0, 2).map(h => {
                          const c = cases.find(c => c.id === h.case_id)
                          return (
                            <button
                              key={h.id}
                              onClick={() => setSelectedHearing(h.id === selectedHearing ? null : h.id)}
                              className={cn(
                                "w-full text-left px-1.5 py-0.5 rounded text-[9px] font-medium text-white truncate transition-opacity",
                                purposeColors[h.purpose] || "bg-indigo-500",
                                selectedHearing === h.id ? "ring-2 ring-offset-1 ring-indigo-700" : ""
                              )}
                            >
                              {h.time} {c?.case_number?.split("/")[0]}
                            </button>
                          )
                        })}
                        {dayHearings.length > 2 && (
                          <span className="text-[9px] text-slate-400 font-medium">+{dayHearings.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Agenda View */}
          {view === "agenda" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Upcoming Hearings</h2>
              </div>
              {Object.keys(groupedAgenda).length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">No upcoming hearings</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {Object.entries(groupedAgenda).map(([date, dayHearings]) => (
                    <div key={date}>
                      <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-600">{formatDate(date, "EEEE, dd MMMM yyyy")}</p>
                      </div>
                      {dayHearings.map(h => {
                        const c = cases.find(x => x.id === h.case_id)
                        const client = clients.find(x => x.id === c?.client_id)
                        return (
                          <div key={h.id} onClick={() => setSelectedHearing(h.id === selectedHearing ? null : h.id)}
                            className={cn("flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors", selectedHearing === h.id && "bg-indigo-50/30")}>
                            <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0", purposeColors[h.purpose] || "bg-indigo-500")} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{c?.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{client?.full_name} · {h.court_room}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-slate-900">{h.time}</p>
                              <p className="text-[10px] text-slate-400">{h.purpose}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected hearing detail */}
          {selectedHearingData && (
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5 animate-scale-in">
              <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Hearing Details</h3>
              <p className="text-sm font-bold text-slate-900 mb-1">{selectedCase?.title}</p>
              <p className="text-xs text-slate-500 mb-1">{selectedCase?.case_number}</p>
              <p className="text-xs text-slate-500 mb-3">{selectedClient?.full_name}</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-800">{formatDate(selectedHearingData.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time</span>
                  <span className="font-medium text-slate-800">{selectedHearingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Court</span>
                  <span className="font-medium text-slate-800 text-right max-w-[150px]">{selectedHearingData.court_room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Purpose</span>
                  <span className="font-medium text-slate-800">{selectedHearingData.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reminder</span>
                  <span className={cn("font-medium", selectedHearingData.reminder_sent ? "text-emerald-600" : "text-slate-400")}>
                    {selectedHearingData.reminder_sent ? "Sent ✓" : "Not Sent"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleWhatsApp(selectedHearingData.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-700 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" /> Remind on WA
                </button>
                <a href={`/cases/${selectedCase?.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-xl hover:bg-indigo-100 transition-colors">
                  View Case <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Upcoming mini list */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Next Hearings</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {upcomingHearings.slice(0, 6).map(h => {
                const c = cases.find(x => x.id === h.case_id)
                const days = getDaysUntil(h.date)
                return (
                  <button key={h.id} onClick={() => setSelectedHearing(h.id === selectedHearing ? null : h.id)}
                    className={cn("w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors", selectedHearing === h.id && "bg-indigo-50/40")}>
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", purposeColors[h.purpose] || "bg-indigo-500")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{c?.case_number}</p>
                      <p className="text-[10px] text-slate-500">{h.time} · {h.purpose}</p>
                    </div>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                      days === 0 ? "bg-rose-100 text-rose-700" : days <= 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600")}>
                      {getCountdownLabel(days)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Purpose Colors</h3>
            <div className="space-y-2">
              {Object.entries(purposeColors).map(([purpose, color]) => (
                <div key={purpose} className="flex items-center gap-2">
                  <span className={cn("w-3 h-3 rounded-sm", color)} />
                  <span className="text-xs text-slate-600">{purpose}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
