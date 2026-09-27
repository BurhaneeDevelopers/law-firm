"use client"
import { MessageCircle } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownTrigger } from "@/components/ui/dropdown"
import { whatsappLink } from "@/lib/utils"
import type { Language } from "@/lib/constants"

interface WhatsAppMenuProps {
  phone: string
  /** Builds the message in the chosen language. */
  message: (language: Language) => string
  preferred?: string
  label?: string
  size?: ButtonProps["size"]
  variant?: ButtonProps["variant"]
  onSent?: () => void
  className?: string
}

/**
 * Opens WhatsApp with a prefilled message. Clients often prefer Hindi, so the
 * advocate picks the language at send time. The client's preference is listed first.
 */
export function WhatsAppMenu({ phone, message, preferred = "English", label = "WhatsApp", size = "sm", variant = "whatsapp", onSent, className }: WhatsAppMenuProps) {
  const languages: Language[] = preferred === "Hindi" ? ["Hindi", "English"] : ["English", "Hindi"]

  const send = (language: Language) => {
    window.open(whatsappLink(phone, message(language)), "_blank", "noopener,noreferrer")
    onSent?.()
  }

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button size={size} variant={variant} className={className} aria-label={label === "" ? "Send on WhatsApp" : undefined}>
          <MessageCircle />
          {label}
        </Button>
      </DropdownTrigger>
      <DropdownContent align="end" className="min-w-44">
        <DropdownLabel>Send message in</DropdownLabel>
        {languages.map((l) => (
          <DropdownItem key={l} onSelect={() => send(l)}>
            {l === "Hindi" ? "Hindi (हिन्दी)" : "English"}
            {l === preferred && <span className="ml-auto text-xs text-subtle-foreground">Preferred</span>}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  )
}
