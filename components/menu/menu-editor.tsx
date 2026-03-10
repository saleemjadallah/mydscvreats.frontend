"use client";

import { useEffect, useState, useTransition } from "react";
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
import { GripVertical, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { ImageStatusBadge } from "@/components/menu/image-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { auditSections } from "@/lib/menu-audit";
import type { MenuItem, MenuSection } from "@/types";

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

export function MenuEditor({
  restaurantId,
  initialSections,
  onRefresh,
}: {
  restaurantId: string;
  initialSections: MenuSection[];
  onRefresh: () => Promise<void>;
}) {
  const { getToken } = useAuth();
  const [sections, setSections] = useState(initialSections);
  const [isPending, startTransition] = useTransition();
  const [bulkImageMode, setBulkImageMode] = useState<"missing" | "failed" | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const audit = auditSections(sections);

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  // Poll for image status updates when any items are generating
  useEffect(() => {
    const hasGenerating = sections.some((s) =>
      s.items.some((i) => i.imageStatus === "generating")
    );
    if (!hasGenerating) return;

    const interval = setInterval(() => {
      void onRefresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [sections, onRefresh]);

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
          restaurantId,
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
        restaurantId,
        name: `Section ${sections.length + 1}`,
        displayOrder: sections.length,
      });
      await onRefresh();
    });
  }

  async function createItem(sectionId: string, count: number) {
    await withToken(async (token) => {
      await apiClient.createItem(token, {
        restaurantId,
        sectionId,
        name: "New dish",
        description: "",
        price: 0,
        displayOrder: count,
      });
      await onRefresh();
    });
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

  async function queueImage(itemId: string) {
    await withToken(async (token) => {
      await apiClient.queueImageGeneration(token, itemId);
      await onRefresh();
    });
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
        await Promise.all(targetIds.map((itemId) => apiClient.queueImageGeneration(token, itemId)));
      });

      toast.success(
        `Queued ${targetIds.length} image job${targetIds.length === 1 ? "" : "s"}.`
      );
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to queue image jobs.");
    } finally {
      setBulkImageMode(null);
    }
  }

  return (
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
              <p className="text-sm text-stone">
                Pricing and menu structure look clean. Finish any optional polish, then move to publish.
              </p>
            )}
          </div>

          <div className="rounded-[24px] border border-[#E7DAC5] bg-white p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="muted">{audit.imagesReady} visuals ready</Badge>
              <Badge variant="muted">{audit.itemsWithoutImages} missing visuals</Badge>
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
                      {section.items.map((item, itemIndex) => (
                        <div
                          key={item.id}
                          className="group grid gap-3 rounded-[24px] border border-[#F0E5D4] bg-[#FFFDF9] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[1.2fr,1.5fr,0.6fr,auto,auto]"
                        >
                          {item.imageUrl ? (
                            <div className="flex items-center gap-3 md:col-span-5 md:col-start-1 md:row-start-1 md:col-span-1">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-12 w-12 rounded-xl border border-[#E7DAC5] object-cover"
                              />
                            </div>
                          ) : null}
                          <div className={item.imageUrl ? "" : ""}>
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
                            <div className="flex items-center gap-3">
                              <ImageStatusBadge status={item.imageStatus} />
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => void queueImage(item.id)}
                              >
                                <ImagePlus className="h-4 w-4" />
                                Generate
                              </Button>
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
                      ))}
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => void createItem(section.id, section.items.length)}
                    >
                      <Plus className="h-4 w-4" />
                      Add item
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
  );
}
