"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Plus, Save, Trash2, X, ZoomIn } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { ImageStatusBadge } from "@/components/menu/image-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import {
  getPlanEntitlements,
  getMenuItemLimitMessage,
  getMenuItemUsage,
  getRestaurantEntitlements,
} from "@/lib/entitlements";
import { auditSections } from "@/lib/menu-audit";
import type { MenuItem, MenuItemImage, MenuSection, Restaurant } from "@/types";

function SortableSection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-[28px] border border-[#E8DCC9] bg-white/70"
    >
      <div className="flex items-center gap-3 border-b border-[#F1E6D5] px-5 py-4">
        <button
          type="button"
          className="rounded-full border border-[#E4D6C1] p-2 text-stone opacity-50 transition-opacity group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

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

export function MenuEditor({
  restaurant,
  initialSections,
  onRefresh,
}: {
  restaurant: Restaurant;
  initialSections: MenuSection[];
  onRefresh: () => Promise<void>;
}) {
  const { getToken } = useAuth();
  const [sections, setSections] = useState(initialSections);
  const [isPending, startTransition] = useTransition();
  const [bulkImageMode, setBulkImageMode] = useState<"missing" | "failed" | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [imagePromptByItem, setImagePromptByItem] = useState<Record<string, string>>({});
  const [imageComposerItemId, setImageComposerItemId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const audit = auditSections(sections);
  const entitlements = getRestaurantEntitlements(restaurant);
  const usage = getMenuItemUsage(restaurant, sections);
  const menuItemLimitMessage =
    usage.limit !== null ? getMenuItemLimitMessage(usage.limit) : null;
  const starterLimit = getPlanEntitlements("starter").menuItemLimit;
  const exceedsStarterDraftLimit =
    !entitlements.hasSelectedPlan &&
    starterLimit !== null &&
    usage.totalItems > starterLimit;
  const addItemDisabled = entitlements.hasSelectedPlan && usage.atLimit;

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  // Lightweight poll: only fetch image statuses and patch in-place
  const pollRef = useRef(false);
  const pollStatuses = useCallback(async () => {
    if (pollRef.current) return;
    pollRef.current = true;
    try {
      const token = await getToken();
      if (!token) return;
      const statuses = await apiClient.getImageStatuses(token, restaurant.id);
      const map = new Map(statuses.map((s) => [s.id, s]));
      setSections((prev) => {
        let changed = false;
        const next = prev.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            const update = map.get(item.id);
            const imagesChanged =
              JSON.stringify(update?.images ?? []) !== JSON.stringify(item.images ?? []);

            if (
              update &&
              (update.imageStatus !== item.imageStatus ||
                update.imageUrl !== item.imageUrl ||
                imagesChanged)
            ) {
              changed = true;
              return {
                ...item,
                imageStatus: update.imageStatus as typeof item.imageStatus,
                imageUrl: update.imageUrl,
                images: update.images,
              };
            }
            return item;
          }),
        }));
        return changed ? next : prev;
      });
    } finally {
      pollRef.current = false;
    }
  }, [getToken, restaurant.id]);

  useEffect(() => {
    const hasGenerating = sections.some((s) =>
      s.items.some((i) => i.imageStatus === "generating")
    );
    if (!hasGenerating) return;

    const interval = setInterval(() => void pollStatuses(), 5000);
    return () => clearInterval(interval);
  }, [sections, pollStatuses]);

  async function withToken<T>(callback: (token: string) => Promise<T>) {
    const token = await getToken();
    if (!token) {
      throw new Error("Missing auth token");
    }
    return callback(token);
  }

  async function saveReorder(nextSections: MenuSection[]) {
    setSections(nextSections);

    startTransition(() => {
      void withToken((token) =>
        apiClient.reorderMenu(token, {
          restaurantId: restaurant.id,
          sections: nextSections.map((section, sectionIndex) => ({
            id: section.id,
            displayOrder: sectionIndex,
            items: section.items.map((item, itemIndex) => ({
              id: item.id,
              displayOrder: itemIndex,
              sectionId: section.id,
            })),
          })),
        }).then(async () => {
          await onRefresh();
        })
      );
    });
  }

  async function onSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const next = arrayMove(sections, oldIndex, newIndex);
    await saveReorder(next);
  }

  async function createSection() {
    await withToken(async (token) => {
      await apiClient.createSection(token, {
        restaurantId: restaurant.id,
        name: `Section ${sections.length + 1}`,
        displayOrder: sections.length,
      });
      await onRefresh();
    });
  }

  async function createItem(sectionId: string, count: number) {
    if (addItemDisabled) {
      toast.error(menuItemLimitMessage ?? "Upgrade to Pro to add more dishes.");
      return;
    }

    try {
      await withToken(async (token) => {
        await apiClient.createItem(token, {
          restaurantId: restaurant.id,
          sectionId,
          name: "New dish",
          description: "",
          price: 0,
          displayOrder: count,
        });
        await onRefresh();
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add a new dish.");
    }
  }

  async function saveSection(section: MenuSection) {
    await withToken(async (token) => {
      await apiClient.updateSection(token, section.id, {
        name: section.name,
      });
      await onRefresh();
    });
  }

  async function saveItem(item: MenuItem) {
    await withToken(async (token) => {
      await apiClient.updateItem(token, item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        isAvailable: item.isAvailable,
      });
      await onRefresh();
    });
  }

  async function queueImage(itemId: string, promptModifier?: string) {
    try {
      await withToken(async (token) => {
        await apiClient.queueImageGeneration(token, itemId, promptModifier);
        await onRefresh();
      });
      setImageComposerItemId(null);
      setImagePromptByItem((prev) => ({ ...prev, [itemId]: "" }));
      toast.success(
        entitlements.priorityImageGeneration
          ? "Priority image generation queued."
          : "Image generation queued."
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to queue image generation.");
    }
  }

  async function selectPrimaryImage(itemId: string, imageId: string) {
    try {
      await withToken(async (token) => {
        await apiClient.selectMenuItemImage(token, itemId, imageId);
        await onRefresh();
      });
      toast.success("Primary dish image updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update the primary image.");
    }
  }

  async function queueImages(mode: "missing" | "failed") {
    const targetIds = sections.flatMap((section) =>
      section.items
        .filter((item) =>
          mode === "missing"
            ? !item.imageUrl && item.imageStatus !== "generating"
            : item.imageStatus === "failed"
        )
        .map((item) => item.id)
    );

    if (!targetIds.length) {
      toast.message(
        mode === "missing"
          ? "No missing dish images left to queue."
          : "There are no failed image jobs to retry."
      );
      return;
    }

    setBulkImageMode(mode);
    try {
      await withToken(async (token) => {
        for (const itemId of targetIds) {
          await apiClient.queueImageGeneration(token, itemId);
        }
      });

      toast.success(
        `${entitlements.priorityImageGeneration ? "Priority" : "Standard"} queue: ${targetIds.length} image job${targetIds.length === 1 ? "" : "s"} added.`
      );
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to queue image jobs.");
    } finally {
      setBulkImageMode(null);
    }
  }

  return (
    <>
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 border-l-4 border-l-saffron md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Menu editor</CardTitle>
          <p className="mt-2 text-sm text-stone">
            Reorder sections, update dishes, and queue AI imagery from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => void queueImages("missing")}
            disabled={bulkImageMode !== null}
            className="bg-saffron/10 text-saffron hover:bg-saffron/20"
          >
            <ImagePlus className="h-4 w-4" />
            {bulkImageMode === "missing" ? "Queueing..." : "Generate missing images"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => void queueImages("failed")}
            disabled={bulkImageMode !== null || audit.failedImages === 0}
            className="bg-saffron/10 text-saffron hover:bg-saffron/20"
          >
            <ImagePlus className="h-4 w-4" />
            {bulkImageMode === "failed" ? "Retrying..." : "Retry failed"}
          </Button>
          <Button onClick={() => void createSection()}>
            <Plus className="h-4 w-4" />
            Add section
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="muted">{audit.totalSections} sections</Badge>
              <Badge variant="muted">{audit.totalItems} dishes</Badge>
              {entitlements.hasSelectedPlan && usage.limit !== null ? (
                <Badge variant={usage.atLimit ? "accent" : "muted"}>
                  {usage.totalItems}/{usage.limit} dishes used
                </Badge>
              ) : !entitlements.hasSelectedPlan ? (
                <Badge variant="muted">Draft mode</Badge>
              ) : (
                <Badge variant="success">Unlimited dishes</Badge>
              )}
              <Badge variant={audit.blockingIssues.length ? "accent" : "success"}>
                {audit.blockingIssues.length
                  ? `${audit.blockingIssues.length} launch blocker${audit.blockingIssues.length === 1 ? "" : "s"}`
                  : "Ready to publish"}
              </Badge>
            </div>

            {audit.blockingIssues.length ? (
              <div className="space-y-2 text-sm text-stone">
                {audit.blockingIssues.map((issue) => (
                  <div key={issue.id}>
                    <span className="font-medium text-ink">{issue.label}:</span> {issue.description}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-sm text-stone">
                <p>
                  Pricing and menu structure look clean. Finish any optional polish, then move to publish.
                </p>
                {entitlements.hasSelectedPlan && menuItemLimitMessage ? (
                  <p className={usage.atLimit ? "font-medium text-[#9E3B2D]" : ""}>
                    {menuItemLimitMessage}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-[#E7DAC5] bg-white p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="muted">{audit.imagesReady} visuals ready</Badge>
              <Badge variant="muted">{audit.itemsWithoutImages} missing visuals</Badge>
              {entitlements.priorityImageGeneration ? (
                <Badge variant="success">Priority image queue</Badge>
              ) : null}
              {audit.failedImages > 0 ? <Badge variant="accent">{audit.failedImages} failed</Badge> : null}
            </div>

            {audit.improvementIssues.length ? (
              <div className="space-y-2 text-sm text-stone">
                {audit.improvementIssues.map((issue) => (
                  <div key={issue.id}>
                    <span className="font-medium text-ink">{issue.label}:</span> {issue.description}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone">
                The page is already polished. Use bulk image generation only when you add new dishes.
              </p>
            )}
          </div>
        </div>

        {usage.atLimit && entitlements.hasSelectedPlan && menuItemLimitMessage ? (
          <div className="mb-6 flex flex-col gap-3 rounded-[24px] border border-[#F2CFC7] bg-[#FFF4F1] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-ink">Starter limit reached</div>
              <p className="mt-1 text-sm text-stone">{menuItemLimitMessage}</p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/dashboard/billing">Upgrade to Pro</Link>
            </Button>
          </div>
        ) : null}

        {exceedsStarterDraftLimit && starterLimit !== null ? (
          <div className="mb-6 flex flex-col gap-3 rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-ink">This draft will need Pro at launch</div>
              <p className="mt-1 text-sm text-stone">
                Your menu has {usage.totalItems} dishes. Starter supports up to {starterLimit}, so if you publish this version you&apos;ll want Pro.
              </p>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link href="/dashboard/billing">Choose a plan later</Link>
            </Button>
          </div>
        ) : null}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => void onSectionDragEnd(event)}>
          <SortableContext items={sections.map((section) => section.id)} strategy={rectSortingStrategy}>
            <div className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <SortableSection key={section.id} id={section.id}>
                  <div className="space-y-4">
                    <div className="flex items-end gap-3">
                      <div className="min-w-0 flex-1">
                        <Label>Section name</Label>
                        <Input
                          value={section.name}
                          onChange={(event) => {
                            const next = structuredClone(sections);
                            next[sectionIndex].name = event.target.value;
                            setSections(next);
                          }}
                        />
                      </div>
                      <Button variant="secondary" onClick={() => void saveSection(section)}>
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          void withToken(async (token) => {
                            await apiClient.deleteSection(token, section.id);
                            await onRefresh();
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => {
                        const displayImages = getDisplayImages(item);
                        const canAddVariant = displayImages.length > 0 && displayImages.length < 3;
                        const isComposingVariant = imageComposerItemId === item.id;

                        return (
                          <div
                            key={item.id}
                            className="group grid gap-3 rounded-[24px] border border-[#F0E5D4] bg-[#FFFDF9] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[1.2fr,1.5fr,0.6fr,1.1fr,auto]"
                          >
                            <div className="space-y-3 md:col-span-5">
                              <Label>Images</Label>
                              <div className="flex flex-wrap items-start gap-3">
                                {displayImages.length ? (
                                  displayImages.map((image) => (
                                    <div key={image.id} className="w-[88px] space-y-2">
                                      <button
                                        type="button"
                                        className={`group/img relative h-[88px] w-[88px] overflow-hidden rounded-2xl border ${
                                          image.isPrimary
                                            ? "border-[#2E8B57] ring-2 ring-[#2E8B57]/15"
                                            : "border-[#E7DAC5]"
                                        }`}
                                        onClick={() =>
                                          image.imageUrl
                                            ? setPreviewImage({ url: image.imageUrl, name: item.name })
                                            : undefined
                                        }
                                      >
                                        {image.imageUrl ? (
                                          <>
                                            <img
                                              src={image.imageUrl}
                                              alt={item.name}
                                              className="h-full w-full object-cover"
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                                              <ZoomIn className="h-4 w-4 text-white" />
                                            </span>
                                          </>
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center bg-[#F9F3EA] text-xs text-stone">
                                            {image.imageStatus}
                                          </div>
                                        )}
                                      </button>
                                      <div className="space-y-1">
                                        {image.isPrimary ? (
                                          <Badge variant="success" className="w-full justify-center">
                                            Primary
                                          </Badge>
                                        ) : null}
                                        {image.promptModifier ? (
                                          <p className="line-clamp-2 text-[11px] leading-4 text-stone">
                                            {image.promptModifier}
                                          </p>
                                        ) : null}
                                        {!image.isSynthetic &&
                                        image.imageUrl &&
                                        !image.isPrimary &&
                                        image.imageStatus !== "generating" ? (
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => void selectPrimaryImage(item.id, image.id)}
                                          >
                                            Use
                                          </Button>
                                        ) : null}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl border border-dashed border-[#E7DAC5] bg-[#F9F3EA] text-xs text-stone">
                                    No image
                                  </div>
                                )}

                                {canAddVariant ? (
                                  isComposingVariant ? (
                                    <div className="min-w-[240px] flex-1 rounded-2xl border border-dashed border-[#E7DAC5] bg-white p-3">
                                      <Label className="text-xs text-stone">
                                        What should look different in the next image?
                                      </Label>
                                      <Textarea
                                        value={imagePromptByItem[item.id] ?? ""}
                                        onChange={(event) =>
                                          setImagePromptByItem((prev) => ({
                                            ...prev,
                                            [item.id]: event.target.value,
                                          }))
                                        }
                                        placeholder="Examples: darker ceramic plate, overhead shot, more dramatic lighting, tighter crop"
                                        className="mt-2 min-h-[96px]"
                                      />
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            void queueImage(item.id, imagePromptByItem[item.id] ?? "")
                                          }
                                        >
                                          <ImagePlus className="h-4 w-4" />
                                          Generate variation
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setImageComposerItemId(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8C7AF] bg-[#FFF8EE] text-stone transition-colors hover:border-saffron hover:text-saffron"
                                      onClick={() => setImageComposerItemId(item.id)}
                                    >
                                      <Plus className="h-5 w-5" />
                                      <span className="mt-1 text-xs">Add</span>
                                    </button>
                                  )
                                ) : null}
                              </div>
                            </div>

                            <div>
                              <Label>Name</Label>
                              <Input
                                value={item.name}
                                onChange={(event) => {
                                  const next = structuredClone(sections);
                                  next[sectionIndex].items[itemIndex].name = event.target.value;
                                  setSections(next);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input
                                value={item.description ?? ""}
                                onChange={(event) => {
                                  const next = structuredClone(sections);
                                  next[sectionIndex].items[itemIndex].description =
                                    event.target.value;
                                  setSections(next);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Price</Label>
                              <Input
                                type="number"
                                value={item.price}
                                onChange={(event) => {
                                  const next = structuredClone(sections);
                                  next[sectionIndex].items[itemIndex].price = Number(
                                    event.target.value
                                  );
                                  setSections(next);
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Image</Label>
                              <div className="flex flex-wrap items-center gap-3">
                                <ImageStatusBadge status={item.imageStatus} />
                                <Badge variant="muted">
                                  {displayImages.length}/3 image{displayImages.length === 1 ? "" : "s"}
                                </Badge>
                                {!displayImages.length ? (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => void queueImage(item.id)}
                                  >
                                    <ImagePlus className="h-4 w-4" />
                                    Generate
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex items-end gap-2">
                              <Button variant="secondary" onClick={() => void saveItem(item)}>
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  void withToken(async (token) => {
                                    await apiClient.deleteItem(token, item.id);
                                    await onRefresh();
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => void createItem(section.id, section.items.length)}
                      disabled={addItemDisabled}
                    >
                      <Plus className="h-4 w-4" />
                      {addItemDisabled ? "Upgrade for more dishes" : "Add item"}
                    </Button>
                  </div>
                </SortableSection>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {isPending ? (
          <div className="mt-4 text-sm text-stone">Saving menu order...</div>
        ) : null}
      </CardContent>

    </Card>

      {/* Image preview lightbox — portaled to body so it's truly viewport-fixed */}
      {previewImage
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setPreviewImage(null)}
            >
              <div
                className="relative w-[28rem] max-w-[90vw] overflow-hidden rounded-2xl border border-[#E7DAC5] bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="absolute right-2 top-2 z-10 rounded-full bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60"
                  onClick={() => setPreviewImage(null)}
                >
                  <X className="h-4 w-4" />
                </button>
                <img
                  src={previewImage.url}
                  alt={previewImage.name}
                  className="w-full object-contain"
                />
                <div className="border-t border-[#F0E5D4] px-4 py-3">
                  <p className="text-sm font-medium text-ink">{previewImage.name}</p>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
