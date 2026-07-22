"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { buttonVariants } from "@/components/ui/button"
import { countTokens } from "@/lib/token-counter"
import {
  Wand2, Sparkles, Languages, Hash, Scissors, GitCompare,
  AlignLeft, Zap, Library, TrendingUp, Clock, Star, ArrowRight, Plus,
} from "lucide-react"

const QUICK_TOOLS = [
  { href: "/tools/cleaner", label: "Clean", icon: Wand2, color: "text-blue-500" },
  { href: "/tools/optimizer", label: "Optimize", icon: Sparkles, color: "text-amber-500" },
  { href: "/tools/translator", label: "Translate", icon: Languages, color: "text-green-500" },
  { href: "/tools/token-counter", label: "Count", icon: Hash, color: "text-purple-500" },
  { href: "/tools/splitter", label: "Split", icon: Scissors, color: "text-rose-500" },
  { href: "/tools/generator", label: "Generate", icon: Zap, color: "text-orange-500" },
]

interface Prompt {
  id: string; title: string; content: string; model: string
  updatedAt: string; isFavorite: boolean
}

export default function DashboardPage() {
  const { session } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) { setLoading(false); return }
    fetch("/api/prompts").then(r => r.json()).then(data => {
      setPrompts(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [session])

  const totalTokens = prompts.reduce((sum, p) => sum + countTokens(p.content).tokens, 0)
  const recentPrompts = prompts.slice(0, 5)
  const favorites = prompts.filter(p => p.isFavorite)

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          {session ? `Welcome back, ${session.name}` : "Dashboard"}
        </h1>
        <p className="text-muted-foreground">Your prompt workspace at a glance.</p>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase mb-3">Quick Tools</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK_TOOLS.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <Icon className={`h-6 w-6 ${color}`} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                <Library className="h-3 w-3" /> Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{session ? prompts.length : "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                <Hash className="h-3 w-3" /> Total Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{session ? totalTokens.toLocaleString() : "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                <Star className="h-3 w-3" /> Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{session ? favorites.length : "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {session ? new Set(prompts.map(p => p.model)).size : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Prompts */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase">Recent Prompts</h2>
          <Link href="/library" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {!session ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Sign in to save and view your prompts.</p>
              <Link href="/sign-in" className={buttonVariants({})}>Sign In</Link>
            </CardContent>
          </Card>
        ) : loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : recentPrompts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No prompts yet. Start creating!</p>
              <Link href="/library" className={buttonVariants({})}>
                <Plus className="h-4 w-4" /> Create First Prompt
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentPrompts.map(p => (
              <Link key={p.id} href="/library" className="block">
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.content.slice(0, 80)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {countTokens(p.content).tokens} tokens
                      </Badge>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
