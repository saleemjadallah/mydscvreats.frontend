"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Check, Clock3, Loader2, Percent, Plus, Sparkles, Trash2, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { getPromotionBadge, getPromotionStatus, type PromotionStatus } from "@/lib/promotions";
import { formatCurrency } from "@/lib/utils";
import type { MenuSection, Promotion, PromotionType, Restaurant } from "@/types";

type PromotionFormState = {
  id: string | null;
  type: PromotionType;
  title: string;
  subtitle: string;
  description: string;
  badgeLabel: string;
  terms: string;
  promoPrice: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isFeatured: boolean;
  itemIds: string[];
};

type AutoFillField =
  | "title"
  | "subtitle"
  | "description"
  | "badgeLabel"
  | "terms"
  | "promoPrice";

function toLocalDateTimeInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
  if (!value.trim()) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function createEmptyForm(type: PromotionType = "discounted_item"): PromotionFormState {
  return {
    id: null,
    type,
    title: "",
    subtitle: "",
    description: "",
    badgeLabel: "",
    terms: "",
    promoPrice: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
    isFeatured: true,
    itemIds: [],
  };
}

function createFormFromPromotion(promotion: Promotion): PromotionFormState {
  return {
    id: promotion.id,
    type: promotion.type,
    title: promotion.title,
    subtitle: promotion.subtitle ?? "",
    description: promotion.description ?? "",
    badgeLabel: promotion.badgeLabel ?? "",
    terms: promotion.terms ?? "",
    promoPrice: promotion.promoPrice?.toString() ?? "",
    startsAt: toLocalDateTimeInput(promotion.startsAt),
    endsAt: toLocalDateTimeInput(promotion.endsAt),
    isActive: promotion.isActive,
    isFeatured: promotion.isFeatured,
    itemIds: promotion.items.map((item) => item.menuItemId),
  };
}

function formatSuggestedPrice(amount: number) {
  return Number(amount.toFixed(2)).toString();
}

