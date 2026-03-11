import type { Metadata } from "next";
import type { Restaurant } from "@/types";

function getSafeAssetUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    return encodeURI(url);
  } catch {
    return null;
  }
}

export function buildRestaurantMetadata(restaurant: Restaurant, canonicalUrl: string): Metadata {
  const cuisine = restaurant.cuisineType ? ` - ${restaurant.cuisineType}` : "";
  const title = `${restaurant.name} Menu${cuisine} | mydscvr Eats`;
  const description =
    restaurant.description ??
    `Browse the full menu for ${restaurant.name}${restaurant.location ? ` in ${restaurant.location}` : ""}. Dish photos, prices, and descriptions on mydscvr Eats.`;
  const coverImageUrl = getSafeAssetUrl(restaurant.coverImageUrl);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "mydscvr Eats",
      locale: "en_AE",
      images: coverImageUrl
        ? [
            {
              url: coverImageUrl,
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
      images: coverImageUrl ? [coverImageUrl] : [],
    },
  };
}
