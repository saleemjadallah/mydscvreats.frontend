import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RestaurantPageView } from "@/components/public/restaurant-page-view";
import { apiClient } from "@/lib/api-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await apiClient.getRestaurantBySlug(slug).catch(() => null);

  if (!restaurant?.entitlements?.widgetEnabled) {
    return {
      title: "Widget not found | mydscvr Eats",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${restaurant.name} Widget | mydscvr Eats`,
    description: `Embeddable menu widget for ${restaurant.name}.`,
    alternates: {
      canonical: `https://mydscvr.ai/${restaurant.slug}`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const revalidate = 60;

export default async function EmbeddedRestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await apiClient.getRestaurantBySlug(slug).catch(() => null);

  if (!restaurant?.entitlements?.widgetEnabled) {
    notFound();
  }

  if (restaurant.slug !== slug) {
    redirect(`/embed/${restaurant.slug}`);
  }

  return <RestaurantPageView restaurant={restaurant} trackPageView isEmbedded />;
}
