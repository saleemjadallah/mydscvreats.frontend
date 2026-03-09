"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRestaurant } from "@/hooks/use-restaurant";
import { getRestaurantSetupState } from "@/lib/restaurant-setup";

export function OnboardingWizard() {
  const { restaurant } = useRestaurant();
  const setup = getRestaurantSetupState(restaurant);
  const completedCount = setup.steps.filter((s) => s.completed).length;
  const progress = (completedCount / setup.steps.length) * 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-[#201A17] via-[#2A211B] to-[#3A2B23] text-white">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-saffron">
          <Sparkles className="h-4 w-4" />
          Onboarding
        </div>
        <CardTitle className="text-white">Get the first version live in {setup.steps.length} steps</CardTitle>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-white/60">
            <span>{completedCount} of {setup.steps.length} complete</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-saffron to-coral transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        {setup.steps.map((step, index) => {
          const isNext = setup.nextStep?.id === step.id;

          return (
            <Link
              key={step.id}
              href={step.href}
              className={cn(
                "group flex items-start gap-4 rounded-[24px] border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                step.completed && "border-[#CCEBD9] bg-[#F7FEFA]",
                isNext && "border-[#E8C66A] bg-[#FFF8EE]",
                !step.completed && !isNext && "border-[#E8DCC9] hover:bg-[#FFF8EE]"
              )}
            >
              <div className="mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-[#2E8B57]" />
                ) : (
                  <div className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                    isNext ? "bg-saffron text-ink" : "bg-[#E7DAC5] text-stone"
                  )}>
                    {index + 1}
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-ink">{step.label}</div>
                <div className="text-sm text-stone">{step.description}</div>
                <div className="mt-1 text-sm font-medium text-ink">{step.summary}</div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
