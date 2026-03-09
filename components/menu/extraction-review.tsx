"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MenuExtractionDraft } from "@/types";

export function ExtractionReview({
  draft,
  onChange,
  onSave,
  saving,
}: {
  draft: MenuExtractionDraft;
  onChange: (draft: MenuExtractionDraft) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Review extracted menu</CardTitle>
          <p className="mt-2 text-sm text-stone">
            Edit anything before it becomes the source of truth for the public page.
          </p>
        </div>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save to menu"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {draft.sections.map((section, sectionIndex) => (
          <div key={`${section.name}-${sectionIndex}`} className="rounded-[28px] border border-[#E7DAC5] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-full">
                <Label>Section name</Label>
                <Input
                  value={section.name}
                  onChange={(event) => {
                    const next = structuredClone(draft);
                    next.sections[sectionIndex].name = event.target.value;
                    onChange(next);
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const next = structuredClone(draft);
                  next.sections.splice(sectionIndex, 1);
                  onChange(next);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div key={`${item.name}-${itemIndex}`} className="grid gap-3 rounded-3xl border border-[#EEE2D2] p-4 md:grid-cols-[1.3fr,1.6fr,0.6fr,auto]">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={item.name}
                      onChange={(event) => {
                        const next = structuredClone(draft);
                        next.sections[sectionIndex].items[itemIndex].name = event.target.value;
                        onChange(next);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={item.description ?? ""}
                      onChange={(event) => {
                        const next = structuredClone(draft);
                        next.sections[sectionIndex].items[itemIndex].description =
                          event.target.value || null;
                        onChange(next);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(event) => {
                        const next = structuredClone(draft);
                        next.sections[sectionIndex].items[itemIndex].price = Number(
                          event.target.value
                        );
                        onChange(next);
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const next = structuredClone(draft);
                        next.sections[sectionIndex].items.splice(itemIndex, 1);
                        onChange(next);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                const next = structuredClone(draft);
                next.sections[sectionIndex].items.push({
                  name: "New item",
                  description: null,
                  price: 0,
                });
                onChange(next);
              }}
            >
              Add item
            </Button>
          </div>
        ))}

        <Button
          variant="secondary"
          onClick={() => {
            onChange({
              ...draft,
              sections: [
                ...draft.sections,
                {
                  name: "New section",
                  items: [],
                },
              ],
            });
          }}
        >
          Add section
        </Button>
      </CardContent>
    </Card>
  );
}
