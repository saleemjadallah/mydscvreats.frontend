"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import type { MenuItem, MenuSection } from "@/types";

type Mode = "missing" | "weak" | "all";
type Tone = "casual" | "upscale" | "playful" | "formal";

interface BulkDescriptionDialogProps {
  restaurantId: string;
  sections: MenuSection[];
  bulkEnabled: boolean;
  onClose: () => void;
  onApplied: () => Promise<void>;
}

export function BulkDescriptionDialog({
  restaurantId,
  sections,
  bulkEnabled,
  onClose,
  onApplied,
}: BulkDescriptionDialogProps) {
  const { getToken } = useAuth();
  const [mode, setMode] = useState<Mode>("missing");
  const [tone, setTone] = useState<Tone>("casual");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, string> | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);

  const allItems = sections.flatMap((s) => s.items);
  const itemMap = new Map(allItems.map((i) => [i.id, i]));

  async function generate() {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const result = await apiClient.enhanceDescriptionsBulk(token, {
        restaurantId,
        mode,
        tone,
      });
      setSuggestions(result.suggestions);
      setSelected(new Set(Object.keys(result.suggestions)));
      if (result.count === 0) {
        toast.message("No items matched the selected mode.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate descriptions");
    } finally {
      setLoading(false);
    }
  }

  async function applySelected() {
    if (!suggestions) return;
    setApplying(true);
    try {
      const token = await getToken();
      if (!token) return;
      const actions = Array.from(selected).map((id) => ({
        menuItemId: id,
        action: "accept" as const,
        description: suggestions[id],
      }));
      await apiClient.acceptDescriptions(token, actions);
      toast.success(`Applied ${actions.length} description${actions.length === 1 ? "" : "s"}`);
      await onApplied();
      onClose();
    } catch (error) {
      toast.error("Failed to apply descriptions");
    } finally {
      setApplying(false);
    }
  }

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (!bulkEnabled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#B8960C]" />
              Bulk AI Descriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-stone">
              Bulk description enhancement is available on the Pro plan. Upgrade to enhance
              all menu descriptions at once with consistent voice and tone.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <a href="/dashboard/billing">Upgrade to Pro</a>
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <Card className="w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#B8960C]" />
            Bulk AI Descriptions
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-5 space-y-5">
          {!suggestions ? (
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block text-sm font-medium">Which items?</Label>
                <div className="flex flex-wrap gap-2">
                  {(["missing", "weak", "all"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        mode === m
                          ? "border-[#B8960C] bg-[#FFFBF0] text-[#8A7209]"
                          : "border-[#E7DAC5] text-stone hover:bg-[#F9F3EA]"
                      }`}
                    >
                      {m === "missing"
                        ? "Missing descriptions only"
                        : m === "weak"
                          ? "Weak + missing"
                          : "All items"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">Tone</Label>
                <div className="flex flex-wrap gap-2">
                  {(["casual", "upscale", "playful", "formal"] as Tone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                        tone === t
                          ? "border-[#B8960C] bg-[#FFFBF0] text-[#8A7209]"
                          : "border-[#E7DAC5] text-stone hover:bg-[#F9F3EA]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={generate} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating descriptions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate descriptions
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone">
                  {Object.keys(suggestions).length} suggestion{Object.keys(suggestions).length === 1 ? "" : "s"} generated
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelected(new Set(Object.keys(suggestions)))}
                  >
                    Select all
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelected(new Set())}
                  >
                    Deselect all
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(suggestions).map(([itemId, desc]) => {
                  const item = itemMap.get(itemId);
                  if (!item) return null;

                  return (
                    <div
                      key={itemId}
                      className={`rounded-2xl border p-4 transition-colors cursor-pointer ${
                        selected.has(itemId)
                          ? "border-[#2E8B57]/30 bg-[#F0FFF4]"
                          : "border-[#E7DAC5] bg-white"
                      }`}
                      onClick={() => toggleItem(itemId)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            selected.has(itemId)
                              ? "border-[#2E8B57] bg-[#2E8B57] text-white"
                              : "border-[#D8C7AF]"
                          }`}
                        >
                          {selected.has(itemId) && <Check className="h-3 w-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink">{item.name}</p>
                          <div className="mt-2 grid gap-2 md:grid-cols-2">
                            <div>
                              <span className="text-[11px] font-medium uppercase tracking-wider text-stone">
                                Original
                              </span>
                              <p className="mt-1 text-sm text-stone">
                                {item.description || "(none)"}
                              </p>
                            </div>
                            <div>
                              <span className="text-[11px] font-medium uppercase tracking-wider text-[#2E8B57]">
                                AI Suggestion
                              </span>
                              <p className="mt-1 text-sm text-ink">{desc}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 border-t pt-4">
                <Button
                  onClick={applySelected}
                  disabled={applying || selected.size === 0}
                >
                  {applying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Apply {selected.size} selected
                    </>
                  )}
                </Button>
                <Button variant="secondary" onClick={() => setSuggestions(null)}>
                  Back
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
