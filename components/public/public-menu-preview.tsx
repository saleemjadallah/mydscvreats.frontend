"use client";

import Link from "next/link";
import { useState } from "react";
import { FileUp, ScanLine, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { RestaurantDraftPreview } from "@/components/dashboard/restaurant-draft-preview";
import { ThemePicker } from "@/components/dashboard/theme-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { auditDraft } from "@/lib/menu-audit";
import type { MenuExtractionDraft, MenuSection, RestaurantThemeKey } from "@/types";

async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function toPreviewSections(draft: MenuExtractionDraft): MenuSection[] {
  return draft.sections.map((section, sectionIndex) => ({
    id: `preview-section-${sectionIndex}`,
    restaurantId: "preview-restaurant",
    name: section.name,
    displayOrder: sectionIndex,
    items: section.items.map((item, itemIndex) => ({
      id: `preview-item-${sectionIndex}-${itemIndex}`,
      sectionId: `preview-section-${sectionIndex}`,
      restaurantId: "preview-restaurant",
      name: item.name,
      description: item.description,
      price: item.price,
      currency: "AED",
      imageUrl: null,
      imageStatus: "none",
      images: [],
      isAvailable: true,
      displayOrder: itemIndex,
    })),
  }));
}

export function PublicMenuPreview() {
  const [restaurantName, setRestaurantName] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [themeKey, setThemeKey] = useState<RestaurantThemeKey>("saffron");
  const [file, setFile] = useState<File | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [draft, setDraft] = useState<MenuExtractionDraft | null>(null);
  const [loading, setLoading] = useState(false);

  const previewSections = draft ? toPreviewSections(draft) : [];
  const audit = draft ? auditDraft(draft) : null;

  async function extractPreview() {
    if (!file && !sourceText.trim()) {
      toast.error("Upload a menu file or paste menu text first.");
      return;
    }

    setLoading(true);
    try {
      let base64: string | undefined;
      if (file) {
        base64 = await fileToBase64(file);
      }

      const extracted = await apiClient.previewMenu({
        sourceText: sourceText.trim() || undefined,
        fileName: file?.name,
        contentType: file?.type,
        base64,
      });

      setDraft(extracted);
      toast.success("Preview ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Preview generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-[#201A17] via-[#2A211B] to-[#3A2B23] text-white">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-saffron">
              <Sparkles className="h-4 w-4" />
              Menu preview
            </div>
            <CardTitle className="text-white">
              See the hosted menu before you create an account
            </CardTitle>
            <p className="mt-2 text-sm text-white/70">
              Upload a PDF or image, or paste menu text. We&apos;ll generate a draft preview without saving anything yet.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Restaurant name</Label>
                <Input
                  placeholder="Saffron Kitchen"
                  value={restaurantName}
                  onChange={(event) => setRestaurantName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cuisine type</Label>
                <Input
                  placeholder="Indian fusion"
                  value={cuisineType}
                  onChange={(event) => setCuisineType(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="JLT, Dubai"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Short description</Label>
                <Textarea
                  placeholder="Modern comfort food with bold spices and all-day breakfast."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Choose a theme</Label>
              <ThemePicker value={themeKey} onChange={setThemeKey} />
            </div>

            <div className="space-y-3">
              <Label>Upload your menu</Label>
              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-[24px] border-2 border-dashed border-[#E7DAC5] bg-[#FFF8EE] px-6 py-8 text-center transition-colors hover:border-saffron/60">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-saffron/10">
                  <Upload className="h-6 w-6 text-saffron" />
                </div>
                <div>
                  <p className="font-medium text-ink">
                    {file ? file.name : "Drop a PDF or menu photo here"}
                  </p>
                  <p className="mt-1 text-sm text-stone">
                    Nothing is saved until you create an account.
                  </p>
                </div>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="space-y-2">
              <Label>Or paste raw menu text</Label>
              <Textarea
                placeholder="Starters&#10;Hummus - AED 28&#10;Spicy potatoes - AED 24"
                rows={6}
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => void extractPreview()} disabled={loading}>
                <ScanLine className="h-4 w-4" />
                {loading ? "Generating preview..." : "Preview my menu"}
              </Button>
              {draft ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDraft(null);
                    toast.message("Preview cleared.");
                  }}
                >
                  Reset preview
                </Button>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-[#E7DAC5] bg-white p-4 text-sm text-stone">
              This preview is anonymous and not saved. To edit, publish, generate images, or start the 14-day trial, continue with sign-up after you like what you see.
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live-feel preview</CardTitle>
              <p className="mt-2 text-sm text-stone">
                This uses the same visual system as the owner onboarding draft preview.
              </p>
            </CardHeader>
            <CardContent>
              <RestaurantDraftPreview
                restaurant={{
                  name: restaurantName || "Your restaurant",
                  cuisineType: cuisineType || "Restaurant",
                  description:
                    description ||
                    "Upload a menu to see how your hosted page could feel before you sign up.",
                  location: location || null,
                }}
                sections={previewSections}
                themeKey={themeKey}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="muted">{audit?.totalSections ?? 0} sections</Badge>
                <Badge variant="muted">{audit?.totalItems ?? 0} dishes</Badge>
                <Badge variant={audit?.blockingIssues.length ? "accent" : "success"}>
                  {audit
                    ? audit.blockingIssues.length
                      ? `${audit.blockingIssues.length} issue${audit.blockingIssues.length === 1 ? "" : "s"}`
                      : "Ready to continue"
                    : "Waiting for preview"}
                </Badge>
              </div>
              <p className="text-sm text-stone">
                {draft
                  ? "Like the output? Create an account to save it, refine the menu, add imagery, and publish."
                  : "Generate a preview first, then decide whether the hosted menu feels right for your restaurant."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/sign-up">Create account to save this</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/explore">See live restaurant pages</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
