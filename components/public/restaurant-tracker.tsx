"use client";

import { useEffect } from "react";

export function RestaurantTracker({ restaurantId }: { restaurantId: string }) {
  useEffect(() => {
    void fetch("/api/public/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        restaurantId,
        path: window.location.pathname,
        hostname: window.location.host,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
    }).catch((error) => {
      console.error("Failed to track restaurant page view", error);
    });
  }, [restaurantId]);

  return null;
}
