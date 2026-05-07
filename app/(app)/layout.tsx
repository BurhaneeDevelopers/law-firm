import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Watermark } from "@/components/layout/watermark"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors">
      <Sidebar />
      <div className="md:pl-[260px] transition-all duration-300">
        <Header />
        <main className="p-4 md:p-6 pb-20 md:pb-6 page-enter">
          {children}
        </main>
      </div>
      <Watermark />
    </div>
  )
}
