"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Plus, Trash2, Key, Copy, Check, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ApiKey {
  id: string; name: string; key: string; lastUsed: string | null; createdAt: string
}

export default function SettingsPage() {
  const { session } = useAuth()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newKey, setNewKey] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchKeys = async () => {
    const res = await fetch("/api/keys")
    const data = await res.json()
    setKeys(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchKeys() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })
    const data = await res.json()
    if (res.ok) {
      setNewKey(data.key)
      fetchKeys()
      toast.success("API key created")
    } else {
      toast.error(data.error || "Failed")
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/keys?id=${id}`, { method: "DELETE" })
    if (res.ok) { fetchKeys(); toast.success("Key deleted") }
  }

  const toggleVisible = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (!session) {
    return (
      <div className="container max-w-lg mx-auto px-4 py-24 text-center">
        <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-6">Sign in to manage API keys.</p>
        <Link href="/sign-in" className={buttonVariants({})}>Sign In</Link>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage API keys for programmatic access.</p>
      </div>

      {/* New key form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Create API Key</CardTitle>
          <CardDescription>
            Use API keys to access PromptKit tools programmatically. Keep them secret.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Key name (e.g., 'My App')"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              <Plus className="h-4 w-4" /> Create
            </Button>
          </div>
          {newKey && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                Key created! Copy it now — it won&apos;t be shown again.
              </p>
              <code className="text-xs break-all bg-muted p-2 rounded block">{newKey}</code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys yet.</p>
          ) : (
            <div className="space-y-3">
              {keys.map(k => (
                <div key={k.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{k.name}</p>
                    <code className="text-xs text-muted-foreground">
                      {visibleKeys.has(k.id) ? k.key : "pk_••••••••••••"}
                    </code>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : "Never used"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => toggleVisible(k.id)}>
                      {visibleKeys.has(k.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      navigator.clipboard.writeText(k.key.replace("...", ""))
                      setCopiedId(k.id)
                      toast.success("Copied")
                      setTimeout(() => setCopiedId(null), 2000)
                    }}>
                      {copiedId === k.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(k.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">API Reference</CardTitle>
          <CardDescription>Use your API key in the <code className="text-xs bg-muted px-1 rounded">x-api-key</code> header.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {[
            { method: "POST", path: "/api/v1/clean", body: '{ text: "your prompt", options?: {...} }' },
            { method: "POST", path: "/api/v1/optimize", body: '{ prompt: "...", targetModel: "gpt-4o" }' },
            { method: "POST", path: "/api/v1/translate", body: '{ prompt: "...", target: "en" }' },
            { method: "POST", path: "/api/v1/tokens", body: '{ text: "..." [, model: "gpt-4o"] }' },
          ].map(({ method, path, body }) => (
            <div key={path} className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs font-mono">{method}</Badge>
                <code className="text-xs">{path}</code>
              </div>
              <code className="text-xs text-muted-foreground">{body}</code>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
