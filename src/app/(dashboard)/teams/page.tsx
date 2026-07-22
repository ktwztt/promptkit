"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { Users, Plus, Copy, Check, Trash2, LogIn, UserPlus, FolderOpen } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface TeamMember { id: string; role: string; user: { id: string; name: string; email: string } }
interface TeamFolder { id: string; name: string }
interface Team {
  id: string; name: string; ownerId: string; inviteCode: string
  members: TeamMember[]; folders: TeamFolder[]
}

export default function TeamsPage() {
  const { session } = useAuth()
  const [memberships, setMemberships] = useState<any[]>([])
  const [owned, setOwned] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const fetchTeams = async () => {
    const res = await fetch("/api/teams")
    const data = await res.json()
    setMemberships(data.memberships || [])
    setOwned(data.owned || [])
    setLoading(false)
  }

  useEffect(() => { fetchTeams() }, [])

  const handleCreate = async () => {
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })
    if (res.ok) {
      toast.success("Team created")
      setCreateOpen(false)
      setNewName("")
      fetchTeams()
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed")
    }
  }

  const handleJoin = async () => {
    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: joinCode }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(`Joined ${data.name}`)
      setJoinCode("")
      fetchTeams()
    } else {
      toast.error(data.error || "Invalid code")
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/teams?id=${id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Team deleted"); fetchTeams() }
  }

  if (!session) {
    return (
      <div className="container max-w-lg mx-auto px-4 py-24 text-center">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Teams</h1>
        <p className="text-muted-foreground mb-6">Sign in to manage teams.</p>
        <Link href="/sign-in" className={buttonVariants({})}>Sign In</Link>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Teams</h1>
          <p className="text-muted-foreground">Collaborate with your team on shared prompts.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Team
        </Button>
      </div>

      {/* Join team */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Join a Team</CardTitle>
          <CardDescription>Enter an invite code to join an existing team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <Button variant="outline" onClick={handleJoin} disabled={!joinCode.trim()}>
              <UserPlus className="h-4 w-4" /> Join
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Owned teams + memberships */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : !owned.length && !memberships.length ? (
        <div className="text-center py-12 text-muted-foreground">
          No teams yet. Create one or join with an invite code.
        </div>
      ) : (
        <div className="space-y-6">
          {owned.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{team.name}</CardTitle>
                    <CardDescription>
                      {team.members.length} member{team.members.length !== 1 ? "s" : ""} · {team.folders.length} folders
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(team.inviteCode)
                      setCopiedCode(team.id)
                      toast.success("Invite code copied")
                      setTimeout(() => setCopiedCode(null), 2000)
                    }}>
                      {copiedCode === team.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedCode === team.id ? "Copied" : team.inviteCode}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(team.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground uppercase mb-2">Members</p>
                <div className="flex flex-wrap gap-2">
                  {team.members.map((m) => (
                    <Badge key={m.id} variant="secondary" className="text-xs">
                      {m.user.name || m.user.email}
                      {m.role === "admin" && " (admin)"}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {memberships.filter((m: any) => m.team.ownerId !== session.userId).map((m: any) => (
            <Card key={m.team.id}>
              <CardHeader>
                <CardTitle className="text-base">{m.team.name}</CardTitle>
                <CardDescription>
                  {m.team.members.length} members · Role: {m.role}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a team workspace to share prompts and folders with colleagues.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Team name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
