import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getModel } from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const { prompt, source, target } = await req.json()
    if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 })

    const model = getModel()
    const sourceHint = source && source !== "auto" ? ` from ${source}` : ""
    const { text } = await generateText({
      model,
      prompt: `You are an expert prompt translator. Translate the following prompt${sourceHint} to ${target}.

Critical rules:
- This is NOT literal translation. Preserve the prompt's logic, structure, variables, placeholders, and intent.
- The output must be a working prompt in the target language, optimized for AI understanding in that language.
- Keep any code, technical terms, variable names, and formatting markers exactly as-is.
- Output ONLY the translated prompt. No explanations, no wrapping, no preambles.

Original prompt:
${prompt}`,
    })

    return NextResponse.json({ translated: text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Translation failed" }, { status: 500 })
  }
}