function joinDishNames(names: string[]) {
  if (names.length <= 2) {
    return names.join(" and ");
  }

  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function buildAutoFillValues(
  type: PromotionType,
  items: Array<{
    name: string;
    description: string | null;
    price: number;
  }>
): Record<AutoFillField, string> | null {
  if (items.length === 0) {
    return null;
  }

  const firstItem = items[0];
  const itemNames = items.map((item) => item.name);
  const combinedNames = joinDishNames(itemNames);
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  if (type === "discounted_item") {
    return {
      title: firstItem.name,
      subtitle: "Limited-time menu highlight",
      description:
        firstItem.description?.trim() || `A limited-time price on ${firstItem.name}.`,
      badgeLabel: "Deal",
      terms: "Available while this dish is in stock.",
      promoPrice: formatSuggestedPrice(firstItem.price * 0.85),
    };
  }

  if (type === "combo") {
    return {
      title:
        items.length >= 2
          ? `${items[0].name} + ${items[1].name} Combo`
          : `${firstItem.name} Combo`,
      subtitle:
        items.length >= 2
          ? `${items.length} dishes bundled together`
          : "Add one more dish to complete the combo",
      description:
        items.length >= 2
          ? `Bundle ${combinedNames} into one higher-converting combo offer.`
          : `Start building a combo around ${firstItem.name}.`,
      badgeLabel: "Combo",
      terms: "Available while all selected dishes are in stock.",
      promoPrice:
        items.length >= 2 ? formatSuggestedPrice(totalPrice * 0.88) : "",
    };
  }

  return {
    title:
      items.length === 1
        ? `${firstItem.name} House Deal`
        : `${items[0].name} & More`,
    subtitle: "Merchandise this offer above the menu",
    description: `Feature ${combinedNames} as a seasonal or time-bound deal.`,
    badgeLabel: "Special",
    terms: "Availability may vary by service window.",
    promoPrice: "",
  };
}

function getStatusBadgeVariant(status: ReturnType<typeof getPromotionStatus>) {
  if (status === "live") {
    return "success";
  }

  if (status === "scheduled") {
    return "muted";
  }

  return "accent";
}

type PromotionStats = {
  total: number;
  live: number;
  scheduled: number;
  inactive: number;
  expired: number;
};

function getTypeLabel(type: PromotionType) {
  if (type === "discounted_item") {
    return "Discounted item";
  }

  if (type === "combo") {
    return "Combo";
  }

  return "Deal";
}

export function PromotionManager({
  restaurant,
  sections,
  promotions,
  onRefresh,
}: {
  restaurant: Restaurant;
  sections: MenuSection[];
  promotions: Promotion[];
  onRefresh: () => Promise<void>;
}) {
  const { getToken } = useAuth();
  const [form, setForm] = useState<PromotionFormState>(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userEditedFields, setUserEditedFields] = useState<AutoFillField[]>([]);
  const [autoFilledFields, setAutoFilledFields] = useState<AutoFillField[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<Record<Exclude<AutoFillField, "promoPrice">, string> | null>(null);
  const [aiUsage, setAiUsage] = useState<{ used: number; limit: number | null } | null>(null);

  const allItems = useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.map((item) => ({
          ...item,
          sectionName: section.name,
        }))
      ),
    [sections]
  );

  const selectedItems = useMemo(() => {
    const itemMap = new Map(allItems.map((item) => [item.id, item]));
    return form.itemIds
      .map((itemId) => itemMap.get(itemId))
      .filter((item): item is (typeof allItems)[number] => Boolean(item));
  }, [allItems, form.itemIds]);

  const promotionsWithStatus = useMemo(
    () =>
      promotions.map((promotion) => ({
        promotion,
        status: getPromotionStatus(promotion),
      })),
    [promotions]
  );

  const stats = useMemo(() => {
    return promotionsWithStatus.reduce(
      (acc, entry) => {
        acc.total += 1;
        acc[entry.status as PromotionStatus] += 1;
        return acc;
      },
      { total: 0, live: 0, scheduled: 0, inactive: 0, expired: 0 } as PromotionStats
    );
  }, [promotionsWithStatus]);
  const previewCurrency = selectedItems[0]?.currency ?? "AED";
  const selectedItemsLabel =
    selectedItems.length > 0
      ? selectedItems.map((item) => item.name).join(" • ")
      : "Select dishes to build the offer preview.";
  const previewBadge =
    form.badgeLabel.trim() ||
    (form.type === "combo"
      ? "Combo"
      : form.type === "deal"
        ? "House special"
        : "Deal");

  useEffect(() => {
    if (form.id) {
      const refreshed = promotions.find((promotion) => promotion.id === form.id);
      if (refreshed) {
        setForm(createFormFromPromotion(refreshed));
        return;
      }
    }

    if (!form.id && promotions.length === 0) {
      setForm(createEmptyForm());
    }
  }, [form.id, promotions]);

  useEffect(() => {
    if (form.id || form.itemIds.length === 0) {
      return;
    }

    const suggestions = buildAutoFillValues(form.type, selectedItems);
    if (!suggestions) {
      return;
    }

    const nextAutoFilled = new Set(autoFilledFields);
    const updates: Partial<PromotionFormState> = {};

    (Object.entries(suggestions) as Array<[AutoFillField, string]>).forEach(
      ([field, suggestedValue]) => {
        const currentValue = form[field];
        const isManual = userEditedFields.includes(field);
        const isAutoFilled = autoFilledFields.includes(field);
        const isEmpty = !currentValue.trim();

        if (!isManual && (isEmpty || isAutoFilled) && currentValue !== suggestedValue) {
          updates[field] = suggestedValue;
          nextAutoFilled.add(field);
        }
      }
    );

    if (Object.keys(updates).length === 0) {
      return;
    }

    setForm((current) => ({ ...current, ...updates }));
    setAutoFilledFields(Array.from(nextAutoFilled));
  }, [autoFilledFields, form, selectedItems, userEditedFields]);

  function updateForm(patch: Partial<PromotionFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function resetAutoFillTracking() {
    setUserEditedFields([]);
    setAutoFilledFields([]);
    setAiSuggestion(null);
    setAiUsage(null);
  }

  function updateTextField(field: AutoFillField, value: string) {
    updateForm({ [field]: value } as Partial<PromotionFormState>);
    setUserEditedFields((current) =>
      current.includes(field) ? current : [...current, field]
    );
    setAutoFilledFields((current) => current.filter((entry) => entry !== field));
  }

  async function askSousChef() {
    if (selectedItems.length === 0) {
      toast.error("Select at least one dish first.");
      return;
    }

    setAiLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const result = await apiClient.suggestPromotionContent(token, {
        restaurantId: restaurant.id,
        type: form.type,
        itemIds: selectedItems.map((item) => item.id),
        title: form.title || null,
        subtitle: form.subtitle || null,
        description: form.description || null,
        badgeLabel: form.badgeLabel || null,
        terms: form.terms || null,
        promoPrice: form.promoPrice || null,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      });

      setAiSuggestion(result.suggestion);
      setAiUsage(result.usage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sous Chef could not draft offer copy.");
    } finally {
      setAiLoading(false);
    }
  }

  function applyAiSuggestion() {
    if (!aiSuggestion) {
      return;
    }

    setForm((current) => ({
      ...current,
      title: aiSuggestion.title,
      subtitle: aiSuggestion.subtitle,
      description: aiSuggestion.description,
      badgeLabel: aiSuggestion.badgeLabel,
      terms: aiSuggestion.terms,
    }));
    setAutoFilledFields((current) => {
      const next = new Set(current);
      ["title", "subtitle", "description", "badgeLabel", "terms"].forEach((field) =>
        next.add(field as AutoFillField)
      );
      return Array.from(next);
    });
    setAiSuggestion(null);
    toast.success("Sous Chef copied draft into the offer.");
  }

  function startNewPromotion(type: PromotionType) {
    resetAutoFillTracking();
    setForm(createEmptyForm(type));
  }

  function selectPromotion(promotion: Promotion) {
    resetAutoFillTracking();
    setForm(createFormFromPromotion(promotion));
  }

  function toggleItem(menuItemId: string) {
    setForm((current) => {
      const selected = current.itemIds.includes(menuItemId);

      if (current.type === "discounted_item") {
        return {
          ...current,
          itemIds: selected ? [] : [menuItemId],
        };
      }

      return {
        ...current,
        itemIds: selected
          ? current.itemIds.filter((id) => id !== menuItemId)
          : [...current.itemIds, menuItemId],
      };
    });
  }

  function handleTypeChange(type: PromotionType) {
    setForm((current) => ({
      ...current,
      type,
      itemIds:
        type === "discounted_item" ? current.itemIds.slice(0, 1) : current.itemIds,
      promoPrice: type === "deal" ? current.promoPrice : current.promoPrice,
    }));
  }

  async function savePromotion() {
    if (!form.title.trim()) {
      toast.error("Offer title is required.");
      return;
    }

    if (form.itemIds.length === 0) {
      toast.error("Select at least one linked dish.");
      return;
    }

    if (form.type === "discounted_item" && form.itemIds.length !== 1) {
      toast.error("Discounted item offers must target exactly one dish.");
      return;
    }

    if (form.type === "combo" && form.itemIds.length < 2) {
      toast.error("Combos need at least two linked dishes.");
      return;
    }

    if ((form.type === "discounted_item" || form.type === "combo") && !form.promoPrice.trim()) {
      toast.error("Add a promotional price for this offer.");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const payload = {
        restaurantId: restaurant.id,
        type: form.type,
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        badgeLabel: form.badgeLabel.trim() || null,
        terms: form.terms.trim() || null,
        promoPrice: form.promoPrice.trim() ? Number(form.promoPrice) : null,
        startsAt: toIsoOrNull(form.startsAt),
        endsAt: toIsoOrNull(form.endsAt),
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        items: form.itemIds.map((menuItemId, index) => ({
          menuItemId,
          displayOrder: index,
        })),
      };

      if (form.id) {
        await apiClient.updatePromotion(token, form.id, payload);
      } else {
        await apiClient.createPromotion(token, payload);
      }

      await onRefresh();
      toast.success(form.id ? "Offer updated." : "Offer created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save offer.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePromotion() {
    if (!form.id) {
      setForm(createEmptyForm(form.type));
      return;
    }

    setDeleting(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiClient.deletePromotion(token, form.id);
      await onRefresh();
      resetAutoFillTracking();
      setForm(createEmptyForm());
      toast.success("Offer deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete offer.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="animate-rise-in overflow-hidden border-[#E7DAC5] bg-[linear-gradient(180deg,#FFFDF9,#FFF7ED)] shadow-[0_20px_60px_rgba(32,26,23,0.06)]">
          <CardHeader className="border-b border-[#F3E8D8] bg-[radial-gradient(circle_at_top_right,rgba(232,163,23,0.15),transparent_38%)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone">
                  Offers library
                </div>
                <CardTitle className="mt-3 text-2xl tracking-[-0.03em]">Build sharper merchandising moments</CardTitle>
                <p className="mt-2 text-sm leading-6 text-stone">
                  Create time-bound discounts, merchandised deals, and shareable combos.
                </p>
              </div>
              <Button variant="secondary" onClick={() => startNewPromotion("discounted_item")}>
                <Plus className="h-4 w-4" />
                New offer
              </Button>
            </div>
            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-[22px] font-bold leading-none text-ink">{stats.total}</span>
              <span className="text-[12px] text-stone/70">total</span>
              {stats.live > 0 ? (
                <>
                  <span className="text-[12px] text-stone/40">/</span>
                  <span className="text-[22px] font-bold leading-none text-[#2E8B57]">{stats.live}</span>
                  <span className="text-[12px] text-[#2E8B57]/70">live</span>
                </>
              ) : null}
              {stats.scheduled > 0 ? (
                <>
                  <span className="text-[12px] text-stone/40">/</span>
                  <span className="text-[22px] font-bold leading-none text-stone/60">{stats.scheduled}</span>
                  <span className="text-[12px] text-stone/70">scheduled</span>
                </>
              ) : null}
              {(stats.inactive + stats.expired) > 0 ? (
                <>
                  <span className="text-[12px] text-stone/40">/</span>
                  <span className="text-[22px] font-bold leading-none text-stone/40">{stats.inactive + stats.expired}</span>
                  <span className="text-[12px] text-stone/50">inactive</span>
                </>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => startNewPromotion("discounted_item")}>
                <Percent className="h-4 w-4" />
                Discount
              </Button>
              <Button variant="secondary" size="sm" onClick={() => startNewPromotion("deal")}>
                <Sparkles className="h-4 w-4" />
                Deal
              </Button>
              <Button variant="secondary" size="sm" onClick={() => startNewPromotion("combo")}>
                <Clock3 className="h-4 w-4" />
                Combo
              </Button>
            </div>

            {promotions.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#E7DAC5] bg-white/80 p-5 text-sm leading-6 text-stone">
                No offers yet. Start with a discounted signature dish, a time-bound lunch deal, or a combo built from existing menu items.
              </div>
            ) : (
              <div className="space-y-3">
                {promotionsWithStatus.map(({ promotion, status }) => {
                  const isSelected = promotion.id === form.id;
                  const primaryItem = promotion.items[0]?.menuItem;

                  return (
                    <button
                      key={promotion.id}
                      type="button"
                      onClick={() => selectPromotion(promotion)}
                      className={`w-full rounded-[24px] border p-4 text-left transition duration-300 ${
                        isSelected
                          ? "border-[#D49A2A] bg-[linear-gradient(180deg,#FFF8EE,#FFF3DD)] shadow-[0_16px_44px_rgba(212,154,42,0.12)]"
                          : "border-[#EADFCC] bg-white/90 hover:-translate-y-0.5 hover:border-[#DFC59B] hover:shadow-[0_12px_30px_rgba(32,26,23,0.06)]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-medium text-stone/60">{getTypeLabel(promotion.type)}</span>
                            <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              status === "live"
                                ? "bg-[#2E8B57]/8 text-[#206B48]"
                                : status === "scheduled"
                                  ? "bg-[#E8A317]/8 text-[#9A7210]"
                                  : "bg-stone/8 text-stone"
                            }`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${
                                status === "live" ? "bg-[#2E8B57]" : status === "scheduled" ? "bg-[#E8A317]" : "bg-stone/40"
                              }`} />
                              {status}
                            </div>
                            {promotion.isFeatured ? (
                              <span className="text-[11px] font-medium text-[#2E8B57]/70">Featured</span>
                            ) : null}
                          </div>
                          <h3 className="mt-2.5 text-base font-semibold text-ink">{promotion.title}</h3>
                          {promotion.subtitle ? (
                            <p className="mt-1 text-sm leading-6 text-stone">{promotion.subtitle}</p>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <div className="text-xs uppercase tracking-[0.18em] text-stone">
                            {getPromotionBadge(promotion)}
                          </div>
                          {promotion.promoPrice ? (
                            <div className="mt-2 text-base font-semibold text-[#B26700]">
                              {formatCurrency(
                                promotion.promoPrice,
                                primaryItem?.currency ?? "AED"
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-stone">
                        {promotion.items.map((item) => item.menuItem.name).join(" • ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-rise-in overflow-hidden border-[#E7DAC5] shadow-[0_20px_60px_rgba(32,26,23,0.07)]">
          <CardHeader className="border-b border-[#F3E8D8] bg-[linear-gradient(180deg,#FFFDF9,#FFF8EE)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone">
              Offer editor
            </div>
            <CardTitle className="mt-3 text-2xl tracking-[-0.03em]">
              {form.id ? "Refine the offer" : "Compose a new offer"}
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-stone">
              Keep base dish pricing untouched. Offers sit on top and can be scheduled, featured, or paused independently.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="overflow-hidden rounded-[28px] border border-[#ECD9B6] bg-[linear-gradient(135deg,#201A17,#6D3B22)] p-5 text-white shadow-[0_18px_44px_rgba(32,26,23,0.16)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-lg">
                  <div className="inline-flex rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    {previewBadge}
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                    {form.title || "Your offer headline appears here"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    {form.description || "Use this space to pressure-test the message before it goes live on the hosted menu."}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/65">
                    {form.type === "combo" ? "Combo price" : "Promo price"}
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
                    {form.promoPrice.trim() ? formatCurrency(form.promoPrice, previewCurrency) : "Add pricing"}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/80">
                <span className="rounded-full bg-white/10 px-3 py-1">{selectedItemsLabel}</span>
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {form.isActive ? "Visible" : "Paused"}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {form.isFeatured ? "Featured rail" : "Inline only"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] uppercase tracking-[0.18em] text-stone">Offer type</Label>
              <div className="grid gap-3 md:grid-cols-3">
                {(["discounted_item", "deal", "combo"] as PromotionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`rounded-[22px] border px-4 py-4 text-left transition ${
                      form.type === type
                        ? "border-[#D49A2A] bg-[linear-gradient(180deg,#FFF8EE,#FFF2DA)] shadow-[0_10px_26px_rgba(212,154,42,0.10)]"
                        : "border-[#E7DAC5] bg-white hover:border-[#DFC59B]"
                    }`}
                  >
                    <div className="font-medium text-ink">{getTypeLabel(type)}</div>
                    <div className="mt-1 text-xs leading-5 text-stone">
                      {type === "discounted_item"
                        ? "One dish with a lower promo price."
                        : type === "deal"
                          ? "A merchandised offer card, optional promo price."
                          : "Bundle multiple dishes into one combo."}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 rounded-[28px] border border-[#EADFCC] bg-[#FFFDF9] p-5 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone">
                  Messaging & pricing
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void askSousChef()}
                  disabled={aiLoading || selectedItems.length === 0}
                  className="bg-[#FFFBF0] text-[#B8960C] hover:bg-[#FFF3D6]"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {aiLoading ? "Sous Chef thinking..." : "Sous Chef AI"}
                </Button>
              </div>

              {aiSuggestion ? (
                <div className="md:col-span-2 rounded-[22px] border border-[#E8C66A]/30 bg-[#FFFBF0] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-[#B8960C]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Sous Chef suggestion
                      </div>
                      <p className="mt-2 text-sm text-stone">
                        Recommended copy based on the selected dishes and offer type.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={applyAiSuggestion} className="h-8 text-xs">
                        <Check className="h-3.5 w-3.5" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAiSuggestion(null)}
                        className="h-8 text-xs"
                      >
                        <X className="h-3.5 w-3.5" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[18px] bg-white/80 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-stone">Title</div>
                      <div className="mt-1 text-sm font-medium text-ink">{aiSuggestion.title}</div>
                    </div>
                    <div className="rounded-[18px] bg-white/80 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-stone">Subtitle</div>
                      <div className="mt-1 text-sm font-medium text-ink">{aiSuggestion.subtitle}</div>
                    </div>
                    <div className="rounded-[18px] bg-white/80 p-3 md:col-span-2">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-stone">Description</div>
                      <div className="mt-1 text-sm leading-6 text-ink">{aiSuggestion.description}</div>
                    </div>
                    <div className="rounded-[18px] bg-white/80 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-stone">Badge</div>
                      <div className="mt-1 text-sm font-medium text-ink">{aiSuggestion.badgeLabel}</div>
                    </div>
                    <div className="rounded-[18px] bg-white/80 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-stone">Terms</div>
                      <div className="mt-1 text-sm leading-6 text-ink">{aiSuggestion.terms}</div>
                    </div>
                  </div>
                  {aiUsage && aiUsage.limit !== null ? (
                    <p className="mt-3 text-[11px] text-stone">
                      {aiUsage.used} of {aiUsage.limit} AI writing suggestions used this month
                    </p>
                  ) : null}
                </div>
              ) : null}

              {!aiSuggestion && aiUsage && aiUsage.limit !== null ? (
                <div className="md:col-span-2 text-[11px] text-stone">
                  {aiUsage.used} of {aiUsage.limit} AI writing suggestions used this month
                </div>
              ) : null}

              <div className="md:col-span-2 text-xs leading-5 text-stone">
                Sous Chef drafts offer copy from the selected dishes. It won&apos;t touch your promo price.
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  placeholder="Lunch combo for two"
                  onChange={(event) => updateTextField("title", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={form.subtitle}
                  placeholder="Available weekdays 12-4pm"
                  onChange={(event) => updateTextField("subtitle", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Badge label</Label>
                <Input
                  value={form.badgeLabel}
                  placeholder="Best seller"
                  onChange={(event) => updateTextField("badgeLabel", event.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  placeholder="Two mains, one side, and a soft drink at a sharper price."
                  onChange={(event) => updateTextField("description", event.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Terms</Label>
                <Input
                  value={form.terms}
                  placeholder="Dine-in only. Not combinable with other offers."
                  onChange={(event) => updateTextField("terms", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{form.type === "combo" ? "Combo price" : "Promo price"}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.promoPrice}
                  placeholder={form.type === "deal" ? "Optional" : "49"}
                  onChange={(event) => updateTextField("promoPrice", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="flex min-h-10 flex-wrap items-center gap-4 rounded-[16px] border border-[#E7DAC5] bg-white px-4 py-2">
                  <label className="inline-flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) => updateForm({ isActive: event.target.checked })}
                    />
                    Active
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(event) => updateForm({ isFeatured: event.target.checked })}
                    />
                    Featured
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Starts at</Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => updateForm({ startsAt: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ends at</Label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(event) => updateForm({ endsAt: event.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-[11px] uppercase tracking-[0.18em] text-stone">Linked dishes</Label>
                <div className="text-xs text-stone">
                  {form.type === "discounted_item"
                    ? "Select exactly one dish."
                    : form.type === "combo"
                      ? "Select two or more dishes."
                      : "Select any dishes that this deal applies to."}
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-[#E7DAC5] bg-[#FFFDF9] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                {sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                      {section.name}
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {section.items.map((item) => {
                        const selected = form.itemIds.includes(item.id);

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className={`flex items-center justify-between rounded-[20px] border px-4 py-3 text-left transition ${
                              selected
                                ? "border-[#D49A2A] bg-[linear-gradient(180deg,#FFF8EE,#FFF2DA)] shadow-[0_10px_24px_rgba(212,154,42,0.10)]"
                                : "border-[#E7DAC5] bg-white hover:border-[#DFC59B]"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium text-ink">{item.name}</div>
                              <div className="text-xs text-stone">{section.name}</div>
                            </div>
                            <div className="ml-3 shrink-0 text-sm font-medium text-stone">
                              {formatCurrency(item.price, item.currency)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#E7DAC5]/70 bg-[rgba(255,248,238,0.5)] px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] font-medium text-stone/60">{getTypeLabel(form.type)}</span>
                <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  form.isActive
                    ? "bg-[#2E8B57]/8 text-[#206B48]"
                    : "bg-[#FFDCD6]/50 text-[#9E3B2D]"
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${form.isActive ? "bg-[#2E8B57]" : "bg-[#9E3B2D]"}`} />
                  {form.isActive ? "Active" : "Paused"}
                </div>
                {form.isFeatured ? (
                  <span className="text-[11px] font-medium text-[#2E8B57]/70">Featured</span>
                ) : null}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-stone/70">
                {selectedItemsLabel}
              </p>
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex gap-3">
                <Button onClick={() => void savePromotion()} disabled={saving}>
                  {saving ? "Saving..." : form.id ? "Save offer" : "Create offer"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetAutoFillTracking();
                    setForm(form.id ? createEmptyForm(form.type) : createEmptyForm());
                  }}
                >
                  Reset
                </Button>
              </div>
              <Button
                variant="ghost"
                disabled={deleting || saving}
                onClick={() => void deletePromotion()}
                className="text-[#A13F2C] hover:bg-[#FFF1ED] hover:text-[#A13F2C]"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
