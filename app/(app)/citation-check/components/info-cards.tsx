"use client"
import { BookOpen, CalendarDays, Check, Hash, Landmark, Scale, UserRound } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/card"

const checks = [
  { icon: Scale, text: "Supreme Court judgments, 1950 onwards" },
  { icon: Landmark, text: "All 25 High Courts" },
  { icon: BookOpen, text: "Reported district court judgments" },
  { icon: Hash, text: "SCC, AIR, CrLJ and neutral citation formats" },
  { icon: Check, text: "Case number format" },
  { icon: UserRound, text: "Judge and bench cross-reference" },
  { icon: CalendarDays, text: "Year and court plausibility" },
]

export function WhatWeCheckCard() {
  return (
    <Card>
      <CardHeader title="What is checked" />
      <ul className="space-y-2.5 px-5 pb-5 pt-2">
        {checks.map((c) => (
          <li key={c.text} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
            <c.icon className="mt-0.5 size-4 shrink-0 text-subtle-foreground" />
            {c.text}
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function CourtWarningCard() {
  return (
    <div className="rounded-2xl border border-danger/25 bg-danger-soft p-5">
      <h3 className="text-sm font-semibold text-danger-soft-foreground">Why this matters</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-danger-soft-foreground/90">
        Indian courts have imposed costs on advocates who filed AI-generated citations that do not exist. One fabricated
        reference can lead to contempt proceedings. Verify every AI draft before you sign it.
      </p>
      <p className="mt-2 text-xs text-danger-soft-foreground/75">Based on reported orders of the Delhi and Bombay High Courts, 2025-2026.</p>
    </div>
  )
}
