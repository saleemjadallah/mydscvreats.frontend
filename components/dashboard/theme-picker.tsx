"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRestaurantTheme, restaurantThemes } from "@/lib/restaurant-theme";
import type { RestaurantThemeKey } from "@/types";

export function ThemePicker({
  value,
  onChange,
}: {
  value: RestaurantThemeKey | null;
  onChange: (themeKey: RestaurantThemeKey) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {restaurantThemes.map((theme) => {
        const selected = value === theme.key;

        return (
          <button
            key={theme.key}
            type="button"
            onClick={() => onChange(theme.key)}
            className={cn(
              "rounded-[28px] border p-4 text-left transition-all",
              selected
                ? "border-[#201A17] bg-white shadow-card"
                : "border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] hover:bg-white"
            )}
          >
            <div
              className="rounded-[22px] p-4 text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.heroFrom}, ${theme.heroTo})`,
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText,
                  }}
                >
                  {theme.name}
                </div>
                {selected ? (
                  <div className="rounded-full bg-white/15 p-1.5">
                    <Check className="h-4 w-4" />
                  </div>
                ) : null}
              </div>
              <div className="mt-10 space-y-2">
                <div className="h-3 w-24 rounded-full bg-white/70" />
                <div className="h-2.5 w-40 rounded-full bg-white/35" />
              </div>
              <div className="mt-6 flex gap-2">
                {[1, 2, 3].map((pill) => (
                  <div
                    key={pill}
                    className="h-8 rounded-full border px-4"
                    style={{
                      width: pill === 2 ? 62 : 84,
                      backgroundColor: theme.chipBg,
                      borderColor: theme.chipBorder,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <div className="font-medium text-ink">{theme.name}</div>
              <div className="mt-1 text-sm text-stone">{theme.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ThemeSwatch({ themeKey }: { themeKey?: RestaurantThemeKey | null }) {
  const theme = getRestaurantTheme(themeKey);

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-4 w-4 rounded-full border border-white/40"
        style={{
          background: `linear-gradient(135deg, ${theme.heroFrom}, ${theme.heroTo})`,
        }}
      />
      <span>{theme.name}</span>
    </div>
  );
}
