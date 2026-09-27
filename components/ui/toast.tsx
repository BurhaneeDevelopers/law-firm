"use client"
import { useState, useCallback, createContext, useContext, useRef } from "react"
import { CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  type: ToastType
  message: string
  action?: { label: string; onClick: () => void }
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, action?: Toast["action"]) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CircleCheck className="size-[18px] text-success" />,
  error: <CircleX className="size-[18px] text-danger" />,
  info: <Info className="size-[18px] text-primary" />,
  warning: <TriangleAlert className="size-[18px] text-warning" />,
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = "info", action?: Toast["action"]) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev.slice(-3), { id, type, message, action }])
      timers.current.set(id, setTimeout(() => dismiss(id), action ? 6000 : 3800))
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-(--z-toast) flex flex-col items-center gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-lg animate-rise"
            )}
          >
            <span className="mt-px">{icons[t.type]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-foreground">{t.message}</p>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick()
                    dismiss(t.id)
                  }}
                  className="mt-1 text-[13px] font-semibold text-primary hover:underline"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="-mr-1 -mt-0.5 flex size-6 items-center justify-center rounded-md text-subtle-foreground hover:bg-surface-2 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
