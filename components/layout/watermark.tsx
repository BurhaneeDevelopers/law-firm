import { DEVELOPER_CREDIT } from "@/lib/constants"

/** Developer credit shown on every page. On phones it sits just above the bottom tab bar. */
export function Watermark() {
  return (
    <p className="no-print fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3 z-(--z-sticky) rounded-full border border-border bg-surface/90 px-3 py-1 text-[11px] font-medium text-subtle-foreground shadow-sm backdrop-blur md:bottom-4 md:right-4">
      Crafted with{" "}
      <span role="img" aria-label="love">
        ❤️
      </span>{" "}
      by{" "}
      <a
        href={DEVELOPER_CREDIT.href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
      >
        {DEVELOPER_CREDIT.label}
      </a>
    </p>
  )
}
