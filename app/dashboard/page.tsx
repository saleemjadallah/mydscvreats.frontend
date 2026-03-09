"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const { restaurant, refresh } = useRestaurant();
  const [form, setForm] = useState({
    name: "",
    description: "",
    cuisineType: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  async function createRestaurant() {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiClient.createRestaurant(token, form);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!restaurant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create your restaurant profile</CardTitle>
          <p className="mt-2 text-sm text-stone">
            This creates the slug, trial window, and dashboard state for all later steps.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Cuisine type</Label>
            <Input
              value={form.cuisineType}
              onChange={(event) =>
                setForm((current) => ({ ...current, cuisineType: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(event) =>
                setForm((current) => ({ ...current, location: event.target.value }))
              }
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => void createRestaurant()} disabled={loading || !form.name}>
              {loading ? "Creating..." : "Create restaurant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const itemCount =
    restaurant.menuSections?.reduce((total, section) => total + section.items.length, 0) ?? 0;
  const trialDaysLeft = restaurant.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(restaurant.trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        )
      )
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Menu items"
          value={String(itemCount)}
          hint="Across all visible sections on the hosted page."
        />
        <StatCard
          label="Trial remaining"
          value={`${trialDaysLeft} days`}
          hint="Starts at sign-up, no card required."
        />
        <StatCard
          label="Current plan"
          value={restaurant.subscription?.plan ? restaurant.subscription.plan.toUpperCase() : "TRIAL"}
          hint={`Starter is ${formatCurrency(99)}, Pro is ${formatCurrency(199)}.`}
        />
      </div>
      <OnboardingWizard />
    </div>
  );
}
