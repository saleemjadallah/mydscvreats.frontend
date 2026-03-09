"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRestaurant } from "@/hooks/use-restaurant";

const stepDefinitions = [
  {
    id: "profile",
    label: "Profile",
    href: "/dashboard/appearance",
    description: "Add cover art, cuisine, contact details, and the page voice.",
  },
  {
    id: "menu",
    label: "Upload menu",
    href: "/dashboard/ai-menu",
    description: "Import from a PDF or image, then review the extracted menu structure.",
  },
  {
    id: "review",
    label: "Review",
    href: "/dashboard/menu",
    description: "Clean up sections, prices, availability, and imagery status.",
  },
  {
    id: "publish",
    label: "Publish",
    href: "/dashboard/billing",
    description: "Choose a plan and make your hosted menu page live.",
  },
];

export function OnboardingWizard() {
  const { restaurant } = useRestaurant();

  const completedSteps = {
    profile: Boolean(restaurant?.description && restaurant?.cuisineType),
    menu: Boolean(restaurant?.menuSections?.length),
    review: Boolean(
      restaurant?.menuSections?.some((section) => section.items.length > 0)
    ),
    publish: Boolean(restaurant?.isPublished),
  };

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
        {stepDefinitions.map((step) => {
          const done = completedSteps[step.id as keyof typeof completedSteps];

          return (
            <Link
              key={step.id}
              href={step.href}
              className={cn(
                "flex items-start gap-4 rounded-3xl border border-[#E8DCC9] p-4 transition-colors hover:bg-[#FFF8EE]",
                done && "border-[#CCEBD9] bg-[#F7FEFA]"
              )}
            >
              {done ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#2E8B57]" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 text-stone" />
              )}
              <div>
                <div className="font-medium text-ink">{step.label}</div>
                <div className="text-sm text-stone">{step.description}</div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
