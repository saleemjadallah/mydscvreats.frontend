"use client";

import { MapPin } from "lucide-react";
import { getRestaurantTheme } from "@/lib/restaurant-theme";
import { formatCurrency } from "@/lib/utils";
import type { MenuSection, RestaurantThemeKey } from "@/types";

export function RestaurantDraftPreview({
  restaurant,
  sections,
  themeKey,
}: {
  restaurant: {
    name: string;
    cuisineType?: string | null;
    description?: string | null;
    location?: string | null;
  };
  sections: MenuSection[];
  themeKey?: RestaurantThemeKey | null;
}) {
  const theme = getRestaurantTheme(themeKey);
  const previewSections = sections.slice(0, 2);

  return (
    <div
      className="rounded-[32px] border p-4"
      style={{
        borderColor: theme.divider,
        background: `radial-gradient(circle at top right, ${theme.glowA}, transparent 32%), radial-gradient(circle at bottom left, ${theme.glowB}, transparent 28%), ${theme.pageBackground}`,
      }}
    >
      <div
        className="overflow-hidden rounded-[28px] text-white"
        style={{
          background: `linear-gradient(135deg, ${theme.heroFrom}, ${theme.heroTo})`,
        }}
      >
        <div className="space-y-4 p-6">
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
            <h3 className="text-3xl font-semibold tracking-tight">
              {restaurant.name || "Your restaurant"}
            </h3>
            <p className="mt-3 max-w-xl text-sm text-white/75">
              {restaurant.description ??
                "This is how the hosted menu page will feel once the theme is applied."}
            </p>
          </div>
          {restaurant.location ? (
            <div className="inline-flex items-center gap-2 text-sm text-white/70">
              <MapPin className="h-4 w-4" />
              {restaurant.location}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {previewSections.map((section) => (
              <div
                key={section.id}
                className="rounded-full border px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: theme.chipBg,
                  borderColor: theme.chipBorder,
                  color: theme.chipText,
                }}
              >
                {section.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {previewSections.flatMap((section) => section.items.slice(0, 1)).map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-[24px] border bg-white"
            style={{ borderColor: theme.divider }}
          >
            <div
              className="h-32"
              style={{
                background: `linear-gradient(135deg, ${theme.placeholderFrom}, ${theme.placeholderTo})`,
              }}
            />
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-ink">{item.name}</div>
                <div className="text-sm font-semibold" style={{ color: theme.price }}>
                  {formatCurrency(item.price, item.currency)}
                </div>
              </div>
              <p className="text-sm text-stone">
                {item.description ?? "Short dish description will show here."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
