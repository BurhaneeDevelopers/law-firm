import Link from "next/link"

const WHATSAPP_URL = "https://wa.me/919003078610?text=Hi%20Taheri%20Developers"

export function Watermark() {
  return (
    <Link
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-3 right-3 z-50 rounded-full border border-indigo-200/70 bg-white/90 px-3 py-1 text-[11px] font-semibold text-indigo-700 shadow-lg backdrop-blur-md transition hover:bg-indigo-700 hover:text-white dark:border-slate-600 dark:bg-slate-900/90 dark:text-indigo-200"
    >
      Taheri Developers
    </Link>
  )
}
