"use client"

export async function callGemini(prompt: string, systemContext?: string): Promise<string> {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, systemContext }),
    })

    if (!response.ok) {
      throw new Error(`Gemini request failed (${response.status})`)
    }

    const data = (await response.json()) as { text?: string }
    return data.text || ""
  } catch (error) {
    console.error("Gemini API route error:", error)
    return "AI service is temporarily unavailable. Please try again."
  }
}
