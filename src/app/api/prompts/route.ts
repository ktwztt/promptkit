import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

async function getUserId(req: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: req.headers })
  return session?.user?.id || null
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const prompts = await db.prompt.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(prompts)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, content, description, model, tags, folderId } = await req.json()
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 })
  }

  const prompt = await db.prompt.create({
    data: { title, content, description, model: model || "generic", tags: tags || "", folderId, userId },
  })
  return NextResponse.json(prompt, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, title, content, description, model, tags, isFavorite, folderId } = await req.json()
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  const existing = await db.prompt.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const data: any = {}
  if (title !== undefined) data.title = title
  if (content !== undefined) data.content = content
  if (description !== undefined) data.description = description
  if (model !== undefined) data.model = model
  if (tags !== undefined) data.tags = tags
  if (isFavorite !== undefined) data.isFavorite = isFavorite
  if (folderId !== undefined) data.folderId = folderId
  data.version = existing.version + 1

  const updated = await db.prompt.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  const existing = await db.prompt.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await db.prompt.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
