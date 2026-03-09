"use client";

import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export function RestaurantTracker({ restaurantId }: { restaurantId: string }) {
  useEffect(() => {
    void apiClient.trackPageView({
      restaurantId,
      path: window.location.pathname,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
    });
  }, [restaurantId]);

  return null;
}
