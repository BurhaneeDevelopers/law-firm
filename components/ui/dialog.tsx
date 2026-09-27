"use client"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

function Overlay() {
  return (
    <DialogPrimitive.Overlay className="fixed inset-0 z-(--z-overlay) bg-overlay backdrop-blur-[2px] animate-overlay-in" />
  )
}

interface ContentProps extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  hideTitle?: boolean
}

/** Centered modal. Use for short, focused tasks. */
export function DialogContent({ title, description, footer, hideTitle, className, children, ...props }: ContentProps) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-[8vh] z-(--z-overlay) flex max-h-[84vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 flex-col",
          "rounded-2xl border border-border bg-surface shadow-lg animate-pop focus:outline-none",
          className
        )}
        {...props}
      >
        <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", hideTitle && "sr-only")}>
          <div>
            <DialogPrimitive.Title className="text-base font-semibold text-foreground">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-[13px] text-muted-foreground">{description}</DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{typeof title === "string" ? title : "Dialog"}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Close"
            className="-mr-1.5 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-subtle-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3.5">{footer}</div>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

/** Right-side panel. Keeps page context visible; use for record outcome, uploads, details. */
export function SheetContent({ title, description, footer, className, children, ...props }: ContentProps) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-(--z-overlay) flex w-full max-w-md flex-col border-l border-border bg-surface shadow-lg",
          "animate-sheet-in focus:outline-none",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <DialogPrimitive.Title className="text-base font-semibold text-foreground">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-0.5 text-[13px] text-muted-foreground">{description}</DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{typeof title === "string" ? title : "Panel"}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Close"
            className="-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-subtle-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3.5 pb-safe">{footer}</div>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
