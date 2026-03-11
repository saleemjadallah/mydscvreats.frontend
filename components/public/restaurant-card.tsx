import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getRestaurantTheme } from "@/lib/restaurant-theme";
import { getRestaurantPublicUrl } from "@/lib/share";
import type { Restaurant } from "@/types";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const theme = getRestaurantTheme(restaurant.themeKey);

  return (
    <Link href={getRestaurantPublicUrl(restaurant)}>
      <Card className="group overflow-hidden transition-transform duration-300 hover:-translate-y-1">
        <div className="relative h-44">
          {restaurant.coverImageUrl ? (
            <Image
              src={restaurant.coverImageUrl}
              alt={`${restaurant.name}${restaurant.cuisineType ? ` – ${restaurant.cuisineType}` : ""} restaurant`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, ${theme.placeholderFrom}, ${theme.placeholderTo})`,
              }}
              role="presentation"
            />
          )}
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{restaurant.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-stone">
                {restaurant.description ?? "Fresh hosted menu page with AI-enhanced visuals."}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-stone">
            {restaurant.cuisineType ? <Badge variant="default">{restaurant.cuisineType}</Badge> : null}
            {restaurant.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {restaurant.location}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
