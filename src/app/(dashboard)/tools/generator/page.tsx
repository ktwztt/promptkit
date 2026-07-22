"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AI_MODELS } from "@/lib/ai"
import { countTokens } from "@/lib/token-counter"
import { Zap, Copy, Loader2, Check, RotateCcw } from "lucide-react"
import { toast } from "sonner"

const CATEGORIES = [
  { value: "writing", label: "Writing & Content" },
  { value: "programming", label: "Programming" },
  { value: "seo", label: "SEO & Marketing" },
  { value: "education", label: "Education" },
  { value: "research", label: "Research" },
  { value: "business", label: "Business" },
  { value: "creative", label: "Creative" },
]

export default function GeneratorPage() {
  const [requirement, setRequirement] = useState("")
  const [category, setCategory] = useState("writing")
  const [targetModel, setTargetModel] = useState("gpt-4o")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!requirement.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement, category, targetModel }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOutput(data.prompt)
    } catch (e: any) {
      toast.error(e.message || "Generation failed")
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

  const outStats = output ? countTokens(output) : null

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">AI Prompt Generator</h1>
        <p className="text-muted-foreground">
          Describe what you need — get a complete, optimized prompt instantly.
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <Textarea
            placeholder='e.g. "Write a YouTube script about AI tools for beginners" or "Create a cold email for SaaS outreach"'
            className="min-h-[150px] font-mono text-sm"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium">Category:</label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="text-sm font-medium">Target Model:</label>
            <Select value={targetModel} onValueChange={(v) => v && setTargetModel(v)}>
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
        <Button onClick={handleGenerate} disabled={!requirement || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate Prompt"}
        </Button>
      </div>

      {output && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Generated Prompt</CardTitle>
              <div className="flex items-center gap-2">
                {outStats && (
                  <Badge variant="secondary">{outStats.tokens} tokens</Badge>
                )}
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-sm font-mono whitespace-pre-wrap">{output}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
