import { cn, splitBold } from "@/lib/utils"

/** Renders the small markdown subset the AI returns: headings in bold, bullets, numbered lines, inline bold. */
export function AIText({ content, className }: { content: string; className?: string }) {
  const lines = content.split("\n")
  return (
    <div className={cn("space-y-1.5 text-sm leading-relaxed text-foreground", className)}>
      {lines.map((raw, i) => {
        const line = raw.trimEnd()
        if (!line.trim()) return <div key={i} className="h-1.5" aria-hidden />
        const inline = (text: string) =>
          splitBold(text).map((p, j) => (p.bold ? <strong key={j} className="font-semibold text-foreground">{p.text}</strong> : <span key={j}>{p.text}</span>))

        if (/^#{1,3}\s/.test(line)) {
          return <p key={i} className="pt-2 text-[15px] font-semibold">{line.replace(/^#{1,3}\s/, "")}</p>
        }
        if (/^\*\*[^*]+\*\*:?$/.test(line.trim())) {
          return <p key={i} className="pt-2 font-semibold">{line.replace(/\*\*/g, "")}</p>
        }
        if (/^\s*[-•*]\s/.test(line)) {
          return (
            <p key={i} className="flex gap-2.5 pl-1 text-muted-foreground">
              <span aria-hidden className="mt-[9px] size-1 shrink-0 rounded-full bg-subtle-foreground" />
              <span>{inline(line.replace(/^\s*[-•*]\s/, ""))}</span>
            </p>
          )
        }
        if (/^\d+\.\s/.test(line)) {
          const [, num, rest] = line.match(/^(\d+)\.\s(.*)$/) ?? []
          return (
            <p key={i} className="flex gap-2">
              <span className="tabular w-5 shrink-0 text-muted-foreground">{num}.</span>
              <span>{inline(rest ?? "")}</span>
            </p>
          )
        }
        if (/^\*[^*].*\*$/.test(line.trim())) {
          return <p key={i} className="text-[13px] italic text-subtle-foreground">{line.trim().slice(1, -1)}</p>
        }
        return <p key={i} className="text-muted-foreground">{inline(line)}</p>
      })}
    </div>
  )
}
