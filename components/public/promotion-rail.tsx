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
  if (type === "combo") {
    return Package2;
  }

  if (type === "deal") {
    return Sparkles;
  }

  return Clock3;
}

function formatSchedule(start: string | null, end: string | null) {
  const parts: string[] = [];

  if (start) {
    parts.push(`Starts ${new Date(start).toLocaleDateString("en-AE", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })}`);
  }

  if (end) {
    parts.push(`Ends ${new Date(end).toLocaleDateString("en-AE", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })}`);
  }

  return parts.join(" • ");
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
  if (promotions.length === 0) {
    return null;
  }

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
                Highlight signature discounts, time-bound deals, and shareable combos before diners start comparing individual dishes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[240px]">
              <div className="rounded-[20px] border border-white/60 bg-white/75 px-4 py-3 backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.18em] text-stone">Live now</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{promotions.length}</div>
              </div>
              <div className="rounded-[20px] border border-white/60 bg-white/75 px-4 py-3 backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.18em] text-stone">Featured</div>
                <div className="mt-2 text-2xl font-semibold text-ink">
                  {promotions.filter((promotion) => promotion.isFeatured).length}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
        {promotions.map((promotion, index) => {
          const Icon = getOfferIcon(promotion.type);
          const primaryItem = getPromotionPrimaryItem(promotion);
          const savings = getPromotionSavings(promotion);
          const schedule = formatSchedule(promotion.startsAt, promotion.endsAt);
          const isHero = index === 0 && promotions.length > 1;

          return (
            <Card
              key={promotion.id}
              className={`group overflow-hidden border border-white/60 bg-white/80 shadow-[0_16px_50px_rgba(25,20,15,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(25,20,15,0.14)] ${
                isHero ? "xl:col-span-2 xl:grid xl:grid-cols-[1.05fr,0.95fr]" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden ${isHero ? "h-56 xl:h-full" : "h-52"}`}
                style={{
                  background: primaryItem?.imageUrl
                    ? `linear-gradient(180deg, rgba(20,18,15,0.05), rgba(20,18,15,0.55)), url("${primaryItem.imageUrl}") center / cover`
                    : `linear-gradient(135deg, ${theme.placeholderFrom}, ${theme.placeholderTo})`,
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.04),rgba(10,10,10,0.58))]" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                    <Icon className="h-3.5 w-3.5" />
                    {getPromotionBadge(promotion)}
                  </div>
                  {promotion.promoPrice ? (
                    <div className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-ink">
                      {formatCurrency(
                        promotion.promoPrice,
                        primaryItem?.currency ?? "AED"
                      )}
                    </div>
                  ) : null}
                </div>
                {primaryItem ? (
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">
                      Anchored to
                    </div>
                    <div className="mt-1 text-lg font-semibold">{primaryItem.name}</div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-5 p-5 md:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                      {promotion.type === "combo" ? "Bundle offer" : promotion.type === "deal" ? "House special" : "Menu highlight"}
                    </span>
                    {promotion.isFeatured ? (
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                        style={{
                          backgroundColor: theme.badgeBg,
                          color: theme.badgeText,
                        }}
                      >
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {promotion.title}
                  </h3>
                  {promotion.subtitle ? (
                    <p className="mt-2 text-sm leading-6 text-stone">{promotion.subtitle}</p>
                  ) : null}
                </div>

                {promotion.description ? (
                  <p className="text-sm leading-6 text-stone">{promotion.description}</p>
                ) : null}

                {promotion.promoPrice ? (
                  <div className="flex flex-wrap items-end justify-between gap-3 rounded-[22px] border border-[#F2E3C7] bg-[#FFF8EA] px-4 py-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#7A5211]/70">
                        Promo price
                      </div>
                      <div className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[#7A5211]">
                        {formatCurrency(promotion.promoPrice, primaryItem?.currency ?? "AED")}
                      </div>
                    </div>
                    {savings ? (
                      <div className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[#7A5211] shadow-sm">
                        Save {formatCurrency(savings.amount, primaryItem?.currency ?? "AED")}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-1.5">
                  {promotion.items.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium"
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

                {savings ? <p className="text-sm font-medium text-[#7A5211]">{savings.percent}% better value than ordering separately.</p> : null}

                <div className="space-y-1.5 text-xs leading-5 text-stone">
                  {schedule ? <p>{schedule}</p> : null}
                  {promotion.terms ? <p>{promotion.terms}</p> : null}
                </div>
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
