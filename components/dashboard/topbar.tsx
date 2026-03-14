"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowUpRight, Eye, Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRestaurant } from "@/hooks/use-restaurant";
import { countMenuItems, getRestaurantEntitlements } from "@/lib/entitlements";
import { plans } from "@/lib/plans";

export function DashboardTopbar() {
  const { restaurant } = useRestaurant();
  const entitlements = getRestaurantEntitlements(restaurant);
  const hasSelectedPlan = entitlements.hasSelectedPlan;
  const menuItemCount = countMenuItems(restaurant?.menuSections);
  const draftNeedsPro =
    !hasSelectedPlan &&
    plans.starter.itemLimit !== null &&
    menuItemCount > plans.starter.itemLimit;

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
              <Badge
                variant={
                  hasSelectedPlan && restaurant.subscriptionStatus === "active"
                    ? "success"
                    : "default"
                }
              >
                {hasSelectedPlan ? restaurant.subscriptionStatus : "draft"}
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
            <>
              <Button
                asChild
                variant="secondary"
                className="transition-all duration-200 hover:-translate-y-0.5"
              >
                <Link href="/dashboard/preview">
                  <Eye className="h-4 w-4" />
                  Preview menu page
                </Link>
              </Button>
              <Button asChild variant="secondary" className="transition-all duration-200 hover:-translate-y-0.5">
                <Link href="/dashboard">Launch checklist</Link>
              </Button>
            </>
          ) : null}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {restaurant && !hasSelectedPlan ? (
        <div className="border-t border-[#E5D7C0] bg-[#FFF8EE] px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-ink">You&apos;re in draft mode</div>
              <p className="mt-1 text-sm text-stone">
                {draftNeedsPro && plans.starter.itemLimit !== null
                  ? `No plan is selected yet. This draft has ${menuItemCount} dishes, so it will need Pro to publish.`
                  : "No plan is selected yet. Build the menu first, then choose Starter or Pro when you’re ready to publish."}
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/dashboard/billing">Choose a plan</Link>
            </Button>
          </div>
        </div>
      ) : restaurant && (restaurant.pendingMenuSourceImageReviewCount ?? 0) > 0 ? (
        <div className="border-t border-[#E5D7C0] bg-[#FFF8EE] px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-ink">Imported menu photos need review</div>
              <p className="mt-1 text-sm text-stone">
                {restaurant.pendingMenuSourceImageReviewCount} cropped photo{restaurant.pendingMenuSourceImageReviewCount === 1 ? "" : "s"} from the uploaded menu are still waiting for confirmation or reassignment before launch.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/dashboard/menu-photos">Review menu photos</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
