import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const promptId = searchParams.get("promptId")
  if (!promptId) return NextResponse.json({ error: "promptId required" }, { status: 400 })

  const prompt = await db.prompt.findUnique({ where: { id: promptId } })
  if (!prompt || prompt.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const versions = await db.promptVersion.findMany({
    where: { promptId },
    orderBy: { version: "desc" },
    select: { id: true, version: true, content: true, createdAt: true },
  })

  return NextResponse.json({ current: prompt, history: versions })
}
