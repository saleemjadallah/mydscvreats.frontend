"use client";

import { Clock3, Package2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
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
}: {
  promotions: Promotion[];
  theme: RestaurantTheme;
}) {
  if (promotions.length === 0) {
    return null;
  }

  return (
    <section id="offers" className="space-y-4 scroll-mt-28">
      <div className="flex items-center gap-4">
        <div>
          <div
            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.badgeText,
            }}
          >
            Featured offers
          </div>
          <h2 className="mt-3 text-3xl font-semibold">Deals worth surfacing first</h2>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {promotions.map((promotion) => {
          const Icon = getOfferIcon(promotion.type);
          const primaryItem = getPromotionPrimaryItem(promotion);
          const savings = getPromotionSavings(promotion);
          const schedule = formatSchedule(promotion.startsAt, promotion.endsAt);

          return (
            <Card
              key={promotion.id}
              className="overflow-hidden border-0 shadow-[0_12px_40px_rgba(25,20,15,0.08)]"
            >
              <div
                className="relative h-44"
                style={{
                  background: primaryItem?.imageUrl
                    ? `linear-gradient(180deg, rgba(20,18,15,0.05), rgba(20,18,15,0.55)), url("${primaryItem.imageUrl}") center / cover`
                    : `linear-gradient(135deg, ${theme.placeholderFrom}, ${theme.placeholderTo})`,
                }}
              >
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
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-xl font-semibold text-ink">{promotion.title}</h3>
                  {promotion.subtitle ? (
                    <p className="mt-1 text-sm text-stone">{promotion.subtitle}</p>
                  ) : null}
                </div>

                {promotion.description ? (
                  <p className="text-sm leading-6 text-stone">{promotion.description}</p>
                ) : null}

                <div className="flex flex-wrap gap-1.5">
                  {promotion.items.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex rounded-full border px-2.5 py-1 text-xs"
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

                {savings ? (
                  <div className="rounded-[18px] border border-[#F2E3C7] bg-[#FFF8EA] px-4 py-3 text-sm text-[#7A5211]">
                    Save {formatCurrency(savings.amount, primaryItem?.currency ?? "AED")} ({savings.percent}%)
                  </div>
                ) : null}

                {schedule ? <p className="text-xs text-stone">{schedule}</p> : null}
                {promotion.terms ? <p className="text-xs text-stone">{promotion.terms}</p> : null}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
