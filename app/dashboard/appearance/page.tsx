"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import type { Restaurant } from "@/types";

async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

export default function AppearancePage() {
  const { getToken } = useAuth();
  const { restaurant, refresh } = useRestaurant();
  const [form, setForm] = useState<Partial<Restaurant>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setForm(restaurant);
    }
  }, [restaurant]);

  async function uploadAsset(file: File, field: "logoUrl" | "coverImageUrl") {
    if (!restaurant) {
      return;
    }

    const token = await getToken();
    if (!token) {
      throw new Error("Missing auth token");
    }

    const uploaded = await apiClient.upload(token, {
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      base64: await fileToBase64(file),
      folder: `restaurants/${restaurant.id}/branding`,
    });

    setForm((current) => ({
      ...current,
      [field]: uploaded.url,
    }));
  }

  async function save() {
    if (!restaurant) {
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiClient.updateRestaurant(token, restaurant.id, form);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!restaurant) {
    return <Card><CardContent className="p-8">Create your restaurant first.</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance and profile</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={form.name ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Cuisine type</Label>
          <Input
            value={form.cuisineType ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, cuisineType: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Description</Label>
          <Textarea
            value={form.description ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={form.location ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, location: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            value={form.address ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, address: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={form.phone ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input
            value={form.website ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, website: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Logo upload</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const nextFile = event.target.files?.[0];
              if (nextFile) {
                void uploadAsset(nextFile, "logoUrl");
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Cover upload</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const nextFile = event.target.files?.[0];
              if (nextFile) {
                void uploadAsset(nextFile, "coverImageUrl");
              }
            }}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Publish status</Label>
          <div className="flex gap-3">
            <Button
              variant={form.isPublished ? "default" : "secondary"}
              onClick={() => setForm((current) => ({ ...current, isPublished: true }))}
            >
              Published
            </Button>
            <Button
              variant={!form.isPublished ? "default" : "secondary"}
              onClick={() => setForm((current) => ({ ...current, isPublished: false }))}
            >
              Draft
            </Button>
          </div>
        </div>
        <div className="md:col-span-2">
          <Button onClick={() => void save()} disabled={loading}>
            {loading ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
