import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr,1.2fr]">
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

        {/* Browser mockup with real screenshot */}
        <div className="hidden lg:block">
          <div className="relative mx-auto w-full max-w-xl">
            {/* Browser window frame */}
            <div className="overflow-hidden rounded-2xl border border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] shadow-card backdrop-blur">
              {/* Title bar with traffic lights */}
              <div className="flex items-center gap-2 border-b border-[#E7DAC5]/60 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FDBC40]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </div>
                {/* URL bar */}
                <div className="ml-2 flex flex-1 items-center gap-2 rounded-md bg-oat/60 px-3 py-1">
                  <svg className="h-3 w-3 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.1.9-2 2-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2zm-4 0c0-1.1-.9-2-2-2H4a2 2 0 00-2 2v0a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
                  <span className="text-xs text-ink/50">mydscvr.ai/zafran-house</span>
                </div>
              </div>
              {/* Screenshot */}
              <Image
                src="/demo-zafran-house.png"
                alt="Zafran House menu on mydscvr Eats"
                width={2560}
                height={1800}
                className="h-auto w-full"
                priority
              />
            </div>
            {/* Glow behind card */}
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-saffron/15 to-coral/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
