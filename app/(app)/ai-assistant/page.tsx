"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUp, Bot, Check, Copy, RotateCcw, ScrollText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/field"
import { Avatar } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { AIText } from "@/components/practice/ai-text"
import { AI_DRAFT_KEY } from "@/lib/constants"
import { cn, formatDate, formatRelativeTime } from "@/lib/utils"
import { addAIMessage, clearAIMessages, getNextHearing, useDB } from "@/lib/store"
import { callGemini } from "@/lib/gemini"

const SUGGESTIONS = [
  { group: "Prepare", items: ["Prepare me for tomorrow's hearings", "Summarise my urgent matters", "Which cases have no next date?"] },
  { group: "Draft", items: ["Draft a hearing reminder for a client in Hindi", "Draft an adjournment application", "Reply to a Section 138 NI Act notice"] },
  { group: "Research", items: ["Twin conditions for bail under Section 37 NDPS", "Limitation for a money recovery suit", "BNSS equivalent of Section 438 CrPC"] },
]

export default function AIAssistantPage() {
  const db = useDB()
  const router = useRouter()
  const { toast } = useToast()
  const { confirm, dialogElement } = useConfirmDialog()
  const [input, setInput] = useState(() => new URLSearchParams(window.location.search).get("prompt") ?? "")
  const [contextCase, setContextCase] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const messages = db.aiMessages

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length, loading])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }, [input])

  const buildContext = () => {
    const c = db.cases.find((x) => x.id === contextCase)
    if (!c) return ""
    const client = db.clients.find((x) => x.id === c.client_id)
    const next = getNextHearing(c.id, db.hearings)
    return `[Case context]\n${c.case_number}: ${c.title}\nCourt: ${c.court}, ${c.judge}\nStatus: ${c.status}\nClient: ${client?.full_name ?? ""}\nOpposite party: ${c.opposing_party}\nFacts: ${c.description}\nNext date: ${next ? `${next.date} for ${next.purpose}` : "not listed"}\n\n`
  }

  const buildPracticeContext = () => {
    const upcoming = db.hearings
      .filter((h) => {
        const d = new Date(h.date).getTime() - Date.now()
        return d > -86400000 && d < 7 * 86400000
      })
      .map((h) => {
        const c = db.cases.find((x) => x.id === h.case_id)
        return `${h.date} ${h.time} ${c?.case_number} ${c?.title} (${h.purpose}, ${h.court_room})`
      })
    return `[Practice context: hearings in the next 7 days]\n${upcoming.join("\n")}\n\n`
  }

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    addAIMessage({ role: "user", content, timestamp: new Date().toISOString() })
    setInput("")
    setLoading(true)
    const practiceHint = /tomorrow|today|urgent|hearing|next date|week/i.test(content) ? buildPracticeContext() : ""
    const response = await callGemini(`${buildContext()}${practiceHint}${content}`)
    addAIMessage({ role: "assistant", content: response, timestamp: new Date().toISOString() })
    setLoading(false)
    inputRef.current?.focus()
  }

  const copy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    } catch {
      toast("Could not copy", "error")
    }
  }

  const sendToNotice = (text: string) => {
    try { sessionStorage.setItem(AI_DRAFT_KEY, text) } catch { /* ignore */ }
    router.push(`/notices/new?from=ai${contextCase ? `&case=${contextCase}` : ""}`)
  }

  const contextLabel = db.cases.find((c) => c.id === contextCase)

  return (
    <div className="mx-auto flex h-[calc(100dvh-12.5rem)] max-w-3xl flex-col md:h-[calc(100dvh-8.5rem)]">
      {dialogElement}
      <div className="flex flex-wrap items-center gap-3 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-[18px]" /></span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">LexAI</h1>
            <p className="text-xs text-muted-foreground">Research and drafting help for your practice</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Select aria-label="Case context" value={contextCase} onChange={(e) => setContextCase(e.target.value)} className="h-9 w-48 text-[13px] sm:w-60">
            <option value="">No case context</option>
            {db.cases.map((c) => <option key={c.id} value={c.id}>{c.case_number}</option>)}
          </Select>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" aria-label="Clear conversation" onClick={() => confirm("Clear conversation?", "All messages in this chat will be removed.", () => clearAIMessages(), "Clear")}>
              <RotateCcw />
            </Button>
          )}
        </div>
      </div>

      <div className="-mx-4 flex-1 overflow-y-auto px-4" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col justify-center py-8">
            <h2 className="text-xl font-semibold text-foreground">What are you working on?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick a case above to give LexAI the facts, or start with one of these.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {SUGGESTIONS.map((g) => (
                <div key={g.group}>
                  <p className="mb-2 text-xs font-medium text-subtle-foreground">{g.group}</p>
                  <div className="space-y-1.5">
                    {g.items.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => send(p)}
                        className="block w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-[13px] leading-snug text-foreground shadow-xs transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end gap-2.5 animate-rise">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                    <p className="whitespace-pre-line">{m.content}</p>
                  </div>
                  <Avatar name={db.lawyer.name} size="sm" className="hidden sm:inline-flex" />
                </div>
              ) : (
                <div key={i} className="flex gap-3 animate-rise">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
                    <Bot className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3 shadow-xs">
                      <AIText content={m.content} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="mr-1 text-xs text-subtle-foreground">{formatRelativeTime(m.timestamp)}</span>
                      <Button size="xs" variant="ghost" onClick={() => copy(m.content, i)}>
                        {copiedIdx === i ? <><Check /> Copied</> : <><Copy /> Copy</>}
                      </Button>
                      <Button size="xs" variant="ghost" onClick={() => sendToNotice(m.content)}>
                        <ScrollText /> Use in notice
                      </Button>
                    </div>
                  </div>
                </div>
              )
            )}
            {loading && (
              <div className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground"><Bot className="size-4" /></span>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3" aria-label="LexAI is writing">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="size-1.5 animate-bounce rounded-full bg-subtle-foreground" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="pt-3">
        {contextLabel && (
          <p className="mb-2 truncate text-xs text-muted-foreground">
            Using facts from <span className="font-mono text-foreground">{contextLabel.case_number}</span>
            {getNextHearing(contextLabel.id, db.hearings) ? ` · next date ${formatDate(getNextHearing(contextLabel.id, db.hearings)!.date)}` : ""}
          </p>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); send() }}
          className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-sm transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            rows={1}
            placeholder="Ask about a provision, draft a paragraph, or prepare for a hearing"
            aria-label="Message"
            className="max-h-44 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-subtle-foreground"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || loading} aria-label="Send">
            <ArrowUp />
          </Button>
        </form>
        <p className={cn("mt-2 text-center text-xs text-subtle-foreground")}>
          Suggested language for your review. Not legal advice. Verify citations before filing.
        </p>
      </div>
    </div>
  )
}
