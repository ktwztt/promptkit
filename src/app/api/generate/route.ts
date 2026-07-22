import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { getModel } from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const { requirement, category, targetModel } = await req.json()
    if (!requirement) return NextResponse.json({ error: "Requirement required" }, { status: 400 })

    const model = getModel()
    const { text } = await generateText({
      model,
      prompt: `You are an expert prompt engineer. Given a user's requirement, generate a complete, production-ready prompt.

Category: ${category || "general"}
Target AI model: ${targetModel || "gpt-4o"}

Requirements:
- Output a complete, self-contained prompt that the user can copy and paste directly into the target AI.
- Structure the prompt with clear sections: Role, Task, Constraints, Output Format, Examples (if helpful).
- Use best practices for ${targetModel || "gpt-4o"}: clear delimiters, specific instructions, helpful context.
- Make the prompt reusable — use placeholders like [TOPIC], [AUDIENCE], [GOAL] where the user should customize.
- Output ONLY the generated prompt. No explanations, no preambles, no markdown wrapping.

User's requirement:
${requirement}`,
    })

    return NextResponse.json({ prompt: text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Generation failed" }, { status: 500 })
  }
}
