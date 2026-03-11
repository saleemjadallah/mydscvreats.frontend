import type { Restaurant } from "@/types";

export function normalizeHostname(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
}

export function getAppUrl(windowOrigin?: string) {
  return (process.env.NEXT_PUBLIC_APP_URL ?? windowOrigin ?? "https://mydscvr.ai").replace(
    /\/$/,
    ""
  );
}

export function getAppHostname() {
  return normalizeHostname(new URL(getAppUrl()).hostname);
}

export function isAppHostname(hostname: string) {
  const normalized = normalizeHostname(hostname);
  const appHostname = getAppHostname();

  return normalized === appHostname || normalized === `www.${appHostname}`;
}

export function getCustomDomainUrl(hostname: string) {
  return `https://${normalizeHostname(hostname)}`;
}

export function getRestaurantCustomDomain(
  restaurant: Pick<Restaurant, "customDomain" | "entitlements"> | null | undefined
) {
  if (restaurant?.entitlements && !restaurant.entitlements.customDomainEnabled) {
    return null;
  }

  if (restaurant?.customDomain?.status !== "active") {
    return null;
  }

  return restaurant.customDomain;
}

export function getRestaurantFallbackUrl(slug: string, windowOrigin?: string) {
  return `${getAppUrl(windowOrigin)}/${slug}`;
}

export function getRestaurantPublicUrl(
  restaurant: Pick<Restaurant, "slug" | "customDomain" | "entitlements"> | string,
  windowOrigin?: string
) {
  if (typeof restaurant === "string") {
    return getRestaurantFallbackUrl(restaurant, windowOrigin);
  }

  const customDomain = getRestaurantCustomDomain(restaurant);
  if (customDomain) {
    return getCustomDomainUrl(customDomain.hostname);
  }

  return getRestaurantFallbackUrl(restaurant.slug, windowOrigin);
}

export function getRequestHostname(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return normalizeHostname(value);
}
