import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

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

export default async function HomePage() {
  const restaurants = await apiClient.listRestaurants().catch(() => []);
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <main className="grain">
      {/* Sticky header */}
      <header className="sticky top-4 z-50 mx-4 md:mx-8">
        <div className="mx-auto max-w-7xl">
          <div className="glass-panel flex items-center justify-between rounded-[36px] border border-[#E7DAC5] px-6 py-4">
            <div className="flex items-center gap-8">
              <div className="text-xs uppercase tracking-[0.32em] text-ink/60">
                mydscvr Eats
              </div>
              <nav className="hidden items-center gap-5 text-sm text-ink/60 md:flex">
                <a href="#how-it-works" className="hover:text-ink">
                  How it works
                </a>
                <a href="#pricing" className="hover:text-ink">
                  Pricing
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/explore"
                className="hidden text-sm font-medium text-ink/60 sm:block"
              >
                Explore
              </Link>
              {clerkEnabled ? (
                <>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button size="sm">Sign in</Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Button asChild size="sm">
                      <Link href="/dashboard">
                        Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </SignedIn>
                </>
              ) : (
                <Button asChild size="sm">
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
