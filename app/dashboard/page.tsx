"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CreditCard,
  Palette,
  ScanLine,
  Sparkles,
  Soup,
} from "lucide-react";
import { toast } from "sonner";
import { LaunchKit } from "@/components/dashboard/launch-kit";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import { getRestaurantPublicUrl } from "@/lib/share";
import { getRestaurantSetupState } from "@/lib/restaurant-setup";

const stepIcons = {
  profile: Palette,
  menu: ScanLine,
  review: Soup,
  publish: CreditCard,
};

export default function DashboardPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { restaurant, setRestaurant } = useRestaurant();
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

      const created = await apiClient.createRestaurant(token, form);
      setRestaurant(created);
      toast.success("Restaurant created. Next step: import the menu.");
      router.push("/dashboard/ai-menu");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create restaurant.");
    } finally {
      setLoading(false);
    }
  }

  if (!restaurant) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-[#201A17] text-white">
          <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-[#E8C66A]">
            <Sparkles className="h-4 w-4" />
            Get live fast
          </div>
          <CardTitle className="text-white">Create the restaurant, then jump straight into AI import</CardTitle>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Keep this lightweight. We only need enough to reserve the slug and unlock the upload flow.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Restaurant name</Label>
            <Input
              placeholder="Saffron Kitchen"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Cuisine type</Label>
            <Input
              placeholder="Indian fusion"
              value={form.cuisineType}
              onChange={(event) =>
                setForm((current) => ({ ...current, cuisineType: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="JLT, Dubai"
              value={form.location}
              onChange={(event) =>
                setForm((current) => ({ ...current, location: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Short description</Label>
            <Textarea
              placeholder="Modern comfort food with bold spices and all-day breakfast."
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] px-5 py-4">
            <p className="text-sm text-stone">
              After this, the flow moves directly to menu upload and extraction review.
            </p>
            <Button onClick={() => void createRestaurant()} disabled={loading || !form.name.trim()}>
              {loading ? "Creating..." : "Create and continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const setup = getRestaurantSetupState(restaurant);
  const audit = setup.audit;
  const trialDaysLeft = restaurant.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(restaurant.trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        )
      )
    : 0;
  const reservedUrl = getRestaurantPublicUrl(
    restaurant.slug
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Launch progress"
          value={`${setup.completionCount}/4`}
          hint={setup.nextStep ? `Next: ${setup.nextStep.label}` : "Everything is live."}
        />
        <StatCard
          label="Menu items"
          value={String(audit.totalItems)}
          hint={audit.totalSections ? `${audit.totalSections} sections imported.` : "No menu yet."}
        />
        <StatCard
          label="Visuals ready"
          value={String(audit.imagesReady)}
          hint={
            audit.itemsWithoutImages
              ? `${audit.itemsWithoutImages} dishes still missing imagery.`
              : "Every dish currently has an image."
          }
        />
        <StatCard
          label={restaurant.subscriptionStatus === "active" ? "Live status" : "Trial remaining"}
          value={
            restaurant.subscriptionStatus === "active"
              ? "Live"
              : `${trialDaysLeft} days`
          }
          hint={
            restaurant.subscriptionStatus === "active"
              ? `Published at mydscvr.ai/${restaurant.slug}.`
              : "No card required until you are ready to publish."
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-stone">
              <Sparkles className="h-4 w-4" />
              Activation flow
            </div>
            <CardTitle>Turn the landing page promise into an actual first session</CardTitle>
            <p className="mt-2 text-sm text-stone">
              The app should walk restaurant owners from import to launch without making them think about navigation.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {setup.steps.map((step) => {
              const Icon = stepIcons[step.id];
              const isNext = setup.nextStep?.id === step.id;

              return (
                <div
                  key={step.id}
                  className={`rounded-[24px] border p-4 transition-colors ${
                    isNext
                      ? "border-[#E8C66A] bg-[#FFF8EE]"
                      : step.completed
                        ? "border-[#CCEBD9] bg-[#F7FEFA]"
                        : "border-[#E7DAC5] bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {step.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-[#2E8B57]" />
                        ) : (
                          <Circle className="h-5 w-5 text-stone" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-2 font-medium text-ink">
                            <Icon className="h-4 w-4 text-saffron" />
                            {step.label}
                          </div>
                          {step.completed ? (
                            <Badge variant="success">Complete</Badge>
                          ) : isNext ? (
                            <Badge variant="default">Do next</Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-stone">{step.description}</p>
                        <p className="text-sm font-medium text-ink">{step.summary}</p>
                      </div>
                    </div>
                    <Button asChild variant={isNext ? "default" : "secondary"} size="sm">
                      <Link href={step.href}>
                        {step.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {restaurant.isPublished ? "Launch status" : "What the owner sees next"}
            </CardTitle>
            <p className="mt-2 text-sm text-stone">
              Keep the experience anchored on the outcome, not on the internal page structure.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-5">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-stone">Reserved URL</div>
              <div className="text-sm font-medium text-ink">{reservedUrl}</div>
              <p className="mt-2 text-sm text-stone">
                {restaurant.isPublished
                  ? "This page is already public and ready to share."
                  : "This URL is the destination you are working toward. It becomes public after publish."}
              </p>
            </div>

            {setup.nextStep ? (
              <div className="rounded-[24px] border border-[#E7DAC5] p-5">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-stone">Recommended move</div>
                <div className="text-lg font-semibold text-ink">{setup.nextStep.label}</div>
                <p className="mt-2 text-sm text-stone">{setup.nextStep.summary}</p>
                <div className="mt-4">
                  <Button asChild>
                    <Link href={setup.nextStep.href}>
                      {setup.nextStep.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}

            {audit.blockingIssues.length > 0 ? (
              <div className="rounded-[24px] border border-coral/25 bg-coral/[0.04] p-5">
                <div className="mb-3 text-sm font-medium text-coral">Still blocking launch</div>
                <div className="space-y-2 text-sm text-stone">
                  {audit.blockingIssues.map((issue) => (
                    <div key={issue.id}>
                      <span className="font-medium text-ink">{issue.label}:</span> {issue.description}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-[#CCEBD9] bg-[#F7FEFA] p-5">
                <div className="mb-2 text-sm font-medium text-[#206B48]">
                  {restaurant.isPublished ? "Launch loop complete" : "Ready for publish"}
                </div>
                <p className="text-sm text-stone">
                  {restaurant.isPublished
                    ? "The page is live. Focus now is distribution: link, QR code, widget, and early traffic."
                    : "Structure and pricing look clean enough. The next meaningful action is to publish."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {restaurant.isPublished ? (
        <LaunchKit
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          slug={restaurant.slug}
        />
      ) : null}
    </div>
  );
}
