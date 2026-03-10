
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RestaurantPageView } from "@/components/public/restaurant-page-view";
import { apiClient } from "@/lib/api-client";

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

  const cuisine = restaurant.cuisineType ? ` - ${restaurant.cuisineType}` : "";
  const title = `${restaurant.name} Menu${cuisine} | mydscvr Eats`;
  const description =
    restaurant.description ??
    `Browse the full menu for ${restaurant.name}${restaurant.location ? ` in ${restaurant.location}` : ""}. Dish photos, prices, and descriptions on mydscvr Eats.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://mydscvr.ai/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://mydscvr.ai/${slug}`,
      type: "restaurant.menu" as "website",
      siteName: "mydscvr Eats",
      locale: "en_AE",
      images: restaurant.coverImageUrl
        ? [
            {
              url: restaurant.coverImageUrl,
              alt: `${restaurant.name} cover photo`,
              width: 1200,
              height: 630,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: restaurant.coverImageUrl ? [restaurant.coverImageUrl] : [],
    },
  };
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

  return <RestaurantPageView restaurant={restaurant} trackPageView />;
}
