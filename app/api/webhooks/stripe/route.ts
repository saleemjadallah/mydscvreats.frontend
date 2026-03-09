
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { constructWebhookEvent, getStripe } from "@/lib/stripe";

function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return "active" as const;
    case "canceled":
    case "incomplete_expired":
      return "cancelled" as const;
    case "past_due":
    case "unpaid":
      return "paused" as const;
    default:
      return "trial" as const;
  }
}

async function forwardToBackend(payload: Record<string, unknown>) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Missing backend webhook sync configuration");
  }

  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/subscriptions/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-stripe-webhook-secret": process.env.STRIPE_WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Backend webhook sync failed with ${response.status}`);
  }
}

export async function POST(request: NextRequest) {
  if (!getStripe()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const event = constructWebhookEvent(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await forwardToBackend({
          type: event.type,
          data: {
            restaurantId: session.metadata?.restaurant_id,
            plan: session.metadata?.plan,
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : undefined,
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : undefined,
          },
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await forwardToBackend({
          type: event.type,
          data: {
            stripeSubscriptionId:
              typeof invoice.subscription === "string" ? invoice.subscription : undefined,
          },
        });
        break;
      }
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await forwardToBackend({
          type: event.type,
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : undefined,
            status: mapStripeStatus(subscription.status),
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
