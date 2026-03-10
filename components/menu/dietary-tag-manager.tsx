"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Plus, Sparkles, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import type { DietaryTag, ItemTagSuggestions, MenuSection } from "@/types";

interface DietaryTagManagerProps {
  restaurantId: string;
  sections: MenuSection[];
  onClose: () => void;
  onApplied: () => Promise<void>;
}

export function DietaryTagManager({
  restaurantId,
  sections,
  onClose,
  onApplied,
}: DietaryTagManagerProps) {
  const { getToken } = useAuth();
  const [allTags, setAllTags] = useState<DietaryTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<ItemTagSuggestions[] | null>(null);
  const [applying, setApplying] = useState(false);
  const [addingTagFor, setAddingTagFor] = useState<string | null>(null);

  const allItems = sections.flatMap((s) =>
    s.items.map((i) => ({ ...i, sectionName: s.name }))
  );
  const itemMap = new Map(allItems.map((i) => [i.id, i]));

  const loadTags = useCallback(async () => {
    try {
      const tags = await apiClient.getDietaryTags();
      setAllTags(tags);
    } catch {
      // Silently fail — tags will be empty
    }
  }, []);

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  async function analyze() {
    setAnalyzing(true);
    try {
      const token = await getToken();
      if (!token) return;
      const result = await apiClient.suggestTags(token, restaurantId);
      setSuggestions(result.suggestions);
      if (!result.suggestions.length) {
        toast.message("No dietary tag suggestions found.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to analyze menu");
    } finally {
      setAnalyzing(false);
    }
  }

  async function confirmAll() {
    if (!suggestions) return;
    setApplying(true);
    try {
      const token = await getToken();
      if (!token) return;
      const tagMap = new Map(allTags.map((t) => [t.key, t.id]));
      const actions = suggestions.flatMap((item) =>
        item.tags
          .filter((t) => tagMap.has(t.tagKey))
          .map((t) => ({
            menuItemId: item.menuItemId,
            tagId: tagMap.get(t.tagKey)!,
            action: "confirm" as const,
          }))
      );
      await apiClient.confirmTagsBulk(token, actions);
      toast.success(`Confirmed ${actions.length} tag${actions.length === 1 ? "" : "s"}`);
      await onApplied();
      onClose();
    } catch (error) {
      toast.error("Failed to confirm tags");
    } finally {
      setApplying(false);
    }
  }

  async function confirmSingle(menuItemId: string, tagKey: string) {
    const tagMap = new Map(allTags.map((t) => [t.key, t.id]));
    const tagId = tagMap.get(tagKey);
    if (!tagId) return;
    try {
      const token = await getToken();
      if (!token) return;
      await apiClient.confirmTagsBulk(token, [
        { menuItemId, tagId, action: "confirm" },
      ]);
      toast.success("Tag confirmed");
      // Remove from suggestions
      setSuggestions((prev) =>
        prev?.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, tags: item.tags.filter((t) => t.tagKey !== tagKey) }
            : item
        ) ?? null
      );
    } catch {
      toast.error("Failed to confirm tag");
    }
  }

  async function rejectSingle(menuItemId: string, tagKey: string) {
    setSuggestions((prev) =>
      prev?.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, tags: item.tags.filter((t) => t.tagKey !== tagKey) }
          : item
      ) ?? null
    );
  }

  async function addManualTag(itemId: string, tagId: string) {
    try {
      const token = await getToken();
      if (!token) return;
      const item = itemMap.get(itemId);
      const existingTags = item?.dietaryTags?.map((dt) => ({
        tagId: dt.tagId,
        source: dt.source,
      })) ?? [];
      await apiClient.setItemTags(token, itemId, [
        ...existingTags,
        { tagId, source: "manual" },
      ]);
      toast.success("Tag added");
      setAddingTagFor(null);
      await onApplied();
    } catch {
      toast.error("Failed to add tag");
    }
  }

  function getConfidenceColor(confidence: number) {
    if (confidence >= 0.9) return "bg-[#2E8B57]/10 text-[#2E8B57] border-[#2E8B57]/20";
    if (confidence >= 0.7) return "bg-[#B8960C]/10 text-[#8A7209] border-[#B8960C]/20";
    return "bg-stone/10 text-stone border-stone/20";
  }

  const tagMap = new Map(allTags.map((t) => [t.key, t]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            Dietary & Allergen Tags
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex flex-wrap gap-3">
            <Button onClick={analyze} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing menu...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Menu
                </>
              )}
            </Button>
            {suggestions && suggestions.some((s) => s.tags.length > 0) && (
              <Button variant="secondary" onClick={confirmAll} disabled={applying}>
                {applying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Confirm All
              </Button>
            )}
          </div>

          {/* Current tags on items */}
          <div className="space-y-3">
            {allItems.map((item) => {
              const itemSuggestions = suggestions?.find((s) => s.menuItemId === item.id);
              const existingTags = item.dietaryTags ?? [];

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
                    {/* Existing confirmed tags */}
                    {existingTags.map((dt) => (
                      <Badge
                        key={dt.id}
                        variant="muted"
                        className="gap-1"
                      >
                        {dt.tag.icon && <span>{dt.tag.icon}</span>}
                        {dt.tag.label}
                      </Badge>
                    ))}

                    {/* AI suggestions */}
                    {itemSuggestions?.tags.map((tagSugg) => {
                      const tag = tagMap.get(tagSugg.tagKey);
                      if (!tag) return null;
                      // Skip if already confirmed
                      if (existingTags.some((et) => et.tag.key === tagSugg.tagKey)) return null;

                      return (
                        <div
                          key={tagSugg.tagKey}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${getConfidenceColor(tagSugg.confidence)}`}
                          title={tagSugg.reasoning}
                        >
                          {tag.icon && <span>{tag.icon}</span>}
                          {tag.label}
                          <span className="opacity-60">
                            {Math.round(tagSugg.confidence * 100)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => confirmSingle(item.id, tagSugg.tagKey)}
                            className="rounded-full p-0.5 hover:bg-[#2E8B57]/20"
                            title="Confirm"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectSingle(item.id, tagSugg.tagKey)}
                            className="rounded-full p-0.5 hover:bg-red-100"
                            title="Reject"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Add manual tag */}
                    {addingTagFor === item.id ? (
                      <div className="flex flex-wrap gap-1">
                        {allTags
                          .filter(
                            (t) =>
                              !existingTags.some((et) => et.tagId === t.id) &&
                              !itemSuggestions?.tags.some((s) => s.tagKey === t.key)
                          )
                          .map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => addManualTag(item.id, tag.id)}
                              className="rounded-full border border-dashed border-[#D8C7AF] px-2.5 py-1 text-xs text-stone hover:border-[#B8960C] hover:text-[#8A7209]"
                            >
                              {tag.icon} {tag.label}
                            </button>
                          ))}
                        <button
                          type="button"
                          onClick={() => setAddingTagFor(null)}
                          className="rounded-full px-2 py-1 text-xs text-stone hover:text-ink"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingTagFor(item.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#D8C7AF] px-2.5 py-1 text-xs text-stone hover:border-[#B8960C] hover:text-[#8A7209]"
                      >
                        <Plus className="h-3 w-3" />
                        Add
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
