import { X, Check } from "lucide-react";

const painPoints = [
  "Blurry PDF menus no one can read on mobile",
  "Screenshotting Instagram highlights as a menu",
  "Outdated designer menu that costs AED 500 to update",
  "No web presence beyond a Google Maps pin",
  "Calling \"the tech guy\" for every small change",
];

const solutions = [
  "Living page updated in seconds from your phone",
  "AI photos for every dish — no photoshoot needed",
  "One link for WhatsApp, Instagram, Google, and print",
  "SEO-optimized so customers find you on Google",
  "Runs entirely from your phone — no tech guy required",
];

export function PainSolution() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
          There&apos;s a better way
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pain column */}
        <div className="rounded-[28px] border border-coral/20 bg-coral/[0.04] p-8">
          <h3 className="mb-6 text-lg font-semibold text-coral">
            The old way
          </h3>
          <ul className="space-y-4">
            {painPoints.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-ink/70">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-coral/70" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Solution column */}
        <div className="rounded-[28px] border border-saffron/20 bg-saffron/[0.04] p-8">
          <h3 className="mb-6 text-lg font-semibold text-saffron">
            The mydscvr way
          </h3>
          <ul className="space-y-4">
            {solutions.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-ink">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
