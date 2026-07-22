import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wand2, Sparkles, Languages, Hash, Library, Scissors, GitCompare, Zap, AlignLeft } from "lucide-react"

const FEATURES = [
  { icon: Wand2, title: "Prompt Cleaner", desc: "Remove markdown, HTML, emoji, and normalize formatting with one click.", href: "/tools/cleaner" },
  { icon: Sparkles, title: "Prompt Optimizer", desc: "Auto-optimize prompts for ChatGPT, Claude, Gemini, Grok, DeepSeek.", href: "/tools/optimizer" },
  { icon: Languages, title: "Prompt Translator", desc: "Translate prompts while preserving logic — not literal translation.", href: "/tools/translator" },
  { icon: Hash, title: "Token Counter", desc: "Count tokens, estimate API costs, and check context limits.", href: "/tools/token-counter" },
  { icon: Scissors, title: "Prompt Splitter", desc: "Split long prompts by token count while keeping context.", href: "/tools/splitter" },
  { icon: GitCompare, title: "Prompt Diff", desc: "Compare two prompts with highlighted additions and deletions.", href: "/tools/diff" },
  { icon: AlignLeft, title: "Prompt Formatter", desc: "Standardize headings, lists, code blocks, tables, and spacing.", href: "/tools/formatter" },
  { icon: Library, title: "Prompt Library", desc: "Save, organize, tag, favorite, and version your prompts.", href: "/library" },
  { icon: Zap, title: "AI Generator", desc: "Describe what you need — get a complete, optimized prompt.", href: "/tools/generator" },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container max-w-5xl mx-auto px-4 py-24 md:py-32 text-center">
        <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">🚀 Now in Public Beta</Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Your AI Prompt{" "}
          <span className="text-primary">Workspace</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Clean, optimize, translate, and manage prompts for every AI model.
          Stop wrestling with formatting — focus on what you want to build.
        </p>
        <div className="flex items-center gap-4 justify-center flex-wrap">
          <Link href="/tools/cleaner" className={buttonVariants({ size: "lg" })}>Start for Free</Link>
          <Link href="/tools/token-counter" className={buttonVariants({ size: "lg", variant: "outline" })}>Try Token Counter</Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Everything you need for prompt engineering
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, href }) => (
            <Card key={title} className="hover:border-primary/50 transition-colors">
              <Link href={href}>
                <CardHeader>
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to level up your prompts?
        </h2>
        <p className="text-muted-foreground mb-8">
          Free to start. No credit card required. Works with every AI model.
        </p>
        <Link href="/tools/cleaner" className={buttonVariants({ size: "lg" })}>Get Started — It&apos;s Free</Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            PromptKit
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tools/cleaner" className="hover:text-foreground">Tools</Link>
            <Link href="/library" className="hover:text-foreground">Library</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
