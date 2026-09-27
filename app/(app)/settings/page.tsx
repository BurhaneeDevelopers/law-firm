"use client"
import { useState } from "react"
import { Bell, Building2, Check, Minus, Monitor, Moon, Palette, Save, Sun, Trash2, UserRound, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Field, Input, Select, Textarea } from "@/components/ui/field"
import { Avatar, Chip, PageHeader } from "@/components/ui/misc"
import { useToast } from "@/components/ui/toast"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"
import { SPECIALIZATIONS } from "@/lib/constants"
import { AlertSettings } from "@/components/dues/alert-settings"
import { cn, isValidEmail } from "@/lib/utils"
import { updateLawyer, useDB } from "@/lib/store"
import { useTheme, type ThemePreference } from "@/lib/theme"

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "firm", label: "Firm & letterhead", icon: Building2 },
  { id: "notifications", label: "Alerts and email", icon: Bell },
  { id: "team", label: "Team", icon: Users },
  { id: "appearance", label: "Appearance", icon: Palette },
] as const
type Section = (typeof SECTIONS)[number]["id"]

const initialTeam = [
  { id: 1, name: "Rahul Yadav", email: "rahul.yadav@vakilos.in", role: "Associate", status: "Active" },
  { id: 2, name: "Priya Sharma", email: "priya.sharma@vakilos.in", role: "Clerk", status: "Active" },
  { id: 3, name: "Vikash Kumar", email: "vikash.kumar@vakilos.in", role: "Associate", status: "Invited" },
]

const permissions = [
  { perm: "View cases and diary", senior: true, associate: true, clerk: true },
  { perm: "Add hearings and outcomes", senior: true, associate: true, clerk: true },
  { perm: "Edit case details", senior: true, associate: true, clerk: false },
  { perm: "Draft and send notices", senior: true, associate: true, clerk: false },
  { perm: "View and record fees", senior: true, associate: false, clerk: true },
  { perm: "Delete records", senior: true, associate: false, clerk: false },
  { perm: "Manage team", senior: true, associate: false, clerk: false },
]

