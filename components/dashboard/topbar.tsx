"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRestaurant } from "@/hooks/use-restaurant";

export function DashboardTopbar() {
  const { restaurant } = useRestaurant();

  return (
    <div className="glass-panel relative overflow-hidden rounded-[28px] border border-[#E5D7C0]">
      <div className="h-[3px] bg-gradient-to-r from-saffron via-coral to-saffron/60" />
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.26em] text-stone">Dashboard</div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-ink">
              {restaurant?.name ?? "Set up your restaurant"}
            </h1>
            {restaurant?.subscriptionStatus ? (
              <Badge variant={restaurant.subscriptionStatus === "active" ? "success" : "default"}>
                {restaurant.subscriptionStatus}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {restaurant?.slug && restaurant.isPublished ? (
            <Button asChild variant="secondary" className="transition-all duration-200 hover:-translate-y-0.5">
              <Link href={`/${restaurant.slug}`} target="_blank">
                <Globe2 className="h-4 w-4" />
                View public page
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : restaurant ? (
            <Button asChild variant="secondary" className="transition-all duration-200 hover:-translate-y-0.5">
              <Link href="/dashboard">Launch checklist</Link>
            </Button>
          ) : null}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
