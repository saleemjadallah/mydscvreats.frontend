export type PlanId = "starter" | "pro";

export const plans = {
  starter: {
    id: "starter" as const,
    name: "Starter",
    priceAed: 99,
    itemLimit: 30,
    description: "For independent restaurants launching their first living menu.",
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    priceAed: 199,
    itemLimit: null,
    description: "For restaurants with large menus, richer visuals, and active growth.",
  },
};

export function getPlan(planId: PlanId) {
  return plans[planId];
}
