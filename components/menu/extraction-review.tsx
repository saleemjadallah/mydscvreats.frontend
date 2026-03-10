"use client";

import { ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auditDraft } from "@/lib/menu-audit";
import type { MenuExtractionDraft } from "@/types";

export function ExtractionReview({
  draft,
  onChange,
  onSave,
  saving,
  saveDisabledReason,
}: {
  draft: MenuExtractionDraft;
  onChange: (draft: MenuExtractionDraft) => void;
  onSave: () => void;
  saving: boolean;
  saveDisabledReason?: string | null;
}) {
  const audit = auditDraft(draft);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron/10">
            <ClipboardCheck className="h-5 w-5 text-saffron" />
          </div>
          <div>
            <CardTitle>Review extracted menu</CardTitle>
            <p className="mt-1 text-sm text-stone">
              Edit anything before it becomes the source of truth for the public page.
            </p>
          </div>
        </div>
        <Button onClick={onSave} disabled={saving || Boolean(saveDisabledReason)} className="shrink-0">
          {saving ? "Saving..." : "Save to menu"}
        </Button>
      </CardHeader>

      {/* Progress banner */}
      <div className="border-b border-t border-[#E7DAC5] bg-[#FFF8EE] px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="muted">{audit.totalSections} sections</Badge>
          <Badge variant="muted">{audit.totalItems} dishes</Badge>
          <Badge variant={audit.blockingIssues.length ? "accent" : "success"}>
            {audit.blockingIssues.length
              ? `${audit.blockingIssues.length} blocking issue${audit.blockingIssues.length === 1 ? "" : "s"}`
              : "Ready to import"}
          </Badge>
          <div className="ml-auto h-2 w-32 overflow-hidden rounded-full bg-[#E7DAC5]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-saffron to-coral transition-all duration-300"
              style={{ width: audit.blockingIssues.length ? "60%" : "100%" }}
            />
          </div>
        </div>
      </div>

      <CardContent className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-5">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-stone">Blocking issues</div>
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
                Structure and pricing look clean enough to move into the menu editor.
              </p>
            )}
          </div>

          <div className="rounded-[24px] border border-[#E7DAC5] bg-white p-5">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-stone">Polish after import</div>
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
                This draft is already in strong shape. The next screen should be mostly about imagery and final checks.
              </p>
            )}
          </div>
        </div>

        {saveDisabledReason ? (
          <div className="rounded-[24px] border border-[#F2CFC7] bg-[#FFF4F1] p-5 text-sm text-stone">
            <span className="font-medium text-ink">Import locked:</span> {saveDisabledReason}
          </div>
        ) : null}

        {draft.sections.map((section, sectionIndex) => (
          <div key={`${section.name}-${sectionIndex}`} className="rounded-[28px] border border-[#E7DAC5] overflow-hidden">
            <div className="flex items-center gap-3 border-b border-[#E7DAC5] bg-[#FFFDF9] px-5 py-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                {sectionIndex + 1}
              </div>
              <div className="min-w-0 flex-1">
                <Input
                  value={section.name}
                  onChange={(event) => {
                    const next = structuredClone(draft);
                    next.sections[sectionIndex].name = event.target.value;
                    onChange(next);
                  }}
                  className="border-0 bg-transparent text-base font-medium shadow-none focus-visible:ring-0"
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

            <div className="space-y-3 p-5">
              {section.items.map((item, itemIndex) => (
                <div
                  key={`${item.name}-${itemIndex}`}
                  className="group grid gap-3 rounded-[24px] border border-[#EEE2D2] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[1.3fr,1.6fr,0.6fr,auto]"
                >
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

              <Button
                variant="secondary"
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
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between gap-4">
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
            <Plus className="h-4 w-4" />
            Add section
          </Button>

          <Button
            onClick={onSave}
            disabled={saving || Boolean(saveDisabledReason)}
            className="shrink-0"
          >
            {saving ? "Saving..." : "Save to menu"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
