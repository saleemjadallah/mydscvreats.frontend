"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChefHat,
  Clock,
  Flame,
  Heart,
  Moon,
  Percent,
  Plus,
  Sparkles,
  Star,
  Sun,
  Tag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import type { BadgeType, MenuSection } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  sparkles: Sparkles,
  "chef-hat": ChefHat,
  "trending-up": TrendingUp,
  heart: Heart,
  clock: Clock,
  moon: Moon,
  sun: Sun,
  star: Star,
  percent: Percent,
  tag: Tag,
  users: Users,
};

function BadgeIcon({ iconKey, className }: { iconKey: string | null; className?: string }) {
  if (!iconKey) return null;
  const Icon = ICON_MAP[iconKey];
  if (!Icon) return null;
  return <Icon className={className} />;
}

interface BadgeManagerProps {
  restaurantId: string;
  sections: MenuSection[];
  onClose: () => void;
  onApplied: () => Promise<void>;
}

export function BadgeManager({
  restaurantId,
  sections,
  onClose,
  onApplied,
}: BadgeManagerProps) {
  const { getToken } = useAuth();
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [addingBadgeFor, setAddingBadgeFor] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const allItems = sections.flatMap((s) =>
    s.items.map((i) => ({ ...i, sectionName: s.name }))
  );

  const loadBadges = useCallback(async () => {
    try {
      const badges = await apiClient.getBadgeTypes();
      setAllBadges(badges);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    void loadBadges();
  }, [loadBadges]);

  async function toggleBadge(itemId: string, badgeId: string) {
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;

    setSaving(itemId);
    try {
      const token = await getToken();
      if (!token) return;

      const existing = item.badges ?? [];
      const alreadyHas = existing.some((b) => b.badgeId === badgeId);

      const newBadges = alreadyHas
        ? existing.filter((b) => b.badgeId !== badgeId).map((b) => ({ badgeId: b.badgeId }))
        : [...existing.map((b) => ({ badgeId: b.badgeId })), { badgeId }];

      await apiClient.setItemBadges(token, itemId, newBadges);
      toast.success(alreadyHas ? "Badge removed" : "Badge added");
      await onApplied();
    } catch {
      toast.error("Failed to update badges");
    } finally {
      setSaving(null);
    }
  }

  async function removeBadge(itemId: string, badgeId: string) {
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;

    setSaving(itemId);
    try {
      const token = await getToken();
      if (!token) return;

      const newBadges = (item.badges ?? [])
        .filter((b) => b.badgeId !== badgeId)
        .map((b) => ({ badgeId: b.badgeId }));

      await apiClient.setItemBadges(token, itemId, newBadges);
      toast.success("Badge removed");
      await onApplied();
    } catch {
      toast.error("Failed to remove badge");
    } finally {
      setSaving(null);
    }
  }

  const badgesByCategory = allBadges.reduce<Record<string, BadgeType[]>>((acc, b) => {
    (acc[b.category] ??= []).push(b);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    promotion: "Highlights",
    seasonal: "Seasonal & Events",
    value: "Value & Sizing",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Menu Item Badges
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-5 space-y-5">
          <p className="text-sm text-stone">
            Add badges like &ldquo;Best Seller&rdquo;, &ldquo;New&rdquo;, or &ldquo;Ramadan Special&rdquo; to highlight menu items for your customers.
          </p>

          <div className="space-y-3">
            {allItems.map((item) => {
              const existingBadges = item.badges ?? [];
              const isItemSaving = saving === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#E7DAC5] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink">{item.name}</p>
                        <span className="text-xs text-stone">({item.sectionName})</span>
                      </div>
                      {item.description && (
                        <p className="mt-1 text-xs text-stone line-clamp-1">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {/* Existing badges */}
                    {existingBadges.map((mb) => (
                      <span
                        key={mb.id}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: mb.badge.color,
                          color: mb.badge.textColor,
                        }}
                      >
                        <BadgeIcon iconKey={mb.badge.icon} className="h-3 w-3" />
                        {mb.badge.label}
                        <button
                          type="button"
                          onClick={() => removeBadge(item.id, mb.badgeId)}
                          disabled={isItemSaving}
                          className="rounded-full p-0.5 hover:opacity-70"
                          title="Remove badge"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}

                    {/* Add badge picker */}
                    {addingBadgeFor === item.id ? (
                      <div className="flex flex-col gap-2 w-full mt-2">
                        {Object.entries(badgesByCategory).map(([category, badges]) => (
                          <div key={category}>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-stone mb-1">
                              {categoryLabels[category] ?? category}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {badges
                                .filter((b) => !existingBadges.some((eb) => eb.badgeId === b.id))
                                .map((badge) => (
                                  <button
                                    key={badge.id}
                                    type="button"
                                    onClick={() => toggleBadge(item.id, badge.id)}
                                    disabled={isItemSaving}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-xs font-medium transition-colors hover:border-solid"
                                    style={{
                                      borderColor: badge.color,
                                      color: badge.textColor,
                                    }}
                                  >
                                    <BadgeIcon iconKey={badge.icon} className="h-3 w-3" />
                                    {badge.label}
                                  </button>
                                ))}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setAddingBadgeFor(null)}
                          className="self-start rounded-full px-2.5 py-1 text-xs text-stone hover:text-ink"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingBadgeFor(item.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#D8C7AF] px-2.5 py-1 text-xs text-stone hover:border-[#B8960C] hover:text-[#8A7209]"
                      >
                        <Plus className="h-3 w-3" />
                        Add badge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
