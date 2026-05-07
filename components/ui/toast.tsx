"use client"
import { useState, useCallback, createContext, useContext } from "react"
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"
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

const icons = {
  success: <CheckCircle className="w-4 h-4 text-emerald-600" />,
  error: <XCircle className="w-4 h-4 text-rose-600" />,
  info: <Info className="w-4 h-4 text-indigo-600" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
}

const styles = {
  success: "border-emerald-200 bg-white",
  error: "border-rose-200 bg-white",
  info: "border-indigo-200 bg-white",
  warning: "border-amber-200 bg-white",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = "info", action?: Toast["action"]) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, message, action }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 p-3.5 rounded-xl border shadow-lg animate-slide-up",
              styles[t.type]
            )}
          >
            {icons[t.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 leading-snug">{t.message}</p>
              {t.action && (
                <button
                  onClick={t.action.onClick}
                  className="text-xs font-semibold text-indigo-600 mt-1 hover:text-indigo-700"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
