"use client"
import { use, useState } from "react"
import Link from "next/link"
import { Check, MailCheck, Pencil, Printer, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/field"
import { EmptyState, PageHeader } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { WhatsAppMenu } from "@/components/practice/whatsapp-menu"
import { NoticePaper } from "@/components/practice/notice-paper"
import { formatDate } from "@/lib/utils"
import { updateNotice, useDB } from "@/lib/store"

export default function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const db = useDB()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")

  const notice = db.notices.find((n) => n.id === id)
  if (!notice) {
    return (
      <EmptyState
        icon={ScrollText}
        title="Notice not found"
        action={<Button asChild variant="outline"><Link href="/notices">Back to notices</Link></Button>}
      />
    )
  }

  const caseData = db.cases.find((c) => c.id === notice.case_id)
  const client = caseData ? db.clients.find((c) => c.id === caseData.client_id) : undefined

  const startEdit = () => {
    setDraft(notice.content)
    setEditing(true)
  }

  const saveEdit = () => {
    updateNotice(notice.id, { content: draft })
    setEditing(false)
    toast("Notice updated", "success")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        className="no-print"
        back={{ href: "/notices", label: "Notices" }}
        title={notice.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {notice.notice_type} · {formatDate(notice.created_at)}
            <Badge tone={notice.status === "Sent" ? "success" : "warning"}>{notice.status}</Badge>
            {caseData && (
              <Link href={`/cases/${caseData.id}`} className="font-mono text-xs text-primary hover:underline">{caseData.case_number}</Link>
            )}
          </span>
        }
        actions={
          editing ? (
            <>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={saveEdit}><Check /> Save</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startEdit}><Pencil /> Edit</Button>
              <Button variant="outline" onClick={() => window.print()}><Printer /> Print / PDF</Button>
              {client && (
                <WhatsAppMenu
                  size="md"
                  variant="outline"
                  label="Send to client"
                  phone={client.phone}
                  preferred={client.preferred_language}
                  message={(lang) =>
                    lang === "Hindi"
                      ? `नमस्ते ${client.full_name} जी,\n\nआपके केस ${caseData?.case_number} में "${notice.title}" तैयार है। कृपया देखकर पुष्टि करें।\n\nएडवोकेट ${db.lawyer.name}`
                      : `Dear ${client.full_name},\n\nThe ${notice.notice_type.toLowerCase()} in case ${caseData?.case_number} is ready for your review.\n\n${notice.content.slice(0, 600)}${notice.content.length > 600 ? "..." : ""}\n\nAdvocate ${db.lawyer.name}`
                  }
                />
              )}
              {notice.status === "Draft" && (
                <Button onClick={() => { updateNotice(notice.id, { status: "Sent" }); toast("Marked as sent", "success") }}>
                  <MailCheck /> Mark as sent
                </Button>
              )}
            </>
          )
        }
      />

      <NoticePaper
        lawyer={db.lawyer}
        date={notice.created_at}
        recipientName={notice.recipient_name}
        subject={notice.notice_type}
        reference={caseData?.case_number}
      >
        {editing ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={18}
            aria-label="Notice text"
            className="border-dashed bg-transparent font-serif text-[14.5px] leading-[1.8] text-[#1b1b22] shadow-none"
          />
        ) : (
          <div className="whitespace-pre-line">{notice.content}</div>
        )}
      </NoticePaper>
    </div>
  )
}
