import { NextResponse } from "next/server"

// Sends payment alert emails through Resend (https://resend.com) using plain fetch.
//
// Env:
//   RESEND_API_KEY  required to actually send
//   EMAIL_FROM      verified sender, e.g. "LexFirm <alerts@yourfirm.in>"
//   ADMIN_EMAIL     when set, mail can only go to this address. Set it in production:
//                   the app has no login yet, so an open route could be abused as a relay.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Body = { to?: string; subject?: string; html?: string; text?: string }

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ sent: false, reason: "invalid_body" }, { status: 400 })
  }

  const to = body.to?.trim() ?? ""
  const subject = body.subject?.trim().slice(0, 200) ?? ""
  if (!EMAIL_RE.test(to) || !subject || (!body.html && !body.text)) {
    return NextResponse.json({ sent: false, reason: "invalid_request" }, { status: 400 })
  }
  if ((body.html?.length ?? 0) > 200_000 || (body.text?.length ?? 0) > 100_000) {
    return NextResponse.json({ sent: false, reason: "too_large" }, { status: 413 })
  }

  const allowed = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (allowed && to.toLowerCase() !== allowed) {
    return NextResponse.json({ sent: false, reason: "recipient_not_allowed" }, { status: 403 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ sent: false, reason: "not_configured" })
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "LexFirm <onboarding@resend.dev>",
        to: [to],
        subject,
        html: body.html,
        text: body.text,
      }),
    })
    if (!res.ok) {
      console.error("Email provider error", res.status, await res.text())
      return NextResponse.json({ sent: false, reason: "provider_error" }, { status: 502 })
    }
    const data = (await res.json()) as { id?: string }
    return NextResponse.json({ sent: true, id: data.id })
  } catch (error) {
    console.error("Email send failed", error)
    return NextResponse.json({ sent: false, reason: "network_error" }, { status: 502 })
  }
}
