"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import { plans } from "@/lib/plans";

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
    <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="space-y-4">
        {Object.values(plans).map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>
                {plan.name} · AED {plan.priceAed}/month
              </CardTitle>
              <p className="mt-2 text-sm text-stone">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-stone">
                {plan.itemLimit ? `${plan.itemLimit} menu items included` : "Unlimited menu items"}
              </div>
              <Button
                onClick={() => void checkout(plan.id)}
                disabled={loadingPlan === plan.id || !restaurant}
              >
                {loadingPlan === plan.id ? "Redirecting..." : `Choose ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-stone">
            Status: {restaurant?.subscriptionStatus ?? "trial"}
          </div>
          <div className="text-sm text-stone">
            Plan: {restaurant?.subscription?.plan ?? "starter"}
          </div>
          <div className="text-sm text-stone">
            Trial ends: {restaurant?.trialEndsAt ? new Date(restaurant.trialEndsAt).toLocaleDateString() : "n/a"}
          </div>
          <Button
            variant="secondary"
            onClick={() => void openPortal()}
            disabled={portalLoading || !restaurant?.subscription?.stripeCustomerId}
          >
            {portalLoading ? "Opening..." : "Open billing portal"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
