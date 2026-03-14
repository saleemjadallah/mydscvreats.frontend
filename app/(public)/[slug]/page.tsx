
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RestaurantPageView } from "@/components/public/restaurant-page-view";
import { apiClient } from "@/lib/api-client";

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

  const itemCount = (restaurant.menuSections ?? []).reduce(
    (sum, s) => sum + s.items.length,
    0
  );
  const description =
    restaurant.description ??
    `Browse the full menu for ${restaurant.name}${cuisine}${restaurant.location ? ` in ${restaurant.location}` : ""}. ${itemCount} dishes with photos, prices & dietary info.`;
  const coverImageUrl = getSafeAssetUrl(restaurant.coverImageUrl);

  return {
    title,
    description,
    alternates: {
      canonical: `https://mydscvr.ai/${restaurant.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
    openGraph: {
      title,
      description,
      url: `https://mydscvr.ai/${restaurant.slug}`,
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

export const revalidate = 60;

export default async function RestaurantPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const restaurant = await apiClient.getRestaurantBySlug(slug).catch(() => null);

  if (!restaurant) {
    notFound();
  }

  if (embed === "1") {
    redirect(`/embed/${restaurant.slug}`);
  }

  if (restaurant.slug !== slug) {
    redirect(`/${restaurant.slug}`);
  }

  return <RestaurantPageView restaurant={restaurant} trackPageView />;
}
