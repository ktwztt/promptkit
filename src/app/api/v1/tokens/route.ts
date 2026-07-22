import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { countTokens } from "@/lib/token-counter"

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-api-key")
  if (!key) return NextResponse.json({ error: "API key required" }, { status: 401 })

  const apiKey = await db.apiKey.findUnique({ where: { key } })
  if (!apiKey) return NextResponse.json({ error: "Invalid API key" }, { status: 401 })

  await db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } })

  const { text, model } = await req.json()
  if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 })

  const stats = countTokens(text, model || "gpt-4o")
  return NextResponse.json(stats)
}
