import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-8">
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Your menu, stunning and online, in under 10&nbsp;minutes.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink/70">
            Hand us your menu in any format — a PDF, a photo, even a napkin
            sketch. Our AI extracts every dish, generates beautiful imagery, and
            publishes a hosted page at{" "}
            <span className="font-medium text-ink">mydscvr.ai/your-name</span>.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/preview">Preview your menu</Link>
            </Button>
          </div>

          <p className="text-sm text-ink/60">
            14-day free trial. No credit card required.
          </p>
        </div>

        {/* Stylized mockup card */}
        <div className="hidden lg:block">
          <div className="relative mx-auto w-full max-w-sm">
            {/* Phone frame */}
            <div className="rounded-[32px] border border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] p-3 shadow-card backdrop-blur">
              {/* Browser bar */}
              <div className="mb-3 flex items-center gap-2 rounded-full bg-oat/60 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-stone/30" />
                <span className="text-xs text-ink/60">mydscvr.ai/saffron-kitchen</span>
              </div>
              {/* Cover image placeholder */}
              <div className="h-32 rounded-[20px] bg-gradient-to-br from-saffron/30 to-coral/30" />
              {/* Restaurant info */}
              <div className="mt-4 px-2">
                <div className="h-4 w-40 rounded-full bg-ink/10" />
                <div className="mt-2 h-3 w-28 rounded-full bg-stone/10" />
              </div>
              {/* Category pills */}
              <div className="mt-4 flex gap-2 px-2">
                <div className="h-7 w-20 rounded-full bg-saffron/15" />
                <div className="h-7 w-16 rounded-full bg-oat" />
                <div className="h-7 w-24 rounded-full bg-oat" />
              </div>
              {/* Menu items */}
              <div className="mt-4 space-y-3 px-2 pb-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-[#E7DAC5]/50 p-3">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-saffron/20 to-coral/20" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-24 rounded-full bg-ink/10" />
                      <div className="h-2 w-16 rounded-full bg-stone/10" />
                    </div>
                    <div className="h-3 w-12 rounded-full bg-saffron/20" />
                  </div>
                ))}
              </div>
            </div>
            {/* Glow behind card */}
            <div className="absolute -inset-4 -z-10 rounded-[40px] bg-gradient-to-br from-saffron/15 to-coral/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
