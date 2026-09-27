"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Download, ExternalLink, FileImage, FileText, FileType2, FolderOpen, LayoutGrid, List, Trash2, Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, DetailRow } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchInput, Select } from "@/components/ui/field"
import { Chip, EmptyState, PageHeader, Segmented } from "@/components/ui/misc"
import { Dialog, SheetContent } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { UploadDialog } from "@/components/practice/upload-dialog"
import { DOC_CATEGORIES } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import { deleteDocument, useDB, type Document } from "@/lib/store"

const fileIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  PDF: FileText,
  Word: FileType2,
  Image: FileImage,
}

export default function DocumentsPage() {
  const db = useDB()
  const { toast } = useToast()
  const { confirm, dialogElement } = useConfirmDialog()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [caseFilter, setCaseFilter] = useState("All")
  const [view, setView] = useState<"grid" | "list">("list")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [openId, setOpenId] = useState<string | null>(() => new URLSearchParams(window.location.search).get("doc"))

  const caseById = useMemo(() => new Map(db.cases.map((c) => [c.id, c])), [db.cases])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return db.documents
      .filter((d) => {
        const c = caseById.get(d.case_id)
        const matchQ = !q || d.filename.toLowerCase().includes(q) || c?.case_number.toLowerCase().includes(q) || c?.title.toLowerCase().includes(q)
        return matchQ && (category === "All" || d.doc_category === category) && (caseFilter === "All" || d.case_id === caseFilter)
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  }, [db.documents, search, category, caseFilter, caseById])

  const openDoc = openId ? db.documents.find((d) => d.id === openId) : undefined
  const openCase = openDoc ? caseById.get(openDoc.case_id) : undefined

  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>()
    db.documents.forEach((d) => m.set(d.doc_category, (m.get(d.doc_category) ?? 0) + 1))
    return m
  }, [db.documents])

  const docIcon = (d: Document, size = "size-4") => {
    const Icon = fileIcon[d.file_type] ?? FileText
    return <Icon className={size} />
  }

  return (
    <div className="space-y-5">
      {dialogElement}
      <PageHeader
        title="Documents"
        description={`${db.documents.length} files across ${new Set(db.documents.map((d) => d.case_id)).size} cases`}
        actions={<Button onClick={() => setUploadOpen(true)}><Upload /> Upload</Button>}
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <SearchInput className="sm:max-w-sm sm:flex-1" value={search} onChange={setSearch} placeholder="Search file name or case" />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select aria-label="Filter by case" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} className="h-9 w-auto min-w-44 max-w-64">
              <option value="All">All cases</option>
              {db.cases.map((c) => <option key={c.id} value={c.id}>{c.case_number}</option>)}
            </Select>
            <Segmented
              ariaLabel="View"
              value={view}
              onChange={setView}
              options={[
                { value: "list", label: <span className="sr-only">List</span>, icon: <List />, title: "List" },
                { value: "grid", label: <span className="sr-only">Grid</span>, icon: <LayoutGrid />, title: "Grid" },
              ]}
            />
          </div>
        </div>
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={category === "All"} onClick={() => setCategory("All")}>All</Chip>
          {DOC_CATEGORIES.filter((c) => categoryCounts.get(c)).map((c) => (
            <Chip key={c} active={category === c} count={categoryCounts.get(c)} onClick={() => setCategory(category === c ? "All" : c)}>{c}</Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderOpen}
            title={db.documents.length ? "No documents match" : "No documents yet"}
            description={db.documents.length ? "Change the search or filters." : "Upload petitions, orders and evidence to keep each case file complete."}
            action={<Button size="sm" onClick={() => setUploadOpen(true)}><Upload /> Upload</Button>}
          />
        </Card>
      ) : view === "list" ? (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {filtered.map((d) => {
              const c = caseById.get(d.case_id)
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(d.id)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-2/60"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">{docIcon(d)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{d.filename}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        <span className="font-mono">{c?.case_number ?? "No case"}</span> · {d.size} · {formatDate(d.created_at)}
                      </span>
                    </span>
                    <Badge className="hidden sm:inline-flex">{d.doc_category}</Badge>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d) => {
            const c = caseById.get(d.case_id)
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setOpenId(d.id)}
                className="flex flex-col rounded-2xl border border-border bg-surface p-4 text-left shadow-xs transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-md"
              >
                <span className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">{docIcon(d)}</span>
                  <Badge>{d.doc_category}</Badge>
                </span>
                <span className="mt-3 line-clamp-2 break-all text-[13px] font-medium text-foreground">{d.filename}</span>
                <span className="mt-auto pt-2 font-mono text-[11px] text-subtle-foreground">{c?.case_number}</span>
              </button>
            )
          })}
        </div>
      )}

      <Dialog open={!!openDoc} onOpenChange={(o) => { if (!o) setOpenId(null) }}>
        {openDoc && (
          <SheetContent title={openDoc.filename} description={`${openDoc.doc_category} · ${openDoc.size}`} className="max-w-lg">
            <div className="space-y-5">
              <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
                {openDoc.file_url && openDoc.file_type === "PDF" ? (
                  <iframe src={openDoc.file_url} title={openDoc.filename} className="h-80 w-full bg-white" />
                ) : openDoc.file_url && openDoc.file_type === "Image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={openDoc.file_url} alt={openDoc.filename} className="max-h-80 w-full object-contain" />
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                    <span className="text-muted-foreground">{docIcon(openDoc, "size-7")}</span>
                    <p className="max-w-[32ch] text-xs text-subtle-foreground">Preview appears for files uploaded in this session. Stored files open once cloud storage is connected.</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {openDoc.file_url && (
                  <Button asChild size="sm"><a href={openDoc.file_url} download={openDoc.filename}><Download /> Download</a></Button>
                )}
                {openCase && (
                  <Button asChild size="sm" variant="outline"><Link href={`/cases/${openCase.id}`}><ExternalLink /> Open case</Link></Button>
                )}
                <Button
                  size="sm"
                  variant="danger-ghost"
                  onClick={() => confirm("Delete document?", `${openDoc.filename} will be removed.`, () => { deleteDocument(openDoc.id); setOpenId(null); toast("Document deleted", "success") })}
                >
                  <Trash2 /> Delete
                </Button>
              </div>

              <dl className="divide-y divide-border rounded-xl border border-border px-4">
                <DetailRow label="Case">{openCase ? <span className="font-mono">{openCase.case_number}</span> : "Not linked"}</DetailRow>
                <DetailRow label="Uploaded by">{openDoc.uploaded_by}</DetailRow>
                <DetailRow label="Date">{formatDate(openDoc.created_at, "dd MMM yyyy, h:mm a")}</DetailRow>
              </dl>

            </div>
          </SheetContent>
        )}
      </Dialog>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} caseId={caseFilter !== "All" ? caseFilter : undefined} />
    </div>
  )
}
