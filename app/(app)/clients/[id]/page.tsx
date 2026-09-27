"use client"
import { use, useState } from "react"
import Link from "next/link"
import { Briefcase, Copy, FileText, MessageSquareText, Pencil, Phone, Plus, Save, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, DetailRow } from "@/components/ui/card"
import { Badge, CaseTypeTag, StatusBadge } from "@/components/ui/badge"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { Avatar, EmptyState, PageHeader, Segmented } from "@/components/ui/misc"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, SheetContent } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { WhatsAppMenu } from "@/components/practice/whatsapp-menu"
import { AIText } from "@/components/practice/ai-text"
import { ID_PROOF_TYPES, LANGUAGES, OPEN_STATUSES } from "@/lib/constants"
import { formatDate, formatINR, formatRelativeTime, getRelativeDayLabel, maskId } from "@/lib/utils"
import { addCommLog, getCaseFees, getClientFees, getNextHearing, uid, updateClient, useDB, type Client } from "@/lib/store"
import { callGemini } from "@/lib/gemini"

const CHANNELS = ["Call", "WhatsApp", "Meeting", "Email"] as const

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const db = useDB()
  const { toast } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [log, setLog] = useState({ channel: "Call" as (typeof CHANNELS)[number], summary: "" })
  const [showId, setShowId] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiBrief, setAiBrief] = useState("")

  const client = db.clients.find((c) => c.id === id)
  if (!client) {
    return (
      <EmptyState
        icon={Users}
        title="Client not found"
        description="The record may have been removed."
        action={<Button asChild variant="outline"><Link href="/clients">Back to clients</Link></Button>}
      />
    )
  }

  const cases = db.cases.filter((c) => c.client_id === id)
  const openCases = cases.filter((c) => OPEN_STATUSES.includes(c.status))
  const docs = db.documents.filter((d) => cases.some((c) => c.id === d.case_id))
  const logs = db.commLogs.filter((l) => l.client_id === id).sort((a, b) => b.created_at.localeCompare(a.created_at))
  const fees = getClientFees(id, db)

  const saveLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!log.summary.trim()) return
    addCommLog({ id: uid("cl"), client_id: id, channel: log.channel, summary: log.summary.trim(), created_at: new Date().toISOString() })
    setLog((l) => ({ ...l, summary: "" }))
    toast("Logged", "success")
  }

  const handleAIBrief = async () => {
    setAiLoading(true)
    const prompt = `Prepare a short meeting brief for Advocate ${db.lawyer.name} about this client:
Client: ${client.full_name}, ${client.city}. Preferred language: ${client.preferred_language}.
Notes: ${client.notes || "none"}
Cases: ${cases.map((c) => `${c.case_number} ${c.title} (${c.status})`).join("; ") || "none"}
Fees: agreed ${fees.agreed}, received ${fees.received}, balance ${fees.balance}
Recent communication: ${logs.slice(0, 3).map((l) => `${l.channel}: ${l.summary}`).join("; ") || "none"}

Cover: who they are, matters and their stage, what to discuss, anything sensitive.`
    const result = await callGemini(prompt)
    setAiBrief(result)
    setAiLoading(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ href: "/clients", label: "Clients" }}
        title={
          <span className="flex items-center gap-3">
            <Avatar name={client.full_name} size="md" />
            {client.full_name}
          </span>
        }
        description={`${client.phone}${client.city ? ` · ${client.city}` : ""} · Client since ${formatDate(client.created_at, "MMM yyyy")}`}
        actions={
          <>
            <Button asChild variant="outline"><a href={`tel:${client.phone.replace(/\s/g, "")}`}><Phone /> Call</a></Button>
            <WhatsAppMenu
              size="md"
              phone={client.phone}
              preferred={client.preferred_language}
              message={(lang) => (lang === "Hindi" ? `नमस्ते ${client.full_name} जी,\n\n` : `Dear ${client.full_name},\n\n`)}
            />
            <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil /> Edit</Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 overflow-hidden">
          <Tabs defaultValue="cases">
            <TabsList>
              <TabsTrigger value="cases" count={cases.length}>Cases</TabsTrigger>
              <TabsTrigger value="log" count={logs.length}>Communication</TabsTrigger>
              <TabsTrigger value="documents" count={docs.length}>Documents</TabsTrigger>
              <TabsTrigger value="ai"><Sparkles className="size-3.5" /> Meeting brief</TabsTrigger>
            </TabsList>

            <TabsContent value="cases" className="p-5">
              <div className="mb-4 flex justify-end">
                <Button asChild size="sm"><Link href={`/cases/new?client=${id}`}><Plus /> New case</Link></Button>
              </div>
              {cases.length === 0 ? (
                <EmptyState icon={Briefcase} title="No cases linked" description="Open a case to start tracking dates and fees for this client." />
              ) : (
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {cases.map((c) => {
                    const next = getNextHearing(c.id, db.hearings)
                    const cf = getCaseFees(c.id, db)
                    return (
                      <li key={c.id}>
                        <Link href={`/cases/${c.id}`} className="block px-4 py-3.5 transition-colors hover:bg-surface-2/60">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{c.case_number}</span>
                            <CaseTypeTag type={c.case_type} />
                            <StatusBadge status={c.status} className="ml-auto" />
                          </div>
                          <p className="mt-1 truncate text-sm font-medium text-foreground">{c.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {c.court}
                            {next ? ` · Next ${getRelativeDayLabel(next.date)}` : ""}
                            {cf.balance ? ` · ${formatINR(cf.balance)} due` : ""}
                          </p>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="log" className="space-y-4 p-5">
              <form onSubmit={saveLog} className="space-y-2 rounded-xl border border-border p-3">
                <Segmented
                  size="sm"
                  ariaLabel="Channel"
                  value={log.channel}
                  onChange={(v) => setLog((l) => ({ ...l, channel: v }))}
                  options={CHANNELS.map((c) => ({ value: c, label: c }))}
                />
                <Textarea rows={2} value={log.summary} onChange={(e) => setLog((l) => ({ ...l, summary: e.target.value }))} placeholder="What was discussed or agreed" aria-label="Summary" />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={!log.summary.trim()}>Log it</Button>
                </div>
              </form>
              {logs.length === 0 ? (
                <EmptyState compact icon={MessageSquareText} title="Nothing logged yet" description="Keep a record of calls and meetings. It helps when instructions are disputed later." />
              ) : (
                <ul className="space-y-2">
                  {logs.map((l) => (
                    <li key={l.id} className="rounded-xl bg-surface-2/70 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge tone={l.channel === "WhatsApp" ? "success" : l.channel === "Call" ? "info" : "neutral"}>{l.channel}</Badge>
                        <span className="text-xs text-subtle-foreground">{formatRelativeTime(l.created_at)}</span>
                      </div>
                      <p className="mt-1.5 text-sm text-foreground">{l.summary}</p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="documents" className="p-5">
              {docs.length === 0 ? (
                <EmptyState icon={FileText} title="No documents" description="Documents uploaded to this client's cases appear here." />
              ) : (
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {docs.map((d) => (
                    <li key={d.id}>
                      <Link href={`/documents?doc=${d.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/60">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{d.filename}</span>
                        <span className="shrink-0 text-xs text-subtle-foreground">{d.doc_category}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="ai" className="p-5">
              {!aiBrief ? (
                <EmptyState
                  icon={Sparkles}
                  title="Prepare for a meeting"
                  description="A short brief with matters, stage, fees and points to discuss."
                  action={<Button onClick={handleAIBrief} loading={aiLoading}>{!aiLoading && <Sparkles />} {aiLoading ? "Preparing" : "Generate brief"}</Button>}
                />
              ) : (
                <div className="space-y-4">
                  <AIText content={aiBrief} />
                  <div className="flex gap-2 border-t border-border pt-4">
                    <Button size="sm" variant="outline" onClick={handleAIBrief} loading={aiLoading}>Regenerate</Button>
                    <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(aiBrief); toast("Copied", "success") }}><Copy /> Copy</Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        <aside className="space-y-5">
          <Card>
            <CardHeader title="At a glance" />
            <dl className="px-5 pb-4 pt-1">
              <DetailRow label="Open cases">{openCases.length} of {cases.length}</DetailRow>
              <DetailRow label="Fees agreed">{formatINR(fees.agreed)}</DetailRow>
              <DetailRow label="Received">{formatINR(fees.received)}</DetailRow>
              <DetailRow label="Balance">
                <span className={fees.balance ? "text-warning-soft-foreground" : "text-success-soft-foreground"}>{formatINR(fees.balance)}</span>
              </DetailRow>
            </dl>
          </Card>
          <Card>
            <CardHeader title="Details" action={<Button variant="ghost" size="xs" onClick={() => setEditOpen(true)}>Edit</Button>} />
            <dl className="px-5 pb-4 pt-1">
              <DetailRow label="Email">{client.email || "Not added"}</DetailRow>
              <DetailRow label="Language">{client.preferred_language}</DetailRow>
              <DetailRow label={client.id_proof_type}>
                {client.id_proof_number ? (
                  <button type="button" onClick={() => setShowId((s) => !s)} className="font-mono text-[13px] hover:text-primary" title={showId ? "Hide" : "Show"}>
                    {showId ? client.id_proof_number : maskId(client.id_proof_number)}
                  </button>
                ) : (
                  "Not added"
                )}
              </DetailRow>
              <DetailRow label="Referred by">{client.referred_by || "Not recorded"}</DetailRow>
            </dl>
            {client.address && <p className="border-t border-border px-5 py-3 text-[13px] text-muted-foreground">{client.address}</p>}
            {client.notes && <p className="border-t border-border px-5 py-3 text-[13px] text-foreground">{client.notes}</p>}
          </Card>
        </aside>
      </div>

      <ClientEditSheet client={client} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}

type EditProps = { client: Client; open: boolean; onOpenChange: (o: boolean) => void }

function ClientEditSheet(props: EditProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && <ClientEditBody {...props} />}
    </Dialog>
  )
}

function ClientEditBody({ client, onOpenChange }: EditProps) {
  const { toast } = useToast()
  const [form, setForm] = useState(client)

  const set = (k: keyof Client, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) return
    updateClient(client.id, form)
    toast("Client details saved", "success")
    onOpenChange(false)
  }

  return (
    <SheetContent
      title="Edit client"
      description={client.full_name}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="client-edit-form"><Save /> Save</Button>
        </>
      }
    >
      <form id="client-edit-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required className="sm:col-span-2"><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
        <Field label="Mobile"><Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="Language">
          <Select value={form.preferred_language} onChange={(e) => set("preferred_language", e.target.value)}>
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </Select>
        </Field>
        <Field label="Address" className="sm:col-span-2"><Textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <Field label="ID proof">
          <Select value={form.id_proof_type} onChange={(e) => set("id_proof_type", e.target.value)}>
            {ID_PROOF_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="ID number"><Input value={form.id_proof_number} onChange={(e) => set("id_proof_number", e.target.value)} className="font-mono" /></Field>
        <Field label="Referred by" className="sm:col-span-2"><Input value={form.referred_by} onChange={(e) => set("referred_by", e.target.value)} /></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
      </form>
    </SheetContent>
  )
}
