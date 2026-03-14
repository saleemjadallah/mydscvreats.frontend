"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChevronDown, ChevronUp, FileUp, ScanLine, Sparkles, Upload, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { ExtractionReview } from "@/components/menu/extraction-review";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import { getMenuItemLimitMessage, getMenuItemUsage } from "@/lib/entitlements";
import {
  cropRenderedMenuSourcePage,
  renderMenuSourcePages,
} from "@/lib/menu-source-images";
import type { MenuExtractionDraft } from "@/types";

async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

const steps = [
  { label: "Upload", icon: Upload },
  { label: "Extract", icon: ScanLine },
  { label: "Review", icon: Sparkles },
  { label: "Save", icon: FileUp },
];

export function AiMenuImportPanel({
  title = "AI menu import",
  description = "Upload a menu file, optionally paste fallback text, then review the extraction before saving.",
  afterSave,
}: {
  title?: string;
  description?: string;
  afterSave?: () => Promise<void> | void;
}) {
  const { getToken } = useAuth();
  const { restaurant, refresh } = useRestaurant();
  const [file, setFile] = useState<File | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [draft, setDraft] = useState<MenuExtractionDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const currentStep = draft ? 2 : file ? 1 : 0;
  const usage = getMenuItemUsage(restaurant, draft?.sections);
  const saveDisabledReason =
    usage.overLimit && usage.limit !== null ? getMenuItemLimitMessage(usage.limit) : null;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);

  async function extract() {
    if (!restaurant) {
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      let base64: string | undefined;
      if (file) {
        base64 = await fileToBase64(file);
        await apiClient.upload(token, {
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          base64,
          folder: `restaurants/${restaurant.id}/imports`,
        });
      }

      const extracted = await apiClient.extractMenu(token, {
        restaurantId: restaurant.id,
        sourceText,
        fileName: file?.name,
        contentType: file?.type,
        base64,
      });

      setDraft(extracted);
      toast.success("Extraction ready for review.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Menu extraction failed.");
    } finally {
      setLoading(false);
    }
  }

  async function saveDraft() {
    if (!restaurant || !draft) {
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiClient.importMenu(token, {
        restaurantId: restaurant.id,
        sections: draft.sections,
      });

      let createdSourceImageCandidates = 0;
      let detectedSourceImages = 0;

      if (file && (file.type === "application/pdf" || file.type.startsWith("image/"))) {
        try {
          const pages = await renderMenuSourcePages(file);
          if (pages.length) {
            const detection = await apiClient.detectMenuSourceImages(token, {
              restaurantId: restaurant.id,
              pages: pages.map((page) => ({
                pageNumber: page.pageNumber,
                base64: page.base64,
                contentType: page.contentType,
              })),
            });

            detectedSourceImages = detection.matches.length;

            for (const match of detection.matches) {
              const page = pages.find((candidate) => candidate.pageNumber === match.pageNumber);
              if (!page) {
                continue;
              }

              try {
                const cropped = await cropRenderedMenuSourcePage(page, match.bbox);
                await apiClient.createMenuSourceImageCandidate(token, {
                  restaurantId: restaurant.id,
                  filename: `menu-source-page-${match.pageNumber}-${match.itemId}.jpg`,
                  contentType: cropped.contentType,
                  base64: cropped.base64,
                  sourcePageNumber: match.pageNumber,
                  confidence: match.confidence,
                  note: match.note,
                  suggestedMenuItemId: match.itemId,
                });
                createdSourceImageCandidates += 1;
              } catch (error) {
                console.warn("Skipping detected menu source image", {
                  itemId: match.itemId,
                  pageNumber: match.pageNumber,
                  error,
                });
              }
            }
          }
        } catch (error) {
          console.warn("Menu source image detection failed", error);
          toast.error("Menu saved, but source image detection could not finish.");
        }
      }

      await refresh();
      if (createdSourceImageCandidates > 0) {
        toast.success(
          `Menu imported. Queued ${createdSourceImageCandidates} imported menu photo${createdSourceImageCandidates === 1 ? "" : "s"} for review.`
        );
      } else if (detectedSourceImages > 0) {
        toast.message(
          "Menu imported. We found likely dish photos in the upload, but none could be staged for review."
        );
      } else {
        toast.success("Menu imported.");
      }
      await afterSave?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save extracted menu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-[#201A17] via-[#2A211B] to-[#3A2B23] text-white">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-saffron">
            <WandSparkles className="h-4 w-4" />
            {title}
          </div>
          <CardTitle className="text-white">{description}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Step indicator */}
          <div className="flex items-center justify-between gap-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isDone = index < currentStep;

              return (
                <div key={step.label} className="flex flex-1 items-center gap-2">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-saffron text-ink"
                      : isDone
                        ? "bg-[#2E8B57] text-white"
                        : "bg-[#E7DAC5] text-stone"
                  }`}>
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <span className={`hidden text-xs font-medium sm:block ${isActive ? "text-ink" : "text-stone"}`}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`mx-2 h-[2px] flex-1 rounded-full ${isDone ? "bg-[#2E8B57]" : "bg-[#E7DAC5]"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Drag-and-drop upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            className={`relative flex flex-col items-center gap-3 rounded-[24px] border-2 border-dashed p-8 text-center transition-all duration-200 ${
              isDragOver
                ? "border-saffron bg-saffron/5"
                : file
                  ? "border-[#2E8B57] bg-[#F7FEFA]"
                  : "border-[#E7DAC5] bg-[#FFF8EE] hover:border-saffron/50"
            }`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
              file ? "bg-[#2E8B57]/10" : "bg-saffron/10"
            }`}>
              <Upload className={`h-6 w-6 ${file ? "text-[#2E8B57]" : "text-saffron"}`} />
            </div>
            {file ? (
              <div>
                <p className="font-medium text-ink">{file.name}</p>
                <p className="text-sm text-stone">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-ink">Drop your menu file here</p>
                <p className="text-sm text-stone">PDF or image — we'll extract the dishes with AI</p>
              </div>
            )}
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {file && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="mt-1"
              >
                Change file
              </Button>
            )}
          </div>

          {/* Collapsible fallback text */}
          <div>
            <button
              type="button"
              onClick={() => setShowFallback(!showFallback)}
              className="flex items-center gap-2 text-sm font-medium text-stone transition-colors hover:text-ink"
            >
              {showFallback ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Paste fallback text instead
            </button>
            {showFallback && (
              <div className="mt-3 space-y-2">
                <Label>Fallback menu text</Label>
                <Textarea
                  placeholder="Paste OCR or raw menu text here if you want a text fallback."
                  value={sourceText}
                  onChange={(event) => setSourceText(event.target.value)}
                  rows={5}
                />
              </div>
            )}
          </div>

          <Button
            onClick={() => void extract()}
            disabled={loading || !restaurant || (!file && !sourceText)}
            className="w-full gap-2 py-6 text-base"
          >
            <WandSparkles className="h-5 w-5" />
            {loading ? "Extracting..." : "Extract menu"}
          </Button>
        </CardContent>
      </Card>

      {draft ? (
        <ExtractionReview
          draft={draft}
          onChange={setDraft}
          onSave={() => void saveDraft()}
          saving={saving}
          saveDisabledReason={saveDisabledReason}
        />
      ) : null}
    </div>
  );
}
