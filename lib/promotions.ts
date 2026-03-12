import type { Promotion, PromotionMenuItemSummary } from "@/types";

function toAmount(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(numeric) ? numeric : null;
}

export function getPromotionStatus(
  promotion: Pick<Promotion, "isActive" | "startsAt" | "endsAt">
) {
  if (!promotion.isActive) {
    return "inactive";
  }

  const now = Date.now();
  const startsAt = promotion.startsAt ? new Date(promotion.startsAt).getTime() : null;
  const endsAt = promotion.endsAt ? new Date(promotion.endsAt).getTime() : null;

  if (startsAt !== null && startsAt > now) {
    return "scheduled";
  }

  if (endsAt !== null && endsAt < now) {
    return "expired";
  }

  return "live";
}

export function isPromotionLive(promotion: Promotion) {
  return getPromotionStatus(promotion) === "live" && promotion.items.length > 0;
}

export function getPromotionPrimaryItem(promotion: Promotion): PromotionMenuItemSummary | null {
  return promotion.items[0]?.menuItem ?? null;
}

export function getPromotionBadge(promotion: Promotion) {
  if (promotion.badgeLabel) {
    return promotion.badgeLabel;
  }

  if (promotion.type === "discounted_item") {
    const baseItem = getPromotionPrimaryItem(promotion);
    const basePrice = toAmount(baseItem?.price);
    const promoPrice = toAmount(promotion.promoPrice);

    if (basePrice && promoPrice && promoPrice < basePrice) {
      const percent = Math.round(((basePrice - promoPrice) / basePrice) * 100);
      return `${percent}% off`;
    }

    return "Deal";
  }

  if (promotion.type === "combo") {
    return "Combo";
  }

  return "Special";
}

export function getPromotionSavings(promotion: Promotion) {
  const promoPrice = toAmount(promotion.promoPrice);
  if (promoPrice === null) {
    return null;
  }

  const totalBase = promotion.items.reduce((sum, item) => {
    const price = toAmount(item.menuItem.price);
    return sum + (price ?? 0);
  }, 0);

  if (totalBase <= 0 || promoPrice >= totalBase) {
    return null;
  }

  return {
    amount: totalBase - promoPrice,
    percent: Math.round(((totalBase - promoPrice) / totalBase) * 100),
    originalPrice: totalBase,
    promoPrice,
  };
}

export function getDiscountedItemPromotionMap(promotions: Promotion[]) {
  const map = new Map<string, Promotion>();

  promotions
    .filter((promotion) => promotion.type === "discounted_item")
    .forEach((promotion) => {
      const itemId = promotion.items[0]?.menuItemId;
      if (itemId && !map.has(itemId)) {
        map.set(itemId, promotion);
      }
    });

  return map;
}

export function getPromotionsByItemId(promotions: Promotion[]) {
  const map = new Map<string, Promotion[]>();

  promotions.forEach((promotion) => {
    promotion.items.forEach((item) => {
      const existing = map.get(item.menuItemId) ?? [];
      existing.push(promotion);
      map.set(item.menuItemId, existing);
    });
  });

  return map;
}
