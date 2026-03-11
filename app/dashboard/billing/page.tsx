"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Check, CreditCard, Globe2, RefreshCw, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import { getAppHostname, getRestaurantFallbackUrl } from "@/lib/domains";
import { countMenuItems, getRestaurantEntitlements } from "@/lib/entitlements";
import { plans } from "@/lib/plans";
import { getRestaurantPublicUrl } from "@/lib/share";

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
  "Custom domain",
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
  const { restaurant, refresh } = useRestaurant();
  const entitlements = getRestaurantEntitlements(restaurant);
  const hasSelectedPlan = entitlements.hasSelectedPlan;
  const hasBillingPortalAccess = Boolean(restaurant?.subscription?.stripeCustomerId);
  const menuItemCount = countMenuItems(restaurant?.menuSections);
  const customDomain = restaurant?.customDomain ?? null;
  const publicUrl = restaurant ? getRestaurantPublicUrl(restaurant) : null;
  const starterNeedsTrim =
    !hasSelectedPlan &&
    plans.starter.itemLimit !== null &&
    menuItemCount > plans.starter.itemLimit;
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [domainLoading, setDomainLoading] = useState<"save" | "verify" | "delete" | null>(null);

  useEffect(() => {
    setDomainInput(customDomain?.hostname ?? "");
  }, [customDomain?.hostname]);

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

  async function saveCustomDomain() {
    if (!restaurant) {
      return;
    }

    setDomainLoading("save");
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const domain = await apiClient.upsertCustomDomain(token, restaurant.id, {
        hostname: domainInput,
      });
      await refresh();

      if (domain?.status === "active") {
        toast.success("Custom domain connected and verified.");
      } else {
        toast.success("Custom domain saved. Add the DNS record, then verify.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save custom domain.");
    } finally {
      setDomainLoading(null);
    }
  }

  async function verifyCustomDomain() {
    if (!restaurant) {
      return;
    }

    setDomainLoading("verify");
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const domain = await apiClient.verifyCustomDomain(token, restaurant.id);
      await refresh();

      if (domain?.status === "active") {
        toast.success("Custom domain is live.");
      } else {
        toast.error("DNS record not found yet. Double-check the CNAME and try again.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify custom domain.");
    } finally {
      setDomainLoading(null);
    }
  }

  async function deleteCustomDomain() {
    if (!restaurant) {
      return;
    }

    setDomainLoading("delete");
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiClient.deleteCustomDomain(token, restaurant.id);
      await refresh();
      toast.success("Custom domain removed. The hosted fallback URL still works.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove custom domain.");
    } finally {
      setDomainLoading(null);
    }
  }

  const defaultVerificationTarget = getAppHostname();
  const verificationTarget = customDomain?.verificationTarget ?? defaultVerificationTarget;
  const canManageCustomDomain =
    Boolean(restaurant) && hasSelectedPlan && entitlements.customDomainEnabled;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-ink p-8 md:p-10">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-saffron">Pricing</p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Less than your monthly cleaning bill.
          </h2>
          <p className="mt-2 text-sm text-white/60">
            14-day free trial on both plans. No card required to start.
          </p>
        </div>

        {!hasSelectedPlan && starterNeedsTrim ? (
          <div className="mx-auto mb-6 max-w-3xl rounded-[24px] border border-[#F2CFC7] bg-[#FFF4F1] px-5 py-4 text-left">
            <div className="text-sm font-semibold text-[#9B2C2C]">This draft needs Pro</div>
            <p className="mt-1 text-sm text-[#9B2C2C]/80">
              Your current menu has {menuItemCount} dishes. Starter supports up to {plans.starter.itemLimit}, so this version will need Pro when you start your trial.
            </p>
          </div>
        ) : null}

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
                  onClick={() =>
                    void (hasBillingPortalAccess ? openPortal() : !hasSelectedPlan ? checkout(plan.id) : undefined)
                  }
                  disabled={
                    loadingPlan === plan.id ||
                    portalLoading ||
                    !restaurant ||
                    (hasSelectedPlan && !hasBillingPortalAccess) ||
                    (!hasSelectedPlan && plan.id === "starter" && starterNeedsTrim)
                  }
                >
                  {loadingPlan === plan.id
                    ? "Redirecting..."
                    : hasSelectedPlan
                      ? portalLoading
                        ? "Opening portal..."
                        : restaurant?.subscription?.plan === plan.id
                          ? "Current plan"
                          : hasBillingPortalAccess
                            ? "Manage in portal"
                            : "Managed by support"
                      : plan.id === "starter" && starterNeedsTrim
                        ? "Needs 30 items or fewer"
                      : `Choose ${plan.name}`}
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
                {hasSelectedPlan ? restaurant?.subscriptionStatus ?? "trial" : "draft"}
              </div>
            </div>
            <div className="rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE] p-4">
              <div className="mb-1 text-xs uppercase tracking-[0.2em] text-stone">Plan</div>
              <div className="font-medium text-ink">
                {hasSelectedPlan
                  ? restaurant?.subscription?.plan ?? entitlements.plan ?? "n/a"
                  : "No plan selected"}
              </div>
            </div>
            <div className="rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE] p-4">
              <div className="mb-1 text-xs uppercase tracking-[0.2em] text-stone">Trial ends</div>
              <div className="font-medium text-ink">
                {restaurant?.trialEndsAt
                  ? new Date(restaurant.trialEndsAt).toLocaleDateString()
                  : hasSelectedPlan
                    ? "Completed"
                    : "Starts after checkout"}
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => void openPortal()}
            disabled={portalLoading || !hasBillingPortalAccess}
            className="transition-all duration-200 hover:-translate-y-0.5"
          >
            <Shield className="h-4 w-4" />
            {portalLoading ? "Opening..." : "Open billing portal"}
          </Button>
          <div className="flex flex-wrap gap-2">
            {entitlements.priorityImageGeneration ? (
              <div className="rounded-full bg-[#D9F4E5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#206B48]">
                Priority image queue
              </div>
            ) : null}
            {entitlements.widgetEnabled ? (
              <div className="rounded-full bg-[#D9F4E5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#206B48]">
                Widget unlocked
              </div>
            ) : null}
            {entitlements.customDomainEnabled ? (
              <div className="rounded-full bg-[#D9F4E5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#206B48]">
                Custom domain unlocked
              </div>
            ) : null}
            <div className="rounded-full bg-[#EFE7DB] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B5A4C]">
              {entitlements.analyticsTier === "advanced" ? "Advanced analytics" : "Basic analytics"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <Globe2 className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <CardTitle>Custom domain</CardTitle>
              <p className="mt-1 text-sm text-stone">
                Point a subdomain like <span className="font-medium text-ink">menu.yourrestaurant.com</span> to mydscvr and keep <span className="font-medium text-ink">mydscvr.ai/{restaurant?.slug ?? "your-slug"}</span> as the fallback.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canManageCustomDomain ? (
            <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-5 text-sm text-stone">
              {hasSelectedPlan
                ? "Custom domains are available on Pro."
                : "Choose a plan first, then connect a custom domain on Pro."}
            </div>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-ink" htmlFor="custom-domain">
                    Subdomain
                  </label>
                  <Input
                    id="custom-domain"
                    placeholder="menu.yourrestaurant.com"
                    value={domainInput}
                    onChange={(event) => setDomainInput(event.target.value)}
                  />
                  <p className="text-sm text-stone">
                    V1 supports subdomains only. Apex domains like <span className="font-medium text-ink">yourrestaurant.com</span> can come later.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => void saveCustomDomain()}
                      disabled={!domainInput.trim() || domainLoading !== null}
                    >
                      {domainLoading === "save" ? "Saving..." : customDomain ? "Update domain" : "Save domain"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => void verifyCustomDomain()}
                      disabled={!customDomain || domainLoading !== null}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {domainLoading === "verify" ? "Verifying..." : "Verify DNS"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => void deleteCustomDomain()}
                      disabled={!customDomain || domainLoading !== null}
                    >
                      <Trash2 className="h-4 w-4" />
                      {domainLoading === "delete" ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-5">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone">
                    DNS record
                  </div>
                  <div className="space-y-3 text-sm text-ink">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-stone">Type</div>
                      <div className="font-medium">CNAME</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-stone">Name</div>
                      <div className="font-medium">{customDomain?.hostname || "menu.yourrestaurant.com"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-stone">Target</div>
                      <div className="font-medium">{verificationTarget}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
                  <div className="mb-1 text-xs uppercase tracking-[0.2em] text-stone">Status</div>
                  <div className="font-medium text-ink">{customDomain?.status ?? "not connected"}</div>
                </div>
                <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
                  <div className="mb-1 text-xs uppercase tracking-[0.2em] text-stone">Active public URL</div>
                  <div className="break-all font-medium text-ink">{publicUrl ?? "Not available yet"}</div>
                </div>
                <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
                  <div className="mb-1 text-xs uppercase tracking-[0.2em] text-stone">Fallback URL</div>
                  <div className="break-all font-medium text-ink">
                    {restaurant ? getRestaurantFallbackUrl(restaurant.slug) : "Not available yet"}
                  </div>
                </div>
              </div>

              {customDomain?.status !== "active" ? (
                <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-4 text-sm text-stone">
                  The custom domain only goes live after verification. Until then, the hosted mydscvr URL remains the reliable fallback.
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
