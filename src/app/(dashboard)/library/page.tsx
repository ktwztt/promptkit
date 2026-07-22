"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AI_MODELS } from "@/lib/ai"
import { countTokens } from "@/lib/token-counter"
import { useAuth } from "@/components/auth-provider"
import { Library, Plus, Search, Star, FolderOpen, Trash2, Edit3, Clock, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Prompt {
  id: string
  title: string
  content: string
  description?: string
  model: string
  tags: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export default function LibraryPage() {
  const { session } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null)

  // New prompt form
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [description, setDescription] = useState("")
  const [model, setModel] = useState("generic")
  const [tags, setTags] = useState("")

  const fetchPrompts = useCallback(async () => {
    const res = await fetch("/api/prompts")
    const data = await res.json()
    setPrompts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  const handleCreate = async () => {
    const res = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, description, model, tags }),
    })
    if (res.ok) {
      toast.success("Prompt saved")
      setCreateOpen(false)
      resetForm()
      fetchPrompts()
    } else {
      toast.error("Failed to save")
    }
  }

  const handleUpdate = async () => {
    if (!editPrompt) return
    const res = await fetch(`/api/prompts`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editPrompt.id, title, content, description, model, tags }),
    })
    if (res.ok) {
      toast.success("Prompt updated")
      setEditPrompt(null)
      resetForm()
      fetchPrompts()
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/prompts?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Prompt deleted")
      fetchPrompts()
    }
  }

  const handleFavorite = async (id: string, fav: boolean) => {
    await fetch("/api/prompts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isFavorite: !fav }),
    })
    fetchPrompts()
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setDescription("")
    setModel("generic")
    setTags("")
  }

  const openEdit = (p: Prompt) => {
    setEditPrompt(p)
    setTitle(p.title)
    setContent(p.content)
    setDescription(p.description || "")
    setModel(p.model)
    setTags(p.tags)
  }

  const filtered = prompts.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.toLowerCase().includes(q)
    )
  })

  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!session) {
    return (
      <div className="container max-w-lg mx-auto px-4 py-24 text-center">
        <Library className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Prompt Library</h1>
        <p className="text-muted-foreground mb-6">Sign in to save and manage your prompts.</p>
        <Link href="/sign-in" className={buttonVariants({})}>Sign In</Link>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Prompt Library</h1>
          <p className="text-muted-foreground">
            {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
          <Plus className="h-4 w-4" /> New Prompt
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search prompts by title, content, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {search ? "No prompts match your search." : "No prompts yet. Create your first one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const stats = countTokens(p.content)
            return (
              <Card key={p.id} className="group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      {p.description && (
                        <CardDescription>{p.description}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => handleFavorite(p.id, p.isFavorite)}
                    >
                      <Star className={`h-4 w-4 ${p.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap mb-3">
                    {p.content}
                  </pre>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{stats.tokens} tokens</Badge>
                      {p.model !== "generic" && (
                        <Badge variant="outline" className="text-xs">{p.model}</Badge>
                      )}
                      {p.tags.split(",").filter(Boolean).map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t.trim()}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button variant="ghost" size="icon" onClick={() => {
                        navigator.clipboard.writeText(p.content)
                        setCopiedId(p.id)
                        toast.success("Copied")
                        setTimeout(() => setCopiedId(null), 2000)
                      }}>
                        {copiedId === p.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Prompt</DialogTitle>
            <DialogDescription>Save a prompt to your library.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Textarea
              placeholder="Prompt content..."
              className="min-h-[200px] font-mono text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Model</label>
                <Select value={model} onValueChange={(v) => v && setModel(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">Generic</SelectItem>
                    {AI_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Tags (comma-separated)</label>
                <Input placeholder="writing, seo, coding" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!title || !content}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPrompt} onOpenChange={() => setEditPrompt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Textarea
              className="min-h-[200px] font-mono text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Model</label>
                <Select value={model} onValueChange={(v) => v && setModel(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">Generic</SelectItem>
                    {AI_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Tags</label>
                <Input placeholder="writing, seo, coding" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPrompt(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!title || !content}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
