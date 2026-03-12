"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Globe2, MapPin, MessageCircle, Phone } from "lucide-react";
import { DietaryFilterChips } from "@/components/public/dietary-filter-chips";
import { EmbedHeightReporter } from "@/components/public/embed-height-reporter";
import { MenuAIChat } from "@/components/public/menu-ai-chat";
import { PromotionRail } from "@/components/public/promotion-rail";
import { RestaurantTracker } from "@/components/public/restaurant-tracker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getApiUrl } from "@/lib/api-client";
import {
  getDiscountedItemPromotionMap,
  getPromotionsByItemId,
  isPromotionLive,
} from "@/lib/promotions";
import { buildBreadcrumbJsonLd, buildRestaurantJsonLd } from "@/lib/structured-data";
import { getRestaurantTheme } from "@/lib/restaurant-theme";
import { cn, formatCurrency, normalizeExternalUrl } from "@/lib/utils";
import type { MenuItem, MenuItemImage, Restaurant, RestaurantThemeKey } from "@/types";

type DisplayMenuImage = MenuItemImage & {
  isSynthetic?: boolean;
};

function getDisplayImages(item: MenuItem): DisplayMenuImage[] {
  if (item.images?.length) {
    return [...item.images].sort((a, b) => a.slot - b.slot);
  }

  if (!item.imageUrl) {
    return [];
  }

  return [
    {
      id: `legacy-${item.id}`,
      slot: 0,
      imageUrl: item.imageUrl,
      imageStatus: item.imageStatus,
      promptModifier: null,
      isPrimary: true,
      isSynthetic: true,
    },
  ];
}

