"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import type { AnalyticsSummary } from "@/types";

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const { restaurant } = useRestaurant();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

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

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader><CardTitle>Total views</CardTitle></CardHeader>
        <CardContent className="text-4xl font-semibold">{summary?.totalViews ?? 0}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Today</CardTitle></CardHeader>
        <CardContent className="text-4xl font-semibold">{summary?.viewsToday ?? 0}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>This week</CardTitle></CardHeader>
        <CardContent className="text-4xl font-semibold">{summary?.viewsThisWeek ?? 0}</CardContent>
      </Card>
      <Card className="md:col-span-2 xl:col-span-1">
        <CardHeader><CardTitle>Top paths</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {summary?.topPaths?.length ? (
            summary.topPaths.map((path) => (
              <div key={path.path} className="flex items-center justify-between text-sm">
                <span className="truncate text-stone">{path.path}</span>
                <span className="font-medium text-ink">{path.views}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-stone">No page views yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
