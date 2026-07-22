import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateText } from "ai"
import { getModel } from "@/lib/ai"

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-api-key")
  if (!key) return NextResponse.json({ error: "API key required" }, { status: 401 })

  const apiKey = await db.apiKey.findUnique({ where: { key } })
  if (!apiKey) return NextResponse.json({ error: "Invalid API key" }, { status: 401 })

  await db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } })

  const { prompt, target } = await req.json()
  if (!prompt || !target) return NextResponse.json({ error: "Prompt and target required" }, { status: 400 })

  const model = getModel()
  const { text } = await generateText({
    model,
    prompt: `Translate the following prompt to ${target}. Preserve prompt logic, variables, placeholders, and intent. Output only the translated prompt.\n\n${prompt}`,
  })

  return NextResponse.json({ translated: text })
}
