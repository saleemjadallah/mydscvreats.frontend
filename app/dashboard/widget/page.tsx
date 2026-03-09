"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/use-restaurant";
import { getRestaurantWidgetSnippet } from "@/lib/share";

export default function WidgetPage() {
  const { restaurant } = useRestaurant();
  const snippet = restaurant?.slug ? getRestaurantWidgetSnippet(restaurant.slug) : "";

  async function copySnippet() {
    if (!snippet) {
      return;
    }

    await navigator.clipboard.writeText(snippet);
    toast.success("Widget snippet copied.");
  }

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
        {snippet ? (
          <Button variant="secondary" onClick={() => void copySnippet()}>
            <Copy className="h-4 w-4" />
            Copy embed
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
