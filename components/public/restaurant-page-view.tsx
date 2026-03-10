import Image from "next/image";
import { Globe2, MapPin, Phone } from "lucide-react";
import { RestaurantTracker } from "@/components/public/restaurant-tracker";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buildBreadcrumbJsonLd, buildRestaurantJsonLd } from "@/lib/structured-data";
import { getRestaurantTheme } from "@/lib/restaurant-theme";
import { formatCurrency } from "@/lib/utils";
import type { Restaurant } from "@/types";

export function RestaurantPageView({
  restaurant,
  trackPageView = false,
  previewBanner,
}: {
  restaurant: Restaurant;
  trackPageView?: boolean;
  previewBanner?: React.ReactNode;
}) {
  const theme = getRestaurantTheme(restaurant.themeKey);
  const jsonLd = buildRestaurantJsonLd(restaurant);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(restaurant.name, restaurant.slug);

  return (
    <main
      className="px-4 py-5 md:px-8 md:py-8"
      style={{
        background: `radial-gradient(circle at top right, ${theme.glowA}, transparent 34%), radial-gradient(circle at bottom left, ${theme.glowB}, transparent 30%), ${theme.pageBackground}`,
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {trackPageView ? <RestaurantTracker restaurantId={restaurant.id} /> : null}
      <div className="mx-auto max-w-7xl space-y-6">
        {previewBanner}

        <section
          className="overflow-hidden rounded-[40px] border text-white"
          style={{
            borderColor: theme.divider,
            backgroundImage: restaurant.coverImageUrl
              ? `linear-gradient(120deg, ${theme.heroOverlayStart}, ${theme.heroOverlayEnd}), url(${restaurant.coverImageUrl})`
              : `linear-gradient(120deg, ${theme.heroFrom}, ${theme.heroTo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr,0.8fr] lg:p-12">
            <div className="space-y-5">
              <div
                className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                }}
              >
                {restaurant.cuisineType ?? "Restaurant"}
              </div>
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
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Phone className="h-4 w-4" />
                    {restaurant.phone}
                  </a>
                ) : null}
                {restaurant.website ? (
                  <a
                    href={restaurant.website}
                    className="inline-flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe2 className="h-4 w-4" />
                    Website
                  </a>
                ) : null}
              </div>
            </div>

            <Card className="self-end p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-stone">
                Browse by category
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {restaurant.menuSections?.map((section) => (
                  <a
                    key={section.id}
                    href={`#section-${section.id}`}
                    className="rounded-full border px-4 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: theme.chipBg,
                      color: theme.chipText,
                      borderColor: theme.chipBorder,
                    }}
                  >
                    {section.name}
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <nav
          aria-label="Menu sections"
          className="sticky top-3 z-10 overflow-x-auto rounded-full border bg-[#FFFDF9]/90 px-3 py-3 backdrop-blur"
          style={{ borderColor: theme.divider }}
        >
          <div className="flex gap-2">
            {restaurant.menuSections?.map((section) => (
              <a
                key={section.id}
                href={`#section-${section.id}`}
                className="whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium"
                style={{ borderColor: theme.divider }}
              >
                {section.name}
              </a>
            ))}
          </div>
        </nav>

        <section className="space-y-8">
          {restaurant.menuSections?.map((section) => (
            <div key={section.id} id={`section-${section.id}`} className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-semibold">{section.name}</h2>
                <Separator
                  className="max-w-[120px]"
                  style={{ backgroundColor: theme.divider }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative h-52">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={`${item.name} – ${section.name} at ${restaurant.name}`}
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
                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-semibold">{item.name}</h3>
                        <div className="text-sm font-semibold" style={{ color: theme.price }}>
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
