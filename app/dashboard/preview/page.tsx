"use client";

import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { RestaurantPageView } from "@/components/public/restaurant-page-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/use-restaurant";

export default function DashboardPreviewPage() {
  const { restaurant, loading } = useRestaurant();

  if (loading && !restaurant) {
    return <Card><CardContent className="p-8">Loading preview...</CardContent></Card>;
  }

  if (!restaurant) {
    return <Card><CardContent className="p-8">Create your restaurant first.</CardContent></Card>;
  }

  return (
    <RestaurantPageView
      restaurant={restaurant}
      previewBanner={
        <div className="flex flex-col gap-3 rounded-[28px] border border-[#E7DAC5] bg-[#FFF8EE] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-stone">
              <Eye className="h-4 w-4 text-saffron" />
              Draft Preview
            </div>
            <p className="mt-2 text-sm text-stone">
              This is the owner-only preview of the hosted page. It is not public until you publish.
            </p>
          </div>
          <Button asChild variant="secondary" className="shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      }
    />
  );
}
