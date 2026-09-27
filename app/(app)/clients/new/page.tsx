"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { PageHeader } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { ID_PROOF_TYPES, LANGUAGES } from "@/lib/constants"
import { isValidEmail, isValidIndianMobile } from "@/lib/utils"
import { addClient, uid, useDB } from "@/lib/store"

const idPatterns: Record<string, { re: RegExp; message: string; placeholder: string }> = {
  Aadhaar: { re: /^\d{4}\s?\d{4}\s?\d{4}$/, message: "Aadhaar has 12 digits", placeholder: "1234 5678 9012" },
  "PAN Card": { re: /^[A-Z]{5}\d{4}[A-Z]$/i, message: "PAN format is ABCDE1234F", placeholder: "ABCDE1234F" },
  Passport: { re: /^[A-Z]\d{7}$/i, message: "Passport is a letter followed by 7 digits", placeholder: "P1234567" },
  "Voter ID": { re: /^.{6,}$/, message: "Enter the EPIC number", placeholder: "ABC1234567" },
  "Driving Licence": { re: /^.{8,}$/, message: "Enter the full licence number", placeholder: "HR-04-2019-0123456" },
}

export default function NewClientPage() {
  const router = useRouter()
  const db = useDB()
  const { toast } = useToast()
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", address: "", city: "",
    id_proof_type: "Aadhaar", id_proof_number: "", referred_by: "", preferred_language: "Hindi", notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const duplicate = form.phone.replace(/\D/g, "").length >= 10
    ? db.clients.find((c) => c.phone.replace(/\D/g, "").endsWith(form.phone.replace(/\D/g, "").slice(-10)))
    : undefined

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.full_name.trim()) errs.full_name = "Enter the client's full name"
    if (!isValidIndianMobile(form.phone)) errs.phone = "Enter a 10-digit Indian mobile number"
    if (form.email && !isValidEmail(form.email)) errs.email = "Enter a valid email address"
    const idRule = idPatterns[form.id_proof_type]
    if (form.id_proof_number && idRule && !idRule.re.test(form.id_proof_number.trim())) errs.id_proof_number = idRule.message
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`client-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    const client = addClient({
      id: uid("c"),
      lawyer_id: db.lawyer.id,
      ...form,
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      created_at: new Date().toISOString(),
    })
    toast(`${client.full_name} added`, "success", { label: "Open a case for this client", onClick: () => router.push(`/cases/new?client=${client.id}`) })
    router.push(`/clients/${client.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader back={{ href: "/clients", label: "Clients" }} title="New client" description="Name and mobile are enough to start. Add the rest when you have it." />

      <Card className="p-5 sm:p-6">
        <form onSubmit={submit} className="space-y-6" noValidate>
          <section className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.full_name} className="sm:col-span-2">
              <Input id="client-full_name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="As on Aadhaar" autoFocus autoComplete="off" />
            </Field>
            <Field
              label="Mobile"
              required
              error={errors.phone}
              hint={duplicate ? `Already saved for ${duplicate.full_name}` : "Used for WhatsApp reminders"}
            >
              <Input id="client-phone" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98765 43210" />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input id="client-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@gmail.com" />
            </Field>
            <Field label="Preferred language" hint="Reminders open in this language first">
              <Select value={form.preferred_language} onChange={(e) => set("preferred_language", e.target.value)}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </Select>
            </Field>
            <Field label="City / town">
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Rohtak" />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House no., village / sector, district, PIN" />
            </Field>
          </section>

          <section className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <Field label="ID proof">
              <Select value={form.id_proof_type} onChange={(e) => set("id_proof_type", e.target.value)}>
                {ID_PROOF_TYPES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="ID number" error={errors.id_proof_number}>
              <Input id="client-id_proof_number" value={form.id_proof_number} onChange={(e) => set("id_proof_number", e.target.value)} placeholder={idPatterns[form.id_proof_type]?.placeholder} className="font-mono" />
            </Field>
            <Field label="Referred by">
              <Input value={form.referred_by} onChange={(e) => set("referred_by", e.target.value)} placeholder="Client, colleague or Bar Association" />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Best time to call, family contact, sensitivities" />
            </Field>
          </section>

          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Button variant="ghost" onClick={() => router.push("/clients")}>Cancel</Button>
            <Button type="submit"><Check /> Save client</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
