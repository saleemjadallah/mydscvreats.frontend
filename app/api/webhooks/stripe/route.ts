
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { constructWebhookEvent, getStripe } from "@/lib/stripe";

function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "trialing":
      return "trial" as const;
    case "active":
      return "active" as const;
    case "canceled":
    case "incomplete_expired":
      return "cancelled" as const;
    case "incomplete":
    case "past_due":
    case "unpaid":
      return "paused" as const;
    default:
      return "trial" as const;
  }
}

function mapPriceIdToPlan(priceId?: string | null) {
  if (!priceId) {
    return undefined;
  }

  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
    return "starter" as const;
  }

  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return "pro" as const;
  }

  return undefined;
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  if (subscription.status === "trialing" && subscription.trial_end) {
    return new Date(subscription.trial_end * 1000).toISOString();
  }

  return subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;
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
    const client = getStripe();
    if (!client) {
      throw new Error("Stripe not configured");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : undefined;
        const subscription = subscriptionId
          ? await client.subscriptions.retrieve(subscriptionId)
          : null;

        await forwardToBackend({
          type: event.type,
          data: {
            restaurantId: session.metadata?.restaurant_id,
            plan:
              mapPriceIdToPlan(subscription?.items.data[0]?.price.id) ??
              (subscription?.metadata.plan === "starter" || subscription?.metadata.plan === "pro"
                ? subscription.metadata.plan
                : undefined) ??
              (session.metadata?.plan === "starter" || session.metadata?.plan === "pro"
                ? session.metadata.plan
                : undefined),
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : undefined,
            stripeSubscriptionId: subscriptionId,
            status: subscription ? mapStripeStatus(subscription.status) : "trial",
            currentPeriodEnd: subscription ? getCurrentPeriodEnd(subscription) : null,
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
      case "customer.subscription.created":
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await forwardToBackend({
          type: event.type,
          data: {
            restaurantId: subscription.metadata.restaurant_id,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : undefined,
            plan:
              mapPriceIdToPlan(subscription.items.data[0]?.price.id) ??
              (subscription.metadata.plan === "starter" || subscription.metadata.plan === "pro"
                ? subscription.metadata.plan
                : undefined),
            status: mapStripeStatus(subscription.status),
            currentPeriodEnd: getCurrentPeriodEnd(subscription),
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
