import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

function getLegalAssistantSystem() {
  return `You are a professional AI legal assistant working for an Indian law firm. Your name is LexAI.

PERSONALITY:
- Professional, formal, and concise — like a senior legal clerk
- Use Indian legal terminology (CrPC, IPC, HMA, CPC, NI Act, etc.)
- Address the lawyer as "Advocate" or "Sir/Ma'am"

CONSTRAINTS:
- Never provide definitive legal advice — always frame as "suggested language" or "for your review"
- Do not make claims about court outcomes
- For document summaries: use structured output (Overview, Key Parties, Key Dates, Risk Points)
- For notice drafts: output in proper legal format with numbered paragraphs
- For case summaries: output in brief format (Case No., Client, Current Stage, Next Action)
- For client messages: output in both English and Hindi when requested
- If asked something outside legal domain: politely redirect

FORMATTING:
- Use markdown: **bold**, *italic*, bullet points, numbered lists, headings
- Keep responses concise and actionable`
}

function getDemoAIResponse(prompt: string): string {
  const lower = prompt.toLowerCase()

  if (lower.includes("summarize") && lower.includes("case")) {
    return `**Case Summary — For Your Review**\n\n**Case No.:** CRL/204/2024\n**Client:** Ramesh Kumar Sharma\n**Current Stage:** Arguments on bail conditions\n**Court:** Rohtak District Court, Court No. 5\n\n**Suggested Next Steps:**\n1. File cross-examination questions\n2. Challenge disputed documents\n3. File written arguments\n\n*This summary is for your review. Please verify all details with case records.*`
  }

  if (lower.includes("draft") || lower.includes("notice") || lower.includes("bail")) {
    return `**Draft Legal Notice — For Your Review**\n\nThis is a suggested draft prepared from your input. Please review party names, dates, provisions, and factual statements before use in court filing.`
  }

  if (lower.includes("hearing") || lower.includes("today")) {
    return `**Today's Hearings Summary**\n\nYou have multiple hearings today. Please verify exact timings from court cause lists before appearance.`
  }

  if (lower.includes("client") && lower.includes("message")) {
    return `**Client Update Message — English & Hindi**\n\nSuggested bilingual client communication is ready for your review. Please personalize dates and case details.`
  }

  return `**LexAI Response**\n\nI can help with case summaries, notice drafts, hearing prep, and client communications. Share your case context and requested output format.`
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string; systemContext?: string }
    const prompt = body?.prompt?.trim()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || ""
    if (!apiKey) {
      return NextResponse.json({ text: getDemoAIResponse(prompt) })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite-preview",
      systemInstruction: body.systemContext || getLegalAssistantSystem(),
    })

    const result = await model.generateContent(prompt)
    return NextResponse.json({ text: result.response.text() })
  } catch (error) {
    console.error("Gemini route error:", error)
    return NextResponse.json({ text: "AI service is temporarily unavailable. Please try again." }, { status: 500 })
  }
}
