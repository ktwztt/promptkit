"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For casual prompt users.",
    features: [
      "All 9 prompt tools",
      "10 prompt saves/day",
      "5 AI optimizations/day",
      "Basic token counting",
      "Dark/light theme",
    ],
    priceId: null,
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For power users and creators.",
    features: [
      "Everything in Free",
      "Unlimited prompt saves",
      "Unlimited AI optimizations",
      "Prompt version history",
      "Cloud sync across devices",
      "Advanced model selection",
      "Priority support",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    description: "For teams and organizations.",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Shared prompt library",
      "Team folders & permissions",
      "Admin dashboard",
      "API access",
      "SSO (coming soon)",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID || "price_team",
    popular: false,
  },
]

export default function PricingPage() {
  const { session } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    if (!session) {
      toast.error("Please sign in first")
      return
    }
    if (!plan.priceId) {
      toast.info("Free plan — no subscription needed")
      return
    }
    setLoading(plan.priceId)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Checkout failed")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Simple, transparent pricing</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Start free. Upgrade when you need more power. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={plan.popular ? "border-primary shadow-lg relative" : ""}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.priceId}
              >
                {loading === plan.priceId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : plan.priceId ? (
                  "Subscribe"
                ) : (
                  "Get Started"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
