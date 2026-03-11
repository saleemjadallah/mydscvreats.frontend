"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Code2, Copy, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/use-restaurant";
import { getRestaurantEntitlements } from "@/lib/entitlements";
import { getRestaurantWidgetSnippet } from "@/lib/share";

export default function WidgetPage() {
  const { restaurant } = useRestaurant();
  const entitlements = getRestaurantEntitlements(restaurant);
  const snippet = restaurant?.slug ? getRestaurantWidgetSnippet(restaurant.slug) : "";
  const [copied, setCopied] = useState(false);

  async function copySnippet() {
    if (!snippet) {
      return;
    }

    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success("Widget snippet copied.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] bg-ink p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-saffron">
          <Code2 className="h-4 w-4" />
          Widget
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-white">Embeddable menu widget</h2>
        <p className="mt-1 text-sm text-white/60">
          Copy the snippet into your website to load the Pro widget with automatic iframe resizing.
        </p>
      </div>

      {!entitlements.widgetEnabled ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-saffron/10">
              <Lock className="h-6 w-6 text-saffron" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Unlock the widget on Pro</h3>
              <p className="mt-1 text-sm text-stone">
                Starter restaurants can publish a hosted menu page. Pro unlocks the embeddable widget for your own site.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/billing">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {entitlements.widgetEnabled ? (
        <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-stone">How to install</div>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Copy the widget snippet below" },
                  { step: "2", text: "Open the HTML where the menu should appear" },
                  { step: "3", text: "Paste the iframe and script snippet into that section" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                      {item.step}
                    </div>
                    <p className="pt-0.5 text-sm text-ink">{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-stone">Embed code</div>
              <pre className="overflow-x-auto rounded-[20px] bg-[#201A17] p-5 text-sm leading-relaxed text-[#F7F1E8]">
                {snippet || "Create a restaurant first to generate the embed snippet."}
              </pre>
              {snippet ? (
                <Button
                  onClick={() => void copySnippet()}
                  className={`w-full transition-all duration-200 ${
                    copied ? "bg-[#2E8B57] hover:bg-[#2E8B57]/90" : ""
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy embed snippet
                    </>
                  )}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
