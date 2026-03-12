"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, CheckCircle2, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { RestaurantDraftPreview } from "@/components/dashboard/restaurant-draft-preview";
import { ThemePicker } from "@/components/dashboard/theme-picker";
import { AiMenuImportPanel } from "@/components/menu/ai-menu-import-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import { getRestaurantSetupState } from "@/lib/restaurant-setup";
import type { RestaurantThemeKey } from "@/types";

export function OwnerOnboarding() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { restaurant, loading, refresh, setRestaurant } = useRestaurant();
  const [form, setForm] = useState({
    name: "",
    description: "",
    cuisineType: "",
    location: "",
  });
  const [selectedTheme, setSelectedTheme] = useState<RestaurantThemeKey>("saffron");
  const [creating, setCreating] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const setup = useMemo(() => getRestaurantSetupState(restaurant), [restaurant]);

  useEffect(() => {
    if (restaurant?.themeKey) {
      setSelectedTheme(restaurant.themeKey);
    }
  }, [restaurant?.themeKey]);

  useEffect(() => {
    if (!loading && setup.onboardingComplete) {
      router.replace("/dashboard");
    }
  }, [loading, router, setup.onboardingComplete]);

  async function createRestaurant() {
    setCreating(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const created = await apiClient.createRestaurant(token, form);
      setRestaurant(created);
      toast.success("Restaurant created. Next: import the menu.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create restaurant.");
    } finally {
      setCreating(false);
    }
  }

  async function saveTheme() {
    if (!restaurant) {
      return;
    }

    setSavingTheme(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiClient.updateRestaurant(token, restaurant.id, {
        themeKey: selectedTheme,
      });
      await refresh();
      toast.success("Theme saved. Onboarding complete.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save theme.");
    } finally {
      setSavingTheme(false);
    }
  }

  if (loading) {
    return <Card><CardContent className="p-8">Loading onboarding...</CardContent></Card>;
  }

  if (setup.onboardingComplete) {
    return <Card><CardContent className="p-8">Redirecting to dashboard...</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-[#201A17] text-white">
          <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-[#F0D08A]">
            <Sparkles className="h-4 w-4" />
            Owner onboarding
          </div>
          <CardTitle className="text-white">
            Get the first menu page assembled before asking for polish
          </CardTitle>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            This flow is intentionally short: create the restaurant, import the menu, choose the theme, then move into the main dashboard.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                step: "1",
                label: "Create restaurant",
                done: Boolean(restaurant),
              },
              {
                step: "2",
                label: "Import menu",
                done: Boolean(restaurant && setup.audit.totalItems > 0),
              },
              {
                step: "3",
                label: "Choose theme",
                done: Boolean(restaurant?.themeKey),
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`rounded-[24px] border px-4 py-4 ${
                  item.done ? "border-[#CCEBD9] bg-[#F7FEFA]" : "border-[#E7DAC5] bg-[#FFF8EE]"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-[#2E8B57]" />
                  ) : (
                    <Badge variant="default">Step {item.step}</Badge>
                  )}
                </div>
                <div className="font-medium text-ink">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!restaurant ? (
        <Card>
          <CardHeader>
            <CardTitle>Create your restaurant</CardTitle>
            <p className="mt-2 text-sm text-stone">
              Keep this lightweight. You can refine the profile later in the dashboard.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
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
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={() => void createRestaurant()} disabled={creating || !form.name.trim()}>
                {creating ? "Creating..." : "Create restaurant"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {restaurant && setup.audit.totalItems === 0 ? (
        <AiMenuImportPanel
          title="Import the menu"
          description="Upload a menu, review the extraction, and save it. Leave image generation for later so activation stays fast."
          afterSave={async () => {
            toast.success("Menu imported. Last step: choose the page theme.");
          }}
        />
      ) : null}

      {restaurant && setup.audit.totalItems > 0 ? (
        <div className="grid gap-4 xl:grid-cols-[1fr,1.05fr]">
          <Card>
            <CardHeader>
              <CardTitle>Choose the page theme</CardTitle>
              <p className="mt-2 text-sm text-stone">
                Pick the visual direction now. Photos, billing, and final polish can happen after onboarding.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <ThemePicker
                value={selectedTheme}
                onChange={setSelectedTheme}
                isPro={restaurant.entitlements?.plan === "pro"}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] px-5 py-4">
                <div className="text-sm text-stone">
                  You can refine copy, uploads, and publish timing later from the main dashboard.
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="secondary">
                    <Link href="/dashboard/appearance">More appearance options</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/dashboard/preview?theme=${selectedTheme}`}>
                      <Eye className="h-4 w-4" />
                      Preview menu page
                    </Link>
                  </Button>
                  <Button onClick={() => void saveTheme()} disabled={savingTheme}>
                    {savingTheme ? "Saving..." : "Finish onboarding"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Draft preview</CardTitle>
                <p className="mt-2 text-sm text-stone">
                  This is the internal draft preview. Publishing is a separate decision after onboarding.
                </p>
              </CardHeader>
              <CardContent>
                <RestaurantDraftPreview
                  restaurant={restaurant}
                  sections={restaurant.menuSections ?? []}
                  themeKey={selectedTheme}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
