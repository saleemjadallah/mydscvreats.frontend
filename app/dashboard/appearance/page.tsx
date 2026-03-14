"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Camera, Clock, Globe, ImageIcon, MessageCircle, Palette, Plus, Save, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemePicker } from "@/components/dashboard/theme-picker";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import { createDefaultSchedule, DAY_LABELS, GULF_TIMEZONES } from "@/lib/operating-hours";
import type { OperatingHoursConfig, Restaurant } from "@/types";

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
    <div className="space-y-6">
      <div className="text-xs uppercase tracking-[0.3em] text-stone">Appearance & Profile</div>

      {/* Publish status */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-stone">Status</span>
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
            restaurant.isPublished
              ? "bg-[#2E8B57]/10 text-[#2E8B57]"
              : "bg-stone/10 text-stone"
          }`}
        >
          <div
            className={`h-2 w-2 rounded-full ${
              restaurant.isPublished ? "bg-[#2E8B57]" : "bg-stone"
            }`}
          />
          {restaurant.isPublished ? "Published" : "Draft"}
        </div>
      </div>

      {/* Restaurant identity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <User className="h-5 w-5 text-saffron" />
            </div>
            <CardTitle>Restaurant identity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <p className="text-sm text-stone">
              Changing the restaurant name updates the URL slug. Older links keep redirecting to the latest page.
            </p>
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
        </CardContent>
      </Card>

      {/* Location & contact */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <Globe className="h-5 w-5 text-saffron" />
            </div>
            <CardTitle>Location & contact</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
            <Label>WhatsApp number</Label>
            <Input
              value={form.whatsappNumber ?? ""}
              placeholder="+971501234567"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  whatsappNumber: event.target.value,
                }))
              }
            />
            <p className="text-xs text-stone">
              Use the full international number. When this is set, the public menu shows WhatsApp CTAs.
            </p>
          </div>
          <div className="space-y-2">
            <Label>WhatsApp opener</Label>
            <Input
              value={form.whatsappPrefill ?? ""}
              placeholder="Hi, I found your menu on MyDscvr Eats"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  whatsappPrefill: event.target.value,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <MessageCircle className="h-5 w-5 text-saffron" />
            </div>
            <CardTitle>WhatsApp conversion</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-stone">
          <p>
            If a WhatsApp number is set, the public page will show:
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE] p-4">
              Floating WhatsApp CTA
            </div>
            <div className="rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE] p-4">
              Per-dish “Ask on WhatsApp” CTA
            </div>
            <div className="rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE] p-4">
              Offer CTA inside live promotions
            </div>
          </div>
          <p className="text-xs">
            Clicks are tracked separately from page views so you can see browsing vs conversation intent.
          </p>
        </CardContent>
      </Card>

      {/* Operating hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <Clock className="h-5 w-5 text-saffron" />
            </div>
            <CardTitle>Operating hours</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.operatingHours ? (
            <>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <select
                  className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={form.operatingHours.timezone}
                  onChange={(event) => {
                    const hours = form.operatingHours as OperatingHoursConfig;
                    setForm((current) => ({
                      ...current,
                      operatingHours: { ...hours, timezone: event.target.value },
                    }));
                  }}
                >
                  {GULF_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace("Asia/", "")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                {(form.operatingHours as OperatingHoursConfig).schedule
                  .slice()
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((day) => (
                    <div key={day.dayOfWeek} className="flex flex-wrap items-start gap-3 rounded-[16px] border border-[#E7DAC5] bg-[#FFF8EE] p-3">
                      <div className="flex w-28 shrink-0 items-center gap-2 pt-1.5">
                        <span className="text-sm font-medium">{DAY_LABELS[day.dayOfWeek]}</span>
                      </div>
                      <label className="flex items-center gap-2 pt-1.5">
                        <input
                          type="checkbox"
                          checked={day.isClosed}
                          onChange={(event) => {
                            const hours = form.operatingHours as OperatingHoursConfig;
                            setForm((current) => ({
                              ...current,
                              operatingHours: {
                                ...hours,
                                schedule: hours.schedule.map((d) =>
                                  d.dayOfWeek === day.dayOfWeek
                                    ? { ...d, isClosed: event.target.checked }
                                    : d
                                ),
                              },
                            }));
                          }}
                          className="h-4 w-4 rounded border-stone/30"
                        />
                        <span className="text-sm text-stone">Closed</span>
                      </label>
                      {!day.isClosed && (
                        <div className="flex flex-1 flex-wrap items-start gap-2">
                          {day.periods.map((period, periodIndex) => (
                            <div key={periodIndex} className="flex items-center gap-1.5">
                              <input
                                type="time"
                                value={period.open}
                                onChange={(event) => {
                                  const hours = form.operatingHours as OperatingHoursConfig;
                                  setForm((current) => ({
                                    ...current,
                                    operatingHours: {
                                      ...hours,
                                      schedule: hours.schedule.map((d) =>
                                        d.dayOfWeek === day.dayOfWeek
                                          ? {
                                              ...d,
                                              periods: d.periods.map((p, pi) =>
                                                pi === periodIndex
                                                  ? { ...p, open: event.target.value }
                                                  : p
                                              ),
                                            }
                                          : d
                                      ),
                                    },
                                  }));
                                }}
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                              />
                              <span className="text-xs text-stone">to</span>
                              <input
                                type="time"
                                value={period.close}
                                onChange={(event) => {
                                  const hours = form.operatingHours as OperatingHoursConfig;
                                  setForm((current) => ({
                                    ...current,
                                    operatingHours: {
                                      ...hours,
                                      schedule: hours.schedule.map((d) =>
                                        d.dayOfWeek === day.dayOfWeek
                                          ? {
                                              ...d,
                                              periods: d.periods.map((p, pi) =>
                                                pi === periodIndex
                                                  ? { ...p, close: event.target.value }
                                                  : p
                                              ),
                                            }
                                          : d
                                      ),
                                    },
                                  }));
                                }}
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                              />
                              {day.periods.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const hours = form.operatingHours as OperatingHoursConfig;
                                    setForm((current) => ({
                                      ...current,
                                      operatingHours: {
                                        ...hours,
                                        schedule: hours.schedule.map((d) =>
                                          d.dayOfWeek === day.dayOfWeek
                                            ? {
                                                ...d,
                                                periods: d.periods.filter(
                                                  (_, pi) => pi !== periodIndex
                                                ),
                                              }
                                            : d
                                        ),
                                      },
                                    }));
                                  }}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-stone hover:bg-stone/10 hover:text-ink"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const hours = form.operatingHours as OperatingHoursConfig;
                              setForm((current) => ({
                                ...current,
                                operatingHours: {
                                  ...hours,
                                  schedule: hours.schedule.map((d) =>
                                    d.dayOfWeek === day.dayOfWeek
                                      ? {
                                          ...d,
                                          periods: [
                                            ...d.periods,
                                            { open: "18:00", close: "23:00" },
                                          ],
                                        }
                                      : d
                                  ),
                                },
                              }));
                            }}
                            className="inline-flex h-9 items-center gap-1 rounded-full border border-dashed border-stone/30 px-3 text-xs text-stone hover:border-stone/50 hover:text-ink"
                          >
                            <Plus className="h-3 w-3" />
                            Add period
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({ ...current, operatingHours: null }))
                }
                className="text-sm text-stone underline hover:text-ink"
              >
                Remove operating hours
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm text-stone">
                No operating hours configured. Setting hours shows an &quot;Open Now&quot; badge on your public page.
              </p>
              <Button
                variant="secondary"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    operatingHours: createDefaultSchedule(),
                  }))
                }
              >
                <Clock className="h-4 w-4" />
                Set up operating hours
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand assets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <ImageIcon className="h-5 w-5 text-saffron" />
            </div>
            <CardTitle>Brand assets</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Logo</Label>
            <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE]">
              {form.logoUrl ? (
                <>
                  <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain p-4" />
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink/0 opacity-0 transition-opacity hover:bg-ink/40 hover:opacity-100">
                    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-lg">
                      <Camera className="h-4 w-4" />
                      Change
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const nextFile = event.target.files?.[0];
                        if (nextFile) {
                          void uploadAsset(nextFile, "logoUrl");
                        }
                      }}
                    />
                  </label>
                </>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-2 text-stone">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
                    <Camera className="h-5 w-5 text-saffron" />
                  </div>
                  <span className="text-sm">Upload logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0];
                      if (nextFile) {
                        void uploadAsset(nextFile, "logoUrl");
                      }
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-stone">Recommended: 512 x 512px, PNG or JPG, max 2 MB</p>
          </div>
          <div className="space-y-3">
            <Label>Cover image</Label>
            <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE]">
              {form.coverImageUrl ? (
                <>
                  <img src={form.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink/0 opacity-0 transition-opacity hover:bg-ink/40 hover:opacity-100">
                    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-lg">
                      <Camera className="h-4 w-4" />
                      Change
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const nextFile = event.target.files?.[0];
                        if (nextFile) {
                          void uploadAsset(nextFile, "coverImageUrl");
                        }
                      }}
                    />
                  </label>
                </>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-2 text-stone">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
                    <ImageIcon className="h-5 w-5 text-saffron" />
                  </div>
                  <span className="text-sm">Upload cover</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0];
                      if (nextFile) {
                        void uploadAsset(nextFile, "coverImageUrl");
                      }
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-stone">Recommended: 1200 x 400px, PNG or JPG, max 5 MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Theme settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <Palette className="h-5 w-5 text-saffron" />
            </div>
            <CardTitle>Theme settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Theme</Label>
            <ThemePicker
              value={form.themeKey ?? null}
              onChange={(themeKey) => setForm((current) => ({ ...current, themeKey }))}
              isPro={restaurant.entitlements?.plan === "pro"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-10">
        <div className="glass-panel flex items-center justify-between rounded-[20px] border border-[#E5D7C0] px-5 py-3 shadow-lg">
          <p className="text-sm text-stone">Unsaved changes will be lost if you navigate away.</p>
          <Button onClick={() => void save()} disabled={loading} className="transition-all duration-200 hover:-translate-y-0.5">
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
