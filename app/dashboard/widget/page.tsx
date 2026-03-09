"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/use-restaurant";

export default function WidgetPage() {
  const { restaurant } = useRestaurant();
  const snippet = restaurant?.slug
    ? `<iframe src="${process.env.NEXT_PUBLIC_APP_URL ?? "https://mydscvr.ai"}/${restaurant.slug}?embed=1" width="100%" height="760" style="border:0;border-radius:24px;overflow:hidden" loading="lazy"></iframe>`
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embeddable widget</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-stone">
          Drop this iframe into the restaurant’s own website to mirror the hosted menu page.
        </p>
        <pre className="overflow-x-auto rounded-[28px] bg-[#201A17] p-5 text-sm text-[#F7F1E8]">
          {snippet || "Create a restaurant first to generate the embed snippet."}
        </pre>
      </CardContent>
    </Card>
  );
}
