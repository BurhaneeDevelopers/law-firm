"use client"
import { Check, Search, BookOpen, Hash, User, CalendarDays, Scale } from "lucide-react"

export function WhatWeCheckCard() {
  const checks = [
    { icon: <Scale className="w-3.5 h-3.5 text-indigo-600" />, text: "Supreme Court of India judgments (1950–present)" },
    { icon: <BookOpen className="w-3.5 h-3.5 text-indigo-600" />, text: "All High Court databases (25 High Courts)" },
    { icon: <Search className="w-3.5 h-3.5 text-indigo-600" />, text: "District Court reported judgments" },
    { icon: <Hash className="w-3.5 h-3.5 text-indigo-600" />, text: "SCC, AIR, CrLJ citation formats" },
    { icon: <Check className="w-3.5 h-3.5 text-indigo-600" />, text: "Case number format validation" },
    { icon: <User className="w-3.5 h-3.5 text-indigo-600" />, text: "Judge name + bench cross-reference" },
    { icon: <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />, text: "Year + court combination plausibility" },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">What We Check</h3>
      <div className="space-y-2.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">{c.icon}</div>
            <span className="text-xs text-slate-600 leading-relaxed">{c.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CourtWarningCard() {
  return (
    <div className="bg-rose-50 rounded-xl border border-rose-200 p-5">
      <h3 className="text-sm font-semibold text-rose-800 mb-2">Why This Matters</h3>
      <p className="text-xs text-rose-700 leading-relaxed mb-3">
        In 2026, Indian courts have begun issuing cost sanctions against lawyers who file AI-generated citations
        that do not exist. A single hallucinated case reference can result in contempt proceedings. Verify every AI
        draft before signing.
      </p>
      <p className="text-[10px] text-rose-500 italic">
        Based on reported cases from Delhi HC, Bombay HC, 2025–2026
      </p>
    </div>
  )
}
