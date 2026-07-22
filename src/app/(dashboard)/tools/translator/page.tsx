"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { countTokens } from "@/lib/token-counter"
import { Copy, Languages, Loader2, Check, RotateCcw, ArrowRight } from "lucide-react"
import { toast } from "sonner"

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ko", label: "Korean", native: "한국어" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "pt", label: "Portuguese", native: "Português" },
]

export default function TranslatorPage() {
  const [input, setInput] = useState("")
  const [source, setSource] = useState("auto")
  const [target, setTarget] = useState("en")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleTranslate = async () => {
    if (!input.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, source, target }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOutput(data.translated)
    } catch (e: any) {
      toast.error(e.message || "Translation failed")
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

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Prompt Translator</h1>
        <p className="text-muted-foreground">
          Translate prompts while preserving logic and structure — not just literal translation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Source Prompt</CardTitle>
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
            <CardTitle className="text-sm font-medium">Translated Prompt</CardTitle>
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
                <p className="text-muted-foreground">Translation appears here...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium">From:</label>
            <select
              className="border rounded-md px-3 py-1.5 text-sm bg-background"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="auto">Auto-detect</option>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
              ))}
            </select>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium">To:</label>
            <select
              className="border rounded-md px-3 py-1.5 text-sm bg-background"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleTranslate} disabled={!input || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
          {loading ? "Translating..." : "Translate Prompt"}
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
