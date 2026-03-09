"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ExtractionReview } from "@/components/menu/extraction-review";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
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

export default function AiMenuPage() {
  const { getToken } = useAuth();
  const { restaurant, refresh } = useRestaurant();
  const [file, setFile] = useState<File | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [draft, setDraft] = useState<MenuExtractionDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

      await refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI menu import</CardTitle>
          <p className="mt-2 text-sm text-stone">
            Upload a menu file, optionally paste fallback text, then review the extraction before saving.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Menu PDF or image</Label>
            <Input
              type="file"
              accept="application/pdf,image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label>Fallback menu text</Label>
            <Textarea
              placeholder="Paste OCR or raw menu text here if you want a text fallback."
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
            />
          </div>
          <Button onClick={() => void extract()} disabled={loading || !restaurant}>
            {loading ? "Extracting..." : "Extract menu"}
          </Button>
        </CardContent>
      </Card>

      {draft ? (
        <ExtractionReview draft={draft} onChange={setDraft} onSave={() => void saveDraft()} saving={saving} />
      ) : null}
    </div>
  );
}
