import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-gradient-to-r from-coral to-saffron py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
          Your menu deserves better than a blurry&nbsp;PDF.
        </h2>
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="bg-white text-ink hover:bg-white/90"
          >
            <Link href="/dashboard">
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-white/80">No credit card required.</p>
      </div>
    </section>
  );
}
