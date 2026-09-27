"use client"
import { useRef, useState } from "react"
import { FileText, Upload, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, Select } from "@/components/ui/field"
import { useToast } from "@/components/ui/toast"
import { DOC_CATEGORIES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { addDocument, getCases, getDB, uid } from "@/lib/store"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId?: string
}

const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
const MAX_MB = 25

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function fileType(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  if (ext === "pdf") return "PDF"
  if (ext === "doc" || ext === "docx") return "Word"
  if (["jpg", "jpeg", "png"].includes(ext)) return "Image"
  return "Other"
}

export function UploadDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && <UploadBody {...props} />}
    </Dialog>
  )
}

/** Mounted only while open, so each upload starts clean. */
function UploadBody({ onOpenChange, caseId }: Props) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [targetCase, setTargetCase] = useState(caseId ?? "")
  const [category, setCategory] = useState("Petition")
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState("")

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const incoming = Array.from(list)
    const tooBig = incoming.find((f) => f.size > MAX_MB * 1024 * 1024)
    if (tooBig) setError(`${tooBig.name} is larger than ${MAX_MB} MB`)
    else setError("")
    setFiles((prev) => [...prev, ...incoming.filter((f) => f.size <= MAX_MB * 1024 * 1024)])
  }

  const submit = () => {
    if (files.length === 0) {
      setError("Choose at least one file")
      return
    }
    if (!targetCase) {
      setError("Choose the case these files belong to")
      return
    }
    const lawyer = getDB().lawyer
    files.forEach((f) =>
      addDocument({
        id: uid("doc"),
        case_id: targetCase,
        filename: f.name,
        file_url: URL.createObjectURL(f),
        file_type: fileType(f.name),
        doc_category: category,
        uploaded_by: `Adv. ${lawyer.name}`,
        created_at: new Date().toISOString(),
        size: formatSize(f.size),
      })
    )
    toast(`${files.length} ${files.length === 1 ? "file" : "files"} uploaded`, "success")
    onOpenChange(false)
  }

  return (
    <DialogContent
      title="Upload documents"
      description="PDF, Word or photos of orders, petitions and evidence."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={files.length === 0}><Upload /> Upload {files.length > 0 ? files.length : ""}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
          className={cn(
            "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
            dragging ? "border-primary bg-primary-soft" : "border-border-strong hover:border-primary hover:bg-surface-2"
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
            <Upload className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">Drop files here or tap to browse</span>
          <span className="text-xs text-subtle-foreground">Up to {MAX_MB} MB each</span>
        </button>
        <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = "" }} />

        {files.length > 0 && (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-3 py-2.5">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{f.name}</span>
                <span className="tabular text-xs text-subtle-foreground">{formatSize(f.size)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="flex size-6 items-center justify-center rounded-md text-subtle-foreground hover:bg-surface-2 hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {!caseId && (
            <Field label="Case" required>
              <Select value={targetCase} onChange={(e) => { setTargetCase(e.target.value); setError("") }}>
                <option value="">Select a case</option>
                {getCases().map((c) => (
                  <option key={c.id} value={c.id}>{c.case_number}</option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {DOC_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
        </div>

        {error && <p role="alert" className="text-[13px] font-medium text-danger-soft-foreground">{error}</p>}
      </div>
    </DialogContent>
  )
}
