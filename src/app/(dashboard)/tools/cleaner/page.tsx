"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cleanPrompt, getCleaningDiff, type CleanOptions } from "@/lib/prompt-cleaner"
import { countTokens } from "@/lib/token-counter"
import { Copy, Eraser, RotateCcw, Check, FolderOpen, Download } from "lucide-react"
import { toast } from "sonner"
import { getElectronAPI } from "@/lib/electron"

const OPTIONS: { key: keyof CleanOptions; label: string }[] = [
  { key: "removeMarkdown", label: "Remove Markdown" },
  { key: "removeHtml", label: "Remove HTML tags" },
  { key: "removeEmoji", label: "Remove Emoji" },
  { key: "removeSpecialChars", label: "Remove special characters" },
  { key: "normalizeSpaces", label: "Normalize spaces" },
  { key: "normalizeNewlines", label: "Normalize newlines" },
]

export default function CleanerPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [options, setOptions] = useState<CleanOptions>({
    removeMarkdown: true,
    removeHtml: true,
    removeEmoji: false,
    removeSpecialChars: false,
    normalizeSpaces: true,
    normalizeNewlines: true,
  })
  const [copied, setCopied] = useState(false)

  const handleClean = () => {
    const cleaned = cleanPrompt(input, options)
    setOutput(cleaned)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
  }

  const handleImport = async () => {
    const api = getElectronAPI()
    if (api) {
      const file = await api.openFile()
      if (file) {
        setInput(file.content)
        toast.success(`Loaded ${file.path.split(/[\\/]/).pop()}`)
      }
    }
  }

  const handleExport = async () => {
    const api = getElectronAPI()
    if (api) {
      await api.saveFile(output, "cleaned-prompt.txt")
      toast.success("File saved")
    }
  }

  const isDesktop = typeof window !== "undefined" && !!window.electronAPI

  const diff = output ? getCleaningDiff(input, output) : null
  const inTokens = input ? countTokens(input) : null
  const outTokens = output ? countTokens(output) : null

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Prompt Cleaner</h1>
        <p className="text-muted-foreground">
          Remove markdown, HTML, emoji, and normalize formatting instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Input</CardTitle>
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
                <Badge variant="secondary">{inTokens.tokens} tokens</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Output</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              placeholder="Cleaned prompt appears here..."
              className="min-h-[300px] font-mono text-sm"
              value={output}
            />
            {outTokens && diff && (
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">{outTokens.chars} chars</Badge>
                <Badge variant="secondary">{outTokens.tokens} tokens</Badge>
                <Badge variant="outline" className="text-green-600">
                  -{diff.removed} chars ({diff.percent.toFixed(1)}%)
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-4 items-center">
            {OPTIONS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={options[key]}
                  onCheckedChange={(v) => setOptions({ ...options, [key]: !!v })}
                />
                {label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleClean} disabled={!input}>
          <Eraser className="h-4 w-4" /> Clean Prompt
        </Button>
        <Button variant="outline" onClick={handleCopy} disabled={!output}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        {isDesktop && (
          <>
            <Button variant="outline" onClick={handleImport}>
              <FolderOpen className="h-4 w-4" /> Import File
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={!output}>
              <Download className="h-4 w-4" /> Export File
            </Button>
          </>
        )}
        <Button variant="ghost" onClick={handleClear}>
          <RotateCcw className="h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  )
}
