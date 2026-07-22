import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getModel } from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const { prompt, targetModel } = await req.json()
    if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 })

    const model = getModel()
    const { text } = await generateText({
      model,
      prompt: `You are a prompt optimization expert. Rewrite the following prompt to be optimized for the "${targetModel}" AI model.

Rules:
- Preserve the original intent, requirements, and constraints exactly.
- Structure the prompt using best practices for the target model (clear instructions, delimiters, examples if helpful).
- Make it concise — remove redundant words.
- Use the style and format that works best for ${targetModel}.
- Output ONLY the optimized prompt. No explanations, no markdown wrapping, no "here's your prompt" preambles.

Original prompt:
${prompt}`,
    })

    return NextResponse.json({ optimized: text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Optimization failed" }, { status: 500 })
  }
}
