"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { BarChart3, Calendar, Eye, Lock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import { getRestaurantEntitlements } from "@/lib/entitlements";
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

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] bg-ink p-6 md:p-8">
        <div className="text-xs uppercase tracking-[0.3em] text-saffron">Analytics</div>
        <h2 className="mt-2 text-2xl font-semibold text-white">Page performance</h2>
        <p className="mt-1 text-sm text-white/60">Track how your menu page is performing.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Total views"
          value={String(summary?.totalViews ?? 0)}
          hint="All-time page views"
          icon={Eye}
          accent="saffron"
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
