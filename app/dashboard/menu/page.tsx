"use client";

import Link from "next/link";
import { ScanLine, Soup } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuEditor } from "@/components/menu/menu-editor";
import { useRestaurant } from "@/hooks/use-restaurant";

function MenuSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-[28px] border border-[#E8DCC9] bg-white/70 p-5">
          <div className="mb-4 h-6 w-32 animate-pulse rounded-lg bg-[#E7DAC5]" />
          <div className="space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="grid gap-3 rounded-[24px] border border-[#F0E5D4] bg-[#FFFDF9] p-4 md:grid-cols-[1.2fr,1.5fr,0.6fr]">
                <div className="h-9 animate-pulse rounded-lg bg-[#E7DAC5]" />
                <div className="h-9 animate-pulse rounded-lg bg-[#E7DAC5]" />
                <div className="h-9 animate-pulse rounded-lg bg-[#E7DAC5]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardMenuPage() {
  const { restaurant, loading, refresh } = useRestaurant();

  if (loading && !restaurant) {
    return <MenuSkeleton />;
  }

  if (!restaurant) {
    return <Card><CardContent className="p-8">Create your restaurant first.</CardContent></Card>;
  }

  if (!restaurant.menuSections?.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-[#E7DAC5] bg-white py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-saffron/10">
          <Soup className="h-7 w-7 text-saffron" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink">No menu items yet</h3>
          <p className="mt-1 text-sm text-stone">Import your menu with AI to get started in seconds.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/ai-menu">
            <ScanLine className="h-4 w-4" />
            AI Menu Import
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <MenuEditor
      restaurant={restaurant}
      initialSections={restaurant.menuSections}
      onRefresh={refresh}
    />
  );
}
