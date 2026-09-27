"use client"
import { useRouter } from "next/navigation"
import { Briefcase, CalendarPlus, Plus, ScrollText, Upload, UserPlus } from "lucide-react"
import { useState } from "react"
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownSeparator, DropdownTrigger } from "@/components/ui/dropdown"
import { Button } from "@/components/ui/button"
import { AddHearingDialog } from "@/components/practice/add-hearing-dialog"
import { UploadDialog } from "@/components/practice/upload-dialog"
import { cn } from "@/lib/utils"

/** One entry point for everything an advocate creates during the day. */
export function QuickAddMenu({ variant = "button" }: { variant?: "button" | "fab" }) {
  const router = useRouter()
  const [hearingOpen, setHearingOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <>
      <Dropdown>
        <DropdownTrigger asChild>
          {variant === "fab" ? (
            <button
              type="button"
              aria-label="Create new"
              className={cn(
                "flex size-12 -translate-y-2 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md",
                "transition-transform active:scale-95"
              )}
            >
              <Plus className="size-6" strokeWidth={2.2} />
            </button>
          ) : (
            <Button size="sm" aria-label="Create new">
              <Plus /> <span className="hidden lg:inline">New</span>
            </Button>
          )}
        </DropdownTrigger>
        <DropdownContent align={variant === "fab" ? "center" : "end"} side={variant === "fab" ? "top" : "bottom"} className="w-56">
          <DropdownLabel>Create</DropdownLabel>
          <DropdownItem onSelect={() => setHearingOpen(true)}><CalendarPlus /> Hearing date</DropdownItem>
          <DropdownItem onSelect={() => router.push("/cases/new")}><Briefcase /> Case</DropdownItem>
          <DropdownItem onSelect={() => router.push("/clients/new")}><UserPlus /> Client</DropdownItem>
          <DropdownSeparator />
          <DropdownItem onSelect={() => router.push("/notices/new")}><ScrollText /> Legal notice</DropdownItem>
          <DropdownItem onSelect={() => setUploadOpen(true)}><Upload /> Upload document</DropdownItem>
        </DropdownContent>
      </Dropdown>
      <AddHearingDialog open={hearingOpen} onOpenChange={setHearingOpen} />
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  )
}
