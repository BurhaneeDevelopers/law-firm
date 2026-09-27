import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Noto_Sans_Devanagari, Source_Serif_4 } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/ui/toast"
import { themeInitScript } from "@/lib/theme"
import { Providers } from "./providers"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })
// Hindi client messages and names render in Devanagari.
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "500", "600"], variable: "--font-devanagari", display: "swap" })
// Legal notices are typeset like court documents.
const documentSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-document", display: "swap" })

export const metadata: Metadata = {
  title: { default: "VakilOS", template: "%s · VakilOS" },
  description: "Practice management for Indian advocates: court diary, cases, clients, fees and dues, legal notices and AI citation check.",
  applicationName: "VakilOS",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c14" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${devanagari.variable} ${documentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
