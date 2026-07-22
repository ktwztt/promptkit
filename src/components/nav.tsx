"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { authClient } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import {
  Wand2, Sparkles, Languages, Hash, Library, Menu, X, LogIn, LogOut,
  Scissors, GitCompare, AlignLeft, Zap,
} from "lucide-react"
import { useState } from "react"

const TOOLS = [
  { href: "/tools/cleaner", label: "Cleaner", icon: Wand2 },
  { href: "/tools/optimizer", label: "Optimizer", icon: Sparkles },
  { href: "/tools/translator", label: "Translator", icon: Languages },
  { href: "/tools/token-counter", label: "Token Counter", icon: Hash },
  { href: "/tools/splitter", label: "Splitter", icon: Scissors },
  { href: "/tools/diff", label: "Diff", icon: GitCompare },
  { href: "/tools/formatter", label: "Formatter", icon: AlignLeft },
  { href: "/tools/generator", label: "Generator", icon: Zap },
]

function NavLink({ href, label, icon: Icon, active, className, onClick }: {
  href: string; label: string; icon: React.ElementType; active: boolean; className?: string; onClick?: () => void
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: active ? "secondary" : "ghost", size: "sm" }),
        className,
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}

export function Nav() {
  const pathname = usePathname()
  const { session, isPending } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            PromptKit
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {TOOLS.map((t) => (
              <NavLink key={t.href} {...t} active={pathname.startsWith(t.href)} />
            ))}
            <NavLink
              href="/library" label="Library" icon={Library}
              active={pathname.startsWith("/library")}
            />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isPending && (
            <>
              {session ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{session.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => authClient.signOut()}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                  <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
                    Get Started
                  </Link>
                </div>
              )}
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t p-4 flex flex-col gap-2">
          {TOOLS.map((t) => (
            <NavLink
              key={t.href} {...t} active={pathname.startsWith(t.href)}
              className="justify-start"
              onClick={() => setOpen(false)}
            />
          ))}
          <NavLink
            href="/library" label="Library" icon={Library}
            active={pathname.startsWith("/library")}
            className="justify-start"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </header>
  )
}
