
import type { Metadata } from "next";
import { RestaurantCard } from "@/components/public/restaurant-card";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cuisine?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const cuisine = params.cuisine;

  const title = cuisine
    ? `${cuisine} Restaurants in Dubai | mydscvr Eats`
    : "Explore Restaurant Menus in Dubai | mydscvr Eats";

  const description = cuisine
    ? `Browse ${cuisine} restaurant menus in Dubai. Dish photos, prices, and descriptions on mydscvr Eats.`
    : "Discover Dubai restaurant menus with dish photos, prices, and descriptions. Browse all published menus on mydscvr Eats.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://mydscvr.ai/explore",
    },
    openGraph: {
      title,
      description,
      url: "https://mydscvr.ai/explore",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ cuisine?: string }>;
}) {
  const params = await searchParams;
  const restaurants = await apiClient.listRestaurants(params.cuisine).catch(() => []);

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-stone">Explore</div>
          <h1 className="mt-2 text-4xl font-semibold">Published restaurant menu pages</h1>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
          {!restaurants.length ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="p-8 text-center text-stone">
                No restaurants match this filter yet.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  );
}
