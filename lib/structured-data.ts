import type { Restaurant } from "@/types";
import { normalizeExternalUrl } from "@/lib/utils";

const DIET_MAP: Record<string, string> = {
  vegetarian: "https://schema.org/VegetarianDiet",
  vegan: "https://schema.org/VeganDiet",
  gluten_free: "https://schema.org/GlutenFreeDiet",
  halal: "https://schema.org/HalalDiet",
  dairy_free: "https://schema.org/DairyFreeDiet",
};

export function buildRestaurantJsonLd(restaurant: Restaurant) {
  const websiteUrl = normalizeExternalUrl(restaurant.website);
  const menuUrl = `https://mydscvr.ai/${restaurant.slug}`;
  const gbpUrl = restaurant.gbpConnection?.gbpUrl ?? null;

  const sameAs: string[] = [];
  if (websiteUrl) sameAs.push(websiteUrl);
  if (gbpUrl) sameAs.push(gbpUrl);

  const menuSections = (restaurant.menuSections ?? []).map((section) => ({
    "@type": "MenuSection",
    "@id": `${menuUrl}#section-${section.id}`,
    name: section.name,
    hasMenuItem: section.items.map((item) => {
      const images: string[] = [];
      if (item.images && item.images.length > 0) {
        for (const img of item.images) {
          if (img.imageUrl) images.push(img.imageUrl);
        }
      } else if (item.imageUrl) {
        images.push(item.imageUrl);
      }

      const diets: string[] = [];
      if (item.dietaryTags) {
        for (const dt of item.dietaryTags) {
          const schemaUrl = DIET_MAP[dt.tag.key];
          if (schemaUrl) diets.push(schemaUrl);
        }
      }

      return {
        "@type": "MenuItem",
        "@id": `${menuUrl}#item-${item.id}`,
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
        ...(images.length === 1 ? { image: images[0] } : {}),
        ...(images.length > 1 ? { image: images } : {}),
        ...(diets.length > 0 ? { suitableForDiet: diets } : {}),
        offers: {
          "@type": "Offer",
          price: item.price,
          priceCurrency: item.currency,
          availability: item.isAvailable
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      };
    }),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${menuUrl}#restaurant`,
    name: restaurant.name,
    ...(restaurant.description ? { description: restaurant.description } : {}),
    url: menuUrl,
    ...(restaurant.coverImageUrl ? { image: restaurant.coverImageUrl } : {}),
    ...(restaurant.logoUrl ? { logo: restaurant.logoUrl } : {}),
    ...(restaurant.phone ? { telephone: restaurant.phone } : {}),
    ...(restaurant.cuisineType
      ? { servesCuisine: restaurant.cuisineType }
      : {}),
    ...(restaurant.location || restaurant.address
      ? {
          address: {
            "@type": "PostalAddress",
            ...(restaurant.address
              ? { streetAddress: restaurant.address }
              : {}),
            ...(restaurant.location
              ? { addressLocality: restaurant.location }
              : {}),
            addressCountry: "AE",
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(gbpUrl ? { hasMap: gbpUrl } : {}),
    hasMenu: {
      "@type": "Menu",
      "@id": `${menuUrl}#menu`,
      ...(menuSections.length > 0
        ? { hasMenuSection: menuSections }
        : {}),
    },
    potentialAction: {
      "@type": "ViewAction",
      target: menuUrl,
      name: "View Menu",
    },
  };
}

export function buildPopularDishesJsonLd(restaurant: Restaurant) {
  const menuUrl = `https://mydscvr.ai/${restaurant.slug}`;
  const sections = restaurant.menuSections ?? [];
  const popularItems: Array<{ name: string; url: string; image?: string; position: number }> = [];

  let position = 1;
  for (const section of sections) {
    for (const item of section.items) {
      const hasBadge = item.badges && item.badges.length > 0;
      const hasImage = item.imageUrl || (item.images && item.images.length > 0);
      if (hasBadge || hasImage) {
        const image = item.images?.[0]?.imageUrl ?? item.imageUrl ?? undefined;
        popularItems.push({
          name: item.name,
          url: `${menuUrl}#item-${item.id}`,
          image,
          position: position++,
        });
      }
      if (position > 10) break;
    }
    if (position > 10) break;
  }

  if (popularItems.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Popular dishes at ${restaurant.name}`,
    itemListElement: popularItems.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      item: {
        "@type": "MenuItem",
        name: item.name,
        url: item.url,
        ...(item.image ? { image: item.image } : {}),
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(restaurantName: string, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mydscvr.ai",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Explore",
        item: "https://mydscvr.ai/explore",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: restaurantName,
        item: `https://mydscvr.ai/${slug}`,
      },
    ],
  };
}
