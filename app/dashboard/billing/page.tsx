"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Check, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import { plans } from "@/lib/plans";

const starterFeatures = [
  "Up to 30 menu items",
  "AI menu extraction",
  "AI dish imagery",
  "Hosted page at mydscvr.ai",
  "Basic page analytics",
];

const proFeatures = [
  "Unlimited menu items",
  "Everything in Starter",
  "Priority image generation",
  "Embeddable widget",
  "Advanced analytics",
];

const planCards = [
  {
    plan: plans.starter,
    features: starterFeatures,
    highlighted: false,
  },
  {
    plan: plans.pro,
    features: proFeatures,
    highlighted: true,
  },
];

export default function BillingPage() {
  const { getToken } = useAuth();
  const { restaurant } = useRestaurant();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function checkout(plan: "starter" | "pro") {
    if (!restaurant) {
      return;
    }

    setLoadingPlan(plan);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const response = await apiClient.createCheckout(token, {
        restaurantId: restaurant.id,
        plan,
        successUrl: `${window.location.origin}/dashboard/billing?checkout=success`,
        cancelUrl: `${window.location.origin}/dashboard/billing?checkout=cancelled`,
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } finally {
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    if (!restaurant) {
      return;
    }

    setPortalLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const response = await apiClient.createBillingPortal(token, {
        restaurantId: restaurant.id,
        returnUrl: `${window.location.origin}/dashboard/billing`,
      });

      window.location.href = response.url;
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-ink p-8 md:p-10">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-saffron">Pricing</p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Less than your monthly cleaning bill.
          </h2>
          <p className="mt-2 text-sm text-white/60">
            14-day free trial on all plans. No credit card required.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {planCards.map(({ plan, features, highlighted }) => (
            <div
              key={plan.id}
              className={`rounded-[28px] border p-7 transition-all duration-300 hover:-translate-y-1 ${
                highlighted
                  ? "border-saffron/30 bg-white/[0.07] ring-2 ring-saffron/50"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              {highlighted && (
                <div className="mb-4 inline-block rounded-full bg-saffron/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
                  Most popular
                </div>
              )}
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-white/90">{plan.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-white">
                  AED {plan.priceAed}
                </span>
                <span className="text-sm text-white/70">/mo</span>
              </div>

              <ul className="mt-8 space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-white/90"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  className={`w-full ${
                    highlighted
                      ? "bg-saffron text-ink hover:bg-saffron/90"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/15"
                  }`}
                  onClick={() => void checkout(plan.id)}
                  disabled={loadingPlan === plan.id || !restaurant}
                >
                  {loadingPlan === plan.id ? "Redirecting..." : `Choose ${plan.name}`}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <CreditCard className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <CardTitle>Current subscription</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE] p-4">
              <div className="mb-1 text-xs uppercase tracking-[0.2em] text-stone">Status</div>
              <div className="flex items-center gap-2 font-medium text-ink">
                <div className={`h-2 w-2 rounded-full ${
                  restaurant?.subscriptionStatus === "active" ? "bg-[#2E8B57]" : "bg-saffron"
                }`} />
                {restaurant?.subscriptionStatus ?? "trial"}
              </div>
            </div>
            <div className="rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE] p-4">
              <div className="mb-1 text-xs uppercase tracking-[0.2em] text-stone">Plan</div>
              <div className="font-medium text-ink">{restaurant?.subscription?.plan ?? "starter"}</div>
            </div>
            <div className="rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE] p-4">
              <div className="mb-1 text-xs uppercase tracking-[0.2em] text-stone">Trial ends</div>
              <div className="font-medium text-ink">
                {restaurant?.trialEndsAt ? new Date(restaurant.trialEndsAt).toLocaleDateString() : "n/a"}
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => void openPortal()}
            disabled={portalLoading || !restaurant?.subscription?.stripeCustomerId}
            className="transition-all duration-200 hover:-translate-y-0.5"
          >
            <Shield className="h-4 w-4" />
            {portalLoading ? "Opening..." : "Open billing portal"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
