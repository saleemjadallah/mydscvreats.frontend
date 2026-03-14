"use client";

import { Clock3, Package2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type RestaurantTheme } from "@/lib/restaurant-theme";
import {
  getPromotionBadge,
  getPromotionPrimaryItem,
  getPromotionSavings,
} from "@/lib/promotions";
import { formatCurrency } from "@/lib/utils";
import type { Promotion } from "@/types";

function getOfferIcon(type: Promotion["type"]) {
  if (type === "combo") return Package2;
  if (type === "deal") return Sparkles;
  return Clock3;
}

function formatSchedule(start: string | null, end: string | null) {
  const parts: string[] = [];
  if (start) {
    parts.push(
      `Starts ${new Date(start).toLocaleDateString("en-AE", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`
    );
  }
  if (end) {
    parts.push(
      `Ends ${new Date(end).toLocaleDateString("en-AE", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`
    );
  }
  return parts.join(" \u2022 ");
}

export function PromotionRail({
  promotions,
  theme,
  buildWhatsAppHref,
}: {
  promotions: Promotion[];
  theme: RestaurantTheme;
  buildWhatsAppHref?: (promotionId: string) => string;
}) {
  if (promotions.length === 0) return null;

  return (
    <section id="offers" className="scroll-mt-28">
      <div
        className="animate-rise-in relative overflow-hidden rounded-[32px] border px-5 py-6 shadow-[0_24px_80px_rgba(28,24,19,0.08)] md:px-8 md:py-8"
        style={{
          borderColor: theme.divider,
          background: `linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.74)), ${theme.pageBackground}`,
        }}
      >
        <div
          className="absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: theme.glowA }}
        />
        <div
          className="absolute -bottom-20 left-0 h-48 w-48 rounded-full blur-3xl"
          style={{ backgroundColor: theme.glowB }}
        />

        <div className="relative space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div
                className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]"
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                }}
              >
                Featured offers
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">
                Put the money-saving story ahead of the menu scroll
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-stone md:text-base">
                Highlight signature discounts, time-bound deals, and shareable
                combos before diners start comparing individual dishes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[240px]">
              <div className="rounded-[20px] border border-white/60 bg-white/75 px-4 py-3 backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.18em] text-stone">
                  Live now
                </div>
                <div className="mt-2 text-2xl font-semibold text-ink">
                  {promotions.length}
                </div>
              </div>
              <div className="rounded-[20px] border border-white/60 bg-white/75 px-4 py-3 backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.18em] text-stone">
                  Featured
                </div>
                <div className="mt-2 text-2xl font-semibold text-ink">
                  {promotions.filter((p) => p.isFeatured).length}
                </div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {promotions.map((promotion, index) => {
              const Icon = getOfferIcon(promotion.type);
              const primaryItem = getPromotionPrimaryItem(promotion);
              const savings = getPromotionSavings(promotion);
              const schedule = formatSchedule(
                promotion.startsAt,
                promotion.endsAt
              );
              const isHero = index === 0 && promotions.length > 1;
              const currency = primaryItem?.currency ?? "AED";
              const displayText = promotion.subtitle || promotion.description;
              const primaryImage = primaryItem?.images?.find((image) => image.isPrimary)
                ?? primaryItem?.images?.[0]
                ?? null;

              return (
                <Card
                  key={promotion.id}
                  className={`group overflow-hidden border border-white/60 bg-white/80 shadow-[0_16px_50px_rgba(25,20,15,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(25,20,15,0.14)] ${
                    isHero
                      ? "md:col-span-2 xl:col-span-2 xl:grid xl:grid-cols-[1.1fr,0.9fr]"
                      : ""
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden ${
                      isHero
                        ? "aspect-[4/3] xl:aspect-auto xl:min-h-72"
                        : "aspect-[4/3]"
                    }`}
                  >
                    {primaryItem?.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={primaryItem.imageUrl}
                        alt={primaryItem.name ?? ""}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${theme.placeholderFrom}, ${theme.placeholderTo})`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                    {/* Top bar */}
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3.5">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        <Icon className="h-3 w-3" />
                        {getPromotionBadge(promotion)}
                      </div>
                      {promotion.promoPrice ? (
                        <div className="rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-ink shadow-sm backdrop-blur-sm">
                          {formatCurrency(promotion.promoPrice, currency)}
                        </div>
                      ) : null}
                    </div>

                    {/* Bottom: anchored item */}
                    {primaryItem ? (
                      <div className="absolute inset-x-0 bottom-0 p-3.5">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                          Anchored to
                        </div>
                        <div className="mt-0.5 text-base font-semibold text-white">
                          {primaryItem.name}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="space-y-3 p-4 md:p-5">
                    {/* Type + Featured */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone">
                        {promotion.type === "combo"
                          ? "Bundle offer"
                          : promotion.type === "deal"
                            ? "House special"
                            : "Menu highlight"}
                      </span>
                      {promotion.isFeatured ? (
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em]"
                          style={{
                            backgroundColor: theme.badgeBg,
                            color: theme.badgeText,
                          }}
                        >
                          Featured
                        </span>
                      ) : null}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-ink line-clamp-2">
                      {promotion.title}
                    </h3>

                    {/* Description — show subtitle or description, not both */}
                    {displayText ? (
                      <p className="text-sm leading-relaxed text-stone line-clamp-2">
                        {displayText}
                      </p>
                    ) : null}

                    {/* Promo price — compact */}
                    {promotion.promoPrice ? (
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#F2E3C7] bg-[#FFF8EA] px-3.5 py-2.5">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.18em] text-[#7A5211]/60">
                            Promo price
                          </div>
                          <div className="mt-0.5 text-2xl font-bold tracking-tight text-[#7A5211]">
                            {formatCurrency(promotion.promoPrice, currency)}
                          </div>
                        </div>
                        {savings ? (
                          <div className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#7A5211] shadow-sm">
                            Save {formatCurrency(savings.amount, currency)}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Item chips */}
                    {promotion.items.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {promotion.items.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium"
                            style={{
                              borderColor: theme.chipBorder,
                              backgroundColor: theme.chipBg,
                              color: theme.chipText,
                            }}
                          >
                            {item.menuItem.name}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Meta — savings + schedule + terms condensed */}
                    {savings || schedule || promotion.terms ? (
                      <div className="space-y-1 text-xs leading-5 text-stone">
                        {savings ? (
                          <p className="font-medium text-[#7A5211]">
                            {savings.percent}% better value than ordering
                            separately.
                          </p>
                        ) : null}
                        {schedule || promotion.terms ? (
                          <p>
                            {[schedule, promotion.terms]
                              .filter(Boolean)
                              .join(" \u00b7 ")}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {/* WhatsApp CTA */}
                    {buildWhatsAppHref ? (
                      <Button
                        asChild
                        variant="secondary"
                        className="w-full border-[#D9F4E5] bg-[#F3FFF8] text-[#156B45] hover:bg-[#E8F9F0]"
                      >
                        <a
                          href={buildWhatsAppHref(promotion.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ask about this offer on WhatsApp
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
