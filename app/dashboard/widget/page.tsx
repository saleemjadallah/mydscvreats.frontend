"use client";

import { useState } from "react";
import { Check, Code2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurant } from "@/hooks/use-restaurant";
import { getRestaurantWidgetSnippet } from "@/lib/share";

export default function WidgetPage() {
  const { restaurant } = useRestaurant();
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
          Drop this iframe into the restaurant's own website to mirror the hosted menu page.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-stone">How to install</div>
            <div className="space-y-4">
              {[
                { step: "1", text: "Copy the embed snippet below" },
                { step: "2", text: "Open the HTML of your restaurant website" },
                { step: "3", text: "Paste the snippet where you want the menu to appear" },
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
    </div>
  );
}
