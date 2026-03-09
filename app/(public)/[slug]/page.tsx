export const runtime = 'edge';

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Phone, Globe2 } from "lucide-react";
import { RestaurantTracker } from "@/components/public/restaurant-tracker";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

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

  return {
    title: `${restaurant.name} | mydscvr Eats`,
    description:
      restaurant.description ??
      `Browse the live menu for ${restaurant.name} on mydscvr Eats.`,
    openGraph: {
      title: `${restaurant.name} | mydscvr Eats`,
      description: restaurant.description ?? undefined,
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

  return (
    <main className="px-4 py-5 md:px-8 md:py-8">
      <RestaurantTracker restaurantId={restaurant.id} />
      <div className="mx-auto max-w-7xl space-y-6">
        <section
          className="overflow-hidden rounded-[40px] border border-[#E6D8C4] bg-[#201A17] text-white"
          style={{
            backgroundImage: restaurant.coverImageUrl
              ? `linear-gradient(120deg, rgba(32,26,23,0.88), rgba(32,26,23,0.5)), url(${restaurant.coverImageUrl})`
              : "linear-gradient(120deg, #201A17, #4B3226)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr,0.8fr] lg:p-12">
            <div className="space-y-5">
              <Badge variant="default">{restaurant.cuisineType ?? "Restaurant"}</Badge>
              <div>
                <h1 className="text-5xl font-semibold tracking-tight">{restaurant.name}</h1>
                {restaurant.description ? (
                  <p className="mt-4 max-w-2xl text-lg text-white/75">{restaurant.description}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                {restaurant.location ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {restaurant.location}
                  </span>
                ) : null}
                {restaurant.phone ? (
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {restaurant.phone}
                  </span>
                ) : null}
                {restaurant.website ? (
                  <a href={restaurant.website} className="inline-flex items-center gap-2" target="_blank">
                    <Globe2 className="h-4 w-4" />
                    Website
                  </a>
                ) : null}
              </div>
            </div>

            <Card className="self-end p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-stone">Browse by category</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {restaurant.menuSections?.map((section) => (
                  <a
                    key={section.id}
                    href={`#section-${section.id}`}
                    className="rounded-full bg-[#F2E7D8] px-4 py-2 text-sm font-medium text-ink"
                  >
                    {section.name}
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <div className="sticky top-3 z-10 overflow-x-auto rounded-full border border-[#E6D8C4] bg-[#FFFDF9]/90 px-3 py-3 backdrop-blur">
          <div className="flex gap-2">
            {restaurant.menuSections?.map((section) => (
              <a
                key={section.id}
                href={`#section-${section.id}`}
                className="whitespace-nowrap rounded-full border border-[#E6D8C4] px-4 py-2 text-sm font-medium"
              >
                {section.name}
              </a>
            ))}
          </div>
        </div>

        <section className="space-y-8">
          {restaurant.menuSections?.map((section) => (
            <div key={section.id} id={`section-${section.id}`} className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-semibold">{section.name}</h2>
                <Separator className="max-w-[120px]" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div
                      className="h-52 bg-cover bg-center"
                      style={{
                        backgroundImage: item.imageUrl
                          ? `url(${item.imageUrl})`
                          : "linear-gradient(135deg, rgba(232,163,23,0.4), rgba(255,107,90,0.3))",
                      }}
                    />
                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-semibold">{item.name}</h3>
                        <div className="text-sm font-semibold text-coral">
                          {formatCurrency(item.price, item.currency)}
                        </div>
                      </div>
                      {item.description ? (
                        <p className="text-sm text-stone">{item.description}</p>
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