function MenuItemImageGallery({
  item,
  sectionName,
  restaurantName,
  placeholderFrom,
  placeholderTo,
}: {
  item: MenuItem;
  sectionName: string;
  restaurantName: string;
  placeholderFrom: string;
  placeholderTo: string;
}) {
  const images = getDisplayImages(item).filter((image) => Boolean(image.imageUrl));
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div
        className="h-full w-full"
        style={{
          background: `linear-gradient(135deg, ${placeholderFrom}, ${placeholderTo})`,
        }}
        role="presentation"
      />
    );
  }

  const activeImage = images[activeIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  function showPreviousImage() {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNextImage() {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  return (
    <>
      <Image
        src={activeImage.imageUrl ?? item.imageUrl ?? ""}
        alt={`${item.name} – ${sectionName} at ${restaurantName}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover"
      />
      {hasMultipleImages ? (
        <>
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <button
              type="button"
              onClick={showPreviousImage}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/60"
              aria-label={`Show previous image for ${item.name}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white">
              {activeIndex + 1} / {images.length}
            </div>
            <button
              type="button"
              onClick={showNextImage}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/60"
              aria-label={`Show next image for ${item.name}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 p-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? "w-6 bg-white" : "w-2.5 bg-white/55"
                }`}
                aria-label={`Show image ${index + 1} for ${item.name}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

export function RestaurantPageView({
  restaurant,
  trackPageView = false,
  previewBanner,
  themeKeyOverride,
  isEmbedded = false,
}: {
  restaurant: Restaurant;
  trackPageView?: boolean;
  previewBanner?: React.ReactNode;
  themeKeyOverride?: RestaurantThemeKey | null;
  isEmbedded?: boolean;
}) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggleFilter(tagKey: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(tagKey)) {
        next.delete(tagKey);
      } else {
        next.add(tagKey);
      }
      return next;
    });
  }

  // Filter sections based on active dietary filters
  const filteredSections = useMemo(() => {
    if (activeFilters.size === 0) return restaurant.menuSections;

    return restaurant.menuSections?.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const itemTagKeys = new Set(
          (item.dietaryTags ?? []).map((dt) => dt.tag.key)
        );
        return Array.from(activeFilters).every((filter) =>
          itemTagKeys.has(filter)
        );
      }),
    })).filter((section) => section.items.length > 0);
  }, [restaurant.menuSections, activeFilters]);
  const theme = getRestaurantTheme(themeKeyOverride ?? restaurant.themeKey);
  const jsonLd = buildRestaurantJsonLd(restaurant);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(restaurant.name, restaurant.slug);
  const websiteUrl = normalizeExternalUrl(restaurant.website);
  const whatsappEnabled = !isEmbedded && Boolean(restaurant.whatsappNumber);
  const campaign = searchParams.get("utm_campaign");
  const livePromotions = useMemo(
    () =>
      (restaurant.promotions ?? [])
        .filter(isPromotionLive)
        .sort((a, b) => {
          if (a.isFeatured !== b.isFeatured) {
            return a.isFeatured ? -1 : 1;
          }

          return a.displayOrder - b.displayOrder;
        }),
    [restaurant.promotions]
  );
  const discountedItemPromotions = useMemo(
    () => getDiscountedItemPromotionMap(livePromotions),
    [livePromotions]
  );
  const promotionsByItemId = useMemo(
    () => getPromotionsByItemId(livePromotions),
    [livePromotions]
  );
  const buildWhatsAppHref = useMemo(() => {
    if (!whatsappEnabled) {
      return null;
    }

    return (options: {
      source: "floating" | "contact" | "menu_item" | "promotion";
      menuItemId?: string;
      promotionId?: string;
    }) => {
      const url = new URL(
        `${getApiUrl().replace(/\/$/, "")}/api/whatsapp/redirect/${restaurant.id}`
      );

      url.searchParams.set("source", options.source);
      if (pathname) {
        url.searchParams.set("path", pathname);
      }
      if (campaign) {
        url.searchParams.set("campaign", campaign);
      }
      if (options.menuItemId) {
        url.searchParams.set("menuItemId", options.menuItemId);
      }
      if (options.promotionId) {
        url.searchParams.set("promotionId", options.promotionId);
      }

      return url.toString();
    };
  }, [campaign, pathname, restaurant.id, whatsappEnabled]);

  return (
    <main
      className={isEmbedded ? "px-0 py-0" : "px-4 py-5 md:px-8 md:py-8"}
      style={{
        background: isEmbedded
          ? theme.pageBackground
          : `radial-gradient(circle at top right, ${theme.glowA}, transparent 34%), radial-gradient(circle at bottom left, ${theme.glowB}, transparent 30%), ${theme.pageBackground}`,
      }}
    >
      {!isEmbedded ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />
        </>
      ) : null}
      {trackPageView ? <RestaurantTracker restaurantId={restaurant.id} /> : null}
      {isEmbedded ? <EmbedHeightReporter /> : null}
      <div className={`mx-auto ${isEmbedded ? "max-w-none space-y-4" : "max-w-7xl space-y-6"}`}>
        {previewBanner}

        <section
          className={`overflow-hidden border text-white ${isEmbedded ? "rounded-[28px]" : "rounded-[40px]"}`}
          style={{
            borderColor: theme.divider,
            backgroundColor: theme.heroFrom,
            backgroundImage: restaurant.coverImageUrl
              ? `linear-gradient(120deg, ${theme.heroOverlayStart}, ${theme.heroOverlayEnd}), url("${restaurant.coverImageUrl}")`
              : `linear-gradient(120deg, ${theme.heroFrom}, ${theme.heroTo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="space-y-5 p-8 lg:p-12">
            <div className="flex flex-wrap items-center gap-4">
              {restaurant.logoUrl ? (
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border border-white/20 bg-white/95 p-3 shadow-lg">
                  <img
                    src={restaurant.logoUrl}
                    alt={`${restaurant.name} logo`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : null}
              <div
                className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                }}
              >
                {restaurant.cuisineType ?? "Restaurant"}
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-semibold tracking-tight">{restaurant.name}</h1>
              {restaurant.description ? (
                <p className="mt-4 max-w-2xl text-lg text-white/90">{restaurant.description}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-white/85">
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
              {websiteUrl ? (
                <a
                  href={websiteUrl}
                  className="inline-flex items-center gap-2 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe2 className="h-4 w-4" />
                  Website
                </a>
              ) : null}
              {buildWhatsAppHref ? (
                <a
                  href={buildWhatsAppHref({ source: "contact" })}
                  className="inline-flex items-center gap-2 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <nav
          aria-label="Menu sections"
          className={`sticky z-10 space-y-2 rounded-[20px] border bg-[#FFFDF9]/90 px-3 py-3 backdrop-blur ${isEmbedded ? "top-0" : "top-3"}`}
          style={{ borderColor: theme.divider }}
        >
          <div className="flex gap-2 overflow-x-auto">
            {livePromotions.length > 0 ? (
              <a
                href="#offers"
                className="whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium"
                style={{ borderColor: theme.divider }}
              >
                Offers
              </a>
            ) : null}
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
          {restaurant.menuSections && (
            <DietaryFilterChips
              sections={restaurant.menuSections}
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
              chipBg={theme.chipBg}
              chipText={theme.chipText}
              chipBorder={theme.chipBorder}
            />
          )}
        </nav>

        <PromotionRail
          promotions={livePromotions}
          theme={theme}
          buildWhatsAppHref={
            buildWhatsAppHref
              ? (promotionId) =>
                  buildWhatsAppHref({
                    source: "promotion",
                    promotionId,
                  })
              : undefined
          }
        />

        <section className="space-y-8">
          {filteredSections?.map((section) => (
            <div key={section.id} id={`section-${section.id}`} className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-semibold">{section.name}</h2>
                <Separator
                  className="max-w-[120px]"
                  style={{ backgroundColor: theme.divider }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((item) => {
                  const discountedPromotion = discountedItemPromotions.get(item.id);
                  const itemPromotions = promotionsByItemId.get(item.id) ?? [];
                  const hasOffer = itemPromotions.length > 0;

                  return (
                    <Card
                      key={item.id}
                      className={`overflow-hidden border-white/60 shadow-[0_14px_40px_rgba(25,20,15,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(25,20,15,0.12)] ${
                        hasOffer ? "ring-1 ring-[#F1DFC0]" : ""
                      }`}
                    >
                      <div className="relative h-52">
                        <MenuItemImageGallery
                          item={item}
                          sectionName={section.name}
                          restaurantName={restaurant.name}
                          placeholderFrom={theme.placeholderFrom}
                          placeholderTo={theme.placeholderTo}
                        />
                        {hasOffer ? (
                          <div className="absolute inset-x-0 top-0 flex justify-end p-3">
                            <div
                              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm backdrop-blur"
                              style={{
                                backgroundColor: "rgba(255,253,249,0.9)",
                                color: theme.badgeText,
                              }}
                            >
                              Offer attached
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="text-xl font-semibold tracking-[-0.02em]">{item.name}</h3>
                            {hasOffer ? (
                              <div className="text-[11px] uppercase tracking-[0.18em] text-stone">
                                Featured in {itemPromotions.length} offer{itemPromotions.length === 1 ? "" : "s"}
                              </div>
                            ) : null}
                          </div>
                          {discountedPromotion?.promoPrice ? (
                            <div className="rounded-[18px] bg-[#FFF7E8] px-3 py-2 text-right">
                              <div className="text-xs font-medium text-stone line-through">
                                {formatCurrency(item.price, item.currency)}
                              </div>
                              <div className="text-sm font-semibold" style={{ color: theme.price }}>
                                {formatCurrency(discountedPromotion.promoPrice, item.currency)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm font-semibold" style={{ color: theme.price }}>
                              {formatCurrency(item.price, item.currency)}
                            </div>
                          )}
                        </div>
                        {item.description ? (
                          <p className="text-sm leading-6 text-stone">{item.description}</p>
                        ) : null}
                        {itemPromotions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {itemPromotions.slice(0, 2).map((promotion) => (
                              <span
                                key={promotion.id}
                                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
                                style={{
                                  borderColor: theme.badgeBg,
                                  backgroundColor: theme.badgeBg,
                                  color: theme.badgeText,
                                }}
                              >
                                {promotion.badgeLabel ?? promotion.title}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {item.dietaryTags && item.dietaryTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.dietaryTags.map((dt) => (
                              <span
                                key={dt.id}
                                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                                style={{
                                  borderColor: theme.chipBorder,
                                  backgroundColor: theme.chipBg,
                                  color: theme.chipText,
                                }}
                              >
                                {dt.tag.icon && <span>{dt.tag.icon}</span>}
                                {dt.tag.label}
                              </span>
                            ))}
                          </div>
                        )}
                        {buildWhatsAppHref ? (
                          <Button
                            asChild
                            variant="secondary"
                            className="w-full border-[#D9F4E5] bg-[#F3FFF8] text-[#156B45] hover:bg-[#E8F9F0]"
                          >
                            <a
                              href={buildWhatsAppHref({
                                source: "menu_item",
                                menuItemId: item.id,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-4 w-4" />
                              Ask about this dish on WhatsApp
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
      {buildWhatsAppHref ? (
        <a
          href={buildWhatsAppHref({ source: "floating" })}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "fixed bottom-6 right-4 z-40 inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold shadow-[0_20px_50px_rgba(21,107,69,0.24)] backdrop-blur transition-transform hover:-translate-y-0.5 sm:right-6",
            "border-[#BFE8D0] bg-[#1FAF63] text-white hover:bg-[#169653]"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      ) : null}
      {!isEmbedded && restaurant.entitlements?.menuAssistantEnabled ? (
        <MenuAIChat
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          side={buildWhatsAppHref ? "left" : "right"}
        />
      ) : null}
    </main>
  );
}
