"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowUpRight,
  Code2,
  Copy,
  Link2,
  QrCode,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import {
  getRestaurantPublicUrl,
  getRestaurantQrCodeUrl,
  getRestaurantShortUrl,
  getRestaurantWidgetSnippet,
} from "@/lib/share";

export function LaunchKit({
  restaurantId,
  restaurantName,
  slug,
  shortLinkCode,
  shortLinksEnabled,
  widgetEnabled,
}: {
  restaurantId: string;
  restaurantName: string;
  slug: string;
  shortLinkCode: string | null;
  shortLinksEnabled: boolean;
  widgetEnabled: boolean;
}) {
  const { getToken } = useAuth();
  const { refresh } = useRestaurant();
  const [viewsThisWeek, setViewsThisWeek] = useState<number | null>(null);
  const [shortLinkAction, setShortLinkAction] = useState<"generate" | "delete" | null>(null);
  const publicUrl = useMemo(() => getRestaurantPublicUrl(slug), [slug]);
  const shortUrl = useMemo(
    () => (shortLinkCode ? getRestaurantShortUrl(shortLinkCode) : null),
    [shortLinkCode]
  );
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

  async function generateShortLink() {
    const isRegenerating = Boolean(shortLinkCode);

    if (
      isRegenerating &&
      !window.confirm("Regenerate the active short link? Older short links will keep redirecting.")
    ) {
      return;
    }

    setShortLinkAction("generate");

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const shortLink = await apiClient.generateShortLink(token, restaurantId);
      await refresh();
      toast.success(
        isRegenerating
          ? `Short link updated to /r/${shortLink.code}. Older links still work.`
          : `Short link created at /r/${shortLink.code}.`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create short link.");
    } finally {
      setShortLinkAction(null);
    }
  }

  async function deleteShortLink() {
    if (!shortLinkCode) {
      return;
    }

    if (!window.confirm("Delete this short link? The current /r code will stop working.")) {
      return;
    }

    setShortLinkAction("delete");

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiClient.deleteShortLink(token, restaurantId);
      await refresh();
      toast.success("Short link deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete short link.");
    } finally {
      setShortLinkAction(null);
    }
  }

  return (
    <Card className="overflow-hidden border-[#E7C98F]">
      <CardHeader className="bg-gradient-to-r from-[#201A17] via-[#3A2B23] to-[#6D3B22] text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-saffron">
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
      <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-4">
          <div className="rounded-[24px] border border-[#E7DAC5] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
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

          <div className="rounded-[24px] border border-[#E7DAC5] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <Link2 className="h-4 w-4 text-saffron" />
                Short link
              </div>
              <Badge variant={shortLinksEnabled ? "success" : "muted"}>
                {shortLinksEnabled ? "Pro" : "Upgrade"}
              </Badge>
            </div>

            {shortLinksEnabled ? (
              <>
                <p className="rounded-2xl bg-[#FFF8EE] px-4 py-3 text-sm text-stone">
                  {shortUrl ?? "Create a shorter share link that redirects to the hosted page."}
                </p>
                <p className="mt-3 text-sm text-stone">
                  The hosted page remains the permanent destination. The short link is a lightweight redirect for flyers, DMs, and bios, and older codes keep forwarding after regeneration.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {shortUrl ? (
                    <>
                      <Button onClick={() => void copy(shortUrl, "Short link")}>
                        <Copy className="h-4 w-4" />
                        Copy short link
                      </Button>
                      <Button asChild variant="secondary">
                        <Link href={shortUrl} target="_blank">
                          Open short link
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void generateShortLink()}
                        disabled={shortLinkAction !== null}
                      >
                        <Link2 className="h-4 w-4" />
                        {shortLinkAction === "generate" ? "Updating..." : "Regenerate"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => void deleteShortLink()}
                        disabled={shortLinkAction !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                        {shortLinkAction === "delete" ? "Deleting..." : "Delete"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => void generateShortLink()}
                      disabled={shortLinkAction !== null}
                    >
                      <Link2 className="h-4 w-4" />
                      {shortLinkAction === "generate" ? "Creating..." : "Create short link"}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="rounded-2xl bg-[#FFF8EE] px-4 py-3 text-sm text-stone">
                  Upgrade to Pro to unlock a shorter `mydscvr.ai/r/...` share link for the hosted menu page.
                </p>
                <div className="mt-4">
                  <Button asChild variant="secondary">
                    <Link href="/dashboard/billing">See Pro features</Link>
                  </Button>
                </div>
              </>
            )}
          </div>

          {widgetEnabled ? (
            <div className="rounded-[24px] border border-[#E7DAC5] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
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
          ) : null}
        </div>

        <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
            <QrCode className="h-4 w-4 text-saffron" />
            QR code for tables and print
          </div>
          <div className="relative flex flex-col items-center gap-4 rounded-[20px] bg-white p-4">
            <div className="absolute -inset-1 rounded-[24px] bg-gradient-to-b from-saffron/10 to-transparent blur-xl" />
            <img
              src={qrCodeUrl}
              alt={`QR code for ${restaurantName}`}
              className="relative h-52 w-52 rounded-2xl border border-[#E7DAC5] bg-white p-2"
            />
            <p className="relative text-center text-sm text-stone">
              Scan to open the live hosted menu page.
            </p>
            <Button variant="secondary" onClick={() => void copy(publicUrl, "QR destination link")} className="relative">
              <Copy className="h-4 w-4" />
              Copy QR destination
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
