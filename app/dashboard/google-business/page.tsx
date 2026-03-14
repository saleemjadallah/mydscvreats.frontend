"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Unlink,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { getRestaurantPublicUrl } from "@/lib/share";
import { useRestaurant } from "@/hooks/use-restaurant";
import type { GbpConnection } from "@/types";

export default function GoogleBusinessPage() {
  const { restaurant, loading: restaurantLoading, refresh } = useRestaurant();
  const { getToken } = useAuth();
  const [connection, setConnection] = useState<GbpConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [gbpUrl, setGbpUrl] = useState("");
  const [guideExpanded, setGuideExpanded] = useState(true);
  const [noGbpExpanded, setNoGbpExpanded] = useState(false);

  const isConnected = connection?.status === "self_reported" || connection?.status === "verified";

  const loadConnection = useCallback(async () => {
    if (!restaurant) {
      setConnection(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const result = await apiClient.getGbpConnection(token, restaurant.id);
      setConnection(result);
      if (result?.gbpUrl) setGbpUrl(result.gbpUrl);
    } catch {
      setConnection(null);
    } finally {
      setLoading(false);
    }
  }, [restaurant, getToken]);

  useEffect(() => {
    void loadConnection();
  }, [loadConnection]);

  useEffect(() => {
    if (isConnected) setGuideExpanded(false);
  }, [isConnected]);

  async function handleConnect() {
    if (!restaurant) return;
    setConnecting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing auth token");
      const result = await apiClient.connectGbp(
        token,
        restaurant.id,
        gbpUrl ? { gbpUrl } : undefined
      );
      setConnection(result);
      await refresh();
      toast.success("Google Business Profile connected!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!restaurant) return;
    if (!window.confirm("Disconnect your Google Business Profile?")) return;
    setDisconnecting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing auth token");
      await apiClient.disconnectGbp(token, restaurant.id);
      setConnection(null);
      setGbpUrl("");
      setGuideExpanded(true);
      await refresh();
      toast.success("Google Business Profile disconnected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }

  async function copyMenuLink() {
    if (!restaurant) return;
    const url = getRestaurantPublicUrl(restaurant.slug);
    await navigator.clipboard.writeText(url);
    toast.success("Menu link copied.");
  }

  if (restaurantLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-stone" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MapPin className="mx-auto mb-4 h-10 w-10 text-stone/40" />
          <p className="text-sm text-stone">Create your restaurant first to connect Google Business Profile.</p>
        </CardContent>
      </Card>
    );
  }

  const menuUrl = getRestaurantPublicUrl(restaurant.slug);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 text-xs uppercase tracking-[0.3em] text-stone">Discovery</div>
          <h1 className="text-2xl font-semibold text-ink">Google Business Profile</h1>
        </div>
        {isConnected ? (
          <Badge className="w-fit bg-[#CCEBD9] text-[#206B48]">Connected to Google Maps</Badge>
        ) : (
          <Badge variant="muted" className="w-fit">Not connected</Badge>
        )}
      </div>

      {/* Value Proposition */}
      <Card className="overflow-hidden rounded-[28px] border-[#E7DAC5]">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF8EE]">
              <MapPin className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Get discovered on Google Maps</h2>
              <p className="mt-1 text-sm text-stone">
                When someone finds your restaurant on Google Maps and taps &quot;Menu&quot;, they&#39;ll see your
                full MyDscvr menu with photos, dietary tags, and promotions — not a basic text list.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected State */}
      {isConnected && (
        <Card className="overflow-hidden rounded-[28px] border-[#CCEBD9] bg-[#F7FEFA]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#2E8B57]" />
                <div>
                  <div className="font-medium text-ink">Connected to Google Maps</div>
                  {connection?.connectedAt && (
                    <div className="text-sm text-stone">
                      Connected on {new Date(connection.connectedAt).toLocaleDateString()}
                    </div>
                  )}
                  {connection?.gbpUrl && (
                    <a
                      href={connection.gbpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-saffron hover:underline"
                    >
                      View on Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4" />
                )}
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step-by-step Guide */}
      <Card className="overflow-hidden rounded-[28px] border-[#E7DAC5]">
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setGuideExpanded(!guideExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {isConnected ? "How to update your menu link" : "How to connect"}
            </CardTitle>
            {guideExpanded ? (
              <ChevronUp className="h-5 w-5 text-stone" />
            ) : (
              <ChevronDown className="h-5 w-5 text-stone" />
            )}
          </div>
        </CardHeader>
        {guideExpanded && (
          <CardContent className="space-y-4 pt-0">
            {/* Step 1: Copy menu link */}
            <div className="rounded-[24px] border border-[#E7DAC5] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron text-sm font-semibold text-white">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-medium text-ink">Copy your menu link</div>
                  <p className="mt-1 text-sm text-stone">
                    This is the URL you&#39;ll paste into your Google Business Profile.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex-1 rounded-2xl bg-[#FFF8EE] px-4 py-2.5 text-sm font-medium text-ink">
                      {menuUrl}
                    </div>
                    <Button size="sm" onClick={copyMenuLink}>
                      <Copy className="h-4 w-4" />
                      Copy link
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Open GBP */}
            <div className="rounded-[24px] border border-[#E7DAC5] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron text-sm font-semibold text-white">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-medium text-ink">Open Google Business Profile</div>
                  <p className="mt-1 text-sm text-stone">
                    Sign in to the Google account that manages your restaurant listing.
                  </p>
                  <div className="mt-3">
                    <Button asChild variant="secondary" size="sm">
                      <a
                        href="https://business.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Google Business
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Paste */}
            <div className="rounded-[24px] border border-[#E7DAC5] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron text-sm font-semibold text-white">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-medium text-ink">Paste in your menu link</div>
                  <p className="mt-1 text-sm text-stone">
                    Go to <span className="font-medium text-ink">Edit profile</span> &rarr;{" "}
                    <span className="font-medium text-ink">Contact</span> &rarr;{" "}
                    <span className="font-medium text-ink">Menu link</span>, then paste the URL you copied in step 1.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4: Confirm */}
            <div className="rounded-[24px] border border-[#E7DAC5] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron text-sm font-semibold text-white">
                  4
                </div>
                <div className="flex-1">
                  <div className="font-medium text-ink">Confirm the connection</div>
                  <p className="mt-1 text-sm text-stone">
                    Optionally paste your Google Maps listing URL below for tracking, then click the button to confirm.
                  </p>
                  <div className="mt-3 space-y-3">
                    <input
                      type="url"
                      placeholder="https://maps.google.com/... (optional)"
                      value={gbpUrl}
                      onChange={(e) => setGbpUrl(e.target.value)}
                      className="w-full rounded-2xl border border-[#E7DAC5] bg-white px-4 py-2.5 text-sm text-ink placeholder:text-stone/50 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                    />
                    <Button onClick={handleConnect} disabled={connecting}>
                      {connecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {isConnected ? "Update connection" : "I've connected my menu"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* No GBP listing */}
      <Card className="overflow-hidden rounded-[28px] border-[#E7DAC5]">
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setNoGbpExpanded(!noGbpExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-stone">
              Don&#39;t have a Google Business listing?
            </CardTitle>
            {noGbpExpanded ? (
              <ChevronUp className="h-5 w-5 text-stone" />
            ) : (
              <ChevronDown className="h-5 w-5 text-stone" />
            )}
          </div>
        </CardHeader>
        {noGbpExpanded && (
          <CardContent className="pt-0">
            <p className="text-sm text-stone">
              Google Business Profile is free and lets your restaurant appear on Google Maps and Search.
              Creating one takes about 10 minutes.
            </p>
            <div className="mt-4">
              <Button asChild variant="secondary" size="sm">
                <a
                  href="https://business.google.com/create"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create a Google Business listing
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
