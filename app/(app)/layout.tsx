import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Watermark } from "@/components/layout/watermark"
import { PageFrame } from "@/components/layout/page-frame"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-toast) focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="transition-[padding] duration-300 ease-out-soft md:pl-(--sidebar-width)">
        <Header />
        <main id="main" className="mx-auto max-w-[1400px] px-4 pb-28 pt-5 md:px-6 md:pb-12 md:pt-7">
          <PageFrame>{children}</PageFrame>
        </main>
      </div>
      <Watermark />
    </div>
  )
}
