import Link from "next/link"
import { Scale } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground">
        <Scale className="size-6" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">This page is not on the board</h1>
      <p className="mt-2 max-w-[42ch] text-sm text-muted-foreground">
        The link may be old or the record was removed. Your diary and cases are one click away.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/dashboard" className="inline-flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
          Go to today
        </Link>
        <Link href="/cases" className="inline-flex h-10 items-center rounded-[10px] border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface-2">
          Open cases
        </Link>
      </div>
    </main>
  )
}
