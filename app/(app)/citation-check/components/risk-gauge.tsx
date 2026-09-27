"use client"
import { cn } from "@/lib/utils"

interface RiskGaugeProps {
  score: number
  verdict: string
  animated?: boolean
}

function band(score: number) {
  if (score <= 30) return { color: "var(--success)", text: "text-success-soft-foreground", label: "Low risk" }
  if (score <= 60) return { color: "var(--warning)", text: "text-warning-soft-foreground", label: "Review needed" }
  return { color: "var(--danger)", text: "text-danger-soft-foreground", label: "High risk" }
}

export function RiskGauge({ score, verdict, animated = true }: RiskGaugeProps) {
  const b = band(score)
  const radius = 70
  const circumference = Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="104" viewBox="0 0 180 104" role="img" aria-label={`Risk score ${score} out of 100, ${b.label}`}>
        <path d="M 20 95 A 70 70 0 0 1 160 95" fill="none" style={{ stroke: "var(--surface-3)" }} strokeWidth="12" strokeLinecap="round" />
        <path
          d="M 20 95 A 70 70 0 0 1 160 95"
          fill="none"
          style={{ stroke: b.color }}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={animated ? "transition-[stroke-dashoffset] duration-1000 ease-out-soft" : ""}
        />
        <text x="90" y="80" textAnchor="middle" className="tabular text-[30px] font-semibold" style={{ fill: "var(--foreground)" }}>{score}</text>
        <text x="90" y="98" textAnchor="middle" className="text-[11px]" style={{ fill: "var(--subtle-foreground)" }}>out of 100</text>
      </svg>
      <p className={cn("mt-2 text-sm font-semibold", b.text)}>{b.label}</p>
      {verdict && <p className="mt-1 max-w-[32ch] text-center text-[13px] text-muted-foreground">{verdict}</p>}
    </div>
  )
}
