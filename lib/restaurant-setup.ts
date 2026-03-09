import { auditSections } from "@/lib/menu-audit";
import type { Restaurant } from "@/types";

export interface SetupStep {
  id: "profile" | "menu" | "review" | "publish";
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
  const hasProfileBasics = Boolean(
    restaurant?.cuisineType &&
      restaurant.location &&
      (restaurant.description || restaurant.coverImageUrl)
  );
  const hasMenu = audit.totalItems > 0;
  const reviewComplete = hasMenu && audit.blockingIssues.length === 0;
  const isPublished = Boolean(restaurant?.isPublished);

  const steps: SetupStep[] = [
    {
      id: "profile",
      label: "Shape the page",
      description: "Add cuisine, location, cover art, and a tighter restaurant story.",
      href: "/dashboard/appearance",
      cta: hasProfileBasics ? "Refine profile" : "Finish profile",
      completed: hasProfileBasics,
      summary: hasProfileBasics
        ? "Profile basics are in place."
        : "The hosted page still needs its public-facing basics.",
    },
    {
      id: "menu",
      label: "Import the menu",
      description: "Upload a PDF or image so the AI can structure sections, dishes, and prices.",
      href: "/dashboard/ai-menu",
      cta: hasMenu ? "Re-import menu" : "Upload menu",
      completed: hasMenu,
      summary: hasMenu
        ? `${audit.totalItems} dishes across ${audit.totalSections} sections are in the app.`
        : "No menu has been imported yet.",
    },
    {
      id: "review",
      label: "Review and polish",
      description: "Clean up extraction mistakes, confirm prices, and queue missing visuals.",
      href: "/dashboard/menu",
      cta: hasMenu ? "Review menu" : "Menu editor",
      completed: reviewComplete,
      summary: !hasMenu
        ? "The editor becomes useful after the first import."
        : reviewComplete
          ? "Pricing and structure are clean enough to launch."
          : `${audit.blockingIssues.length} cleanup item${audit.blockingIssues.length === 1 ? "" : "s"} still need attention.`,
    },
    {
      id: "publish",
      label: "Publish and share",
      description: "Choose a plan, make the page live, then share the link, QR code, and widget.",
      href: "/dashboard/billing",
      cta: isPublished ? "Manage billing" : "Go live",
      completed: isPublished,
      summary: isPublished
        ? `Live at mydscvr.ai/${restaurant?.slug}.`
        : "The public link is reserved, but it is not live yet.",
    },
  ];

  return {
    audit,
    steps,
    completionCount: steps.filter((step) => step.completed).length,
    nextStep: steps.find((step) => !step.completed) ?? null,
  };
}
