"use client"
import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, MessageSquare, Check } from "lucide-react"
import { getNotices, getCases } from "@/lib/store"
import { formatDate } from "@/lib/utils"
import { demoLawyer } from "@/lib/demo-data"

export default function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const notice = getNotices().find(n => n.id === id)
  const caseData = notice ? getCases().find(c => c.id === notice.case_id) : null

  if (!notice) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Notice not found</p>
        <Link href="/notices" className="text-indigo-600 text-sm font-medium mt-2 block">← Back</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{notice.title}</h1>
          <p className="text-sm text-slate-500">{notice.notice_type} · {formatDate(notice.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors">
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </button>
        </div>
      </div>

      <div className="notice-paper rounded-2xl p-8">
        <div className="text-center mb-6">
          <p className="text-xl font-bold text-slate-900">{demoLawyer.firm_name}</p>
          <p className="text-sm text-slate-500 mt-1">{demoLawyer.firm_address}</p>
          <p className="text-sm text-slate-500">Bar Council No: {demoLawyer.bar_council_no}</p>
          <div className="w-16 h-px bg-slate-300 mx-auto mt-4" />
        </div>

        <div className="text-right mb-4">
          <p className="text-sm text-slate-700">Date: {formatDate(notice.created_at)}</p>
        </div>

        <p className="text-sm font-bold text-slate-900 mb-4 text-center underline uppercase">{notice.notice_type}</p>

        <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line min-h-[300px]">
          {notice.content}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-sm font-semibold text-slate-900">Advocate {demoLawyer.name}</p>
          <p className="text-xs text-slate-500">{demoLawyer.firm_name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs text-slate-500">Status:</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${notice.status === "Sent" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600"}`}>
          {notice.status}
        </span>
        {caseData && (
          <Link href={`/cases/${caseData.id}`} className="ml-auto text-xs text-indigo-600 font-medium hover:text-indigo-700">
            View Case: {caseData.case_number} →
          </Link>
        )}
      </div>
    </div>
  )
}
