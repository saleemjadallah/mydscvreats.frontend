import type { Restaurant, SubscriptionPlan } from "@/types";

export type MenuAnalysisLevel = "basic" | "full";

export interface PlanEntitlements {
  plan: SubscriptionPlan | null;
  hasSelectedPlan: boolean;
  menuItemLimit: number | null;
  sourcePhotoImportEnabled: boolean;
  sourcePhotoReviewEnabled: boolean;
  widgetEnabled: boolean;
  menuAssistantEnabled: boolean;
  customDomainEnabled: boolean;
  shortLinksEnabled: boolean;
  hideBranding: boolean;
  analyticsTier: "basic" | "advanced";
  imageGenerationPriority: number;
  priorityImageGeneration: boolean;
  imageEnhancementLimit: number | null;
  batchImageEnhancementEnabled: boolean;
  advancedPhotoStylingEnabled: boolean;
  aiDescriptionLimit: number | null;
  bulkDescriptionEnabled: boolean;
  aiTagAnalysisLimit: number | null;
  menuAnalysisLevel: MenuAnalysisLevel;
  analysisLimit: number | null;
}

const PLAN_ENTITLEMENTS: Record<
  SubscriptionPlan,
  Omit<PlanEntitlements, "plan" | "hasSelectedPlan">
> = {
  starter: {
    menuItemLimit: 30,
    sourcePhotoImportEnabled: true,
    sourcePhotoReviewEnabled: true,
    widgetEnabled: false,
    menuAssistantEnabled: false,
    customDomainEnabled: false,
    shortLinksEnabled: false,
    hideBranding: false,
    analyticsTier: "basic",
    imageGenerationPriority: 0,
    priorityImageGeneration: false,
    imageEnhancementLimit: 5,
    batchImageEnhancementEnabled: false,
    advancedPhotoStylingEnabled: false,
    aiDescriptionLimit: 5,
    bulkDescriptionEnabled: false,
    aiTagAnalysisLimit: 1,
    menuAnalysisLevel: "basic",
    analysisLimit: 1,
  },
  pro: {
    menuItemLimit: null,
    sourcePhotoImportEnabled: true,
    sourcePhotoReviewEnabled: true,
    widgetEnabled: true,
    menuAssistantEnabled: true,
    customDomainEnabled: false,
    shortLinksEnabled: true,
    hideBranding: true,
    analyticsTier: "advanced",
    imageGenerationPriority: 10,
    priorityImageGeneration: true,
    imageEnhancementLimit: null,
    batchImageEnhancementEnabled: true,
    advancedPhotoStylingEnabled: true,
    aiDescriptionLimit: null,
    bulkDescriptionEnabled: true,
    aiTagAnalysisLimit: null,
    menuAnalysisLevel: "full",
    analysisLimit: null,
  },
};

const DRAFT_ENTITLEMENTS: PlanEntitlements = {
  plan: null,
  hasSelectedPlan: false,
  menuItemLimit: null,
  sourcePhotoImportEnabled: true,
  sourcePhotoReviewEnabled: true,
  widgetEnabled: false,
  menuAssistantEnabled: false,
  customDomainEnabled: false,
  shortLinksEnabled: false,
  hideBranding: false,
  analyticsTier: "basic",
  imageGenerationPriority: 0,
  priorityImageGeneration: false,
  imageEnhancementLimit: 3,
  batchImageEnhancementEnabled: false,
  advancedPhotoStylingEnabled: false,
  aiDescriptionLimit: 3,
  bulkDescriptionEnabled: false,
  aiTagAnalysisLimit: 1,
  menuAnalysisLevel: "basic",
  analysisLimit: 1,
};

type SectionLike = {
  items: unknown[];
};

export function getPlanEntitlements(plan: SubscriptionPlan): PlanEntitlements {
  return {
    plan,
    hasSelectedPlan: true,
    ...PLAN_ENTITLEMENTS[plan],
  };
}

export function getRestaurantPlan(
  restaurant: Pick<Restaurant, "entitlements" | "subscription"> | null | undefined
) {
  const subscriptionStatus = restaurant?.subscription?.status ?? null;

  return (
    restaurant?.entitlements?.plan ??
    (restaurant?.subscription?.plan && subscriptionStatus !== "cancelled"
      ? restaurant.subscription.plan
      : null)
  );
}

export function getRestaurantEntitlements(
  restaurant: Pick<Restaurant, "entitlements" | "subscription"> | null | undefined
) {
  const plan = getRestaurantPlan(restaurant);
  return restaurant?.entitlements ?? (plan ? getPlanEntitlements(plan) : DRAFT_ENTITLEMENTS);
}

export function countMenuItems(sections: SectionLike[] | null | undefined) {
  return (sections ?? []).reduce((total, section) => total + section.items.length, 0);
}

export function getMenuItemUsage(
  restaurant: Pick<Restaurant, "entitlements" | "subscription"> | null | undefined,
  sections: SectionLike[] | null | undefined
) {
  const entitlements = getRestaurantEntitlements(restaurant);
  const totalItems = countMenuItems(sections);
  const remaining =
    entitlements.menuItemLimit === null
      ? null
      : Math.max(entitlements.menuItemLimit - totalItems, 0);

  return {
    totalItems,
    limit: entitlements.menuItemLimit,
    remaining,
    atLimit: entitlements.menuItemLimit !== null && totalItems >= entitlements.menuItemLimit,
    overLimit: entitlements.menuItemLimit !== null && totalItems > entitlements.menuItemLimit,
  };
}

export function getMenuItemLimitMessage(limit: number) {
  return `Starter includes up to ${limit} menu items. Upgrade to Pro for unlimited dishes.`;
}

export function getImageEnhancementLimitLabel(limit: number | null) {
  if (limit === null) {
    return "Unlimited AI photo enhancements";
  }

  return `${limit} AI photo enhancement${limit === 1 ? "" : "s"} / month`;
}
