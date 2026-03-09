import { Shield, Cloud, CreditCard } from "lucide-react";

const trustSignals = [
  { icon: Shield, label: "Powered by Anthropic Claude AI" },
  { icon: Cloud, label: "Hosted on Cloudflare" },
  { icon: CreditCard, label: "Payments via Stripe" },
];

export function SocialProof() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      {/* Trust signals */}
      <div className="flex flex-wrap items-center justify-center gap-8">
        {trustSignals.map((signal) => (
          <div
            key={signal.label}
            className="flex items-center gap-2.5 text-sm text-stone"
          >
            <signal.icon className="h-4 w-4 text-stone/60" />
            <span>{signal.label}</span>
          </div>
        ))}
      </div>

      {/* Early adopter card */}
      <div className="mx-auto mt-12 max-w-lg rounded-[28px] border border-saffron/20 bg-saffron/[0.04] p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saffron">
          Early access
        </p>
        <h3 className="mt-3 text-xl font-semibold text-ink">
          Be one of the first 50 restaurants.
        </h3>
        <p className="mt-2 text-sm text-stone">
          Early adopters get priority support and a direct line to the founding
          team.
        </p>
      </div>
    </section>
  );
}
