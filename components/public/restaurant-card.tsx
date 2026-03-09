import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Restaurant } from "@/types";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/${restaurant.slug}`}>
      <Card className="group overflow-hidden transition-transform duration-300 hover:-translate-y-1">
        <div
          className="h-44 bg-cover bg-center"
          style={{
            backgroundImage: restaurant.coverImageUrl
              ? `linear-gradient(180deg, rgba(32,26,23,0.05), rgba(32,26,23,0.5)), url(${restaurant.coverImageUrl})`
              : "linear-gradient(135deg, rgba(232,163,23,0.35), rgba(255,107,90,0.35))",
          }}
        />
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
