import { auditSections } from "@/lib/menu-audit";
import { getRestaurantTheme } from "@/lib/restaurant-theme";
import { getRestaurantPublicUrl } from "@/lib/share";
import type { Restaurant } from "@/types";

export interface SetupStep {
  id: "menu" | "theme" | "publish";
  label: string;
  description: string;
  href: string;
  cta: string;
  completed: boolean;
  summary: string;
}

export function getRestaurantSetupState(restaurant: Restaurant | null) {
  const sections = restaurant?.menuSections ?? [];
  const audit = auditSections(sections);
  const hasMenu = audit.totalItems > 0;
  const hasTheme = Boolean(restaurant?.themeKey);
  const isPublished = Boolean(restaurant?.isPublished);
  const onboardingComplete = Boolean(restaurant && hasMenu && hasTheme);
  const themeName = hasTheme ? getRestaurantTheme(restaurant?.themeKey).name : null;
  const publicUrl = restaurant ? getRestaurantPublicUrl(restaurant) : null;

  const steps: SetupStep[] = [
    {
      id: "menu",
      label: "Import the menu",
      description: "Upload a PDF or image so the AI can structure sections, dishes, and prices.",
      href: "/dashboard/onboarding",
      cta: hasMenu ? "Update menu" : "Import menu",
      completed: hasMenu,
      summary: hasMenu
        ? `${audit.totalItems} dishes across ${audit.totalSections} sections are ready.`
        : "No menu has been imported yet.",
    },
    {
      id: "theme",
      label: "Choose the page theme",
      description: "Pick the visual direction for the hosted page and preview the draft.",
      href: "/dashboard/onboarding",
      cta: hasTheme ? "Adjust theme" : "Choose theme",
      completed: hasTheme,
      summary: hasTheme
        ? `${themeName} is applied to the hosted page.`
        : "Theme choice is still missing.",
    },
    {
      id: "publish",
      label: "Publish and share",
      description: "Go live only after the page already feels right.",
      href: "/dashboard/billing",
      cta: isPublished ? "Manage billing" : "Go live",
      completed: isPublished,
      summary: isPublished
        ? `Live at ${publicUrl}.`
        : "Publishing is intentionally left out of onboarding to reduce drop-off.",
    },
  ];

  return {
    audit,
    steps,
    onboardingComplete,
    completionCount: steps.filter((step) => step.completed).length,
    nextStep: steps.find((step) => !step.completed) ?? null,
    nextOnboardingStep: steps.find((step) => !step.completed && step.id !== "publish") ?? null,
  };
}
