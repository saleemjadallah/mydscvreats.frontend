"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, ImageIcon, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRestaurant } from "@/hooks/use-restaurant";
import { apiClient } from "@/lib/api-client";
import type { MenuSourceImageCandidate } from "@/types";

const statusOptions = [
  { id: "pending", label: "Pending review" },
  { id: "confirmed", label: "Confirmed" },
  { id: "dismissed", label: "Dismissed" },
] as const;

export default function MenuPhotosPage() {
  const { getToken } = useAuth();
  const { restaurant, refresh } = useRestaurant();
  const [status, setStatus] = useState<(typeof statusOptions)[number]["id"]>("pending");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<MenuSourceImageCandidate[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  const menuItems = useMemo(
    () =>
      (restaurant?.menuSections ?? []).flatMap((section) =>
        section.items.map((item) => ({
          id: item.id,
          name: item.name,
          sectionName: section.name,
        }))
      ),
    [restaurant?.menuSections]
  );

  async function loadCandidates(nextStatus = status) {
    if (!restaurant) {
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const data = await apiClient.listMenuSourceImageCandidates(token, restaurant.id, nextStatus);
      setCandidates(data);
      setSelectedCandidateIds([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load imported menu photos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCandidates(status);
  }, [restaurant?.id, status]);

  async function reassignCandidate(candidateId: string, assignedMenuItemId: string | null) {
    try {
      setBusyId(candidateId);
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const updated = await apiClient.updateMenuSourceImageCandidate(token, candidateId, {
        assignedMenuItemId,
      });
      setCandidates((current) => current.map((candidate) => (candidate.id === candidateId ? updated : candidate)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update suggested dish.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmCandidate(candidateId: string) {
    try {
      setBusyId(candidateId);
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiClient.confirmMenuSourceImageCandidate(token, candidateId);
      setCandidates((current) => current.filter((candidate) => candidate.id !== candidateId));
      await refresh();
      toast.success("Imported menu photo confirmed and added to the dish.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm imported menu photo.");
    } finally {
      setBusyId(null);
    }
  }

  async function bulkConfirmSelected() {
    if (!selectedCandidateIds.length) {
      return;
    }

    try {
      setBusyId("bulk");
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiClient.bulkConfirmMenuSourceImageCandidates(token, selectedCandidateIds);
      setCandidates((current) =>
        current.filter((candidate) => !selectedCandidateIds.includes(candidate.id))
      );
      setSelectedCandidateIds([]);
      await refresh();
      toast.success("Selected imported menu photos confirmed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to bulk confirm imported menu photos.");
    } finally {
      setBusyId(null);
    }
  }

  async function dismissCandidate(candidateId: string) {
    try {
      setBusyId(candidateId);
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiClient.dismissMenuSourceImageCandidate(token, candidateId);
      setCandidates((current) => current.filter((candidate) => candidate.id !== candidateId));
      await refresh();
      toast.message("Imported menu photo dismissed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to dismiss imported menu photo.");
    } finally {
      setBusyId(null);
    }
  }

  if (!restaurant) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-stone">Create a restaurant first to review imported menu photos.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-[#201A17] via-[#2A211B] to-[#3A2B23] text-white">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-saffron">
            <ImageIcon className="h-4 w-4" />
            Imported menu photos
          </div>
          <CardTitle className="text-white">Review menu photos before they become live dish images</CardTitle>
          <p className="mt-2 max-w-3xl text-sm text-white/70">
            These are cropped directly from the uploaded PDF or menu image. Confirm the correct dish, reassign when needed, or dismiss anything decorative.
          </p>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatus(option.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  status === option.id
                    ? "bg-[#201A17] text-white"
                    : "border border-[#E7DAC5] bg-white text-stone hover:bg-[#FFF8EE]"
                }`}
              >
                {option.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              {status === "pending" && selectedCandidateIds.length > 0 ? (
                <Button onClick={() => void bulkConfirmSelected()} disabled={busyId === "bulk"}>
                  {busyId === "bulk" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Confirm selected ({selectedCandidateIds.length})
                </Button>
              ) : null}
              {status === "pending" && (restaurant.pendingMenuSourceImageReviewCount ?? 0) > 0 ? (
                <Badge variant="accent">
                  {restaurant.pendingMenuSourceImageReviewCount} pending
                </Badge>
              ) : null}
              <Button variant="secondary" size="sm" onClick={() => void loadCandidates()}>
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 rounded-[24px] border border-[#E7DAC5] bg-[#FFFDF9] p-6 text-sm text-stone">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading imported menu photos...
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-[24px] border border-[#E7DAC5] bg-[#FFFDF9] p-6 text-sm text-stone">
              {status === "pending"
                ? "No imported menu photos are waiting for review."
                : `No ${status} imported menu photos yet.`}
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {candidates.map((candidate) => {
                const selectedItemId = candidate.assignedMenuItemId ?? candidate.suggestedMenuItemId ?? "";
                const isBusy = busyId === candidate.id;
                const isSelected = selectedCandidateIds.includes(candidate.id);
                const canBulkConfirm = candidate.reviewStatus === "pending" && Boolean(selectedItemId);

                return (
                  <Card key={candidate.id} className="overflow-hidden border border-[#E7DAC5]">
                    <div className="grid md:grid-cols-[220px,1fr]">
                      <div className="relative min-h-[220px] bg-[#F7F1E8]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={candidate.imageUrl}
                          alt="Imported menu photo candidate"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="space-y-4 p-5">
                        {candidate.reviewStatus === "pending" ? (
                          <label className="flex items-center gap-2 text-sm font-medium text-ink">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-[#D8C7AF] text-[#201A17]"
                              checked={isSelected}
                              disabled={!canBulkConfirm || busyId === "bulk"}
                              onChange={(event) =>
                                setSelectedCandidateIds((current) =>
                                  event.target.checked
                                    ? [...current, candidate.id]
                                    : current.filter((id) => id !== candidate.id)
                                )
                              }
                            />
                            Select for bulk confirm
                          </label>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={candidate.confidence >= 0.85 ? "success" : candidate.confidence >= 0.65 ? "default" : "accent"}>
                            {Math.round(candidate.confidence * 100)}% confidence
                          </Badge>
                          <Badge variant="muted">Page {candidate.sourcePageNumber}</Badge>
                          {candidate.suggestedMenuItem ? (
                            <Badge variant="muted">Suggested: {candidate.suggestedMenuItem.name}</Badge>
                          ) : null}
                        </div>

                        {candidate.note ? (
                          <p className="text-sm text-stone">{candidate.note}</p>
                        ) : null}

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-ink">Assign to dish</label>
                          <select
                            value={selectedItemId}
                            disabled={candidate.reviewStatus !== "pending" || isBusy}
                            onChange={(event) =>
                              void reassignCandidate(
                                candidate.id,
                                event.target.value ? event.target.value : null
                              )
                            }
                            className="w-full rounded-xl border border-[#E7DAC5] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-[#201A17]"
                          >
                            <option value="">Choose a dish</option>
                            {menuItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} · {item.sectionName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {candidate.reviewStatus === "pending" ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              disabled={isBusy || !selectedItemId}
                              onClick={() => void confirmCandidate(candidate.id)}
                            >
                              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                              Confirm and add to dish
                            </Button>
                            <Button
                              variant="secondary"
                              disabled={isBusy}
                              onClick={() => void dismissCandidate(candidate.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Dismiss
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-stone">
                            {candidate.reviewStatus === "confirmed"
                              ? `Confirmed for ${candidate.assignedMenuItem?.name ?? candidate.suggestedMenuItem?.name ?? "a dish"}.`
                              : "Dismissed."}
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
