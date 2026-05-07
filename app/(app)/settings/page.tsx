"use client"
import { useState } from "react"
import { Save, Camera, Plus, Trash2, Shield, Bell, Users, Palette, User, Building } from "lucide-react"
import { cn } from "@/lib/utils"
import { demoLawyer } from "@/lib/demo-data"
import { useToast } from "@/components/ui/toast"

const TABS = ["Profile", "Firm", "Notifications", "Team", "Appearance"]

const teamMembers = [
  { id: 1, name: "Rahul Yadav", email: "rahul.yadav@lexfirm.in", role: "Junior Advocate", status: "Active" },
  { id: 2, name: "Priya Sharma", email: "priya.sharma@lexfirm.in", role: "Office Staff", status: "Active" },
  { id: 3, name: "Vikash Kumar", email: "vikash.kumar@lexfirm.in", role: "Junior Advocate", status: "Invited" },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile")
  const { toast } = useToast()
  const [profile, setProfile] = useState({ ...demoLawyer })
  const [notifications, setNotifications] = useState({
    whatsapp_hearing_day_before: true,
    whatsapp_hearing_morning: true,
    email_weekly_summary: false,
    inapp_case_updates: true,
    inapp_document_uploads: true,
    inapp_hearing_reminders: true,
  })
  const [appearance, setAppearance] = useState({ theme: "light", density: "comfortable" })
  const [inviteEmail, setInviteEmail] = useState("")

  const handleSave = () => {
    toast("Settings saved successfully", "success")
  }

  const setP = (k: string, v: string | string[]) => setProfile(p => ({ ...p, [k]: v }))
  const toggleN = (k: string) => setNotifications(n => ({ ...n, [k]: !n[k as keyof typeof n] }))

  const SPECIALIZATIONS = ["Criminal Law", "Property Disputes", "Family Law", "Civil Law", "Constitutional Law", "Tax Law", "Corporate Law"]

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Manage your profile and preferences</p>
        </div>
        <button onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <div className="w-44 flex-shrink-0 space-y-1">
          {[
            { tab: "Profile", icon: <User className="w-4 h-4" /> },
            { tab: "Firm", icon: <Building className="w-4 h-4" /> },
            { tab: "Notifications", icon: <Bell className="w-4 h-4" /> },
            { tab: "Team", icon: <Users className="w-4 h-4" /> },
            { tab: "Appearance", icon: <Palette className="w-4 h-4" /> },
          ].map(({ tab, icon }) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                activeTab === tab ? "bg-indigo-50 text-indigo-700 border-l-[3px] border-indigo-700 pl-[calc(0.75rem-3px)]" : "text-slate-600 hover:bg-slate-50")}>
              {icon} {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {/* Profile */}
          {activeTab === "Profile" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">Lawyer Profile</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-700 flex items-center justify-center text-white text-xl font-bold">
                    MY
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Advocate Mahipal Yadav</p>
                  <p className="text-xs text-slate-500">Senior Advocate</p>
                  <button className="text-xs text-indigo-600 font-medium mt-1 hover:text-indigo-700">Upload Photo</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Full Name" },
                  { key: "bar_council_no", label: "Bar Council Number" },
                  { key: "email", label: "Email" },
                  { key: "phone", label: "Phone" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                    <input value={(profile as any)[f.key] || ""}
                      onChange={e => setP(f.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map(s => (
                    <button key={s} onClick={() => {
                      const current = profile.specializations || []
                      const updated = current.includes(s) ? current.filter(x => x !== s) : [...current, s]
                      setP("specializations", updated)
                    }}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        (profile.specializations || []).includes(s) ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-200")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Digital Signature</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-300 transition-colors cursor-pointer">
                  <p className="text-xs text-slate-500">Drop signature image or click to upload</p>
                  <button className="mt-2 text-xs text-indigo-600 font-medium">Upload Signature</button>
                </div>
              </div>
            </div>
          )}

          {/* Firm */}
          {activeTab === "Firm" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">Firm Information</h2>
              {[
                { key: "firm_name", label: "Firm Name" },
                { key: "firm_address", label: "Firm Address" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">{f.label}</label>
                  <input value={(profile as any)[f.key] || ""}
                    onChange={e => setP(f.key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Firm Logo</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-300 transition-colors">
                  <p className="text-xs text-slate-500">Upload firm logo (PNG/SVG)</p>
                  <button className="mt-2 text-xs text-indigo-600 font-medium">Upload Logo</button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "Notifications" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">Notification Preferences</h2>

              {[
                { group: "WhatsApp Reminders", items: [
                  { key: "whatsapp_hearing_day_before", label: "Hearing day-before reminder to client" },
                  { key: "whatsapp_hearing_morning", label: "Hearing morning-of reminder to client" },
                ]},
                { group: "Email Digests", items: [
                  { key: "email_weekly_summary", label: "Weekly case summary email" },
                ]},
                { group: "In-App Notifications", items: [
                  { key: "inapp_case_updates", label: "Case updates and status changes" },
                  { key: "inapp_document_uploads", label: "New document uploads" },
                  { key: "inapp_hearing_reminders", label: "Hearing reminders" },
                ]},
              ].map(section => (
                <div key={section.group}>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{section.group}</p>
                  <div className="space-y-3">
                    {section.items.map(item => (
                      <label key={item.key} className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="text-sm text-slate-700">{item.label}</span>
                        <div
                          onClick={() => toggleN(item.key)}
                          className={cn("w-11 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer",
                            notifications[item.key as keyof typeof notifications] ? "bg-indigo-700" : "bg-slate-200")}
                        >
                          <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
                            notifications[item.key as keyof typeof notifications] ? "translate-x-6" : "translate-x-1")} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Team */}
          {activeTab === "Team" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-semibold text-slate-700">Team Members</h2>
              </div>

              {/* Invite */}
              <div className="flex gap-3">
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  placeholder="Email address to invite"
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400" />
                <select className="px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 bg-white">
                  <option>Junior Advocate</option>
                  <option>Office Staff</option>
                  <option>Senior Advocate</option>
                </select>
                <button onClick={() => { if (inviteEmail) { toast(`Invite sent to ${inviteEmail}`, "success"); setInviteEmail("") } }}
                  className="px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-xl hover:bg-indigo-800 transition-colors whitespace-nowrap">
                  Invite
                </button>
              </div>

              <div className="space-y-2">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-bold">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{member.role}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                      member.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                      {member.status}
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Permission Matrix */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Role Permissions</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-3 py-2 font-semibold text-slate-600">Permission</th>
                        <th className="px-3 py-2 text-center font-semibold text-slate-600">Senior</th>
                        <th className="px-3 py-2 text-center font-semibold text-slate-600">Junior</th>
                        <th className="px-3 py-2 text-center font-semibold text-slate-600">Staff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { perm: "View Cases", senior: true, junior: true, staff: true },
                        { perm: "Edit Cases", senior: true, junior: true, staff: false },
                        { perm: "Delete Cases", senior: true, junior: false, staff: false },
                        { perm: "Manage Clients", senior: true, junior: true, staff: false },
                        { perm: "Generate Notices", senior: true, junior: true, staff: false },
                        { perm: "Manage Team", senior: true, junior: false, staff: false },
                      ].map(row => (
                        <tr key={row.perm} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-slate-700">{row.perm}</td>
                          {["senior", "junior", "staff"].map(role => (
                            <td key={role} className="px-3 py-2 text-center">
                              <span className={cn("w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px]",
                                row[role as keyof typeof row] ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                                {row[role as keyof typeof row] ? "✓" : "✗"}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === "Appearance" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">Appearance</h2>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Light", preview: "bg-white border-slate-200" },
                    { value: "dark", label: "Dark", preview: "bg-slate-900 border-slate-700" },
                    { value: "system", label: "System", preview: "bg-gradient-to-r from-white to-slate-900 border-slate-300" },
                  ].map(t => (
                    <button key={t.value} onClick={() => setAppearance(a => ({ ...a, theme: t.value }))}
                      className={cn("p-4 rounded-xl border-2 transition-colors",
                        appearance.theme === t.value ? "border-indigo-700" : "border-slate-100 hover:border-slate-200")}>
                      <div className={cn("w-full h-8 rounded-lg mb-2 border", t.preview)} />
                      <p className="text-xs font-medium text-slate-700 text-center">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-3">Layout Density</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "comfortable", label: "Comfortable", desc: "More spacing, easier to read" },
                    { value: "compact", label: "Compact", desc: "Denser, more content visible" },
                  ].map(d => (
                    <button key={d.value} onClick={() => setAppearance(a => ({ ...a, density: d.value }))}
                      className={cn("p-4 rounded-xl border-2 text-left transition-colors",
                        appearance.density === d.value ? "border-indigo-700 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200")}>
                      <p className="text-sm font-semibold text-slate-900 mb-1">{d.label}</p>
                      <p className="text-xs text-slate-500">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
