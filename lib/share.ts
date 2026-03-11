import type { Restaurant } from "@/types";
import { getRestaurantPublicUrl as getResolvedRestaurantPublicUrl } from "@/lib/domains";

export { getAppUrl } from "@/lib/domains";

export function getRestaurantPublicUrl(
  restaurant: Pick<Restaurant, "slug" | "customDomain"> | string,
  windowOrigin?: string
) {
  return getResolvedRestaurantPublicUrl(restaurant, windowOrigin);
}

export function getRestaurantWidgetSnippet(
  restaurant: Pick<Restaurant, "slug" | "customDomain"> | string,
  windowOrigin?: string
) {
  const publicUrl = getRestaurantPublicUrl(restaurant, windowOrigin);

  return `<iframe src="${publicUrl}?embed=1" width="100%" height="760" style="border:0;border-radius:24px;overflow:hidden" loading="lazy"></iframe>`;
}

export function getRestaurantQrCodeUrl(publicUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    publicUrl
  )}`;
}
