"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRestaurant } from "@/hooks/use-restaurant";
import { getRestaurantSetupState } from "@/lib/restaurant-setup";

export function OnboardingWizard() {
  const { restaurant } = useRestaurant();
  const setup = getRestaurantSetupState(restaurant);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-stone">
            <Sparkles className="h-4 w-4" />
            Onboarding
          </div>
          <CardTitle>Get to publish in four steps</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {setup.steps.map((step) => {
          const isNext = setup.nextStep?.id === step.id;

          return (
            <Link
              key={step.id}
              href={step.href}
              className={cn(
                "flex items-start gap-4 rounded-3xl border border-[#E8DCC9] p-4 transition-colors hover:bg-[#FFF8EE]",
                step.completed && "border-[#CCEBD9] bg-[#F7FEFA]",
                isNext && "border-[#E8C66A] bg-[#FFF8EE]"
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#2E8B57]" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 text-stone" />
              )}
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
