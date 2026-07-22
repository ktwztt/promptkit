import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { inviteCode } = await req.json()
  if (!inviteCode) return NextResponse.json({ error: "Invite code required" }, { status: 400 })

  const team = await db.team.findUnique({ where: { inviteCode } })
  if (!team) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })

  const existing = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId: team.id, userId } },
  })
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 })

  await db.teamMember.create({ data: { teamId: team.id, userId, role: "member" } })

  return NextResponse.json({ teamId: team.id, name: team.name })
}
