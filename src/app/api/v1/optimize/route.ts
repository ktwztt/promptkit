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

  const { prompt, targetModel } = await req.json()
  if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 })

  const model = getModel()
  const { text } = await generateText({
    model,
    prompt: `Rewrite the following prompt to be optimized for "${targetModel || "gpt-4o"}". Preserve intent. Output only the optimized prompt.\n\n${prompt}`,
  })

  return NextResponse.json({ optimized: text })
}
