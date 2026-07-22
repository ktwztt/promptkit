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

  const memberships = await db.teamMember.findMany({
    where: { userId },
    include: { team: { include: { members: { include: { user: { select: { id: true, name: true, email: true } } } }, folders: true } } },
    orderBy: { createdAt: "desc" },
  })

  const owned = await db.team.findMany({
    where: { ownerId: userId },
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } }, folders: true },
  })

  return NextResponse.json({ memberships, owned })
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const team = await db.team.create({
    data: {
      name,
      ownerId: userId,
      inviteCode: randomBytes(6).toString("hex"),
      members: { create: { userId, role: "admin" } },
    },
    include: { members: true },
  })

  return NextResponse.json(team, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  const team = await db.team.findUnique({ where: { id } })
  if (!team || team.ownerId !== userId) {
    return NextResponse.json({ error: "Not found or not owner" }, { status: 404 })
  }

  await db.team.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
