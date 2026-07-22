"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AI_MODELS } from "@/lib/ai"
import { countTokens } from "@/lib/token-counter"
import { Scissors, Copy, Check } from "lucide-react"
import { toast } from "sonner"

export default function SplitterPage() {
  const [input, setInput] = useState("")
  const [maxTokens, setMaxTokens] = useState(4000)
  const [model, setModel] = useState("gpt-4o")
  const [chunks, setChunks] = useState<string[]>([])
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleSplit = () => {
    if (!input.trim()) return
    const result: string[] = []
    const paragraphs = input.split(/\n\n+/)
    let current = ""
    let currentTokens = 0

    for (const para of paragraphs) {
      const paraTokens = countTokens(para, model).tokens
      if (currentTokens + paraTokens > maxTokens && current) {
        result.push(current.trim())
        current = para
        currentTokens = paraTokens
      } else {
        current = current ? current + "\n\n" + para : para
        currentTokens += paraTokens
      }
    }
    if (current.trim()) result.push(current.trim())

    // If any single chunk still exceeds limit, split by sentences
    const final: string[] = []
    for (const chunk of result) {
      if (countTokens(chunk, model).tokens <= maxTokens) {
        final.push(chunk)
        continue
      }
      const sentences = chunk.split(/(?<=[.!?])\s+/)
      let cur = ""
      let curToks = 0
      for (const s of sentences) {
        const st = countTokens(s, model).tokens
        if (curToks + st > maxTokens && cur) {
          final.push(cur.trim())
          cur = s
          curToks = st
        } else {
          cur = cur ? cur + " " + s : s
          curToks += st
        }
      }
      if (cur.trim()) final.push(cur.trim())
    }

    setChunks(final)
    toast.success(`Split into ${final.length} chunks`)
  }

  const totalTokens = useMemo(() => input ? countTokens(input, model).tokens : 0, [input, model])

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Prompt Splitter</h1>
        <p className="text-muted-foreground">
          Split long prompts into chunks that fit within model context limits.
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <Textarea
            placeholder="Paste your long prompt here..."
            className="min-h-[200px] font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {input && (
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{totalTokens.toLocaleString()} tokens total</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium">Max tokens per chunk:</label>
            <Input
              type="number"
              className="w-32"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              min={100}
            />
            <label className="text-sm font-medium">Model:</label>
            <Select value={model} onValueChange={(v) => v && setModel(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-4">
        <Button onClick={handleSplit} disabled={!input}>
          <Scissors className="h-4 w-4" /> Split Prompt
        </Button>
      </div>

      {chunks.length > 0 && (
        <div className="space-y-4">
          {chunks.map((chunk, i) => {
            const stats = countTokens(chunk, model)
            return (
              <Card key={i}>
                <CardHeader className="pb-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      Chunk {i + 1} of {chunks.length}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{stats.tokens} tokens</Badge>
                      <Badge variant="secondary">{stats.chars} chars</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(chunk)
                          setCopiedIdx(i)
                          toast.success("Copied")
                          setTimeout(() => setCopiedIdx(null), 2000)
                        }}
                      >
                        {copiedIdx === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground line-clamp-6">
                    {chunk}
                  </pre>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
