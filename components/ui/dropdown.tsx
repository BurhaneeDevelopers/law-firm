"use client"
import * as Menu from "@radix-ui/react-dropdown-menu"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export const Dropdown = Menu.Root
export const DropdownTrigger = Menu.Trigger

export function DropdownContent({ className, align = "end", sideOffset = 8, ...props }: React.ComponentPropsWithoutRef<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-(--z-popover) min-w-52 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg animate-pop",
          className
        )}
        {...props}
      />
    </Menu.Portal>
  )
}

export function DropdownItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none",
        "data-highlighted:bg-surface-2 data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function DropdownCheckItem({ checked, className, children, ...props }: React.ComponentPropsWithoutRef<typeof Menu.Item> & { checked: boolean }) {
  return (
    <DropdownItem className={className} {...props}>
      {children}
      <Check className={cn("ml-auto size-4 text-primary!", !checked && "invisible")} />
    </DropdownItem>
  )
}

export function DropdownLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof Menu.Label>) {
  return <Menu.Label className={cn("px-2.5 pb-1 pt-2 text-xs font-medium text-subtle-foreground", className)} {...props} />
}

export function DropdownSeparator() {
  return <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
}
