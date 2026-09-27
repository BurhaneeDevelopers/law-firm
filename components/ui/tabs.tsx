"use client"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

export const Tabs = TabsPrimitive.Root
export const TabsContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content className={cn("focus-visible:outline-none animate-fade-in", className)} {...props} />
)

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("scrollbar-hide flex gap-1 overflow-x-auto border-b border-border px-3", className)}
      {...props}
    />
  )
}

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  count?: number
}

export function TabsTrigger({ className, children, count, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "group relative -mb-px flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-2.5 text-sm font-medium text-muted-foreground",
        "transition-colors hover:text-foreground",
        "data-[state=active]:border-primary data-[state=active]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className="tabular rounded-md bg-surface-2 px-1.5 text-[11px] font-semibold leading-5 text-muted-foreground group-data-[state=active]:bg-primary-soft group-data-[state=active]:text-primary-soft-foreground">
          {count}
        </span>
      )}
    </TabsPrimitive.Trigger>
  )
}
