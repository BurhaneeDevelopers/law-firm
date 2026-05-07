"use client"
import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Copy, Check, FileText, ArrowRight, Paperclip, Mic } from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"
import { getAIMessages, addAIMessage } from "@/lib/store"
import { callGemini } from "@/lib/gemini"
import { useToast } from "@/components/ui/toast"

const SUGGESTED_PROMPTS = [
  "Summarize my pending cases",
  "What documents are pending review?",
  "List all hearings this week",
  "Draft a bail application reminder",
  "Generate a client update message",
  "What are grounds for property dispute?",
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState(() => getAIMessages())
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-fill from URL param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const prompt = params.get("prompt")
      if (prompt) setInput(prompt)
    }
  }, [])

  const handleSend = async (msg?: string) => {
    const text = msg || input.trim()
    if (!text) return

    const userMsg = { role: "user", content: text, timestamp: new Date().toISOString() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    addAIMessage(userMsg)
    setInput("")
    setLoading(true)

    // Build context
    let prompt = text
    if (text.startsWith("/case ")) {
      const caseName = text.replace("/case ", "")
      prompt = `[Regarding case: ${caseName}]\n\n${text}`
    }
    if (text.startsWith("/document ")) {
      const docName = text.replace("/document ", "")
      prompt = `[Regarding document: ${docName}]\n\n${text}`
    }

    const response = await callGemini(prompt)
    const aiMsg = { role: "assistant", content: response, timestamp: new Date().toISOString() }
    const finalMessages = [...updatedMessages, aiMsg]
    setMessages(finalMessages)
    addAIMessage(aiMsg)
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content)
    setCopiedId(idx)
    setTimeout(() => setCopiedId(null), 2000)
    toast("Copied to clipboard", "success")
  }

  const renderMessage = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-bold text-slate-900 mt-2 mb-1">{line.replace(/\*\*/g, "")}</p>
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return <p key={i} className="flex gap-2 text-slate-700 leading-relaxed"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />{line.replace(/^[•\-]\s/, "")}</p>
      }
      if (line.match(/^\d+\./)) {
        return <p key={i} className="text-slate-700 leading-relaxed">{line}</p>
      }
      if (line.trim() === "") return <br key={i} />
      return <p key={i} className="text-slate-700 leading-relaxed">{line.replace(/\*\*/g, "")}</p>
    })
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-indigo-700 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">LexAI Assistant</h1>
          <p className="text-xs text-slate-500">Your AI-powered legal research and drafting assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-600 font-medium">Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">How can I assist you today?</h2>
            <p className="text-sm text-slate-500 max-w-xs">Ask me about your cases, draft legal notices, research provisions, or summarize documents.</p>
            <div className="grid grid-cols-2 gap-2 mt-6">
              {SUGGESTED_PROMPTS.slice(0, 4).map(p => (
                <button key={p} onClick={() => handleSend(p)}
                  className="text-xs bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 px-3 py-2.5 rounded-xl transition-all text-left shadow-sm">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3 animate-fade-in", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-indigo-700 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={cn("max-w-[80%]", msg.role === "user" ? "items-end" : "items-start")}>
              <div className={cn(
                "px-4 py-3 text-sm leading-relaxed",
                msg.role === "user" ? "chat-user" : "chat-ai"
              )}>
                {msg.role === "user" ? (
                  <p>{msg.content}</p>
                ) : (
                  <div className="space-y-0.5">{renderMessage(msg.content)}</div>
                )}
              </div>
              <div className={cn("flex items-center gap-2 mt-1.5 px-1", msg.role === "user" ? "justify-end" : "justify-start")}>
                <span className="text-[10px] text-slate-400">{formatRelativeTime(msg.timestamp)}</span>
                {msg.role === "assistant" && (
                  <>
                    <button onClick={() => handleCopy(msg.content, idx)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors">
                      {copiedId === idx ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                    <button
                      onClick={() => {
                        const encoded = encodeURIComponent(msg.content.slice(0, 200))
                        window.location.href = `/notices/new`
                      }}
                      className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      <FileText className="w-3 h-3" /> Use in Notice
                    </button>
                  </>
                )}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-indigo-700 flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-bold">
                M
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-indigo-700 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="chat-ai px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 flex-shrink-0 scrollbar-hide">
          {SUGGESTED_PROMPTS.map(p => (
            <button key={p} onClick={() => handleSend(p)}
              className="flex-shrink-0 text-[11px] bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 px-3 py-1.5 rounded-full transition-all font-medium">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex gap-3 items-end flex-shrink-0">
        <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
          <Paperclip className="w-4 h-4" />
        </button>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... Type /case [name] for case context, /document [name] for document context"
          rows={1}
          className="flex-1 text-sm outline-none resize-none text-slate-900 placeholder-slate-400 max-h-32 leading-relaxed"
          style={{ height: "auto", minHeight: "24px" }}
          onInput={e => {
            const el = e.target as HTMLTextAreaElement
            el.style.height = "auto"
            el.style.height = Math.min(el.scrollHeight, 128) + "px"
          }}
        />
        <div className="flex gap-2 flex-shrink-0">
          <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-indigo-700 flex items-center justify-center text-white hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-center text-slate-400 mt-2">
        LexAI provides suggested language only — always verify before filing. Not legal advice.
      </p>
    </div>
  )
}
