"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Copy, Check, Search, FileText, Code, Megaphone,
  GraduationCap, Lightbulb, Briefcase, Palette, Wand2, Plus,
} from "lucide-react"
import { toast } from "sonner"

interface Template {
  id: string
  title: string
  category: string
  description: string
  model: string
  content: string
  tags: string[]
}

const CATEGORIES = [
  { key: "all", label: "All", icon: FileText },
  { key: "writing", label: "Writing", icon: Wand2 },
  { key: "programming", label: "Programming", icon: Code },
  { key: "marketing", label: "Marketing", icon: Megaphone },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "business", label: "Business", icon: Briefcase },
  { key: "creative", label: "Creative", icon: Palette },
]

const TEMPLATES: Template[] = [
  {
    id: "blog-post",
    title: "Blog Post Writer",
    category: "writing",
    description: "Write a well-structured blog post on any topic with SEO optimization.",
    model: "generic",
    content: `You are a professional blog writer. Write a comprehensive blog post about [TOPIC].

Requirements:
- Target audience: [AUDIENCE]
- Tone: [professional/casual/technical]
- Length: approximately [WORD_COUNT] words
- Include: an engaging headline, introduction, 3-5 main sections with subheadings, conclusion, and a call-to-action.
- SEO: naturally incorporate the keyword "[KEYWORD]" 3-5 times.

Format the output in clean markdown with proper headings.`,
    tags: ["writing", "seo", "content"],
  },
  {
    id: "code-review",
    title: "Code Review Assistant",
    category: "programming",
    description: "Get a thorough code review with improvement suggestions.",
    model: "generic",
    content: `Act as a senior software engineer conducting a code review for the following code.

Review for:
1. Bugs and logic errors
2. Performance issues
3. Security vulnerabilities
4. Code style and readability
5. Architecture and design patterns
6. Test coverage gaps

For each issue found:
- Severity: [critical/high/medium/low]
- File and line reference
- Explanation of the problem
- Suggested fix with code example

Code to review:
\`\`\`
[PASTE CODE HERE]
\`\`\`

Context: This code is part of a [DESCRIBE PROJECT TYPE] project using [TECH STACK].`,
    tags: ["programming", "review", "code"],
  },
  {
    id: "cold-email",
    title: "Cold Outreach Email",
    category: "marketing",
    description: "Craft compelling cold emails that get replies.",
    model: "generic",
    content: `Write a cold outreach email with the following parameters:

- Sender: [YOUR NAME / COMPANY]
- Recipient: [RECIPIENT ROLE, e.g., CTO of a SaaS startup]
- Goal: [MEETING / DEMO / PARTNERSHIP]
- Value proposition: [WHAT YOU OFFER]

Email structure:
1. Personalized opening line (reference their work/company)
2. Clear value proposition (1-2 sentences)
3. Social proof (1 sentence)
4. Low-friction call-to-action
5. Professional signature

Rules:
- Keep under 150 words
- No buzzwords or hype
- Make it easy to say "yes" or "no"
- Use a conversational, human tone`,
    tags: ["marketing", "email", "sales"],
  },
  {
    id: "study-notes",
    title: "Study Notes Generator",
    category: "education",
    description: "Generate concise study notes from any topic or material.",
    model: "generic",
    content: `Create comprehensive study notes on the topic: [TOPIC]

Format the notes as follows:

## Key Concepts
- Bullet points of the 3-5 most important ideas

## Detailed Breakdown
For each key concept, provide:
- Definition
- Example
- Why it matters

## Common Misconceptions
List 2-3 things students often get wrong

## Quick Review Questions
5 questions to test understanding (with answers)

## Memory Aids
Mnemonics or analogies to help remember the material

Target education level: [HIGH SCHOOL / UNDERGRADUATE / GRADUATE / SELF-STUDY]`,
    tags: ["education", "study", "learning"],
  },
  {
    id: "youtube-script",
    title: "YouTube Video Script",
    category: "creative",
    description: "Structure engaging YouTube video scripts with hooks and pacing.",
    model: "generic",
    content: `Write a YouTube video script about [TOPIC].

Video details:
- Title: [WORKING TITLE]
- Target length: [5 / 10 / 15 / 20] minutes
- Style: [educational / entertainment / vlog / tutorial / review]
- Target audience: [DESCRIBE AUDIENCE]

Script structure:
1. HOOK (first 15 seconds) — grab attention with a question, surprising fact, or bold claim
2. INTRO — introduce yourself and what the viewer will learn
3. BODY — 3-5 main points with examples and visuals
4. BONUS TIP — something extra the viewer didn't expect
5. OUTRO — summarize and call-to-action (like, subscribe, comment)

For each section, include:
- [SPEAKER NOTES]: What to say
- [VISUAL]: B-roll, graphics, or screen recording suggestions
- Estimated duration for the section`,
    tags: ["creative", "video", "youtube"],
  },
  {
    id: "project-brief",
    title: "Project Brief Template",
    category: "business",
    description: "Create clear project briefs for team alignment.",
    model: "generic",
    content: `Generate a project brief for: [PROJECT NAME]

Include these sections:

## Project Overview
- One-sentence summary
- Problem being solved
- Success metrics (2-3 measurable KPIs)

## Scope
- In scope: [LIST DELIVERABLES]
- Out of scope: [WHAT'S NOT INCLUDED]

## Timeline
- Start date:
- Key milestones:
- Target completion:

## Team
- Project lead:
- Contributors:
- Stakeholders:

## Risks & Dependencies
- Top 3 risks and mitigation strategies
- External dependencies

## Budget
- Estimated budget:
- Resource allocation:`,
    tags: ["business", "project-management", "planning"],
  },
]

export default function TemplatesPage() {
  const [category, setCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = TEMPLATES.filter(t => {
    if (category !== "all" && t.category !== category) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.tags.some(tag => tag.includes(search.toLowerCase()))) return false
    return true
  })

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    toast.success("Template copied")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Prompt Templates</h1>
        <p className="text-muted-foreground">
          Production-ready templates. Click to expand, copy, and customize.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={category === key ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(key)}
          >
            <Icon className="h-3 w-3" />
            {label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No templates match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(t => {
            const isOpen = expanded === t.id
            return (
              <Card key={t.id} className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{t.title}</CardTitle>
                      <CardDescription>{t.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {t.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  {isOpen && (
                    <>
                      <Separator className="mb-3" />
                      <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-3 rounded-md mb-3 max-h-[300px] overflow-y-auto">
                        {t.content}
                      </pre>
                    </>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setExpanded(isOpen ? null : t.id)}>
                      {isOpen ? "Collapse" : "Expand"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(t.id, t.content)}
                    >
                      {copiedId === t.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedId === t.id ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
