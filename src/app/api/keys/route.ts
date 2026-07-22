import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { randomBytes } from "node:crypto"

async function getUserId(req: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers })
  return session?.user?.id || null
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const keys = await db.apiKey.findMany({
    where: { userId },
    select: { id: true, name: true, key: true, lastUsed: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
  // Only show first 8 chars of key for security
  const masked = keys.map(k => ({ ...k, key: k.key.slice(0, 8) + "..." }))
  return NextResponse.json(masked)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const key = `pk_${randomBytes(24).toString("hex")}`
  const apiKey = await db.apiKey.create({ data: { name, key, userId } })

  return NextResponse.json({ id: apiKey.id, name: apiKey.name, key, createdAt: apiKey.createdAt }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  const existing = await db.apiKey.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await db.apiKey.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
