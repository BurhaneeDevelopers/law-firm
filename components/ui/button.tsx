import { forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out-soft",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        accent: "bg-accent text-accent-foreground shadow-xs hover:bg-accent-hover",
        secondary: "bg-surface-2 text-foreground hover:bg-surface-3",
        outline: "border border-border bg-surface text-foreground shadow-xs hover:bg-surface-2 hover:border-border-strong",
        ghost: "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        soft: "bg-primary-soft text-primary-soft-foreground hover:bg-primary/15",
        danger: "bg-danger text-danger-foreground shadow-xs hover:bg-danger-hover",
        "danger-ghost": "text-danger-soft-foreground hover:bg-danger-soft",
        whatsapp: "bg-whatsapp text-white shadow-xs hover:bg-whatsapp-hover",
        link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 rounded-lg px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-8 rounded-lg px-3 text-[13px] [&_svg]:size-4",
        md: "h-9 rounded-[10px] px-3.5 text-sm [&_svg]:size-4",
        lg: "h-11 rounded-xl px-5 text-[15px] [&_svg]:size-[18px]",
        icon: "size-9 rounded-[10px] [&_svg]:size-[18px]",
        "icon-sm": "size-8 rounded-lg [&_svg]:size-4",
        "icon-xs": "size-7 rounded-md [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, children, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={asChild ? undefined : disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && (
              <span
                aria-hidden
                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
              />
            )}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"