export default function SettingsPage() {
  const db = useDB()
  const { toast } = useToast()
  const { confirm, dialogElement } = useConfirmDialog()
  const { preference, setPreference } = useTheme()
  const [section, setSection] = useState<Section>(() => {
    const q = new URLSearchParams(window.location.search).get("section")
    return SECTIONS.some((x) => x.id === q) ? (q as Section) : "profile"
  })
  const [profile, setProfile] = useState(db.lawyer)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [team, setTeam] = useState(initialTeam)
  const [invite, setInvite] = useState({ email: "", role: "Associate" })
  const [inviteError, setInviteError] = useState("")

  const dirty = JSON.stringify(profile) !== JSON.stringify(db.lawyer)

  const setP = <K extends keyof typeof profile>(k: K, v: (typeof profile)[K]) => {
    setProfile((p) => ({ ...p, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const saveProfile = () => {
    const e: Record<string, string> = {}
    if (!profile.name.trim()) e.name = "Name is required"
    if (profile.email && !isValidEmail(profile.email)) e.email = "Enter a valid email"
    if (!profile.firm_name.trim()) e.firm_name = "Firm name appears on every notice"
    setErrors(e)
    if (Object.keys(e).length) return
    updateLawyer(profile)
    toast("Settings saved", "success")
  }

  const sendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(invite.email)) {
      setInviteError("Enter a valid email address")
      return
    }
    if (team.some((m) => m.email === invite.email)) {
      setInviteError("This person is already on the team")
      return
    }
    setTeam((t) => [...t, { id: Date.now(), name: invite.email.split("@")[0], email: invite.email, role: invite.role, status: "Invited" }])
    toast(`Invite sent to ${invite.email}`, "success")
    setInvite({ email: "", role: invite.role })
    setInviteError("")
  }

  const saveBar = (section === "profile" || section === "firm") && (
    <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5 sm:px-6">
      {dirty && <span className="mr-auto text-[13px] text-muted-foreground">Unsaved changes</span>}
      <Button variant="ghost" disabled={!dirty} onClick={() => { setProfile(db.lawyer); setErrors({}) }}>Discard</Button>
      <Button disabled={!dirty} onClick={saveProfile}><Save /> Save</Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {dialogElement}
      <PageHeader title="Settings" description="Your profile, letterhead, reminders and team." />

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="scrollbar-hide -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              aria-current={section === s.id ? "page" : undefined}
              className={cn(
                "flex h-9 shrink-0 items-center gap-2.5 rounded-[10px] px-3 text-sm font-medium transition-colors",
                section === s.id ? "bg-surface text-foreground shadow-xs ring-1 ring-border" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <s.icon className="size-4" /> {s.label}
            </button>
          ))}
        </nav>

        <Card className="overflow-hidden">
          {section === "profile" && (
            <div className="space-y-6 p-5 sm:p-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <Avatar name={profile.name} size="lg" />
                <div>
                  <p className="text-base font-semibold text-foreground">Adv. {profile.name}</p>
                  <p className="text-[13px] text-muted-foreground">{profile.title} · {profile.bar_council_no}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required error={errors.name}><Input value={profile.name} onChange={(e) => setP("name", e.target.value)} /></Field>
                <Field label="Designation"><Input value={profile.title} onChange={(e) => setP("title", e.target.value)} placeholder="Advocate, Senior Advocate" /></Field>
                <Field label="Bar Council enrolment no."><Input value={profile.bar_council_no} onChange={(e) => setP("bar_council_no", e.target.value)} className="font-mono" /></Field>
                <Field label="Mobile"><Input type="tel" value={profile.phone} onChange={(e) => setP("phone", e.target.value)} /></Field>
                <Field label="Email" error={errors.email} className="sm:col-span-2"><Input type="email" value={profile.email} onChange={(e) => setP("email", e.target.value)} /></Field>
              </div>
              <fieldset>
                <legend className="mb-2 text-[13px] font-medium text-foreground">Practice areas</legend>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map((s) => {
                    const on = profile.specializations.includes(s)
                    return (
                      <Chip key={s} active={on} onClick={() => setP("specializations", on ? profile.specializations.filter((x) => x !== s) : [...profile.specializations, s])}>
                        {on && <Check />} {s}
                      </Chip>
                    )
                  })}
                </div>
              </fieldset>
            </div>
          )}

          {section === "firm" && (
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2 animate-fade-in">
              <div className="space-y-4">
                <Field label="Firm / chamber name" required error={errors.firm_name}><Input value={profile.firm_name} onChange={(e) => setP("firm_name", e.target.value)} /></Field>
                <Field label="Chamber address"><Textarea rows={3} value={profile.firm_address} onChange={(e) => setP("firm_address", e.target.value)} /></Field>
                <Field label="UPI ID for fees" hint="Added to payment reminders so clients can pay straight away.">
                  <Input value={profile.upi_id} onChange={(e) => setP("upi_id", e.target.value.trim())} className="font-mono" placeholder="yourname@okicici" />
                </Field>
                <Field label="GSTIN" hint="Optional. Printed on fee receipts when added."><Input value={profile.firm_gstin} onChange={(e) => setP("firm_gstin", e.target.value.toUpperCase())} className="font-mono" placeholder="06ABCDE1234F1Z5" /></Field>
              </div>
              <div>
                <p className="mb-2 text-[13px] font-medium text-foreground">Letterhead preview</p>
                <div className="document-paper rounded-xl px-5 py-6 text-center font-serif">
                  <p className="text-lg font-semibold">{profile.firm_name || "Firm name"}</p>
                  <p className="mt-1 text-xs">Advocate {profile.name} · Enrolment {profile.bar_council_no}</p>
                  <p className="text-xs opacity-80">{profile.firm_address}</p>
                  <p className="text-xs opacity-80">{profile.phone} · {profile.email}</p>
                  <div className="mx-auto mt-3 h-px w-3/4 bg-[#1b1b22]/40" />
                </div>
                <p className="mt-2 text-xs text-subtle-foreground">Used on every notice and printed cause list.</p>
              </div>
            </div>
          )}

          {section === "notifications" && <AlertSettings fallbackEmail={db.lawyer.email} />}

          {section === "team" && (
            <div className="space-y-6 p-5 sm:p-6 animate-fade-in">
              <form onSubmit={sendInvite} className="grid gap-2 sm:grid-cols-[1fr_160px_auto]">
                <Field label="Invite by email" error={inviteError}>
                  <Input type="email" value={invite.email} onChange={(e) => { setInvite((i) => ({ ...i, email: e.target.value })); setInviteError("") }} placeholder="junior@chamber.in" />
                </Field>
                <Field label="Role">
                  <Select value={invite.role} onChange={(e) => setInvite((i) => ({ ...i, role: e.target.value }))}>
                    <option>Associate</option>
                    <option>Clerk</option>
                    <option>Senior</option>
                  </Select>
                </Field>
                <Button type="submit" className="self-start sm:mt-[26px]">Send invite</Button>
              </form>

              <ul className="divide-y divide-border rounded-xl border border-border">
                {team.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={m.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium capitalize text-foreground">{m.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <Badge className="hidden sm:inline-flex">{m.role}</Badge>
                    <Badge tone={m.status === "Active" ? "success" : "warning"}>{m.status}</Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${m.name}`}
                      onClick={() => confirm("Remove team member?", `${m.email} will lose access to your cases.`, () => setTeam((t) => t.filter((x) => x.id !== m.id)), "Remove")}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>

              <section>
                <h2 className="text-sm font-semibold text-foreground">What each role can do</h2>
                <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2/60 text-xs text-muted-foreground">
                        <th scope="col" className="px-4 py-2.5 font-medium">Permission</th>
                        {["Senior", "Associate", "Clerk"].map((r) => <th key={r} scope="col" className="px-4 py-2.5 text-center font-medium">{r}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {permissions.map((row) => (
                        <tr key={row.perm}>
                          <td className="px-4 py-2.5 text-foreground">{row.perm}</td>
                          {(["senior", "associate", "clerk"] as const).map((r) => (
                            <td key={r} className="px-4 py-2.5 text-center">
                              {row[r] ? (
                                <Check className="mx-auto size-4 text-success" aria-label="Allowed" />
                              ) : (
                                <Minus className="mx-auto size-4 text-subtle-foreground" aria-label="Not allowed" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {section === "appearance" && (
            <div className="p-5 sm:p-6 animate-fade-in">
              <h2 className="text-sm font-semibold text-foreground">Theme</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Dark mode is easier on the eyes for late-night drafting.</p>
              <div role="radiogroup" aria-label="Theme" className="mt-4 grid gap-3 sm:grid-cols-3">
                {([
                  { value: "light", label: "Light", icon: Sun, preview: "bg-[#f6f7fb]", bar: "bg-white", line: "bg-[#e3e5ee]" },
                  { value: "dark", label: "Dark", icon: Moon, preview: "bg-[#0b0c14]", bar: "bg-[#12131e]", line: "bg-[#25273a]" },
                  { value: "system", label: "Match device", icon: Monitor, preview: "bg-linear-to-r from-[#f6f7fb] from-50% to-[#0b0c14] to-50%", bar: "bg-white/80", line: "bg-[#8b8ffa]/40" },
                ] as { value: ThemePreference; label: string; icon: typeof Sun; preview: string; bar: string; line: string }[]).map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    role="radio"
                    aria-checked={preference === t.value}
                    onClick={() => setPreference(t.value)}
                    className={cn(
                      "rounded-2xl border p-2 text-left transition-colors",
                      preference === t.value ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-border-strong"
                    )}
                  >
                    <div className={cn("flex h-20 flex-col gap-1.5 rounded-xl border border-border p-2.5", t.preview)}>
                      <span className={cn("h-3 w-1/2 rounded", t.bar)} />
                      <span className={cn("h-2 w-3/4 rounded", t.line)} />
                      <span className={cn("h-2 w-2/3 rounded", t.line)} />
                    </div>
                    <p className="mt-2 flex items-center gap-2 px-1 pb-1 text-[13px] font-medium text-foreground">
                      <t.icon className="size-4 text-muted-foreground" /> {t.label}
                      {preference === t.value && <Check className="ml-auto size-4 text-primary" />}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {saveBar}
        </Card>
      </div>
    </div>
  )
}
