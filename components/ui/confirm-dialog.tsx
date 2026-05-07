"use client"
import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"

interface ConfirmDialogProps {
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, description, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    title: string
    description: string
    onConfirm: () => void
  } | null>(null)

  const confirm = (title: string, description: string, onConfirm: () => void) => {
    setDialog({ title, description, onConfirm })
  }

  const dialogElement = dialog ? (
    <ConfirmDialog
      title={dialog.title}
      description={dialog.description}
      onConfirm={() => { dialog.onConfirm(); setDialog(null) }}
      onCancel={() => setDialog(null)}
    />
  ) : null

  return { confirm, dialogElement }
}
