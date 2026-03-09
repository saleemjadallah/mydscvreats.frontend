import Link from "next/link";
import { ArrowRight, ChefHat, Globe, Sparkles, WandSparkles } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { RestaurantCard } from "@/components/public/restaurant-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { plans } from "@/lib/plans";

export default async function HomePage() {
  const restaurants = await apiClient.listRestaurants().catch(() => []);
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="grain px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="glass-panel flex flex-col gap-5 rounded-[36px] border border-[#E7DAC5] px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.32em] text-stone">mydscvr Eats</div>
            <div className="mt-2 text-2xl font-semibold">Living menu pages for Dubai restaurants</div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="text-sm font-medium text-stone">
              Explore restaurants
            </Link>
            {clerkEnabled ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button>Owner sign in</Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Button asChild>
                    <Link href="/dashboard">
                      Open dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </SignedIn>
              </>
            ) : (
              <Button asChild>
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <Card className="overflow-hidden">
            <CardContent className="grid gap-10 p-8 lg:grid-cols-[1.15fr,0.85fr]">
              <div className="space-y-6">
                <Badge>AI-powered SaaS</Badge>
                <div className="space-y-4">
                  <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight text-ink">
                    Hosted menu pages that never go stale.
                  </h1>
                  <p className="max-w-xl text-lg text-stone">
                    Import a menu PDF, clean up the extraction, generate dish imagery, and publish at
                    <span className="font-medium text-ink"> mydscvr.ai/[your-slug]</span>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Start onboarding
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/explore">See live restaurant pages</Link>
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: ChefHat,
                      title: "Menu import",
                      description: "Claude extracts sections, items, and prices from menu uploads.",
                    },
                    {
                      icon: WandSparkles,
                      title: "Dish imagery",
                      description: "Generate appetizing visuals for dishes without hiring a shoot.",
                    },
                    {
                      icon: Globe,
                      title: "Hosted pages",
                      description: "Launch a clean, mobile-first menu page on the mydscvr.ai root domain.",
                    },
                  ].map((feature) => (
                    <div key={feature.title} className="rounded-[28px] border border-[#EEE2D2] bg-[#FFFCF7] p-4">
                      <feature.icon className="mb-4 h-5 w-5 text-coral" />
                      <div className="font-medium text-ink">{feature.title}</div>
                      <p className="mt-2 text-sm text-stone">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] bg-[#201A17] p-6 text-white">
                <div className="mb-3 text-sm uppercase tracking-[0.2em] text-[#F3D88C]">Pricing</div>
                <div className="space-y-4">
                  {Object.values(plans).map((plan) => (
                    <div key={plan.id} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="text-lg font-semibold">{plan.name}</div>
                        <div className="text-2xl font-semibold">AED {plan.priceAed}</div>
                      </div>
                      <p className="mt-2 text-sm text-white/70">{plan.description}</p>
                      <div className="mt-3 text-sm text-[#F3D88C]">
                        {plan.itemLimit ? `${plan.itemLimit} menu items` : "Unlimited menu items"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6 p-8">
              <Badge variant="accent">What owners get</Badge>
              <div className="space-y-5">
                {[
                  "14-day trial with no card required",
                  "Public page SEO metadata and OG image support",
                  "Sticky category navigation and mobile-first layout",
                  "Embeddable widget for your own website",
                  "Page view analytics and subscription gating",
                ].map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-stone">
                    <Sparkles className="mt-0.5 h-4 w-4 text-saffron" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-stone">Explore live pages</div>
              <h2 className="mt-2 text-3xl font-semibold">Published restaurants</h2>
            </div>
            <Button asChild variant="secondary">
              <Link href="/explore">View all</Link>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.slice(0, 6).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
            {!restaurants.length ? (
              <Card className="md:col-span-2 xl:col-span-3">
                <CardContent className="p-8 text-center text-stone">
                  No restaurants are published yet. The dashboard is ready to onboard the first one.
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
