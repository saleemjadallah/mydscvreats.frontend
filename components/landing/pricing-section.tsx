import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  "Short share links",
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

export function PricingSection() {
  return (
    <section id="pricing" className="bg-ink py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-saffron">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Less than your monthly cleaning bill.
          </h2>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {planCards.map(({ plan, features, highlighted }) => (
            <div
              key={plan.id}
              className={`rounded-[28px] border p-8 ${
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
                  asChild
                  variant={highlighted ? "default" : "secondary"}
                  className={`w-full ${
                    highlighted
                      ? "bg-saffron text-ink hover:bg-saffron/90"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  <Link href="/dashboard">
                    Start free trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-white/70">
          14-day free trial on all plans. No credit card required.
        </p>
      </div>
    </section>
  );
}
