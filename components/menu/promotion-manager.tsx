"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Clock3, Percent, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { getPromotionBadge, getPromotionStatus } from "@/lib/promotions";
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

function getStatusBadgeVariant(status: ReturnType<typeof getPromotionStatus>) {
  if (status === "live") {
    return "success";
  }

  if (status === "scheduled") {
    return "muted";
  }

  return "accent";
}

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

  const stats = useMemo(() => {
    return promotions.reduce(
      (acc, promotion) => {
        const status = getPromotionStatus(promotion);
        acc.total += 1;
        acc[status] += 1;
        return acc;
      },
      { total: 0, live: 0, scheduled: 0, inactive: 0, expired: 0 }
    );
  }, [promotions]);

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

  function updateForm(patch: Partial<PromotionFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function startNewPromotion(type: PromotionType) {
    setForm(createEmptyForm(type));
  }

  function selectPromotion(promotion: Promotion) {
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
        <Card className="border-[#E7DAC5]">
          <CardHeader className="border-b border-[#F3E8D8]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Offers library</CardTitle>
                <p className="mt-2 text-sm text-stone">
                  Create time-bound discounts, merchandised deals, and shareable combos.
                </p>
              </div>
              <Button variant="secondary" onClick={() => startNewPromotion("discounted_item")}>
                <Plus className="h-4 w-4" />
                New offer
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="muted">{stats.total} total</Badge>
              <Badge variant="success">{stats.live} live</Badge>
              <Badge variant="muted">{stats.scheduled} scheduled</Badge>
              <Badge variant="accent">{stats.inactive + stats.expired} inactive</Badge>
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
              <div className="rounded-[24px] border border-dashed border-[#E7DAC5] bg-[#FFF8EE] p-5 text-sm text-stone">
                No offers yet. Start with a discounted signature dish, a time-bound lunch deal, or a combo built from existing menu items.
              </div>
            ) : (
              <div className="space-y-3">
                {promotions.map((promotion) => {
                  const status = getPromotionStatus(promotion);
                  const isSelected = promotion.id === form.id;
                  const primaryItem = promotion.items[0]?.menuItem;

                  return (
                    <button
                      key={promotion.id}
                      type="button"
                      onClick={() => selectPromotion(promotion)}
                      className={`w-full rounded-[22px] border p-4 text-left transition ${
                        isSelected
                          ? "border-[#D49A2A] bg-[#FFF8EE] shadow-sm"
                          : "border-[#EADFCC] bg-white hover:border-[#DFC59B]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="muted">{getTypeLabel(promotion.type)}</Badge>
                            <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                            {promotion.isFeatured ? <Badge variant="success">Featured</Badge> : null}
                          </div>
                          <h3 className="mt-3 text-base font-semibold text-ink">{promotion.title}</h3>
                          {promotion.subtitle ? (
                            <p className="mt-1 text-sm text-stone">{promotion.subtitle}</p>
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
                      <p className="mt-3 text-sm text-stone">
                        {promotion.items.map((item) => item.menuItem.name).join(" • ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#E7DAC5]">
          <CardHeader className="border-b border-[#F3E8D8]">
            <CardTitle>{form.id ? "Edit offer" : "Create offer"}</CardTitle>
            <p className="mt-2 text-sm text-stone">
              Keep base dish pricing untouched. Offers sit on top and can be scheduled, featured, or paused independently.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-3">
              <Label>Offer type</Label>
              <div className="grid gap-3 md:grid-cols-3">
                {(["discounted_item", "deal", "combo"] as PromotionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`rounded-[20px] border px-4 py-3 text-left transition ${
                      form.type === type
                        ? "border-[#D49A2A] bg-[#FFF8EE]"
                        : "border-[#E7DAC5] bg-white hover:border-[#DFC59B]"
                    }`}
                  >
                    <div className="font-medium text-ink">{getTypeLabel(type)}</div>
                    <div className="mt-1 text-xs text-stone">
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  placeholder="Lunch combo for two"
                  onChange={(event) => updateForm({ title: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={form.subtitle}
                  placeholder="Available weekdays 12-4pm"
                  onChange={(event) => updateForm({ subtitle: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Badge label</Label>
                <Input
                  value={form.badgeLabel}
                  placeholder="Best seller"
                  onChange={(event) => updateForm({ badgeLabel: event.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  placeholder="Two mains, one side, and a soft drink at a sharper price."
                  onChange={(event) => updateForm({ description: event.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Terms</Label>
                <Input
                  value={form.terms}
                  placeholder="Dine-in only. Not combinable with other offers."
                  onChange={(event) => updateForm({ terms: event.target.value })}
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
                  onChange={(event) => updateForm({ promoPrice: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="flex h-10 items-center gap-4 rounded-[16px] border border-[#E7DAC5] px-4">
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
                <Label>Linked dishes</Label>
                <div className="text-xs text-stone">
                  {form.type === "discounted_item"
                    ? "Select exactly one dish."
                    : form.type === "combo"
                      ? "Select two or more dishes."
                      : "Select any dishes that this deal applies to."}
                </div>
              </div>

              <div className="space-y-4 rounded-[24px] border border-[#E7DAC5] bg-[#FFFDF9] p-4">
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
                            className={`flex items-center justify-between rounded-[18px] border px-4 py-3 text-left transition ${
                              selected
                                ? "border-[#D49A2A] bg-[#FFF8EE]"
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

            <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="muted">{getTypeLabel(form.type)}</Badge>
                {form.isFeatured ? <Badge variant="success">Featured</Badge> : null}
                {form.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="accent">Paused</Badge>}
              </div>
              <div className="mt-3 text-sm text-stone">
                {selectedItems.length > 0
                  ? selectedItems.map((item) => item.name).join(" • ")
                  : "No linked dishes selected yet."}
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex gap-3">
                <Button onClick={() => void savePromotion()} disabled={saving}>
                  {saving ? "Saving..." : form.id ? "Save offer" : "Create offer"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setForm(form.id ? createEmptyForm(form.type) : createEmptyForm())}
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
