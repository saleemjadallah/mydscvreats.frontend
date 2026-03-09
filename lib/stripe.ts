import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
  }

  return stripe;
}

export function constructWebhookEvent(body: string | Buffer, signature: string) {
  const client = getStripe();

  if (!client || !process.env.STRIPE_WEBHOOK_SECRET) {
    return null;
  }

  try {
    return client.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return null;
  }
}
