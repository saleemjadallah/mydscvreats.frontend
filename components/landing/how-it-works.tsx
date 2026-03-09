import { Upload, WandSparkles, Globe } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "1",
    title: "Upload your menu",
    description: "Snap a photo, drop a PDF, or paste a link. Any format.",
  },
  {
    icon: WandSparkles,
    number: "2",
    title: "AI does the work",
    description:
      "Our AI reads every section, item, and price. Then generates dish photos automatically.",
  },
  {
    icon: Globe,
    number: "3",
    title: "You're live",
    description:
      "Published at mydscvr.ai/your-name. Share anywhere.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-ink py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-saffron">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Three steps. That&apos;s it.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Numbered circle */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <step.icon className="h-7 w-7 text-saffron" />
              </div>
              {/* Step number */}
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-saffron/60">
                Step {step.number}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
