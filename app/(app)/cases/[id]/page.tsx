"use client"
import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlarmClock, Briefcase, CalendarDays, CalendarPlus, Check, Copy, Download, Ellipsis, ExternalLink, FileText, Gavel,
  IndianRupee, NotebookPen, Pencil, Phone, Pin, PinOff, Plus, ScrollText, Trash2, Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, DetailRow } from "@/components/ui/card"
import { Badge, CaseTypeTag, CountdownBadge, StatusBadge, UrgentBadge } from "@/components/ui/badge"
import { Input, Textarea } from "@/components/ui/field"
import { Avatar, EmptyState, PageHeader } from "@/components/ui/misc"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown"
import { useToast } from "@/components/ui/toast"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { RecordOutcomeSheet } from "@/components/practice/record-outcome-sheet"
import { AddHearingDialog } from "@/components/practice/add-hearing-dialog"
import { UploadDialog } from "@/components/practice/upload-dialog"
import { WhatsAppMenu } from "@/components/practice/whatsapp-menu"
import { purposeTone } from "@/lib/constants"
import {
  cn, formatDate, formatINR, formatRelativeTime, formatTime, getDaysUntil, hearingReminderMessage, todayISO,
} from "@/lib/utils"
import {
  addDeadline, addNote, deleteCase, deleteDeadline, deleteDocument, deleteHearing, deleteNote, getCaseFees, getNextHearing,
  getCaseDueInfos, sortHearings, summariseDues, uid, updateNote, useDB, type Hearing,
} from "@/lib/store"
import { CaseEditSheet } from "./case-edit-sheet"
import { CaseFees } from "./case-fees"
import { useDues } from "@/components/dues/dues-context"
import { OverdueBanner } from "@/components/dues/overdue-banner"

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const db = useDB()
  const { toast } = useToast()
  const { confirm, dialogElement } = useConfirmDialog()

  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") ?? "overview")
  const dues = useDues()
  const [editOpen, setEditOpen] = useState(false)
  const [outcomeFor, setOutcomeFor] = useState<Hearing | null>(null)
  const [hearingOpen, setHearingOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [deadline, setDeadline] = useState({ title: "", due_date: "" })
  const [copied, setCopied] = useState(false)

  const caseData = db.cases.find((c) => c.id === id)

  if (!caseData) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Case not found"
        description="It may have been deleted, or the link is incorrect."
        action={<Button asChild variant="outline"><Link href="/cases">Back to cases</Link></Button>}
      />
    )
  }

  const client = db.clients.find((c) => c.id === caseData.client_id)
  const hearings = db.hearings.filter((h) => h.case_id === id)
  const upcoming = sortHearings(hearings.filter((h) => getDaysUntil(h.date) >= 0))
  const past = sortHearings(hearings.filter((h) => getDaysUntil(h.date) < 0), "desc")
  const nextHearing = getNextHearing(id, db.hearings)
  const needsOutcome = [...past, ...upcoming.filter((h) => getDaysUntil(h.date) === 0)].find((h) => !h.outcome)
  const documents = db.documents.filter((d) => d.case_id === id)
  const notes = db.notes.filter((n) => n.case_id === id).sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at))
  const notices = db.notices.filter((n) => n.case_id === id)
  const deadlines = db.deadlines.filter((d) => d.case_id === id).sort((a, b) => a.due_date.localeCompare(b.due_date))
  const fees = getCaseFees(id, db)
  const dueSummary = summariseDues(getCaseDueInfos(id, db))

  const copyCnr = async () => {
    try {
      await navigator.clipboard.writeText(caseData.cnr_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast("Could not copy. Select the number and copy it manually.", "error")
    }
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    addNote({ id: uid("note"), case_id: id, content: newNote.trim(), is_pinned: false, created_by: `Adv. ${db.lawyer.name}`, created_at: new Date().toISOString() })
    setNewNote("")
    toast("Note added", "success")
  }

  const handleAddDeadline = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deadline.title.trim() || !deadline.due_date) {
      toast("Enter what is due and the date", "error")
      return
    }
    addDeadline({ id: uid("dl"), case_id: id, title: deadline.title.trim(), due_date: deadline.due_date, case_number: caseData.case_number, client: client?.full_name ?? "" })
    setDeadline({ title: "", due_date: "" })
    toast("Deadline added", "success")
  }

  const reminder = (h: Hearing) => (lang: "English" | "Hindi") =>
    hearingReminderMessage(
      { clientName: client?.full_name ?? "", caseNumber: caseData.case_number, date: h.date, time: h.time, court: h.court_room, lawyerName: db.lawyer.name },
      lang
    )

  const renderHearing = (h: Hearing) => {
    const days = getDaysUntil(h.date)
    const isPastOrToday = days <= 0
    return (
      <li key={h.id} className="relative pb-5 pl-7 last:pb-0">
        <span className={cn("absolute left-[5px] top-2 size-2.5 rounded-full ring-4 ring-surface", days >= 0 ? "bg-primary" : h.outcome ? "bg-success" : "bg-warning")} aria-hidden />
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {formatDate(h.date, "EEE, dd MMM yyyy")} <span className="font-normal text-muted-foreground">· {formatTime(h.time)}</span>
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {h.court_room}
              {h.item_no ? ` · Item ${h.item_no}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={purposeTone[h.purpose] ?? "neutral"}>{h.purpose}</Badge>
            {days >= 0 && <CountdownBadge days={days} />}
          </div>
        </div>
        {h.outcome && (
          <div className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-[13px]">
            <span className="font-medium text-foreground">{h.outcome}.</span>{" "}
            <span className="text-muted-foreground">{h.outcome_notes}</span>
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {isPastOrToday && (
            <Button size="xs" variant={h.outcome ? "ghost" : "soft"} onClick={() => setOutcomeFor(h)}>
              <Gavel /> {h.outcome ? "Edit outcome" : "Record outcome"}
            </Button>
          )}
          {days >= 0 && client && (
            <WhatsAppMenu size="xs" variant="outline" label={h.reminder_sent ? "Remind again" : "Remind client"} phone={client.phone} preferred={client.preferred_language} message={reminder(h)} />
          )}
          <Button
            size="xs"
            variant="ghost"
            onClick={() => confirm("Delete this hearing?", `${formatDate(h.date)} (${h.purpose}) will be removed from the diary.`, () => { deleteHearing(h.id); toast("Hearing removed", "success") })}
          >
            <Trash2 /> Delete
          </Button>
        </div>
      </li>
    )
  }

  return (
    <div className="space-y-6">
      {dialogElement}

      <PageHeader
        back={{ href: "/cases", label: "Cases" }}
        title={caseData.title}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="font-mono text-[13px] text-foreground">{caseData.case_number}</span>
            {caseData.cnr_number && (
              <button type="button" onClick={copyCnr} className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground" title="Copy CNR number">
                CNR {caseData.cnr_number} {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
              </button>
            )}
            <CaseTypeTag type={caseData.case_type} />
            <StatusBadge status={caseData.status} />
            {caseData.priority === "Urgent" && <UrgentBadge />}
          </span>
        }
        actions={
          <>
            {needsOutcome && (
              <Button onClick={() => setOutcomeFor(needsOutcome)}><Gavel /> Record outcome</Button>
            )}
            <Button variant={needsOutcome ? "outline" : "primary"} onClick={() => setHearingOpen(true)}><CalendarPlus /> Add hearing</Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil /> Edit</Button>
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions"><Ellipsis /></Button>
              </DropdownTrigger>
              <DropdownContent className="w-52">
                <DropdownItem onSelect={() => setUploadOpen(true)}><Upload /> Upload document</DropdownItem>
                <DropdownItem onSelect={() => router.push(`/notices/new?case=${id}`)}><ScrollText /> Draft notice</DropdownItem>
                <DropdownSeparator />
                <DropdownItem
                  className="text-danger-soft-foreground [&_svg]:text-danger"
                  onSelect={() =>
                    confirm("Delete this case?", `${caseData.case_number} and its hearings, notes and deadlines will be removed. This cannot be undone.`, () => {
                      deleteCase(id)
                      toast(`${caseData.case_number} deleted`, "success")
                      router.push("/cases")
                    }, "Delete case")
                  }
                >
                  <Trash2 /> Delete case
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </>
        }
      />

      {dueSummary.overdueCount > 0 && dueSummary.oldestOverdue && (
        <OverdueBanner
          amount={dueSummary.overdueBalance}
          days={dueSummary.maxDaysOverdue}
          label={dueSummary.overdueCount > 1 ? `${dueSummary.overdueCount} dues` : dueSummary.oldestOverdue.due.description}
          onMarkPaid={dueSummary.overdueCount === 1 ? () => dues.markPaid(dueSummary.oldestOverdue!.due.id) : undefined}
          onRecord={() => dues.recordPayment({ caseId: id })}
          onView={() => setTab("fees")}
        />
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="min-w-0 overflow-hidden">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hearings" count={hearings.length}>Hearings</TabsTrigger>
              <TabsTrigger value="documents" count={documents.length}>Documents</TabsTrigger>
              <TabsTrigger value="notes" count={notes.length}>Notes</TabsTrigger>
              <TabsTrigger value="fees" count={dueSummary.openCount || undefined} className={dueSummary.overdueCount ? "[&>span]:bg-danger-soft! [&>span]:text-danger-soft-foreground!" : undefined}>Fees</TabsTrigger>
              <TabsTrigger value="notices" count={notices.length}>Notices</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 p-5">
              <section>
                <h2 className="text-sm font-semibold text-foreground">Brief facts</h2>
                <p className="mt-1.5 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">{caseData.description || "No facts recorded yet. Use Edit to add them."}</p>
              </section>
              <dl className="grid gap-x-8 sm:grid-cols-2">
                <DetailRow label="Court">{caseData.court}</DetailRow>
                <DetailRow label="Presiding officer">{caseData.judge || "Not recorded"}</DetailRow>
                <DetailRow label="Opposite party">{caseData.opposing_party || "Not recorded"}</DetailRow>
                <DetailRow label="Filed on">{formatDate(caseData.filing_date)}</DetailRow>
                <DetailRow label="Hearings so far">{past.length}</DetailRow>
                <DetailRow label="Priority">{caseData.priority}</DetailRow>
              </dl>
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><AlarmClock className="size-4 text-muted-foreground" /> Deadlines</h2>
                </div>
                {deadlines.length > 0 && (
                  <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                    {deadlines.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-foreground">{d.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(d.due_date, "EEE, dd MMM yyyy")}</p>
                        </div>
                        <CountdownBadge days={getDaysUntil(d.due_date)} />
                        <Button variant="ghost" size="icon-xs" aria-label="Remove deadline" onClick={() => { deleteDeadline(d.id); toast("Deadline removed", "success") }}>
                          <Trash2 />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                <form onSubmit={handleAddDeadline} className="mt-3 grid gap-2 sm:grid-cols-[1fr_160px_auto]">
                  <Input aria-label="Deadline" value={deadline.title} onChange={(e) => setDeadline((d) => ({ ...d, title: e.target.value }))} placeholder="e.g. File written statement (30 days)" />
                  <Input aria-label="Due date" type="date" min={todayISO()} value={deadline.due_date} onChange={(e) => setDeadline((d) => ({ ...d, due_date: e.target.value }))} />
                  <Button type="submit" variant="outline"><Plus /> Add</Button>
                </form>
              </section>
            </TabsContent>

            <TabsContent value="hearings" className="p-5">
              {hearings.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No hearings yet" description="Add the first date the court gives." action={<Button size="sm" onClick={() => setHearingOpen(true)}><CalendarPlus /> Add hearing</Button>} />
              ) : (
                <div className="space-y-6">
                  {upcoming.length > 0 && (
                    <section>
                      <h3 className="mb-3 text-xs font-medium text-subtle-foreground">Upcoming</h3>
                      <ol className="relative before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-border">{upcoming.map(renderHearing)}</ol>
                    </section>
                  )}
                  {past.length > 0 && (
                    <section>
                      <h3 className="mb-3 text-xs font-medium text-subtle-foreground">History</h3>
                      <ol className="relative before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-border">{past.map(renderHearing)}</ol>
                    </section>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="p-5">
              <div className="mb-4 flex justify-end">
                <Button size="sm" onClick={() => setUploadOpen(true)}><Upload /> Upload</Button>
              </div>
              {documents.length === 0 ? (
                <EmptyState icon={FileText} title="No documents" description="Upload the petition, vakalatnama and court orders." />
              ) : (
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {documents.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                        <FileText className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{d.filename}</p>
                        <p className="text-xs text-muted-foreground">{d.doc_category} · {d.size} · {formatDate(d.created_at)}</p>
                      </div>
                      {d.file_url ? (
                        <Button asChild variant="ghost" size="icon-sm" aria-label={`Download ${d.filename}`}>
                          <a href={d.file_url} download={d.filename}><Download /></a>
                        </Button>
                      ) : (
                        <Button asChild variant="ghost" size="icon-sm" aria-label={`Open ${d.filename} in documents`}>
                          <Link href={`/documents?doc=${d.id}`}><ExternalLink /></Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${d.filename}`}
                        onClick={() => confirm("Delete document?", `${d.filename} will be removed from this case.`, () => { deleteDocument(d.id); toast("Document deleted", "success") })}
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 p-5">
              <div className="space-y-2">
                <Textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddNote() }}
                  placeholder="Client instructions, points for arguments, witness details"
                  aria-label="New note"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-subtle-foreground">Ctrl + Enter to save</p>
                  <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}><NotebookPen /> Add note</Button>
                </div>
              </div>
              {notes.length === 0 ? (
                <EmptyState compact icon={NotebookPen} title="No notes yet" />
              ) : (
                <ul className="space-y-2.5">
                  {notes.map((n) => (
                    <li key={n.id} className={cn("rounded-xl border p-4", n.is_pinned ? "border-accent/35 bg-accent-soft/60" : "border-border")}>
                      <div className="flex items-start gap-3">
                        <p className="flex-1 whitespace-pre-line text-sm leading-relaxed text-foreground">{n.content}</p>
                        <div className="-mr-1.5 -mt-1 flex">
                          <Button variant="ghost" size="icon-xs" aria-label={n.is_pinned ? "Unpin note" : "Pin note"} onClick={() => updateNote(n.id, { is_pinned: !n.is_pinned })}>
                            {n.is_pinned ? <PinOff /> : <Pin />}
                          </Button>
                          <Button variant="ghost" size="icon-xs" aria-label="Delete note" onClick={() => confirm("Delete note?", "This note will be permanently deleted.", () => { deleteNote(n.id); toast("Note deleted", "success") })}>
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-subtle-foreground">
                        {n.is_pinned && <span className="font-medium text-accent-soft-foreground">Pinned · </span>}
                        {formatRelativeTime(n.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="fees" className="p-5">
              <CaseFees caseData={caseData} />
            </TabsContent>

            <TabsContent value="notices" className="p-5">
              <div className="mb-4 flex justify-end">
                <Button asChild size="sm"><Link href={`/notices/new?case=${id}`}><ScrollText /> Draft notice</Link></Button>
              </div>
              {notices.length === 0 ? (
                <EmptyState icon={ScrollText} title="No notices for this case" />
              ) : (
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {notices.map((n) => (
                    <li key={n.id}>
                      <Link href={`/notices/${n.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/60">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground">{n.notice_type} · {formatDate(n.created_at)}</p>
                        </div>
                        <Badge tone={n.status === "Sent" ? "success" : "neutral"}>{n.status}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

          </Tabs>
        </Card>

        <aside className="space-y-5">
          <Card className="overflow-hidden">
            <div className="p-5">
              <p className="text-xs font-medium text-muted-foreground">Next date</p>
              {nextHearing ? (
                <>
                  <p className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">{formatDate(nextHearing.date, "dd MMM yyyy")}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatDate(nextHearing.date, "EEEE")} · {formatTime(nextHearing.time)} · {nextHearing.purpose}
                  </p>
                  <p className="mt-2 text-[13px] text-muted-foreground">{nextHearing.court_room}{nextHearing.item_no ? ` · Item ${nextHearing.item_no}` : ""}</p>
                  <CountdownBadge days={getDaysUntil(nextHearing.date)} className="mt-3" />
                </>
              ) : (
                <>
                  <p className="mt-1.5 text-lg font-semibold text-foreground">Not listed</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">Add the date once the court gives it.</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => setHearingOpen(true)}><CalendarPlus /> Add hearing</Button>
                </>
              )}
            </div>
          </Card>

          {client ? (
            <Card>
              <CardHeader title="Client" action={<Button asChild variant="ghost" size="xs"><Link href={`/clients/${client.id}`}>Profile</Link></Button>} />
              <div className="px-5 pb-5 pt-2">
                <div className="flex items-center gap-3">
                  <Avatar name={client.full_name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{client.full_name}</p>
                    <p className="text-[13px] text-muted-foreground">{client.phone}</p>
                  </div>
                </div>
                {client.notes && <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-[13px] text-muted-foreground">{client.notes}</p>}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm"><a href={`tel:${client.phone.replace(/\s/g, "")}`}><Phone /> Call</a></Button>
                  {nextHearing ? (
                    <WhatsAppMenu size="sm" label="Remind" phone={client.phone} preferred={client.preferred_language} message={reminder(nextHearing)} />
                  ) : (
                    <WhatsAppMenu size="sm" label="WhatsApp" phone={client.phone} preferred={client.preferred_language} message={(lang) => (lang === "Hindi" ? `नमस्ते ${client.full_name} जी,\n\n` : `Dear ${client.full_name},\n\n`)} />
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-5">
              <p className="text-sm font-medium text-foreground">No client linked</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Link a client to send reminders and track fees.</p>
            </Card>
          )}

          <Card>
            <CardHeader title="Fees" action={<Button variant="ghost" size="xs" onClick={() => setTab("fees")}>Schedule</Button>} />
            <dl className="px-5 pt-1">
              <DetailRow label="Agreed">{formatINR(fees.agreed)}</DetailRow>
              <DetailRow label="Received"><span className="text-success-soft-foreground">{formatINR(fees.received)}</span></DetailRow>
              <DetailRow label="Overdue">
                <span className={dueSummary.overdueBalance ? "text-danger-soft-foreground" : "text-foreground"}>
                  {formatINR(dueSummary.overdueBalance)}
                  {dueSummary.maxDaysOverdue > 0 && <span className="font-normal"> · {dueSummary.maxDaysOverdue}d</span>}
                </span>
              </DetailRow>
              <DetailRow label="Next due">
                {dueSummary.next ? `${formatINR(dueSummary.next.balance)} · ${formatDate(dueSummary.next.due.due_date, "dd MMM")}` : "None scheduled"}
              </DetailRow>
            </dl>
            <div className="grid grid-cols-2 gap-2 px-5 pb-5 pt-2">
              <Button size="sm" variant="outline" onClick={() => dues.addDue({ caseId: id })}><CalendarPlus /> Add due</Button>
              <Button size="sm" onClick={() => dues.recordPayment({ caseId: id })}><IndianRupee /> Payment</Button>
            </div>
          </Card>
        </aside>
      </div>

      <CaseEditSheet caseData={caseData} open={editOpen} onOpenChange={setEditOpen} />
      <RecordOutcomeSheet hearing={outcomeFor} onOpenChange={(o) => !o && setOutcomeFor(null)} />
      <AddHearingDialog open={hearingOpen} onOpenChange={setHearingOpen} caseId={id} />
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} caseId={id} />
    </div>
  )
}
