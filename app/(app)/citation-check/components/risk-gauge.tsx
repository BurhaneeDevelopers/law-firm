"use client"

interface RiskGaugeProps {
  score: number
  verdict: string
  animated?: boolean
}

export function RiskGauge({ score, verdict, animated = true }: RiskGaugeProps) {
  const getColor = (s: number) => {
    if (s <= 30) return { stroke: "#10B981", text: "text-emerald-600", bg: "bg-emerald-50" }
    if (s <= 60) return { stroke: "#F59E0B", text: "text-amber-600", bg: "bg-amber-50" }
    return { stroke: "#F43F5E", text: "text-rose-600", bg: "bg-rose-50" }
  }

  const colors = getColor(score)
  const radius = 70
  const circumference = Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100" className="overflow-visible">
        {/* Background arc */}
        <path
          d="M 10 90 A 70 70 0 0 1 170 90"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Color zones */}
        <path d="M 10 90 A 70 70 0 0 1 50 27" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" opacity="0.2" />
        <path d="M 50 27 A 70 70 0 0 1 130 27" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.2" />
        <path d="M 130 27 A 70 70 0 0 1 170 90" fill="none" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" opacity="0.2" />
        {/* Active arc */}
        <path
          d="M 10 90 A 70 70 0 0 1 170 90"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          className={animated ? "transition-all duration-1000 ease-out" : ""}
        />
        {/* Score text */}
        <text x="90" y="75" textAnchor="middle" className="text-3xl font-bold" fill={colors.stroke}>{score}</text>
        <text x="90" y="93" textAnchor="middle" className="text-[10px] font-medium" fill="#94A3B8">/ 100 risk</text>
      </svg>
      <p className={`text-sm font-semibold mt-2 text-center ${colors.text}`}>{verdict}</p>
    </div>
  )
}
