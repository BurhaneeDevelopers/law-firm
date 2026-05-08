import Link from "next/link"

const WHATSAPP_URL = "https://wa.me/919003078610?text=Hi%20Taheri%20Developers"

export function Watermark() {
  return (
    <Link
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-3 right-3 z-50 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-600 hover:text-white"
    >
      Taheri Developers
    </Link>
  )
}
