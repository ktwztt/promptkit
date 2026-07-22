"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AI_MODELS } from "@/lib/ai"
import { countTokens } from "@/lib/token-counter"
import { Copy, Sparkles, Loader2, Check, RotateCcw } from "lucide-react"
import { toast } from "sonner"

export default function OptimizerPage() {
  const [input, setInput] = useState("")
  const [targetModel, setTargetModel] = useState("gpt-4o")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleOptimize = async () => {
    if (!input.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, targetModel }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOutput(data.optimized)
    } catch (e: any) {
      toast.error(e.message || "Optimization failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const inTokens = input ? countTokens(input) : null
  const outTokens = output ? countTokens(output) : null

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Prompt Optimizer</h1>
        <p className="text-muted-foreground">
          Optimize your prompt for a specific AI model to get better results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your prompt here..."
              className="min-h-[300px] font-mono text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {inTokens && (
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{inTokens.chars} chars</Badge>
                <Badge variant="secondary">{Math.round(inTokens.tokens)} tokens</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Optimized Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[300px] border rounded-md p-3 font-mono text-sm bg-muted/50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : output ? (
                <pre className="whitespace-pre-wrap">{output}</pre>
              ) : (
                <p className="text-muted-foreground">Optimized prompt appears here...</p>
              )}
            </div>
            {outTokens && (
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{outTokens.chars} chars</Badge>
                <Badge variant="secondary">{Math.round(outTokens.tokens)} tokens</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium whitespace-nowrap">Target Model:</label>
            <Select value={targetModel} onValueChange={(v) => v && setTargetModel(v)}>
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

      <div className="flex gap-2">
        <Button onClick={handleOptimize} disabled={!input || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Optimizing..." : "Optimize Prompt"}
        </Button>
        <Button variant="outline" onClick={handleCopy} disabled={!output}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button variant="ghost" onClick={() => { setInput(""); setOutput("") }}>
          <RotateCcw className="h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  )
}
