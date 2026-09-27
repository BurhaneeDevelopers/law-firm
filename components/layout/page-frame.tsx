"use client"
import { usePathname } from "next/navigation"
import { Hydrated } from "@/lib/use-hydrated"
import { Skeleton } from "@/components/ui/skeleton"

function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  )
}

/** Renders page content after hydration (dates depend on the browser clock) and animates route changes. */
export function PageFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <Hydrated fallback={<PageSkeleton />}>
      <div key={pathname} className="animate-rise">
        {children}
      </div>
    </Hydrated>
  )
}
