import Image from "next/image";
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

        {/* Phone mockup with real screenshot */}
        <div className="hidden lg:block">
          <div className="relative mx-auto w-full max-w-sm">
            {/* Phone frame */}
            <div className="overflow-hidden rounded-[32px] border border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] p-3 shadow-card backdrop-blur">
              {/* Browser bar */}
              <div className="mb-3 flex items-center gap-2 rounded-full bg-oat/60 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-stone/30" />
                <span className="text-xs text-ink/60">mydscvr.ai/zafran-house</span>
              </div>
              {/* Actual menu screenshot */}
              <div className="overflow-hidden rounded-[20px]">
                <Image
                  src="/demo-zafran-house.png"
                  alt="Zafran House menu on mydscvr Eats"
                  width={390}
                  height={844}
                  className="h-auto w-full"
                  priority
                />
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
