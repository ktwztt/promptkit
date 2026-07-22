import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 })
  }

  const { default: Stripe } = await import("stripe")
  const stripe = new Stripe(stripeKey)

  const sig = req.headers.get("stripe-signature")
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 })

  let event
  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      const userId = session.client_reference_id
      const subscriptionId = session.subscription as string

      if (userId && subscriptionId) {
        await db.user.update({
          where: { id: userId },
          data: { stripeSubscriptionId: subscriptionId },
        })
      }
      break
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object
      // ponytail: find user by subscription ID and clear it
      break
    }
  }

  return NextResponse.json({ received: true })
}
