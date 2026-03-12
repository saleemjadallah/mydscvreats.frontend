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
import { Eye, GripVertical, ImagePlus, Info, Plus, Save, Sparkles, Tag, Trash2, X, ZoomIn } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { BulkDescriptionDialog } from "@/components/menu/bulk-description-dialog";
import { DescriptionEnhancer } from "@/components/menu/description-enhancer";
import { DietaryTagManager } from "@/components/menu/dietary-tag-manager";
import { ImageRetryDialog } from "@/components/menu/image-retry-dialog";
import { ImageStatusBadge } from "@/components/menu/image-status-badge";
import { PromotionManager } from "@/components/menu/promotion-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const [showBulkDescriptions, setShowBulkDescriptions] = useState(false);
  const [showDietaryTags, setShowDietaryTags] = useState(false);
  const [imageComposerItemId, setImageComposerItemId] = useState<string | null>(null);
  const [queueingImageItemIds, setQueueingImageItemIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"menu" | "offers">("menu");
  const [imageRetryChoice, setImageRetryChoice] = useState<{
    itemId: string;
    itemName: string;
    imageId?: string;
    promptModifier?: string | null;
  } | null>(null);
  const [retryDialogLoading, setRetryDialogLoading] = useState(false);
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
          ...(entitlements.menuAssistantEnabled ? { aiNotes: "" } : {}),
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
      const payload: Record<string, unknown> = {
        name: item.name,
        description: item.description,
        price: item.price,
        isAvailable: item.isAvailable,
      };

      if (entitlements.menuAssistantEnabled) {
        payload.aiNotes = item.aiNotes;
      }

      await apiClient.updateItem(token, item.id, payload);
      await onRefresh();
    });
  }

  async function queueImage(
    itemId: string,
    options?: {
      promptModifier?: string;
      allowFallback?: boolean;
      replaceImageId?: string;
    }
  ) {
    if (queueingImageItemIds[itemId]) {
      return;
    }

    setQueueingImageItemIds((prev) => ({ ...prev, [itemId]: true }));
    try {
      await withToken(async (token) => {
        await apiClient.queueImageGeneration(token, itemId, options);
        await onRefresh();
      });
      setImageComposerItemId(null);
      setImagePromptByItem((prev) => ({ ...prev, [itemId]: "" }));
      setImageRetryChoice(null);
      toast.success(
        entitlements.priorityImageGeneration
          ? "Priority image generation queued."
          : "Image generation queued."
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to queue image generation.");
    } finally {
      setQueueingImageItemIds((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
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
    const targets: Array<{
      itemId: string;
      imageId?: string;
      promptModifier?: string | null;
    }> = sections.flatMap((section) =>
      section.items.flatMap((item) => {
        if (mode === "missing") {
          return !item.imageUrl && item.imageStatus !== "generating"
            ? [{ itemId: item.id }]
            : [];
        }

        const failedImage = getDisplayImages(item).find((image) => image.imageStatus === "failed");
        return failedImage
          ? [
              {
                itemId: item.id,
                imageId: failedImage.id,
                promptModifier: failedImage.promptModifier,
              },
            ]
          : [];
      })
    );

    if (!targets.length) {
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
        for (const target of targets) {
          await apiClient.queueImageGeneration(token, target.itemId, {
            promptModifier: target.promptModifier ?? undefined,
            replaceImageId: target.imageId,
          });
        }
      });

      toast.success(
        `${entitlements.priorityImageGeneration ? "Priority" : "Standard"} queue: ${targets.length} image job${targets.length === 1 ? "" : "s"} added.`
      );
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to queue image jobs.");
    } finally {
      setBulkImageMode(null);
    }
  }

  async function resolveFailedImage(allowFallback: boolean) {
    if (!imageRetryChoice) {
      return;
    }

    setRetryDialogLoading(true);
    try {
      await queueImage(imageRetryChoice.itemId, {
        promptModifier: imageRetryChoice.promptModifier ?? undefined,
        allowFallback,
        replaceImageId: imageRetryChoice.imageId,
      });
    } finally {
      setRetryDialogLoading(false);
    }
  }

  return (
    <>
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 border-l-4 border-l-saffron md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Menu editor</CardTitle>
          <p className="mt-2 text-sm text-stone">
            Manage core dishes and the promotional layer that sits on top of them.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "menu" | "offers")}>
            <TabsList>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button asChild variant="secondary">
            <Link href={`/dashboard/preview${restaurant.themeKey ? `?theme=${restaurant.themeKey}` : ""}`}>
              <Eye className="h-4 w-4" />
              Preview menu page
            </Link>
          </Button>
          {activeTab === "menu" ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowBulkDescriptions(true)}
                className="bg-[#FFFBF0] text-[#B8960C] hover:bg-[#FFF3D6]"
              >
                <Sparkles className="h-4 w-4" />
                AI Descriptions
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDietaryTags(true)}
                className="bg-[#F0FFF4] text-[#2E8B57] hover:bg-[#D6FFE4]"
              >
                <Tag className="h-4 w-4" />
                Dietary Tags
              </Button>
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
            </>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "menu" | "offers")}>
          <TabsContent value="menu" className="mt-0">
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
                        const isQueueingImage = Boolean(queueingImageItemIds[item.id]);
                        const isImageBusy = item.imageStatus === "generating" || isQueueingImage;

                        return (
                          <div
                            key={item.id}
                            className="group grid gap-4 rounded-[24px] border border-[#F0E5D4] bg-[#FFFDF9] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[auto,1fr]"
                          >
                            {/* Left column: images */}
                            <div className="space-y-2">
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
                                        {image.imageStatus === "failed" ? (
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                            disabled={isImageBusy}
                                            onClick={() =>
                                              setImageRetryChoice({
                                                itemId: item.id,
                                                itemName: item.name,
                                                imageId: image.id,
                                                promptModifier: image.promptModifier,
                                              })
                                            }
                                          >
                                            Retry options
                                          </Button>
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

                                {canAddVariant && !isComposingVariant ? (
                                    <button
                                      type="button"
                                      disabled={isImageBusy}
                                      className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8C7AF] bg-[#FFF8EE] text-stone transition-colors hover:border-saffron hover:text-saffron disabled:cursor-not-allowed disabled:opacity-50"
                                      onClick={() => setImageComposerItemId(item.id)}
                                    >
                                      <Plus className="h-5 w-5" />
                                      <span className="mt-1 text-xs">
                                        {isQueueingImage ? "..." : "Add"}
                                      </span>
                                    </button>
                                ) : null}
                              </div>
                            </div>

                            {/* Variant composer: spans full width when active */}
                            {canAddVariant && isComposingVariant ? (
                              <div className="rounded-2xl border border-dashed border-[#E7DAC5] bg-white p-3 md:col-span-2">
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
                                  className="mt-2 min-h-[72px]"
                                />
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    disabled={isImageBusy}
                                    onClick={() =>
                                      void queueImage(item.id, {
                                        promptModifier: imagePromptByItem[item.id] ?? "",
                                      })
                                    }
                                  >
                                    <ImagePlus className="h-4 w-4" />
                                    {isQueueingImage ? "Queueing..." : "Generate variation"}
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
                            ) : null}

                            {/* Right column: all fields */}
                            <div className="space-y-3">
                              {/* Row 1: Name + Price + Actions */}
                              <div className="flex items-end gap-3">
                                <div className="min-w-0 flex-[2]">
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
                                <div className="w-24 shrink-0">
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
                                <div className="flex shrink-0 items-end gap-1">
                                  <Button variant="secondary" size="sm" onClick={() => void saveItem(item)}>
                                    Save
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
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

                              {/* Row 2: Description */}
                              <div>
                                <div className="flex items-center gap-1">
                                  <Label>Description</Label>
                                  <DescriptionEnhancer
                                    menuItemId={item.id}
                                    currentDescription={item.description}
                                    onAccept={(desc) => {
                                      const next = structuredClone(sections);
                                      next[sectionIndex].items[itemIndex].description = desc;
                                      setSections(next);
                                      void saveItem({ ...item, description: desc });
                                    }}
                                  />
                                </div>
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

                              {/* Row 3: Chef's Notes */}
                              <div className="rounded-[16px] border border-[#E9DFD1] bg-[#FFFCF6] p-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Label className="text-[13px] font-medium text-stone">
                                    Chef&apos;s Notes for AI
                                  </Label>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-stone/70 transition-colors hover:text-stone"
                                          aria-label="About Chef's Notes for AI"
                                        >
                                          <Info className="h-3.5 w-3.5" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        These notes are private - diners won&apos;t see them directly.
                                        Your AI assistant uses them to answer customer questions accurately.
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {!entitlements.menuAssistantEnabled ? (
                                    <span className="rounded-full bg-saffron/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-saffron">
                                      Pro
                                    </span>
                                  ) : null}
                                </div>
                                <Textarea
                                  rows={2}
                                  value={item.aiNotes ?? ""}
                                  disabled={!entitlements.menuAssistantEnabled}
                                  placeholder="e.g. Spice level 7/10, contains tree nuts, great for sharing, pairs well with garlic sauce"
                                  className="mt-2 resize-none border-[#E7DAC5] bg-white"
                                  onChange={(event) => {
                                    const next = structuredClone(sections);
                                    next[sectionIndex].items[itemIndex].aiNotes =
                                      event.target.value;
                                    setSections(next);
                                  }}
                                />
                                <p className="mt-1.5 text-[11px] leading-4 text-stone">
                                  {entitlements.menuAssistantEnabled
                                    ? "Private kitchen context for the public AI menu assistant."
                                    : "Upgrade to Pro to save private AI notes and unlock diner chat on your public menu."}
                                </p>
                              </div>

                              {/* Row 4: Dietary tags + Image status */}
                              <div className="flex flex-wrap items-center gap-2">
                                {item.dietaryTags && item.dietaryTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {item.dietaryTags.map((dt) => (
                                      <span
                                        key={dt.id}
                                        className="inline-flex items-center gap-0.5 rounded-full border border-[#E7DAC5] bg-[#F9F3EA] px-2 py-0.5 text-[11px] text-stone"
                                      >
                                        {dt.tag.icon && <span>{dt.tag.icon}</span>}
                                        {dt.tag.label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex flex-wrap items-center gap-2 ml-auto">
                                  <ImageStatusBadge status={item.imageStatus} />
                                  <Badge variant="muted">
                                    {displayImages.length}/3 image{displayImages.length === 1 ? "" : "s"}
                                  </Badge>
                                  {!displayImages.length ? (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      disabled={isImageBusy}
                                      onClick={() => void queueImage(item.id)}
                                    >
                                      <ImagePlus className="h-4 w-4" />
                                      {isQueueingImage ? "Queueing..." : "Generate"}
                                    </Button>
                                  ) : null}
                                  {item.imageStatus === "failed" ? (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      disabled={isImageBusy}
                                      onClick={() =>
                                        setImageRetryChoice({
                                          itemId: item.id,
                                          itemName: item.name,
                                        })
                                      }
                                    >
                                      <ImagePlus className="h-4 w-4" />
                                      Retry options
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
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
          </TabsContent>
          <TabsContent value="offers" className="mt-0">
            <PromotionManager
              restaurant={restaurant}
              sections={sections}
              promotions={restaurant.promotions ?? []}
              onRefresh={onRefresh}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

    </Card>

      {/* Bulk description dialog */}
      {showBulkDescriptions && (
        <BulkDescriptionDialog
          restaurantId={restaurant.id}
          sections={sections}
          bulkEnabled={entitlements.bulkDescriptionEnabled}
          onClose={() => setShowBulkDescriptions(false)}
          onApplied={onRefresh}
        />
      )}

      {/* Dietary tag manager */}
      {showDietaryTags && (
        <DietaryTagManager
          restaurantId={restaurant.id}
          sections={sections}
          onClose={() => setShowDietaryTags(false)}
          onApplied={onRefresh}
        />
      )}

      {imageRetryChoice && (
        <ImageRetryDialog
          itemName={imageRetryChoice.itemName}
          loading={retryDialogLoading}
          onClose={() => {
            if (!retryDialogLoading) {
              setImageRetryChoice(null);
            }
          }}
          onRetryPrimary={() => void resolveFailedImage(false)}
          onRetryFallback={() => void resolveFailedImage(true)}
        />
      )}

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
