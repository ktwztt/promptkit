"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { countTokens } from "@/lib/token-counter"
import { AI_MODELS } from "@/lib/ai"
import { Hash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TokenCounterPage() {
  const [text, setText] = useState("")
  const [model, setModel] = useState("gpt-4o")

  const stats = useMemo(() => (text ? countTokens(text, model) : null), [text, model])

  const modelLimits = [
    { model: "gpt-4o", name: "GPT-4o", limit: 128000 },
    { model: "gpt-4", name: "GPT-4", limit: 8192 },
    { model: "claude-3.5", name: "Claude 3.5", limit: 200000 },
    { model: "gemini-2.0", name: "Gemini 2.0", limit: 1048576 },
    { model: "deepseek-v3", name: "DeepSeek V3", limit: 65536 },
    { model: "grok-3", name: "Grok 3", limit: 131072 },
  ]

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Token Counter</h1>
        <p className="text-muted-foreground">
          Count tokens, estimate API costs, and check context window limits.
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <Textarea
            placeholder="Paste or type your prompt here to count tokens..."
            className="min-h-[200px] font-mono text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Model:</label>
            <Select value={model} onValueChange={(v) => v && setModel(v)}>
              <SelectTrigger className="w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground uppercase">Characters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.chars.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground uppercase">Words</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.words.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground uppercase">Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.tokens.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground uppercase">Est. Cost (Input)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${stats.costInput.toFixed(4)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {stats && (
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Context Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-2">
              <Progress value={Math.min(stats.contextPercent, 100)} className="flex-1" />
              <span className="text-sm font-mono whitespace-nowrap">
                {stats.tokens.toLocaleString()} / {stats.contextLimit.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.contextPercent > 90
                ? "⚠️ Approaching context limit"
                : stats.contextPercent > 50
                  ? "Using significant context"
                  : `${(100 - stats.contextPercent).toFixed(1)}% of context window remaining`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick model reference */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-sm">Model Context Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {modelLimits.map((m) => (
              <div key={m.model} className="flex justify-between text-sm">
                <span>{m.name}</span>
                <span className="font-mono text-muted-foreground">{m.limit.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
