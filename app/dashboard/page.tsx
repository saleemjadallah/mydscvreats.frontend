"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CreditCard,
  Eye,
  ImageIcon,
  MapPin,
  Palette,
  Rocket,
  ScanLine,
  Sparkles,
  Soup,
  Timer,
} from "lucide-react";
import { LaunchKit } from "@/components/dashboard/launch-kit";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/use-restaurant";
import { getRestaurantEntitlements } from "@/lib/entitlements";
import { getRestaurantPublicUrl } from "@/lib/share";
import { getRestaurantSetupState } from "@/lib/restaurant-setup";

const stepIcons = {
  menu: ScanLine,
  theme: Palette,
  publish: CreditCard,
};

export default function DashboardPage() {
  const { restaurant } = useRestaurant();

  if (!restaurant) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-[#201A17] via-[#2A211B] to-[#3A2B23] text-white">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-saffron">
            <Sparkles className="h-4 w-4" />
            Start onboarding
          </div>
          <CardTitle className="text-white">New owners should start in the focused onboarding flow</CardTitle>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Create the restaurant, import the menu, and choose the page theme before using the full dashboard.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
          <p className="text-sm text-stone">
            This keeps the first session fast and avoids slower steps like image generation or billing.
          </p>
          <Button asChild>
            <Link href="/dashboard/onboarding">
              Start onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const setup = getRestaurantSetupState(restaurant);
  const audit = setup.audit;
  const entitlements = getRestaurantEntitlements(restaurant);
  const hasStartedTrial = Boolean(
    entitlements.hasSelectedPlan &&
      restaurant.subscriptionStatus === "trial" &&
      restaurant.trialEndsAt
  );
  const trialDaysLeft = restaurant.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(restaurant.trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        )
      )
    : 0;
  const reservedUrl = getRestaurantPublicUrl(restaurant.slug);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">Overview</div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Launch progress"
            value={`${setup.completionCount}/3`}
            hint={
              !setup.onboardingComplete
                ? "Finish onboarding first."
                : setup.nextStep
                  ? `Next: ${setup.nextStep.label}`
                  : "Everything is live."
            }
            icon={Rocket}
            accent="saffron"
          />
          <StatCard
            label="Menu items"
            value={String(audit.totalItems)}
            hint={audit.totalSections ? `${audit.totalSections} sections imported.` : "No menu yet."}
            icon={Soup}
            accent="coral"
          />
          <StatCard
            label="Visuals ready"
            value={String(audit.imagesReady)}
            hint={
              audit.itemsWithoutImages
                ? `${audit.itemsWithoutImages} dishes still missing imagery.`
                : "Every dish currently has an image."
            }
            icon={ImageIcon}
            accent="emerald"
          />
          <StatCard
            label={
              restaurant.subscriptionStatus === "active"
                ? "Live status"
                : hasStartedTrial
                  ? "Trial remaining"
                  : "Billing status"
            }
            value={
              restaurant.subscriptionStatus === "active"
                ? "Live"
                : hasStartedTrial
                  ? `${trialDaysLeft} days`
                  : "Not started"
            }
            hint={
              restaurant.subscriptionStatus === "active"
                ? `Published at mydscvr.ai/${restaurant.slug}.`
                : hasStartedTrial
                  ? "Your trial is live. Add a payment method in billing before it ends."
                  : "Choose Starter or Pro in billing to start the 14-day trial."
            }
            icon={restaurant.subscriptionStatus === "active" ? Eye : Timer}
            accent="stone"
          />
        </div>
      </div>

      <div>
        <div className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">Activation</div>
        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-[#201A17] via-[#2A211B] to-[#3A2B23] text-white">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-saffron">
                <Sparkles className="h-4 w-4" />
                Activation flow
              </div>
              <CardTitle className="text-white">Keep onboarding short, then move into polish</CardTitle>
              <p className="mt-2 text-sm text-white/70">
                The first-run flow is now only menu import and theme choice. Slower polish stays outside onboarding.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {setup.steps.map((step) => {
                const Icon = stepIcons[step.id];
                const isNext = setup.nextStep?.id === step.id;

                return (
                  <div
                    key={step.id}
                    className={`rounded-[24px] border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
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
              <CardTitle>{restaurant.isPublished ? "Launch status" : "What the owner sees next"}</CardTitle>
              <p className="mt-2 text-sm text-stone">
                Keep the experience anchored on the outcome, not on the internal page structure.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-5">
                <div className="mb-2 text-xs uppercase tracking-[0.3em] text-stone">Reserved URL</div>
                <div className="text-sm font-medium text-ink">{reservedUrl}</div>
                <p className="mt-2 text-sm text-stone">
                  {restaurant.isPublished
                    ? "This page is already public and ready to share."
                    : "This URL is the destination you are working toward. It becomes public after publish."}
                </p>
                <div className="mt-4">
                  <Button asChild variant="secondary">
                    <Link href={restaurant.isPublished ? `/${restaurant.slug}` : "/dashboard/preview"}>
                      {restaurant.isPublished ? "View public page" : "Preview menu page"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {!setup.onboardingComplete ? (
                <div className="rounded-[24px] border border-[#E7DAC5] p-5">
                  <div className="mb-2 text-xs uppercase tracking-[0.3em] text-stone">Recommended move</div>
                  <div className="text-lg font-semibold text-ink">Continue onboarding</div>
                  <p className="mt-2 text-sm text-stone">
                    Finish the menu import and theme choice before worrying about imagery, billing, or launch polish.
                  </p>
                  <div className="mt-4">
                    <Button asChild>
                      <Link href="/dashboard/onboarding">
                        Continue onboarding
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : setup.nextStep ? (
                <div className="rounded-[24px] border border-[#E7DAC5] p-5">
                  <div className="mb-2 text-xs uppercase tracking-[0.3em] text-stone">Recommended move</div>
                  <div className="text-lg font-semibold text-ink">{setup.nextStep.label}</div>
                  <p className="mt-2 text-sm text-stone">{setup.nextStep.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {setup.nextStep.id === "publish" ? (
                      <Button asChild variant="secondary">
                        <Link href="/dashboard/preview">
                          <Eye className="h-4 w-4" />
                          Preview menu page
                        </Link>
                      </Button>
                    ) : null}
                    <Button asChild>
                      <Link href={setup.nextStep.href}>
                        {setup.nextStep.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}

              {setup.onboardingComplete && audit.blockingIssues.length > 0 ? (
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
                    {restaurant.isPublished
                      ? "Launch loop complete"
                      : setup.onboardingComplete
                        ? "Ready for polish and publish"
                        : "Onboarding intentionally kept small"}
                  </div>
                  <p className="text-sm text-stone">
                    {restaurant.isPublished
                      ? "The page is live. Focus now is distribution: link, QR code, widget, and early traffic."
                      : setup.onboardingComplete
                        ? "Now that the page skeleton exists, move into menu polish, image generation, and billing."
                        : "The goal of onboarding is to assemble the first version of the page, not to complete every task."}
                  </p>
                  {restaurant.isPublished && (restaurant.gbpConnection?.status === "self_reported" || restaurant.gbpConnection?.status === "verified") ? (
                    <div className="mt-3 flex items-center gap-2 text-sm text-[#206B48]">
                      <MapPin className="h-4 w-4" />
                      Connected to Google Maps
                    </div>
                  ) : restaurant.isPublished && !restaurant.gbpConnection ? (
                    <Link
                      href="/dashboard/google-business"
                      className="mt-3 inline-flex items-center gap-2 text-sm text-saffron hover:underline"
                    >
                      <MapPin className="h-4 w-4" />
                      Connect your Google Business Profile to get discovered on Maps
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {restaurant.isPublished ? (
        <LaunchKit
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          slug={restaurant.slug}
          shortLinkCode={restaurant.shortLink?.code ?? null}
          shortLinksEnabled={Boolean(restaurant.entitlements?.shortLinksEnabled)}
          widgetEnabled={Boolean(restaurant.entitlements?.widgetEnabled)}
        />
      ) : null}
    </div>
  );
}
