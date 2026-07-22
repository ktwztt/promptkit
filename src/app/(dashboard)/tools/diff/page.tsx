"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { GitCompare, ArrowRight, Copy, Check } from "lucide-react"
import { toast } from "sonner"

function computeDiff(oldText: string, newText: string) {
  const oldLines = oldText.split("\n")
  const newLines = newText.split("\n")

  // Simple LCS-based diff
  const m = oldLines.length
  const n = newLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const result: { type: "same" | "added" | "removed"; text: string; lineNum?: number }[] = []
  let i = m, j = n
  const temp: typeof result = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      temp.push({ type: "same", text: oldLines[i - 1], lineNum: j })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({ type: "added", text: newLines[j - 1], lineNum: j })
      j--
    } else {
      temp.push({ type: "removed", text: oldLines[i - 1], lineNum: i })
      i--
    }
  }

  return temp.reverse()
}

export default function DiffPage() {
  const [original, setOriginal] = useState("")
  const [modified, setModified] = useState("")
  const [showSame, setShowSame] = useState(true)
  const [copied, setCopied] = useState(false)

  const diff = useMemo(() => {
    if (!original && !modified) return []
    return computeDiff(original, modified)
  }, [original, modified])

  const stats = useMemo(() => {
    const added = diff.filter((d) => d.type === "added").length
    const removed = diff.filter((d) => d.type === "removed").length
    return { added, removed, total: diff.length }
  }, [diff])

  const filtered = showSame ? diff : diff.filter((d) => d.type !== "same")

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Prompt Diff</h1>
        <p className="text-muted-foreground">
          Compare two prompts and see exactly what changed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Original</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste original prompt..."
              className="min-h-[200px] font-mono text-sm"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Modified</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste modified prompt..."
              className="min-h-[200px] font-mono text-sm"
              value={modified}
              onChange={(e) => setModified(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {diff.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="text-green-600">
              +{stats.added} added
            </Badge>
            <Badge variant="outline" className="text-red-600">
              -{stats.removed} removed
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setShowSame(!showSame)}>
              {showSame ? "Hide unchanged" : "Show all"} lines
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  diff.map((d) => `${d.type === "added" ? "+" : d.type === "removed" ? "-" : " "} ${d.text}`).join("\n")
                )
                setCopied(true)
                toast.success("Diff copied")
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              Copy diff
            </Button>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="font-mono text-sm leading-relaxed">
                {filtered.map((line, i) => (
                  <div
                    key={i}
                    className={`px-2 py-0.5 ${
                      line.type === "added"
                        ? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200"
                        : line.type === "removed"
                          ? "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200"
                          : ""
                    }`}
                  >
                    <span className="select-none w-6 inline-block text-muted-foreground">
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                    </span>
                    {line.text || " "}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
