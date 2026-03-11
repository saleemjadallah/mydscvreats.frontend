import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { RestaurantPageView } from "@/components/public/restaurant-page-view";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { getCustomDomainUrl, getRequestHostname, isAppHostname } from "@/lib/domains";
import { buildRestaurantMetadata } from "@/lib/restaurant-metadata";

import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PainSolution } from "@/components/landing/pain-solution";
import { BenefitsFlood } from "@/components/landing/benefits-flood";
import { OneLinkSection } from "@/components/landing/one-link-section";
import { SocialProof } from "@/components/landing/social-proof";
import { PricingSection } from "@/components/landing/pricing-section";
import { RestaurantShowcase } from "@/components/landing/restaurant-showcase";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

const landingMetadata: Metadata = {
  title: "mydscvr Eats - Beautiful Menu Pages for Dubai Restaurants",
  description:
    "Create stunning hosted menu pages for your Dubai restaurant. Dish photos, prices, descriptions — all in one beautiful link.",
  alternates: {
    canonical: "https://mydscvr.ai",
  },
};

async function resolveCustomDomainRequest() {
  const headerStore = await headers();
  const hostname = getRequestHostname(
    headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  );

  if (!hostname || isAppHostname(hostname)) {
    return null;
  }

  const restaurant = await apiClient.getRestaurantByHostname(hostname).catch(() => null);
  return {
    hostname,
    restaurant,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const customDomainRequest = await resolveCustomDomainRequest();

  if (customDomainRequest?.restaurant) {
    return buildRestaurantMetadata(
      customDomainRequest.restaurant,
      getCustomDomainUrl(customDomainRequest.hostname)
    );
  }

  return landingMetadata;
}

export default async function HomePage() {
  const customDomainRequest = await resolveCustomDomainRequest();

  if (customDomainRequest) {
    if (!customDomainRequest.restaurant) {
      notFound();
    }

    return (
      <RestaurantPageView
        restaurant={customDomainRequest.restaurant}
        trackPageView
        canonicalUrl={getCustomDomainUrl(customDomainRequest.hostname)}
        showExploreBreadcrumb={false}
      />
    );
  }

  const restaurants = await apiClient.listRestaurants().catch(() => []);
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="grain">
      {/* Sticky header */}
      <header className="sticky top-4 z-50 mx-4 md:mx-8">
        <div className="mx-auto max-w-7xl">
          <div className="glass-panel flex items-center justify-between rounded-[36px] border border-[#E7DAC5] px-6 py-5">
            <div className="flex items-center gap-10">
              <Link href="/">
                <Image src="/logo.png" alt="MyDscvr Eats" width={140} height={56} className="h-14 w-auto" />
              </Link>
              <nav className="hidden items-center gap-6 text-base font-medium text-ink/70 md:flex">
                <a href="#how-it-works" className="transition-colors hover:text-ink">
                  How it works
                </a>
                <a href="#pricing" className="transition-colors hover:text-ink">
                  Pricing
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/explore"
                className="hidden text-base font-medium text-ink/70 transition-colors hover:text-ink sm:block"
              >
                Explore
              </Link>
              {clerkEnabled ? (
                <>
                  <SignedOut>
                    <SignUpButton
                      mode="modal"
                      forceRedirectUrl="/dashboard/onboarding"
                      fallbackRedirectUrl="/dashboard/onboarding"
                    >
                      <Button variant="secondary">Sign up</Button>
                    </SignUpButton>
                    <SignInButton
                      mode="modal"
                      forceRedirectUrl="/dashboard"
                      fallbackRedirectUrl="/dashboard"
                    >
                      <Button>Sign in</Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Button asChild>
                      <Link href="/dashboard">
                        Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </SignedIn>
                </>
              ) : (
                <Button asChild>
                  <Link href="/dashboard">
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <HeroSection />
      <HowItWorks />
      <PainSolution />
      <BenefitsFlood />
      <OneLinkSection />
      <SocialProof />
      <PricingSection />
      <RestaurantShowcase restaurants={restaurants} />
      <FinalCta />
      <Footer />
    </main>
  );
}
