"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlignLeft, Copy, Check, RotateCcw, List, Code, Heading, Table } from "lucide-react"
import { toast } from "sonner"
import { countTokens } from "@/lib/token-counter"

interface FormatRule {
  key: string
  label: string
  icon: React.ElementType
  desc: string
}

const RULES: FormatRule[] = [
  { key: "headings", label: "Headings", icon: Heading, desc: "Normalize heading levels" },
  { key: "lists", label: "Lists", icon: List, desc: "Standardize bullet/numbered lists" },
  { key: "code", label: "Code Blocks", icon: Code, desc: "Add proper code block fences" },
  { key: "tables", label: "Tables", icon: Table, desc: "Align table columns" },
  { key: "spacing", label: "Spacing", icon: AlignLeft, desc: "Consistent paragraph spacing" },
]

function formatPrompt(text: string, rules: string[]): string {
  let result = text

  if (rules.includes("headings")) {
    // Ensure blank lines around headings
    result = result.replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")
    result = result.replace(/(#{1,6}\s[^\n]+)\n([^\n#])/g, "$1\n\n$2")
  }

  if (rules.includes("lists")) {
    // Standardize bullet points
    result = result.replace(/^[•⋅·●○]/gm, "-")
    result = result.replace(/^\*(\s)/gm, "-$1")
    // Ensure blank line before lists
    result = result.replace(/([^\n])\n(-|\d+\.)\s/g, "$1\n\n$2")
  }

  if (rules.includes("code")) {
    // Wrap code-like content in backticks
    result = result.replace(/\b([A-Z_]{2,})\b/g, "`$1`")
    // Add language hints to common fenced blocks
    result = result.replace(/```\n(?!\w)/g, "```text\n")
  }

  if (rules.includes("tables")) {
    // Normalize table pipe spacing
    result = result.replace(/\|\s*/g, "| ")
    result = result.replace(/\s*\|/g, " |")
    result = result.replace(/\|\s+\|/g, "| |")
  }

  if (rules.includes("spacing")) {
    // Single blank line between paragraphs
    result = result.replace(/\n{3,}/g, "\n\n")
    // Remove trailing whitespace
    result = result.replace(/[ \t]+$/gm, "")
    // Ensure newline at end
    result = result.replace(/([^\n])$/, "$1\n")
  }

  return result
}

export default function FormatterPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [activeRules, setActiveRules] = useState<string[]>(["headings", "lists", "spacing"])
  const [copied, setCopied] = useState(false)

  const toggleRule = (key: string) => {
    setActiveRules((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    )
  }

  const handleFormat = () => {
    setOutput(formatPrompt(input, activeRules))
  }

  const inStats = input ? countTokens(input) : null
  const outStats = output ? countTokens(output) : null

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Prompt Formatter</h1>
        <p className="text-muted-foreground">
          Standardize formatting — headings, lists, code blocks, tables, spacing.
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
            {inStats && (
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{inStats.chars} chars</Badge>
                <Badge variant="secondary">{inStats.tokens} tokens</Badge>
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
              placeholder="Formatted prompt appears here..."
              className="min-h-[300px] font-mono text-sm"
              value={output}
            />
            {outStats && (
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{outStats.chars} chars</Badge>
                <Badge variant="secondary">{outStats.tokens} tokens</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-2">
            {RULES.map(({ key, label, icon: Icon, desc }) => (
              <Button
                key={key}
                variant={activeRules.includes(key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRule(key)}
                title={desc}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleFormat} disabled={!input || activeRules.length === 0}>
          <AlignLeft className="h-4 w-4" /> Format Prompt
        </Button>
        <Button variant="outline" onClick={() => { navigator.clipboard.writeText(output); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 2000) }} disabled={!output}>
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
