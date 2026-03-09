"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowUpRight,
  Code2,
  Copy,
  QrCode,
  Share2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import {
  getRestaurantPublicUrl,
  getRestaurantQrCodeUrl,
  getRestaurantWidgetSnippet,
} from "@/lib/share";

export function LaunchKit({
  restaurantId,
  restaurantName,
  slug,
}: {
  restaurantId: string;
  restaurantName: string;
  slug: string;
}) {
  const { getToken } = useAuth();
  const [viewsThisWeek, setViewsThisWeek] = useState<number | null>(null);
  const publicUrl = useMemo(() => getRestaurantPublicUrl(slug), [slug]);
  const widgetSnippet = useMemo(() => getRestaurantWidgetSnippet(slug), [slug]);
  const qrCodeUrl = useMemo(() => getRestaurantQrCodeUrl(publicUrl), [publicUrl]);

  useEffect(() => {
    async function loadAnalytics() {
      const token = await getToken();
      if (!token) {
        return;
      }

      try {
        const summary = await apiClient.getAnalytics(token, restaurantId);
        setViewsThisWeek(summary.viewsThisWeek);
      } catch (error) {
        console.error(error);
      }
    }

    void loadAnalytics();
  }, [getToken, restaurantId]);

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied.`);
  }

  return (
    <Card className="overflow-hidden border-[#E7C98F]">
      <CardHeader className="bg-gradient-to-r from-[#201A17] via-[#3A2B23] to-[#6D3B22] text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-[#F0D08A]">
              <Sparkles className="h-4 w-4" />
              Launch kit
            </div>
            <CardTitle className="text-white">{restaurantName} is live</CardTitle>
            <p className="mt-2 text-sm text-white/70">
              Share the hosted link, drop the widget into a site, or print the QR code for tables.
            </p>
          </div>
          <Badge variant="success" className="self-start bg-white/15 text-white">
            {viewsThisWeek === null ? "Loading views" : `${viewsThisWeek} views this week`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-4">
          <div className="rounded-[24px] border border-[#E7DAC5] bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
              <Share2 className="h-4 w-4 text-saffron" />
              Hosted page
            </div>
            <p className="rounded-2xl bg-[#FFF8EE] px-4 py-3 text-sm text-stone">
              {publicUrl}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => void copy(publicUrl, "Public link")}>
                <Copy className="h-4 w-4" />
                Copy link
              </Button>
              <Button asChild variant="secondary">
                <Link href={publicUrl} target="_blank">
                  View live page
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E7DAC5] bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
              <Code2 className="h-4 w-4 text-saffron" />
              Widget snippet
            </div>
            <pre className="overflow-x-auto rounded-[20px] bg-[#201A17] p-4 text-xs text-[#F7F1E8]">
              {widgetSnippet}
            </pre>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => void copy(widgetSnippet, "Widget snippet")}>
                <Copy className="h-4 w-4" />
                Copy embed
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
            <QrCode className="h-4 w-4 text-saffron" />
            QR code for tables and print
          </div>
          <div className="flex flex-col items-center gap-4 rounded-[20px] bg-white p-4">
            <img
              src={qrCodeUrl}
              alt={`QR code for ${restaurantName}`}
              className="h-52 w-52 rounded-2xl border border-[#E7DAC5] bg-white p-2"
            />
            <p className="text-center text-sm text-stone">
              Scan to open the live hosted menu page.
            </p>
            <Button variant="secondary" onClick={() => void copy(publicUrl, "QR destination link")}>
              <Copy className="h-4 w-4" />
              Copy QR destination
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
