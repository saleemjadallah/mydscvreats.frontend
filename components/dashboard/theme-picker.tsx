"use client";

import Link from "next/link";
import { Check, Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  freeThemes,
  getRestaurantTheme,
  premiumThemes,
  type RestaurantTheme,
} from "@/lib/restaurant-theme";
import type { RestaurantThemeKey } from "@/types";

function ThemeCard({
  theme,
  selected,
  locked,
  onSelect,
}: {
  theme: RestaurantTheme;
  selected: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      key={theme.key}
      type="button"
      onClick={locked ? undefined : onSelect}
      className={cn(
        "group relative rounded-[28px] border p-4 text-left transition-all",
        locked && "cursor-default",
        selected
          ? "border-[#201A17] bg-white shadow-card"
          : locked
            ? "border-[#E7DAC5] bg-[rgba(255,253,249,0.60)] opacity-80"
            : "border-[#E7DAC5] bg-[rgba(255,253,249,0.82)] hover:bg-white"
      )}
    >
      {/* Lock overlay for premium themes */}
      {locked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[28px] bg-white/40 backdrop-blur-[1px]">
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </Link>
        </div>
      )}

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
          {selected && !locked ? (
            <div className="rounded-full bg-white/15 p-1.5">
              <Check className="h-4 w-4" />
            </div>
          ) : locked ? (
            <div className="rounded-full bg-white/15 p-1.5">
              <Lock className="h-3.5 w-3.5" />
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
        <div className="flex items-center gap-2 font-medium text-ink">
          {theme.name}
          {theme.isPremium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#C9A84C]/15 to-[#E8C96A]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A7B2E]">
              <Crown className="h-3 w-3" />
              Pro
            </span>
          )}
        </div>
        <div className="mt-1 text-sm text-stone">{theme.description}</div>
      </div>
    </button>
  );
}

export function ThemePicker({
  value,
  onChange,
  isPro = false,
}: {
  value: RestaurantThemeKey | null;
  onChange: (themeKey: RestaurantThemeKey) => void;
  isPro?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {freeThemes.map((theme) => (
          <ThemeCard
            key={theme.key}
            theme={theme}
            selected={value === theme.key}
            locked={false}
            onSelect={() => onChange(theme.key)}
          />
        ))}
      </div>

      {/* Premium themes section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#DDD5C2] to-transparent" />
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A7B2E]">
            <Crown className="h-3.5 w-3.5" />
            Premium themes
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#DDD5C2] to-transparent" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {premiumThemes.map((theme) => (
            <ThemeCard
              key={theme.key}
              theme={theme}
              selected={value === theme.key}
              locked={!isPro}
              onSelect={() => onChange(theme.key)}
            />
          ))}
        </div>
      </div>
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
      {theme.isPremium && (
        <Crown className="h-3 w-3 text-[#C9A84C]" />
      )}
    </div>
  );
}
