import type { MetadataRoute } from "next";
import { apiClient } from "@/lib/api-client";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const restaurants = await apiClient.listRestaurants().catch(() => []);

  const restaurantEntries: MetadataRoute.Sitemap = restaurants
    .filter((r) => r.isPublished)
    .map((r) => ({
      url: `https://mydscvr.ai/${r.slug}`,
      lastModified: new Date(r.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  return [
    {
      url: "https://mydscvr.ai",
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://mydscvr.ai/explore",
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...restaurantEntries,
  ];
}
