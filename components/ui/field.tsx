import { forwardRef, useId, cloneElement, isValidElement } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

const controlBase = [
  "w-full rounded-[10px] border bg-surface text-sm text-foreground shadow-xs",
  "transition-[border-color,box-shadow] duration-150",
  "placeholder:text-subtle-foreground",
  "hover:border-border-strong",
  "focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20",
  "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted-foreground",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/25",
]

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(controlBase, "h-10 px-3", className)} {...props} />
  )
)
Input.displayName = "Input"

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(controlBase, "min-h-20 resize-y px-3 py-2.5 leading-relaxed", className)} {...props} />
  )
)
Textarea.displayName = "Textarea"

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(controlBase, "h-10 appearance-none pl-3 pr-9", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
    </div>
  )
)
Select.displayName = "Select"

interface FieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  children: React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>
}

/** Label above, control, then hint or error below. Wires id, aria-invalid and aria-describedby. */
export function Field({ label, required, hint, error, className, children }: FieldProps) {
  const autoId = useId()
  const id = children.props.id ?? autoId
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const control = isValidElement(children)
    ? cloneElement(children, { id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })
    : children

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
      </label>
      {control}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-danger-soft-foreground">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-subtle-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string
  onChange: (value: string) => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, className, placeholder = "Search", ...props }, ref) => (
    <div className={cn("relative", className)}>
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(controlBase, "h-10 pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden")}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-subtle-foreground hover:bg-surface-2 hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
)
SearchInput.displayName = "SearchInput"
