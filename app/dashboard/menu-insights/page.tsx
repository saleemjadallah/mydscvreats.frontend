"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Lightbulb, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { AnalysisScoreRing } from "@/components/dashboard/analysis-score-ring";
import { MenuAnalysisCard } from "@/components/dashboard/menu-analysis-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { getRestaurantEntitlements } from "@/lib/entitlements";
import { useRestaurant } from "@/hooks/use-restaurant";
import type { MenuAnalysisResult } from "@/types";

export default function MenuInsightsPage() {
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const { getToken } = useAuth();
  const [analysis, setAnalysis] = useState<MenuAnalysisResult | null>(null);
  const [level, setLevel] = useState<"basic" | "full">("basic");
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingCached, setLoadingCached] = useState(true);

  const entitlements = getRestaurantEntitlements(restaurant);

  const loadCached = useCallback(async () => {
    if (!restaurant) {
      setAnalysis(null);
      setCachedAt(null);
      setLoadingCached(false);
      return;
    }

    setLoadingCached(true);

    try {
      const token = await getToken();
      if (!token) {
        setAnalysis(null);
        setCachedAt(null);
        return;
      }

      const result = await apiClient.getMenuAnalysis(token, restaurant.id);
      setAnalysis(result.analysis);
      setLevel(result.level);
      setCachedAt(result.createdAt ?? null);
    } catch {
      // No cached analysis available
      setAnalysis(null);
      setCachedAt(null);
    } finally {
      setLoadingCached(false);
    }
  }, [restaurant, getToken]);

  useEffect(() => {
    void loadCached();
  }, [loadCached]);

  async function runAnalysis() {
    if (!restaurant) return;
    setAnalyzing(true);
    try {
      const token = await getToken();
      if (!token) return;
      const result = await apiClient.analyzeMenu(token, restaurant.id);
      setAnalysis(result.analysis);
      setLevel(result.level);
      setCachedAt(null);
      if (result.cached) {
        toast.message("Showing cached analysis (menu unchanged).");
      } else {
        toast.success("Menu analysis complete.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to analyze menu");
    } finally {
      setAnalyzing(false);
    }
  }

  if (restaurantLoading || loadingCached) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-stone" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <Card>
        <CardContent className="p-8">Create your restaurant first.</CardContent>
      </Card>
    );
  }

  if (!restaurant.menuSections?.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-[#E7DAC5] bg-white py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFFBF0]">
          <Lightbulb className="h-7 w-7 text-[#B8960C]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink">No menu to analyze</h3>
          <p className="mt-1 text-sm text-stone">
            Import your menu first, then come back for AI-powered insights.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/ai-menu">Import Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Menu Insights</h1>
          <p className="mt-1 text-sm text-stone">
            AI-powered analysis of your menu&apos;s pricing, descriptions, structure, and more.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {entitlements.menuAnalysisLevel === "basic" && (
            <Badge variant="muted" className="bg-[#FFFBF0] text-[#8A7209]">
              Basic analysis — Upgrade to Pro for full insights
            </Badge>
          )}
          <Button onClick={runAnalysis} disabled={analyzing}>
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : analysis ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Re-analyze
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Menu
              </>
            )}
          </Button>
        </div>
      </div>

      {analysis ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 rounded-[28px] border border-[#E7DAC5] bg-white p-8">
            <AnalysisScoreRing score={analysis.overallScore} />
            {cachedAt && (
              <p className="text-xs text-stone">
                Last analyzed: {new Date(cachedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MenuAnalysisCard category={analysis.categories.pricing} />
            <MenuAnalysisCard category={analysis.categories.descriptions} />
            <MenuAnalysisCard category={analysis.categories.structure} />
            <MenuAnalysisCard category={analysis.categories.gaps} />
            <MenuAnalysisCard category={analysis.categories.seasonal} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-[28px] border border-[#E7DAC5] bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFFBF0]">
            <Lightbulb className="h-7 w-7 text-[#B8960C]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">Ready for analysis</h3>
            <p className="mt-1 max-w-md text-sm text-stone">
              Click &quot;Analyze Menu&quot; to get AI-powered insights on your pricing, descriptions,
              structure, and seasonal opportunities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
