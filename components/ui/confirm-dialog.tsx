"use client"
import { useState } from "react"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { TriangleAlert } from "lucide-react"
import { Button } from "./button"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Delete", onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-(--z-overlay) bg-overlay backdrop-blur-[2px] animate-overlay-in" />
        <AlertDialog.Content className="fixed left-1/2 top-[18vh] z-(--z-overlay) w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border bg-surface p-5 shadow-lg animate-pop focus:outline-none">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger-soft-foreground">
              <TriangleAlert className="size-5" />
            </div>
            <div>
              <AlertDialog.Title className="text-base font-semibold text-foreground">{title}</AlertDialog.Title>
              <AlertDialog.Description className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </AlertDialog.Description>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

type Pending = { title: string; description: string; confirmLabel?: string; onConfirm: () => void }

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<Pending | null>(null)

  const confirm = (title: string, description: string, onConfirm: () => void, confirmLabel?: string) => {
    setDialog({ title, description, onConfirm, confirmLabel })
  }

  const dialogElement = (
    <ConfirmDialog
      open={dialog !== null}
      title={dialog?.title ?? ""}
      description={dialog?.description ?? ""}
      confirmLabel={dialog?.confirmLabel}
      onConfirm={() => {
        dialog?.onConfirm()
        setDialog(null)
      }}
      onCancel={() => setDialog(null)}
    />
  )

  return { confirm, dialogElement }
}
