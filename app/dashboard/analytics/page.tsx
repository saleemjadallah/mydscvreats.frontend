"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  BarChart3,
  Calendar,
  Eye,
  Link2,
  Lock,
  MessageCircle,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import { getRestaurantEntitlements } from "@/lib/entitlements";
import { getRestaurantShortUrl } from "@/lib/share";
import type { AnalyticsSummary } from "@/types";

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const { restaurant } = useRestaurant();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const entitlements = getRestaurantEntitlements(restaurant);

  useEffect(() => {
    async function load() {
      if (!restaurant) {
        return;
      }
      const token = await getToken();
      if (!token) {
        return;
      }
      const data = await apiClient.getAnalytics(token, restaurant.id);
      setSummary(data);
    }

    void load();
  }, [getToken, restaurant]);

  const maxViews = summary?.topPaths?.length
    ? Math.max(...summary.topPaths.map((p) => p.views))
    : 0;
  const shortLinkUrl = summary?.shortLink ? getRestaurantShortUrl(summary.shortLink.code) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="overflow-hidden rounded-[28px] bg-ink p-6 md:p-8">
        <div className="text-xs uppercase tracking-[0.3em] text-saffron">Analytics</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">Page performance</h2>
        <p className="mt-1 text-sm text-white/60">Track how your menu page is performing.</p>
      </div>

      {/* Traffic metrics — featured total + daily/weekly */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total views"
          value={String(summary?.totalViews ?? 0)}
          hint="All-time page views across all channels"
          icon={Eye}
          accent="saffron"
          featured
        />
        <StatCard
          label="Today"
          value={String(summary?.viewsToday ?? 0)}
          hint="Views in the last 24 hours"
          icon={Calendar}
          accent="coral"
        />
        <StatCard
          label="This week"
          value={String(summary?.viewsThisWeek ?? 0)}
          hint="Views in the last 7 days"
          icon={TrendingUp}
          accent="emerald"
        />
      </div>

      {/* Engagement metrics */}
      <div>
        <div className="mb-4 flex items-center gap-2.5 px-1">
          <div className="h-1.5 w-1.5 rounded-full bg-saffron" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone">
            Engagement
          </span>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard
            label="Short link clicks"
            value={String(summary?.shortLink?.totalClicks ?? 0)}
            hint={
              summary?.shortLink
                ? "All-time redirect clicks on the active short link"
                : "Create a short link to start tracking redirect clicks"
            }
            icon={Link2}
            accent="stone"
          />
          <StatCard
            label="WhatsApp clicks"
            value={String(summary?.whatsapp?.totalClicks ?? 0)}
            hint={
              restaurant?.whatsappNumber
                ? "All-time opens of WhatsApp CTAs from the public menu"
                : "Add a WhatsApp number in Appearance to track click-to-chat intent"
            }
            icon={MessageCircle}
            accent="emerald"
          />
          <StatCard
            label="Dish likes"
            value={String(summary?.likes.total ?? 0)}
            hint="All-time positive feedback from public menu cards"
            icon={ThumbsUp}
            accent="coral"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <ThumbsUp className="h-5 w-5 text-saffron" />
            </div>
            <CardTitle>Dish feedback</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-stone">All time</div>
              <div className="mt-2 text-3xl font-semibold text-ink">
                {summary?.likes.total ?? 0}
              </div>
              <p className="mt-1 text-sm text-stone">Total “I like it” taps across menu items.</p>
            </div>
            <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-stone">Today</div>
              <div className="mt-2 text-3xl font-semibold text-ink">
                {summary?.likes.today ?? 0}
              </div>
              <p className="mt-1 text-sm text-stone">Likes captured in the last 24 hours.</p>
            </div>
            <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-stone">This week</div>
              <div className="mt-2 text-3xl font-semibold text-ink">
                {summary?.likes.thisWeek ?? 0}
              </div>
              <p className="mt-1 text-sm text-stone">Likes captured in the last 7 days.</p>
            </div>
          </div>

          {summary?.likes.topItems.length ? (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.2em] text-stone">Most liked dishes</div>
              {summary.likes.topItems.map((item, index) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center justify-between rounded-[20px] border border-[#E7DAC5] bg-[#FFF8EE] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="font-medium text-ink">{item.name}</div>
                  </div>
                  <div className="text-sm font-semibold text-stone">{item.likes} likes</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#E7DAC5] bg-[#FFFDF9] px-5 py-8 text-center">
              <p className="font-medium text-ink">No dish feedback yet</p>
              <p className="mt-1 text-sm text-stone">
                Once diners tap “I like it” on public menu cards, the top dishes will show here.
              </p>
            </div>
          )}
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
        <CardContent>
          {!restaurant?.whatsappNumber ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-saffron/10">
                <MessageCircle className="h-6 w-6 text-saffron" />
              </div>
              <div>
                <p className="font-medium text-ink">WhatsApp is not configured yet</p>
                <p className="mt-1 text-sm text-stone">
                  Add a WhatsApp number in Appearance to turn menu browsing into tracked chat intent.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/appearance">Set up WhatsApp</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone">All time</div>
                <div className="mt-2 text-3xl font-semibold text-ink">
                  {summary?.whatsapp?.totalClicks ?? 0}
                </div>
                <p className="mt-1 text-sm text-stone">Tracked clicks to WhatsApp from the public menu.</p>
              </div>
              <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone">Today</div>
                <div className="mt-2 text-3xl font-semibold text-ink">
                  {summary?.whatsapp?.clicksToday ?? 0}
                </div>
                <p className="mt-1 text-sm text-stone">Clicks in the last 24 hours.</p>
              </div>
              <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-stone">This week</div>
                <div className="mt-2 text-3xl font-semibold text-ink">
                  {summary?.whatsapp?.clicksThisWeek ?? 0}
                </div>
                <p className="mt-1 text-sm text-stone">Clicks in the last 7 days.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <Link2 className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <CardTitle>Short link performance</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!restaurant?.shortLink ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-saffron/10">
                <Link2 className="h-6 w-6 text-saffron" />
              </div>
              <div>
                <p className="font-medium text-ink">No short link created yet</p>
                <p className="mt-1 text-sm text-stone">
                  Create a short link from the launch kit to measure flyer scans, bio clicks, and DM traffic separately from menu views.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard">Go to Launch Kit</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFF8EE] p-5">
                <div className="mb-2 text-xs uppercase tracking-[0.3em] text-stone">Active short link</div>
                <div className="break-all text-sm font-medium text-ink">{shortLinkUrl}</div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone">All time</div>
                  <div className="mt-2 text-3xl font-semibold text-ink">
                    {summary?.shortLink?.totalClicks ?? 0}
                  </div>
                  <p className="mt-1 text-sm text-stone">Redirect clicks on the active short URL.</p>
                </div>
                <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone">Today</div>
                  <div className="mt-2 text-3xl font-semibold text-ink">
                    {summary?.shortLink?.clicksToday ?? 0}
                  </div>
                  <p className="mt-1 text-sm text-stone">Clicks in the last 24 hours.</p>
                </div>
                <div className="rounded-[20px] border border-[#E7DAC5] bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone">This week</div>
                  <div className="mt-2 text-3xl font-semibold text-ink">
                    {summary?.shortLink?.clicksThisWeek ?? 0}
                  </div>
                  <p className="mt-1 text-sm text-stone">Clicks in the last 7 days.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10">
              <BarChart3 className="h-5 w-5 text-saffron" />
            </div>
            <CardTitle>Top paths</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {entitlements.analyticsTier !== "advanced" ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-saffron/10">
                <Lock className="h-6 w-6 text-saffron" />
              </div>
              <div>
                <p className="font-medium text-ink">Advanced path analytics are on Pro</p>
                <p className="mt-1 text-sm text-stone">
                  Starter includes headline view counts. Upgrade to unlock top paths and deeper demand signals.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/billing">Upgrade to Pro</Link>
              </Button>
            </div>
          ) : summary?.topPaths?.length ? (
            <div className="space-y-3">
              {summary.topPaths.map((path, index) => (
                <div key={path.path} className="flex items-center gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate text-ink">{path.path}</span>
                      <span className="shrink-0 font-semibold text-ink">{path.views}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-sand">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-saffron to-coral transition-all duration-500"
                        style={{ width: maxViews ? `${(path.views / maxViews) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-saffron/10">
                <BarChart3 className="h-6 w-6 text-saffron" />
              </div>
              <p className="text-sm text-stone">No page views yet. Share your menu link to start tracking.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
