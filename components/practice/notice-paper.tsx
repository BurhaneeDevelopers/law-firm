import { cn, formatDate } from "@/lib/utils"
import type { Lawyer } from "@/lib/store"

interface NoticePaperProps {
  lawyer: Lawyer
  date: string
  recipientName: string
  recipientAddress?: string
  subject: string
  reference?: string
  children: React.ReactNode
  className?: string
}

/** Advocate's letterhead layout. Also the print area for Export PDF. */
export function NoticePaper({ lawyer, date, recipientName, recipientAddress, subject, reference, children, className }: NoticePaperProps) {
  return (
    <article className={cn("document-paper print-area rounded-xl px-6 py-8 font-serif sm:px-12 sm:py-12", className)}>
      <header className="border-b-2 border-double border-[#1b1b22]/60 pb-4 text-center">
        <p className="text-xl font-semibold tracking-wide">{lawyer.firm_name}</p>
        <p className="mt-1 text-[13px]">Advocate {lawyer.name} · Enrolment {lawyer.bar_council_no}</p>
        <p className="text-[13px] opacity-80">{lawyer.firm_address}</p>
        <p className="text-[13px] opacity-80">{lawyer.phone} · {lawyer.email}</p>
      </header>

      <div className="mt-6 flex flex-wrap justify-between gap-2 text-[14px]">
        <p>{reference ? `Ref: ${reference}` : " "}</p>
        <p>Date: {formatDate(date, "dd.MM.yyyy")}</p>
      </div>

      <div className="mt-5 text-[14px] leading-relaxed">
        <p className="font-semibold">To,</p>
        <p className="whitespace-pre-line">{recipientName || "[Recipient name]"}</p>
        {recipientAddress && <p className="whitespace-pre-line">{recipientAddress}</p>}
      </div>

      <p className="mt-6 text-center text-[14px] font-semibold uppercase tracking-wide underline underline-offset-4">{subject}</p>

      <div className="mt-5 text-[14.5px] leading-[1.8]">{children}</div>

      <footer className="mt-10 flex justify-end">
        <div className="text-right text-[14px]">
          <div className="mb-10 h-px w-44" />
          <p className="font-semibold">({lawyer.name})</p>
          <p>Advocate</p>
          <p className="opacity-80">{lawyer.firm_name}</p>
        </div>
      </footer>
    </article>
  )
}
