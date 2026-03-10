import type { Restaurant } from "@/types";

export function buildRestaurantJsonLd(restaurant: Restaurant) {
  const menuSections = (restaurant.menuSections ?? []).map((section) => ({
    "@type": "MenuSection",
    name: section.name,
    hasMenuItem: section.items.map((item) => ({
      "@type": "MenuItem",
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
      ...(item.imageUrl ? { image: item.imageUrl } : {}),
      offers: {
        "@type": "Offer",
        price: item.price,
        priceCurrency: item.currency,
      },
    })),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    ...(restaurant.description ? { description: restaurant.description } : {}),
    url: `https://mydscvr.ai/${restaurant.slug}`,
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
    ...(restaurant.website ? { sameAs: [restaurant.website] } : {}),
    hasMenu: {
      "@type": "Menu",
      ...(menuSections.length > 0
        ? { hasMenuSection: menuSections }
        : {}),
    },
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
