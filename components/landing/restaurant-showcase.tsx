import Link from "next/link";
import { RestaurantCard } from "@/components/public/restaurant-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Restaurant } from "@/types";

export function RestaurantShowcase({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone">
            Live pages
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            See what a mydscvr page looks like
          </h2>
        </div>
        {restaurants.length > 0 && (
          <Button asChild variant="secondary">
            <Link href="/explore">View all</Link>
          </Button>
        )}
      </div>

      {restaurants.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {restaurants.slice(0, 6).map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-lg font-medium text-ink">
              The first restaurants are being onboarded.
            </p>
            <p className="mt-2 text-sm text-stone">
              Want to be one of them? Start your free trial and your page will
              appear here.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/dashboard">Get started</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
