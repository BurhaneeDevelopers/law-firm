import { DEVELOPER_CREDIT } from "@/lib/constants"

/** Developer credit. Desktop only: on phones the credit lives in the "More" drawer so it never covers the tab bar. */
export function Watermark() {
  return (
    <a
      href={DEVELOPER_CREDIT.href}
      target="_blank"
      rel="noreferrer"
      className="no-print fixed bottom-4 right-4 z-(--z-sticky) hidden rounded-full border border-border bg-surface/90 px-3 py-1 text-[11px] font-medium text-subtle-foreground shadow-sm backdrop-blur transition-colors hover:border-primary/40 hover:text-primary md:block"
    >
      {DEVELOPER_CREDIT.label}
    </a>
  )
}
