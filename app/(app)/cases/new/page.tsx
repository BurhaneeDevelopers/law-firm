"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { Avatar, PageHeader, Segmented } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { CASE_STATUSES, CASE_TYPES, COURTS, HEARING_PURPOSES, LANGUAGES } from "@/lib/constants"
import { cn, formatINR, isValidIndianMobile, todayISO } from "@/lib/utils"
import { addCase, addClient, addHearing, uid, useDB } from "@/lib/store"

const STEPS = [
  { title: "Matter", description: "Court, parties and status" },
  { title: "Client", description: "Who you appear for" },
  { title: "Dates & fees", description: "First date and professional fee" },
]

const OTHER_COURT = "__other"

export default function NewCasePage() {
  const router = useRouter()
  const db = useDB()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    case_number: "",
    cnr_number: "",
    title: "",
    case_type: "Civil",
    court: COURTS[0],
    custom_court: "",
    judge: "",
    filing_date: todayISO(),
    opposing_party: "",
    description: "",
    priority: "Normal",
    status: "Active",
  })
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing")
  const [clientId, setClientId] = useState(() => new URLSearchParams(window.location.search).get("client") ?? "")
  const [clientSearch, setClientSearch] = useState("")
  const [newClient, setNewClient] = useState({ full_name: "", phone: "", email: "", city: "", preferred_language: "Hindi" })
  const [fees, setFees] = useState({ fee_agreed: "", first_date: "", first_time: "10:00", first_purpose: "Mention" })

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const court = form.court === OTHER_COURT ? form.custom_court.trim() : form.court

  const validate = (s: number) => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!form.title.trim()) e.title = "Enter a title, e.g. State vs. Name (IPC 420)"
      if (!form.case_number.trim()) e.case_number = "Enter the case number as on the court record"
      if (form.cnr_number && !/^[A-Z]{4}\d{12}$/i.test(form.cnr_number.replace(/\s/g, ""))) e.cnr_number = "CNR is 16 characters: 4 letters and 12 digits"
      if (!court) e.custom_court = "Enter the court name"
    }
    if (s === 1) {
      if (clientMode === "existing" && !clientId) e.client = "Choose a client or add a new one"
      if (clientMode === "new") {
        if (!newClient.full_name.trim()) e.full_name = "Enter the client's name"
        if (!isValidIndianMobile(newClient.phone)) e.phone = "Enter a 10-digit mobile number"
      }
    }
    if (s === 2) {
      if (fees.fee_agreed && (isNaN(Number(fees.fee_agreed)) || Number(fees.fee_agreed) < 0)) e.fee_agreed = "Enter an amount in rupees"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (validate(step)) setStep((s) => s + 1)
  }

  const submit = () => {
    if (!validate(2)) return
    let linkedClient = clientId
    if (clientMode === "new") {
      const c = addClient({
        id: uid("c"),
        lawyer_id: db.lawyer.id,
        full_name: newClient.full_name.trim(),
        phone: newClient.phone.trim(),
        email: newClient.email.trim(),
        address: "",
        city: newClient.city.trim(),
        id_proof_type: "Aadhaar",
        id_proof_number: "",
        referred_by: "",
        preferred_language: newClient.preferred_language,
        notes: "",
        created_at: new Date().toISOString(),
      })
      linkedClient = c.id
    }
    const created = addCase({
      id: uid("case"),
      lawyer_id: db.lawyer.id,
      client_id: linkedClient,
      case_number: form.case_number.trim().toUpperCase(),
      cnr_number: form.cnr_number.replace(/\s/g, "").toUpperCase(),
      title: form.title.trim(),
      case_type: form.case_type,
      court,
      judge: form.judge.trim(),
      filing_date: form.filing_date,
      status: fees.first_date ? "Hearing Scheduled" : form.status,
      priority: form.priority,
      opposing_party: form.opposing_party.trim(),
      description: form.description.trim(),
      fee_agreed: Number(fees.fee_agreed) || 0,
      created_at: new Date().toISOString(),
    })
    if (fees.first_date) {
      addHearing({
        id: uid("h"),
        case_id: created.id,
        date: fees.first_date,
        time: fees.first_time,
        court_room: court,
        item_no: "",
        purpose: fees.first_purpose,
        outcome: "",
        outcome_notes: "",
        reminder_sent: false,
      })
    }
    toast(`${created.case_number} created`, "success")
    router.push(`/cases/${created.id}`)
  }

  const filteredClients = db.clients.filter((c) => {
    const q = clientSearch.toLowerCase()
    return !q || c.full_name.toLowerCase().includes(q) || c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "") || "~")
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader back={{ href: "/cases", label: "Cases" }} title="New case" description="Takes about a minute. Only the case number, title and client are required." />

      <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className="w-full text-left disabled:cursor-default"
            >
              <span className={cn("block h-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-surface-3")} />
              <span className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                {i < step && <Check className="size-3.5 text-success" />}
                {s.title}
              </span>
              <span className="hidden text-xs text-subtle-foreground sm:block">{s.description}</span>
            </button>
          </li>
        ))}
      </ol>

      <Card className="p-5 sm:p-6">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2 animate-fade-in">
            <Field label="Case title" required error={errors.title} className="sm:col-span-2" hint="Use the cause title as it appears in the cause list.">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="State vs. Rakesh Kumar (IPC 420)" autoFocus />
            </Field>
            <Field label="Case number" required error={errors.case_number}>
              <Input value={form.case_number} onChange={(e) => set("case_number", e.target.value)} placeholder="CRL/204/2024" className="font-mono" />
            </Field>
            <Field label="CNR number" error={errors.cnr_number} hint="From eCourts. Helps you find the matter fast.">
              <Input value={form.cnr_number} onChange={(e) => set("cnr_number", e.target.value.toUpperCase())} placeholder="HRRT010012342024" maxLength={19} className="font-mono uppercase" />
            </Field>
            <Field label="Case type">
              <Select value={form.case_type} onChange={(e) => set("case_type", e.target.value)}>
                {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Court" error={form.court !== OTHER_COURT ? errors.custom_court : undefined}>
              <Select value={form.court} onChange={(e) => set("court", e.target.value)}>
                {COURTS.map((c) => <option key={c}>{c}</option>)}
                <option value={OTHER_COURT}>Other court</option>
              </Select>
            </Field>
            {form.court === OTHER_COURT && (
              <Field label="Court name" required error={errors.custom_court} className="sm:col-span-2">
                <Input value={form.custom_court} onChange={(e) => set("custom_court", e.target.value)} placeholder="Civil Judge (JD), Gohana" />
              </Field>
            )}
            <Field label="Presiding officer">
              <Input value={form.judge} onChange={(e) => set("judge", e.target.value)} placeholder="Sh. R.K. Malik, ASJ" />
            </Field>
            <Field label="Opposite party">
              <Input value={form.opposing_party} onChange={(e) => set("opposing_party", e.target.value)} placeholder="State of Haryana" />
            </Field>
            <Field label="Filing date">
              <Input type="date" value={form.filing_date} max={todayISO()} onChange={(e) => set("filing_date", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {CASE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                  <option>Normal</option>
                  <option>Urgent</option>
                </Select>
              </Field>
            </div>
            <Field label="Brief facts" className="sm:col-span-2">
              <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Stage, sections, key orders so far." />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <Segmented
              ariaLabel="Client"
              value={clientMode}
              onChange={(v) => { setClientMode(v); setErrors({}) }}
              options={[
                { value: "existing", label: "Existing client" },
                { value: "new", label: "New client" },
              ]}
            />
            {clientMode === "existing" ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
                  <Input value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="Search by name or phone" className="pl-9" aria-label="Search clients" />
                </div>
                {errors.client && <p className="text-xs font-medium text-danger-soft-foreground">{errors.client}</p>}
                <div role="radiogroup" aria-label="Clients" className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
                  {filteredClients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={clientId === c.id}
                      onClick={() => { setClientId(c.id); setErrors({}) }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                        clientId === c.id ? "border-primary bg-primary-soft" : "border-border hover:border-border-strong hover:bg-surface-2"
                      )}
                    >
                      <Avatar name={c.full_name} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{c.full_name}</span>
                        <span className="block text-xs text-muted-foreground">{c.phone}{c.city ? ` · ${c.city}` : ""}</span>
                      </span>
                      {clientId === c.id && <Check className="size-4 text-primary" />}
                    </button>
                  ))}
                  {filteredClients.length === 0 && (
                    <p className="py-6 text-center text-[13px] text-muted-foreground">
                      No client found.{" "}
                      <button type="button" className="font-medium text-primary hover:underline" onClick={() => { setClientMode("new"); setNewClient((n) => ({ ...n, full_name: clientSearch })) }}>
                        Add &ldquo;{clientSearch}&rdquo; as new
                      </button>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required error={errors.full_name}>
                  <Input value={newClient.full_name} onChange={(e) => setNewClient((n) => ({ ...n, full_name: e.target.value }))} placeholder="As on Aadhaar" autoFocus />
                </Field>
                <Field label="Mobile" required error={errors.phone}>
                  <Input type="tel" inputMode="tel" value={newClient.phone} onChange={(e) => setNewClient((n) => ({ ...n, phone: e.target.value }))} placeholder="98765 43210" />
                </Field>
                <Field label="Email">
                  <Input type="email" value={newClient.email} onChange={(e) => setNewClient((n) => ({ ...n, email: e.target.value }))} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City">
                    <Input value={newClient.city} onChange={(e) => setNewClient((n) => ({ ...n, city: e.target.value }))} />
                  </Field>
                  <Field label="Language">
                    <Select value={newClient.preferred_language} onChange={(e) => setNewClient((n) => ({ ...n, preferred_language: e.target.value }))}>
                      {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                    </Select>
                  </Field>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <section>
              <h2 className="text-sm font-semibold text-foreground">First date</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Optional. Adds it to your diary right away.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field label="Date">
                  <Input type="date" value={fees.first_date} min={todayISO()} onChange={(e) => setFees((f) => ({ ...f, first_date: e.target.value }))} />
                </Field>
                <Field label="Time">
                  <Input type="time" value={fees.first_time} onChange={(e) => setFees((f) => ({ ...f, first_time: e.target.value }))} />
                </Field>
                <Field label="Listed for">
                  <Select value={fees.first_purpose} onChange={(e) => setFees((f) => ({ ...f, first_purpose: e.target.value }))}>
                    {HEARING_PURPOSES.map((p) => <option key={p}>{p}</option>)}
                  </Select>
                </Field>
              </div>
            </section>
            <section>
              <h2 className="text-sm font-semibold text-foreground">Professional fee</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Agreed fee for this matter. Record receipts later from the case page.</p>
              <Field label="Agreed fee (₹)" error={errors.fee_agreed} className="mt-3 sm:max-w-xs" hint={fees.fee_agreed && !errors.fee_agreed ? formatINR(Number(fees.fee_agreed)) : undefined}>
                <Input inputMode="numeric" value={fees.fee_agreed} onChange={(e) => { setFees((f) => ({ ...f, fee_agreed: e.target.value.replace(/[^\d]/g, "") })); setErrors({}) }} placeholder="50000" className="tabular" />
              </Field>
            </section>
            <p className="rounded-xl bg-surface-2 px-4 py-3 text-[13px] text-muted-foreground">
              You can upload the petition, vakalatnama and orders from the case page after saving.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}><ArrowLeft /> Back</Button>
          ) : (
            <Button variant="ghost" onClick={() => router.push("/cases")}>Cancel</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Continue <ArrowRight /></Button>
          ) : (
            <Button onClick={submit}><Check /> Create case</Button>
          )}
        </div>
      </Card>
    </div>
  )
}
