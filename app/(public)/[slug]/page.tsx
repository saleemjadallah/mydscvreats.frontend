import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RestaurantPageView } from "@/components/public/restaurant-page-view";
import { apiClient } from "@/lib/api-client";
import { getAppHostname, getRequestHostname, getRestaurantPublicUrl } from "@/lib/domains";
import { buildRestaurantMetadata } from "@/lib/restaurant-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await apiClient.getRestaurantBySlug(slug).catch(() => null);

  if (!restaurant) {
    return {
      title: "Restaurant not found | mydscvr Eats",
    };
  }

  return buildRestaurantMetadata(restaurant, getRestaurantPublicUrl(restaurant));
}

export const revalidate = 60;

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await apiClient.getRestaurantBySlug(slug).catch(() => null);

  if (!restaurant) {
    notFound();
  }

  const canonicalUrl = getRestaurantPublicUrl(restaurant);
  const canonicalHostname = getRequestHostname(new URL(canonicalUrl).hostname);
  const showExploreBreadcrumb = canonicalHostname === getAppHostname();

  return (
    <RestaurantPageView
      restaurant={restaurant}
      trackPageView
      canonicalUrl={canonicalUrl}
      showExploreBreadcrumb={showExploreBreadcrumb}
    />
  );
}
