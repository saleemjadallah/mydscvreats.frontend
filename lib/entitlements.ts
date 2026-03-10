import type { Restaurant, SubscriptionPlan } from "@/types";

export interface PlanEntitlements {
  plan: SubscriptionPlan;
  menuItemLimit: number | null;
  widgetEnabled: boolean;
  customDomainEnabled: boolean;
  analyticsTier: "basic" | "advanced";
  imageGenerationPriority: number;
  priorityImageGeneration: boolean;
}

const PLAN_ENTITLEMENTS: Record<SubscriptionPlan, Omit<PlanEntitlements, "plan">> = {
  starter: {
    menuItemLimit: 30,
    widgetEnabled: false,
    customDomainEnabled: false,
    analyticsTier: "basic",
    imageGenerationPriority: 0,
    priorityImageGeneration: false,
  },
  pro: {
    menuItemLimit: null,
    widgetEnabled: true,
    customDomainEnabled: false,
    analyticsTier: "advanced",
    imageGenerationPriority: 10,
    priorityImageGeneration: true,
  },
};

type SectionLike = {
  items: unknown[];
};

export function getPlanEntitlements(plan: SubscriptionPlan): PlanEntitlements {
  return {
    plan,
    ...PLAN_ENTITLEMENTS[plan],
  };
}

export function getRestaurantPlan(
  restaurant: Pick<Restaurant, "entitlements" | "subscription"> | null | undefined
) {
  return restaurant?.entitlements?.plan ?? restaurant?.subscription?.plan ?? "starter";
}

export function getRestaurantEntitlements(
  restaurant: Pick<Restaurant, "entitlements" | "subscription"> | null | undefined
) {
  return restaurant?.entitlements ?? getPlanEntitlements(getRestaurantPlan(restaurant));
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
